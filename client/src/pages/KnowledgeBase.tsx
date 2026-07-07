import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Upload, Trash2, File, FileText, Loader2, Cpu } from "lucide-react";
import { toast } from "sonner";

type DocumentType = "FAQ" | "RefundPolicy" | "Shipping" | "Warranty" | "Pricing" | "Products" | "Installation" | "UserManual";

export default function KnowledgeBase() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<DocumentType>("FAQ");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: documents, refetch } = trpc.kb.listDocuments.useQuery();
  const uploadMutation = trpc.kb.uploadDocument.useMutation();
  const deleteMutation = trpc.kb.deleteDocument.useMutation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const documentTypes: { value: DocumentType; label: string; description: string }[] = [
    { value: "FAQ", label: "FAQ / Operations", description: "Operating hours, corporate orders, tracking details" },
    { value: "RefundPolicy", label: "Refund & Returns", description: "Standard return guidelines, shipping labels, restocking fees" },
    { value: "Shipping", label: "Shipping Policy", description: "Free shipping rules, speed upgrades, carrier providers" },
    { value: "Warranty", label: "Warranty Policy", description: "Hardware warranty duration, coverage limits, claims" },
    { value: "Pricing", label: "Pricing & Matching", description: "Price match guarantees, tax rules, match eligibility" },
    { value: "Products", label: "Product Catalog", description: "Product models, hardware specifications, prices" },
    { value: "Installation", label: "Installation Guides", description: "Device installation, network configurations, pairing apps" },
    { value: "UserManual", label: "User Manuals", description: "Safety instructions, reset sequences, support contacts" },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const base64 = content.split(",")[1] || content;

        await uploadMutation.mutateAsync({
          documentType: selectedType,
          fileName: file.name,
          fileContent: base64,
        });

        toast.success("Document uploaded successfully");
        refetch();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
    setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  const handleDelete = async (documentId: number) => {
    try {
      await deleteMutation.mutateAsync({ documentId });
      toast.success("Document deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#222222] font-sans antialiased flex flex-col">
      {/* Auth Top Header */}
      <header className="h-20 border-b border-[#ebebeb] bg-white sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 cursor-pointer animate-fade-in" onClick={() => setLocation("/")}>
          <Cpu className="w-8 h-8 text-[#ff385c]" />
          <span className="font-bold text-xl text-[#ff385c] tracking-tight">SupportFlow</span>
        </div>

        {/* Dashboard Products (Services tab active since Knowledge Base is a Service tool) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <span className="text-[#6a6a6a] hover:text-[#222222] pb-2 cursor-pointer transition-colors" onClick={() => setLocation("/")}>Homes</span>
          <span className="text-[#6a6a6a] hover:text-[#222222] pb-2 cursor-pointer transition-colors" onClick={() => setLocation("/")}>Experiences <span className="text-[8px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-bold ml-1">NEW</span></span>
          <span className="text-[#222222] border-b-2 border-[#ff385c] pb-2 cursor-pointer">Services <span className="text-[8px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-bold ml-1">NEW</span></span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[#6a6a6a]">Logged in as: <strong className="text-[#222222]">{user?.name}</strong></span>
          <button
            onClick={() => setLocation("/")}
            className="text-xs font-semibold text-[#6a6a6a] border border-[#dddddd] px-3.5 py-2 rounded-lg hover:bg-[#f7f7f7] transition-all"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-[#f7f7f7] border border-[#dddddd] rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-[#222222]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#222222]">Knowledge Base</h1>
            <p className="text-xs text-[#6a6a6a]">Manage and index company training manuals, return policies, and FAQs for real-time RAG context</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upload Card */}
          <Card 
            className="bg-white border border-[#dddddd] p-6 rounded-xl h-fit"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
          >
            <h2 className="text-base font-bold text-[#222222] mb-6">Upload Document</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6a6a6a] block mb-2 uppercase tracking-wider">
                  Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  className="w-full bg-white border border-[#dddddd] text-[#222222] rounded-lg px-3.5 py-2 text-sm focus:border-[#222222] focus:outline-none"
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-all disabled:opacity-50 ${
                  isDragging
                    ? "border-[#ff385c] bg-[#ff385c]/5"
                    : "border-[#dddddd] hover:border-[#222222] hover:bg-[#f7f7f7]"
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#ff385c] animate-spin" />
                    <p className="text-sm font-semibold text-[#222222]">Uploading file...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-[#6a6a6a]" />
                    <p className="text-sm font-semibold text-[#222222]">Click or drag file to upload</p>
                    <p className="text-xs text-[#6a6a6a]">PDF, TXT, DOC up to 10MB</p>
                  </div>
                )}
              </button>

              <div className="bg-[#f7f7f7] border border-[#ebebeb] rounded-xl p-3.5">
                <p className="text-xs text-[#6a6a6a]">
                  <span className="font-bold text-[#222222]">Upload Target:</span> {getDocumentTypeLabel(selectedType)}
                </p>
              </div>
            </div>
          </Card>

          {/* Documents List Card */}
          <Card 
            className="bg-white border border-[#dddddd] p-6 lg:col-span-2 rounded-xl"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
          >
            <h2 className="text-base font-bold text-[#222222] mb-6">Indexed Knowledge Base Documents</h2>

            {documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-[#f7f7f7] border border-[#ebebeb] rounded-xl hover:bg-[#f0f0f0] transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-white border border-[#dddddd] rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[#ff385c]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#222222] font-semibold text-sm truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-[10px] bg-[#ff385c]/10 text-[#ff385c] font-bold px-2 py-0.5 rounded-full">
                            {getDocumentTypeLabel(doc.documentType)}
                          </span>
                          <span className="text-[10px] text-[#6a6a6a] font-medium">
                            {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : ""}
                          </span>
                          <span className="text-[10px] text-[#6a6a6a] font-medium">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="border border-[#dddddd] hover:bg-[#fff1f2] hover:border-red-200 text-[#6a6a6a] hover:text-red-600 p-2.5 rounded-xl transition-all ml-4"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-[#ebebeb] border-dashed rounded-xl">
                <File className="w-12 h-12 text-[#dddddd] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#222222]">No documents uploaded yet</p>
                <p className="text-xs text-[#6a6a6a] mt-1">Upload training guides or text documents to enrich agent RAG retrieval context</p>
              </div>
            )}
          </Card>
        </div>

        {/* Document Categories Overview */}
        <Card 
          className="bg-white border border-[#dddddd] p-6 rounded-xl"
          style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
        >
          <h3 className="text-base font-bold text-[#222222] mb-4">Supported Document Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {documentTypes.map(type => (
              <div key={type.value} className="bg-[#f7f7f7] border border-[#ebebeb] rounded-xl p-4">
                <p className="text-xs font-bold text-[#222222]">{type.label}</p>
                <p className="text-[11px] text-[#6a6a6a] mt-1 leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
