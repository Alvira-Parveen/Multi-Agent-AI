import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as db from "../server/db";
import { generateEmbedding } from "../server/_core/llm";
import * as pdfParse from "pdf-parse";
import { storagePut } from "../server/storage";

// Mapping file names to Drizzle documentType schema enum values
const typeMap: Record<string, string> = {
  "FAQ.pdf": "FAQ",
  "RefundPolicy.pdf": "RefundPolicy",
  "ShippingPolicy.pdf": "Shipping",
  "Warranty.pdf": "Warranty",
  "Pricing.pdf": "Pricing",
  "Products.pdf": "Products",
  "InstallationGuide.pdf": "Installation",
  "UserManual.pdf": "UserManual"
};

function splitText(text: string, chunkSize = 800, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start + chunkSize - overlap) {
        end = lastSpace;
      }
    }
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    if (start >= text.length - overlap) break;
  }
  return chunks.filter(c => c.length > 0);
}

async function extractText(buffer: Buffer, fileName: string): Promise<string> {
  if (fileName.toLowerCase().endsWith(".pdf")) {
    let PDFParseClass: any = (pdfParse as any).PDFParse || (pdfParse as any).default?.PDFParse;
    if (!PDFParseClass) {
      const { createRequire } = await import("module");
      const requireFn = createRequire(import.meta.url);
      const mod = requireFn("pdf-parse");
      PDFParseClass = mod.PDFParse;
    }
    const parser = new PDFParseClass({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }
  return buffer.toString("utf-8");
}

async function run() {
  const kbDir = path.join(process.cwd(), "knowledge_base");
  if (!fs.existsSync(kbDir)) {
    console.error("knowledge_base directory not found!");
    process.exit(1);
  }

  const files = fs.readdirSync(kbDir).filter(f => f.endsWith(".pdf"));
  console.log(`Found ${files.length} PDF files in knowledge_base/`);

  // Fetch already uploaded documents
  const existingDocs = await db.getKnowledgeDocuments();
  const existingNames = new Set(existingDocs.map(d => d.fileName));

  for (const file of files) {
    if (existingNames.has(file)) {
      console.log(`Skipping already ingested document: ${file}`);
      continue;
    }

    const docType = typeMap[file];
    if (!docType) {
      console.log(`Skipping unknown file mapping: ${file}`);
      continue;
    }

    console.log(`Ingesting ${file} (Type: ${docType})...`);
    const filePath = path.join(kbDir, file);
    const buffer = fs.readFileSync(filePath);

    // Save to storage
    const fileKey = `kb/${Date.now()}_${file}`;
    await storagePut(fileKey, buffer, "application/pdf");

    // Add to DB
    const doc = await db.addKnowledgeDocument(docType, file, fileKey, buffer.length);
    if (!doc) {
      console.error(`Failed to insert document metadata for ${file}`);
      continue;
    }

    // Extract & Embed
    const rawText = await extractText(buffer, file);
    const chunks = splitText(rawText, 800, 200);
    console.log(`Split ${file} into ${chunks.length} chunks. Generating embeddings...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embeddingArray = await generateEmbedding(chunkText);
      const embeddingStr = JSON.stringify(embeddingArray);

      await db.addKnowledgeChunk(
        doc.id,
        chunkText,
        i,
        embeddingStr,
        { source: "document", chunkIndex: i }
      );
    }
    console.log(`Successfully ingested ${file}`);
  }

  console.log("Knowledge base ingestion complete!");
  process.exit(0);
}

run().catch(err => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
