export type ToolDefinition = {
  slug: string;
  title: string;
  description: string;
  category: string;
  mode: string;
};

export const tools: ToolDefinition[] = [
  { slug: "aes-256-cbc", title: "AES-256-CBC Encrypt / Decrypt", description: "Encrypt and decrypt text locally with AES-256-CBC.", category: "Security", mode: "aes" },
  { slug: "age-calculator", title: "Age Calculator", description: "Calculate your age in years, months, and days.", category: "Calculators", mode: "age" },
  { slug: "base64-encode-decode", title: "Base64 Encode / Decode", description: "Encode and decode Unicode text with Base64.", category: "Text & Code", mode: "base64" },
  { slug: "case-converter", title: "Case Converter", description: "Convert text between popular letter cases.", category: "Text & Code", mode: "case" },
  { slug: "contribution", title: "Contribute", description: "Help support the continued development of ConvoTools.", category: "About", mode: "contribution" },
  { slug: "emi-calculator", title: "EMI Calculator", description: "Estimate monthly loan payments, interest and total repayment.", category: "Calculators", mode: "emi" },
  { slug: "excel-to-json", title: "Excel to JSON", description: "Convert an Excel workbook into structured JSON.", category: "Data", mode: "file-conversion" },
  { slug: "image-compressor", title: "Image Compressor", description: "Resize and compress an image in your browser.", category: "Images", mode: "image-compressor" },
  { slug: "jpg-to-png", title: "JPG to PNG", description: "Convert a JPG image into a PNG file locally.", category: "Images", mode: "file-conversion" },
  { slug: "json-beautifier", title: "JSON Beautifier", description: "Format, validate and minify JSON.", category: "Developer Tools", mode: "json-format" },
  { slug: "json-stringify", title: "JSON Stringify", description: "Escape JSON into a string value.", category: "Developer Tools", mode: "json-stringify" },
  { slug: "json-to-csv", title: "JSON to CSV", description: "Convert JSON objects to a downloadable CSV file.", category: "Data", mode: "file-conversion" },
  { slug: "json-to-excel", title: "JSON to Excel", description: "Create an Excel workbook from JSON records.", category: "Data", mode: "file-conversion" },
  { slug: "json-to-table", title: "JSON to Table", description: "View JSON records as a readable table.", category: "Developer Tools", mode: "json-table" },
  { slug: "json-to-xml", title: "JSON to XML", description: "Convert structured JSON data to XML.", category: "Data", mode: "file-conversion" },
  { slug: "json-unstringify", title: "JSON Unstringify", description: "Parse a JSON-encoded string back into a value.", category: "Developer Tools", mode: "json-unstringify" },
  { slug: "payment-qr-generator", title: "Payment QR Generator", description: "Generate a QR code from your payment details.", category: "QR Tools", mode: "payment-qr" },
  { slug: "qr-generator", title: "QR Code Generator", description: "Create a downloadable QR code from text or a URL.", category: "QR Tools", mode: "qr-generator" },
  { slug: "qr-scanner", title: "QR Code Scanner", description: "Read a QR code from an image on your device.", category: "QR Tools", mode: "qr-scanner" },
  { slug: "sip-calculator", title: "SIP Calculator", description: "Estimate the future value of monthly mutual-fund investments.", category: "Calculators", mode: "sip" },
  { slug: "text-to-one-line", title: "Text to One Line", description: "Clean up line breaks and whitespace in text.", category: "Text & Code", mode: "one-line" },
  { slug: "tryit", title: "HTML, CSS & JavaScript Playground", description: "Preview a small HTML document in an isolated frame.", category: "Developer Tools", mode: "playground" },
  { slug: "url-encoder-decoder", title: "URL Encoder / Decoder", description: "Encode or decode text for use in URLs.", category: "Text & Code", mode: "url" },
  { slug: "uuid-generator", title: "UUID Generator", description: "Create random UUID v4 identifiers in your browser.", category: "Developer Tools", mode: "uuid" },
  { slug: "word-to-pdf", title: "Word to PDF", description: "Convert plain text or DOCX documents into a PDF.", category: "Documents", mode: "word-to-pdf" },
  { slug: "xml-to-json", title: "XML to JSON", description: "Parse an XML document into JSON.", category: "Data", mode: "file-conversion" },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
