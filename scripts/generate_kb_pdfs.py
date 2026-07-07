import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_pdf(filename, title, content_paragraphs):
    os.makedirs("knowledge_base", exist_ok=True)
    filepath = os.path.join("knowledge_base", filename)
    
    # Standard document template with letter size and margins
    doc = SimpleDocTemplate(
        filepath, 
        pagesize=letter, 
        rightMargin=54, 
        leftMargin=54, 
        topMargin=54, 
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom heading style matching clean ink aesthetics
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#222222'),
        spaceAfter=15
    )
    
    # Body text style
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#333333'),
        spaceAfter=8
    )
    
    story = []
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 12))
    
    for para in content_paragraphs:
        # Wrap line breaks with html tag to preserve layout in PDF
        formatted_para = para.replace("\n", "<br/>")
        story.append(Paragraph(formatted_para, body_style))
        
    doc.build(story)
    print(f"Successfully generated: {filepath}")

def main():
    # 1. FAQ.pdf
    create_pdf(
        "FAQ.pdf",
        "TechMart Electronics - Frequently Asked Questions (FAQ)",
        [
            "<strong>Q1: What are TechMart Electronics store operating hours?</strong>\n"
            "Operating Hours: TechMart stores are open Monday through Saturday from 9:00 AM to 9:00 PM, "
            "and Sunday from 11:00 AM to 6:00 PM. Store locations are closed on major holidays, including "
            "New Year's Day, Thanksgiving Day, and Christmas Day.",
            
            "<strong>Q2: How can I track my online order?</strong>\n"
            "Once an order is shipped, a shipping confirmation email is dispatched containing a tracking link and code. "
            "Alternatively, tracking updates can be queried directly on the 'Orders' dashboard by logging "
            "into your registered customer profile.",
            
            "<strong>Q3: Can corporate accounts or educational institutions place tax-exempt orders?</strong>\n"
            "Yes. Corporate entities, schools, and non-profit groups can establish purchase orders and submit "
            "tax-exempt validation certificates by emailing sales@techmart.com.",
            
            "<strong>Q4: Do you offer same-day home delivery?</strong>\n"
            "Same-day delivery is offered for select zip codes on orders submitted before 1:00 PM local time. "
            "The default fee is $9.99, which is waived for TechMart VIP account members."
        ]
    )

    # 2. RefundPolicy.pdf
    create_pdf(
        "RefundPolicy.pdf",
        "TechMart Electronics - Return & Refund Policy",
        [
            "<strong>Standard Return Window:</strong>\n"
            "TechMart Electronics accepts returns within 30 days of initial purchase for a full refund or "
            "exchange, provided the item is in its original packaging with all included accessories, manuals, "
            "and proof of purchase.",
            
            "<strong>Restocking Fees:</strong>\n"
            "A restocking fee of 10% will be applied to opened laptops, smartphones, tablet computers, "
            "and professional cameras. This fee is automatically deducted from the final refund amount.",
            
            "<strong>Return Shipping Labels:</strong>\n"
            "Return shipping is free when using my pre-printed shipping labels. Customers can request "
            "a digital return label by contacting returns@techmart.com with their order details.",
            
            "<strong>Refund Processing Timelines:</strong>\n"
            "Once returns are inspected and checked in at my warehouse location, refunds are processed "
            "back to the original payment source within 5 to 7 business days."
        ]
    )

    # 3. ShippingPolicy.pdf
    create_pdf(
        "ShippingPolicy.pdf",
        "TechMart Electronics - General Shipping & Delivery Policy",
        [
            "<strong>Shipping Rates & Free Shipping Thresholds:</strong>\n"
            "Standard shipping (3 to 5 business days) is free of charge for all domestic orders totaling $49 "
            "or more. For orders under $49, a flat rate shipping fee of $5.99 is assessed at checkout.",
            
            "<strong>Expedited Shipping Upgrades:</strong>\n"
            "Two-Day Express shipping is available to most residential addresses for a flat fee of $14.99. "
            "Next-day overnight delivery can be requested for $29.99 on orders placed before 2:00 PM EST.",
            
            "<strong>Delivery Carriers:</strong>\n"
            "Shipments are dispatched via major delivery providers, including FedEx, UPS, and DHL. Delivery tracking "
            "links will display which carrier is handling your package.",
            
            "<strong>International Shipping & Import Duties:</strong>\n"
            "We ship internationally to selected global locations starting at a base cost of $25.00. Customs duties, "
            "import tariffs, and clearance taxes are the sole responsibility of the customer upon arrival."
        ]
    )

    # 4. Warranty.pdf
    create_pdf(
        "Warranty.pdf",
        "TechMart Electronics - Limited Manufacturer Warranty",
        [
            "<strong>Warranty Period:</strong>\n"
            "All new consumer electronics sold by TechMart carry a 1-Year Limited Manufacturer Warranty from the "
            "original date of purchase. Refurbished hardware items carry a 90-Day Limited Warranty.",
            
            "<strong>What is Covered:</strong>\n"
            "This warranty covers physical defects in materials and craftsmanship when the product is operated "
            "under normal conditions according to my user documentation.",
            
            "<strong>What is NOT Covered:</strong>\n"
            "The warranty is voided in cases of physical drops, screen fractures, water immersion, electrical surges, "
            "unauthorized modifications, or cosmetic scratch wear.",
            
            "<strong>How to Make a Claim:</strong>\n"
            "Warranty inquiries should be routed to warranty@techmart.com. Claims must include the product's "
            "unique serial number, purchase receipt, and a brief description of the hardware defect."
        ]
    )

    # 5. Pricing.pdf
    create_pdf(
        "Pricing.pdf",
        "TechMart Electronics - Pricing & Price Match Policy",
        [
            "<strong>Price Match Guarantee:</strong>\n"
            "TechMart offers a price match guarantee against major authorized electronic dealers (including "
            "BestBuy and Amazon). The matched item must be in-stock and identical in brand, color, and model.",
            
            "<strong>Matching Period:</strong>\n"
            "Price matching requests can be processed at the initial checkout or within 14 days of purchase. "
            "If matched within 14 days, the price difference will be refunded to your original payment method.",
            
            "<strong>Exclusions:</strong>\n"
            "Price matching does not apply to clearance events, holiday promotions (e.g. Black Friday or Cyber Monday), "
            "refurbished items, or typographical errors in competitor pricing.",
            
            "<strong>Sales Taxes:</strong>\n"
            "Appropriate sales taxes are determined based on local municipal tax laws and the shipping destination address."
        ]
    )

    # 6. Products.pdf
    create_pdf(
        "Products.pdf",
        "TechMart Electronics - Product Catalog & Specifications",
        [
            "<strong>1. Laptops & Computers:</strong>\n"
            "• <i>TechMart ProBook 14</i> - Retail Price: $899.99 (Features: Intel Core i7 CPU, 16GB LPDDR5 RAM, 512GB NVMe SSD)\n"
            "• <i>TechMart LiteBook 13</i> - Retail Price: $499.99 (Features: Intel Core i3 CPU, 8GB RAM, 256GB SSD)",
            
            "<strong>2. Smart Home Solutions:</strong>\n"
            "• <i>TechMart SmartPlug V2</i> - Retail Price: $19.99 (Features: WiFi pairing, voice control, energy monitoring)\n"
            "• <i>TechMart HomeCam 1080p</i> - Retail Price: $59.99 (Features: 1080p HD, night vision, local storage slot)",
            
            "<strong>3. Gaming & Accessories:</strong>\n"
            "• <i>TechMart G-Switch Controller</i> - Retail Price: $39.99 (Features: Wireless Bluetooth, dual haptic motors)\n"
            "• <i>TechMart Headset Pro</i> - Retail Price: $79.99 (Features: Spatial audio sound, active noise-canceling mic)"
        ]
    )

    # 7. InstallationGuide.pdf
    create_pdf(
        "InstallationGuide.pdf",
        "TechMart Electronics - SmartPlug V2 Installation Guide",
        [
            "<strong>Step 1: Powering On the Device</strong>\n"
            "Plug the TechMart SmartPlug V2 into a wall power outlet. The LED indicator on the side will "
            "begin flashing green, indicating that it is in setup pairing mode.",
            
            "<strong>Step 2: Network Preparation</strong>\n"
            "Ensure your mobile smartphone is connected to a 2.4GHz WiFi wireless band. Note: The SmartPlug "
            "does not support 5GHz network configurations.",
            
            "<strong>Step 3: Application Setup</strong>\n"
            "Download and log into the TechMart Smart Home App. Tap the '+' icon in the top right corner, "
            "select 'SmartPlug V2' from the list, and input your local WiFi network credentials.",
            
            "<strong>Step 4: Pairing Execution</strong>\n"
            "Wait 30 seconds for the indicator light to solid-green lock. Once connected, name the smart plug "
            "in the app to enable Google Assistant or Amazon Alexa voice controls."
        ]
    )

    # 8. UserManual.pdf
    create_pdf(
        "UserManual.pdf",
        "TechMart Electronics - General User Manual & Safety Guide",
        [
            "<strong>Electrical Safety Guidelines:</strong>\n"
            "To prevent shocks or fires, do not expose TechMart devices to high moisture, water spills, "
            "or direct heat elements. Use only the factory-supplied wall charging adapters.",
            
            "<strong>Factory Reset Procedures:</strong>\n"
            "To restore default settings, locate the reset button pinhole. Using a paperclip, press and "
            "hold the button for 10 seconds until the status indicator flashes amber.",
            
            "<strong>Troubleshooting Support Contact:</strong>\n"
            "For hardware diagnostics, spare parts queries, or device guide assistance, email "
            "support@techmart.com to speak with a technical support representative."
        ]
    )

if __name__ == "__main__":
    main()
