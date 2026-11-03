import JSZip from "jszip";
import YAML from "yaml";
import type { Converter } from "@/types/converter";

export type ConversionResult = {
  blob: Blob;
  filename: string;
  preview?: string;
};

const textPairs = new Set([
  "json:json",
  "json:csv",
  "json:xml",
  "json:yaml",
  "json:sql",
  "json:jsonl",
  "jsonl:json",
  "jsonl:csv",
  "jsonl:sql",
  "jsonl:yaml",
  "yaml:json",
  "csv:json",
  "csv:jsonl",
  "csv:xml",
  "csv:sql",
  "csv:srt",
  "csv:yaml",
  "xml:json",
  "xml:csv",
  "xml:jsonl",
  "xml:sql",
  "xml:yaml",
  "rss:json",
  "srt:csv",
  "srt:ass",
  "srt:text",
  "srt:vtt",
  "ass:csv",
  "ass:json",
  "ass:jsonl",
  "ass:sql",
  "ass:srt",
  "ass:text",
  "ass:vtt",
  "vtt:csv",
  "vtt:json",
  "vtt:jsonl",
  "vtt:sql",
  "vtt:ass",
  "vtt:srt",
  "vtt:text",
  "html:csv",
  "html:json",
  "html:markdown",
  "html:word",
  "rss:jsonl",
  "rss:csv",
  "rss:sql",
  "sitemap:json",
  "sitemap:jsonl",
  "sitemap:csv",
  "sitemap:sql",
  "markdown:html",
  "markdown:text",
  "markdown:epub",
  "markdown:pdf",
  "markdown:docx",
  "markdown:latex",
]);
const spreadsheetFormats = new Set(["excel", "xlsx"]);
const spreadsheetTargets = new Set(["excel", "xlsx", "csv", "json", "jsonl", "xml", "sql", "srt", "ass", "html", "pdf"]);
const recordSources = new Set(["json", "jsonl", "json-objects", "gstr-json", "ais-json", "postman-test-results", "bson", "edi", "csv", "xml", "rss", "sitemap", "html", "srt", "ass", "vtt", "parquet"]);
const imageFormats = new Set(["jpg", "jpeg", "png", "webp", "svg", "avif", "heic", "jxl", "bmp", "gif", "tiff", "pgm", "ppm", "pam", "yuv"]);
const rasterImageTargets = new Set(["jpg", "png", "webp", "avif", "jxl", "bmp", "gif", "pgm", "ppm", "pam", "yuv", "svg", "tiff"]);
const acceptedImagePairs = new Set([
  "jpg:png", "jpg:webp", "png:jpg", "png:webp",
  "webp:jpg", "webp:png", "svg:jpg", "svg:png",
]);

export function supportsConverter(converter: Converter): boolean {
  const pair = `${converter.source}:${converter.target}`;
  if (converter.category === "images") {
    if (["compress-image", "remove-exif-data"].includes(converter.id)) return true;
    if (converter.target === "heic") return false;
    return imageFormats.has(converter.source) && rasterImageTargets.has(converter.target);
  }
  if (converter.category === "media") return true;
  if (converter.id === "validate-xml-xsd") return true;
  if (converter.id === "fix-xml-escaping") return true;
  if (textPairs.has(pair)) return true;
  if (spreadsheetFormats.has(converter.source) && [...spreadsheetTargets, "ods", "parquet", "xls"].includes(converter.target)) return true;
  if (converter.source === "ods" && ["csv", "excel", "xlsx", "pdf", "json", "jsonl", "sql", "html", "parquet", "srt"].includes(converter.target)) return true;
  if (recordSources.has(converter.source) && ["excel", "xlsx"].includes(converter.target)) return true;
  if (recordSources.has(converter.source) && ["csv", "json", "jsonl", "xml", "sql", "parquet"].includes(converter.target)) return true;
  if (converter.source === "excel-xml" && converter.target === "excel-xlsx") return true;
  if (converter.source === "html-meta" && converter.target === "json") return true;
  if (converter.source === "srt" && converter.target === "xls") return true;
  if (converter.source === "xls" && converter.target === "srt") return true;
  if (converter.id.startsWith("ocr-")) return true;
  if (converter.source === "powerpoint" && ["html", "pdf", "text"].includes(converter.target)) return true;
  if (converter.source === "oxps" && converter.target === "pdf") return true;
  if (["docx", "word"].includes(converter.source) && ["pdf", "text", "html", "markdown", "latex"].includes(converter.target)) return true;
  if (converter.source === "pdf" && ["csv", "excel", "html", "jpg", "png", "svg", "text", "word", "tiff", "epub", "fb2", "fbz"].includes(converter.target)) return true;
  if (converter.source === "pdf" && converter.target === "pdf") return true;
  if (["docx", "word"].includes(converter.source) && ["pdf", "text", "html", "markdown", "latex"].includes(converter.target)) return true;
  if (["html", "markdown"].includes(converter.source) && ["docx", "word"].includes(converter.target)) return true;
  if (["html", "website"].includes(converter.source) && ["pdf", "jpg", "png"].includes(converter.target)) return true;
  if (converter.source === "epub" && ["pdf", "html", "text"].includes(converter.target)) return true;
  if (["fb2", "fbz"].includes(converter.source) && converter.target === "pdf") return true;
  if (["azw", "azw3", "mobi"].includes(converter.source) && ["pdf", "epub"].includes(converter.target)) return true;
  if (["jpg", "png"].includes(converter.source) && converter.target === "pdf") return true;
  if (converter.source === "bson" && ["csv", "excel"].includes(converter.target)) return true;
  if (converter.source === "edi" && ["csv", "excel"].includes(converter.target)) return true;
  if (converter.source === "parquet" && ["csv", "excel", "json", "jsonl", "sql"].includes(converter.target)) return true;
  if (["json", "jsonl", "csv", "excel", "xml", "rss", "sitemap"].includes(converter.source) && converter.target === "parquet") return true;
  return false;
}

export function converterAvailabilityMessage(converter: Converter): string {
  if (converter.source === "numbers") {
    return "Apple Numbers uses a proprietary workbook format without a reliable browser parser. Export it as Excel or CSV in Numbers, then use the matching converter here.";
  }
  if (converter.target === "xps") {
    return "Creating XPS requires a dedicated document-print engine that browsers do not provide. Export the workbook as PDF instead.";
  }
  if (converter.target === "heic") {
    return "This site can read HEIC images, but browser-compatible HEIC encoders are not included. Choose AVIF, JPEG, or PNG as the output format.";
  }
  if (["azw", "mobi"].includes(converter.source) && ["azw", "mobi"].includes(converter.target)) {
    return "Changing between AZW and MOBI requires an ebook writer, which is not included. DRM-free Kindle files can be converted to PDF or EPUB here.";
  }
  if (["azw", "azw3", "mobi"].includes(converter.target)) {
    return "Creating Kindle AZW/MOBI files requires a proprietary ebook encoder. DRM-free AZW, AZW3, and MOBI files can be converted to PDF or EPUB here.";
  }
  return "This conversion needs a specialized format engine that is not included in this browser-based app.";
}

export function acceptedFileTypes(source: string): string {
  if (spreadsheetFormats.has(source)) return ".xlsx";
  if (source === "ods") return ".ods";
  if (source === "bson") return ".bson";
  if (source === "parquet") return ".parquet";
  if (source === "xls") return ".xls";
  if (source === "ocr-jpg") return ".jpg,.jpeg";
  if (source === "ocr-png") return ".png";
  if (source === "edi") return ".edi,.txt";
  if (source === "pdf" || source === "ocr-pdf") return ".pdf";
  if (source === "image") return "image/*";
  if (source === "video") return "video/*";
  if (["avi", "mkv", "mov", "mp4", "flac", "mp3", "wav"].includes(source)) return `.${source}`;
  if (source === "powerpoint") return ".pptx";
  if (source === "oxps") return ".oxps,.xps";
  if (imageFormats.has(source)) return source === "jpg" || source === "jpeg" ? ".jpg,.jpeg" : `.${source}`;
  if (source === "docx" || source === "word") return ".docx,.txt";
  if (source === "epub") return ".epub";
  if (source === "azw" || source === "azw3" || source === "mobi") return `.${source}`;
  if (source === "srt") return ".srt,.txt";
  if (source === "ass") return ".ass,.txt";
  if (source === "vtt") return ".vtt,.txt";
  if (source === "excel-xml" || source === "xml" || source === "rss" || source === "sitemap") return ".xml,.txt";
  if (source === "html" || source === "html-meta") return ".html,.htm,.txt";
  if (source === "markdown") return ".md,.markdown,.txt";
  if (source === "yaml") return ".yaml,.yml,.txt";
  if (source === "xlsx") return ".xlsx";
  if (source === "jpg") return ".jpg,.jpeg";
  if (source === "png") return ".png";
  if (source === "svg") return ".svg,image/svg+xml";
  if (source === "webp") return ".webp";
  if (source === "json") return ".json,.txt";
  if (source === "jsonl") return ".jsonl,.ndjson,.txt";
  if (source === "csv") return ".csv,.txt";
  if (source.endsWith("-json") || source === "postman-test-results") return ".json,.txt";
  return ".txt";
}

export async function convertFile(
  converter: Converter,
  input: string,
  file?: File,
  schema = "",
): Promise<ConversionResult> {
  const { source, target } = converter;
  if (!supportsConverter(converter)) {
    throw new Error(converterAvailabilityMessage(converter));
  }
  if (converter.category === "images") {
    if (!file) throw new Error("Choose an image file to convert.");
    return convertImage(file, source, target, converter.id);
  }
  if (converter.category === "media") {
    if (!file) throw new Error("Choose an audio or video file to convert.");
    return convertMedia(file, converter);
  }
  if (converter.id === "validate-xml-xsd") return validateXml(file ? await file.text() : input, schema);
  if (converter.id.startsWith("ocr-")) {
    if (!file) throw new Error("Choose an image or PDF file to run OCR.");
    return runOcr(file, target, converter.id);
  }
  if (source === "powerpoint") {
    if (!file) throw new Error("Choose a PowerPoint (.pptx) file.");
    const text = await extractPowerPointText(file);
    if (target === "html") return textResult(`<article>${text.split(/\n{2,}/).map((part) => `<p>${escapeHtml(part)}</p>`).join("\n")}</article>`, "html");
    if (target === "pdf") return pdfFromText(text, converter.id);
    return textResult(text, "text");
  }
  if (source === "oxps") {
    if (!file) throw new Error("Choose an XPS/OXPS file.");
    return pdfFromText(await extractXpsText(file), converter.id);
  }
  if (source === "pdf") {
    if (!file) throw new Error("Choose a PDF file to convert.");
    return convertPdf(file, target, converter.id);
  }
  if (source === "ods") {
    if (!file) throw new Error(`Choose a ${source.toUpperCase()} file to convert.`);
    const records = await readOds(file);
    return renderRecords(records, target, converter.id);
  }
  if (source === "xls" && target === "srt") {
    if (!file) throw new Error("Choose an Excel XML (.xls) file.");
    const records = parseSpreadsheetMl(await file.text());
    return textResult(toSrt(records), "srt");
  }
  if (source === "parquet") {
    if (!file) throw new Error("Choose a Parquet file to convert.");
    return convertParquet(file, target, converter.id);
  }
  if (target === "parquet") {
    const records = await readTabularInput(source, input, file);
    return createParquet(records, converter.id);
  }
  if (source === "bson" || source === "edi" || ["gstr-json", "ais-json", "json-objects", "postman-test-results"].includes(source)) {
    const records = await readTabularInput(source, input, file);
    return renderRecords(records, target, converter.id);
  }
  if (source === "website") {
    return convertWebsite(input, target, converter.id);
  }
  if (source === "html" && (target === "jpg" || target === "png")) {
    return htmlToImage(file ? await file.text() : input, target);
  }
  if (source === "docx" || source === "word") {
    if (!file && !input.trim()) throw new Error("Choose a DOCX file or enter text to convert.");
    const isDocx = Boolean(file?.name.toLowerCase().endsWith(".docx"));
    const text = isDocx
      ? await extractDocxText(file!)
      : (file ? await file.text() : input);
    if (target === "pdf") return pdfFromText(text, converter.id);
    if (target === "html") {
      const html = isDocx
        ? await extractDocxHtml(file!)
        : `<article>${text.split(/\r?\n/).map((line) => `<p>${escapeHtml(line)}</p>`).join("\n")}</article>`;
      return textResult(html, "html");
    }
    if (target === "markdown" && isDocx) return textResult(htmlToMarkdown(new DOMParser().parseFromString(await extractDocxHtml(file!), "text/html").body), "markdown");
    if (target === "markdown") return textResult(markdownToPlainText(text), "markdown");
    if (target === "latex") return textResult(plainTextToLatex(text), "latex");
    return textResult(text, "text");
  }
  if (source === "epub") {
    if (!file) throw new Error("Choose an EPUB file to convert.");
    const text = await extractEpubText(file);
    if (target === "pdf") return pdfFromText(text, converter.id);
    if (target === "html") return textResult(`<article>${text.split(/\n{2,}/).map((part) => `<p>${escapeHtml(part)}</p>`).join("\n")}</article>`, "html");
    return textResult(text, "text");
  }
  if (source === "azw" || source === "azw3" || source === "mobi") {
    if (!file) throw new Error(`Choose a ${source.toUpperCase()} ebook file.`);
    const text = await extractKindleText(file, source);
    if (target === "pdf") return pdfFromText(text, converter.id);
    return convertMarkdownToEpub(text);
  }
  if (source === "fb2" || source === "fbz") {
    if (!file) throw new Error(`Choose a ${source.toUpperCase()} ebook file.`);
    const text = await extractFb2Text(file, source);
    return pdfFromText(text, converter.id);
  }
  if (source === "excel-xml") {
    const xml = file ? await file.text() : input;
    if (!xml.trim()) throw new Error("Choose an Excel XML file or paste its contents.");
    return renderRecords(parseSpreadsheetMl(xml), "xlsx", converter.id);
  }
  if (spreadsheetFormats.has(source)) {
    if (!file) throw new Error("Choose an Excel workbook (.xlsx) to convert.");
    const records = await readWorkbook(file);
    if (target === "ods") return createOds(records, converter.id);
    return renderRecords(records, target, converter.id);
  }
  if (source === "jpg" || source === "png") {
    if (!file) throw new Error("Choose an image file to convert.");
    return imageToPdf(file);
  }
  if (source === "html" && ["word", "docx"].includes(target)) {
    const document = new DOMParser().parseFromString(file ? await file.text() : input, "text/html");
    return createDocx(document.body.innerText, converter.id);
  }
  if (source === "xml" && target === "xml") return textResult(fixXml(file ? await file.text() : input), "xml");
  if (converter.id === "fix-xml-escaping") return textResult(fixXml(input), "xml");
  if (!input.trim() && !file) throw new Error("Choose a file or enter text to convert.");
  const value = file ? parseInput(await file.text(), source) : parseInput(input, source);
  return convertText(value, source, target);
}

function textResult(text: string, format: string): ConversionResult {
  return blobResult(new Blob([text], { type: mimeType(format) }), `converted.${format === "yaml" ? "yaml" : format}`, text);
}

function blobResult(blob: Blob, filename: string, preview?: string): ConversionResult {
  return { blob, filename, preview };
}

function mimeType(format: string): string {
  return {
    csv: "text/csv;charset=utf-8",
    json: "application/json;charset=utf-8",
    jsonl: "application/x-ndjson;charset=utf-8",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    xls: "application/vnd.ms-excel",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fb2: "application/x-fictionbook+xml",
    pdf: "application/pdf",
    ass: "text/plain;charset=utf-8",
    latex: "text/plain;charset=utf-8",
    xml: "application/xml;charset=utf-8",
    yaml: "text/yaml;charset=utf-8",
    sql: "application/sql;charset=utf-8",
    srt: "text/plain;charset=utf-8",
    vtt: "text/vtt;charset=utf-8",
    html: "text/html;charset=utf-8",
    svg: "image/svg+xml",
    markdown: "text/markdown;charset=utf-8",
    text: "text/plain;charset=utf-8",
  }[format] ?? "text/plain;charset=utf-8";
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell.length === 0) quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("The CSV input contains an unclosed quoted field.");
  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  if (rows.length === 0) throw new Error("The CSV input is empty.");
  const headers = rows[0].map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim());
  if (headers.some((header) => !header)) throw new Error("Every CSV column must have a header.");
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function parseXml(text: string): unknown {
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.querySelector("parsererror")) throw new Error("The XML input is not well formed.");
  const readElement = (element: Element): unknown => {
    const result: Record<string, unknown> = {};
    for (const attribute of [...element.attributes]) result[`@${attribute.name}`] = attribute.value;
    for (const child of [...element.children]) {
      const value = readElement(child);
      if (Object.hasOwn(result, child.tagName)) {
        const previous = result[child.tagName];
        result[child.tagName] = Array.isArray(previous) ? [...previous, value] : [previous, value];
      } else result[child.tagName] = value;
    }
    const textValue = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent?.trim() ?? "").filter(Boolean).join(" ");
    if (textValue) {
      if (Object.keys(result).length) result["#text"] = textValue;
      else return textValue;
    }
    return result;
  };
  return { [document.documentElement.tagName]: readElement(document.documentElement) };
}

function parseInput(text: string, source: string): unknown {
  if (source === "json") return JSON.parse(text);
  if (source === "jsonl") return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line));
  if (source === "csv") return parseCsv(text);
  if (source === "xml" || source === "rss" || source === "sitemap") return parseXml(text);
  if (source === "html") return parseHtmlTable(text);
  if (source === "html-meta") return parseHtmlMetadata(text);
  if (source === "yaml") return YAML.parse(text);
  if (source === "markdown") return text;
  if (source === "srt") return parseSrt(text);
  if (source === "ass") return parseAss(text);
  if (source === "vtt") return parseVtt(text);
  if (source.endsWith("-json") || source === "postman-test-results") return JSON.parse(text);
  throw new Error(`The ${source.toUpperCase()} input format is not supported locally.`);
}

async function validateXml(xml: string, schema: string): Promise<ConversionResult> {
  if (!xml.trim()) throw new Error("Provide the XML document to validate.");
  if (!schema.trim()) throw new Error("Provide an XSD schema to validate against.");
  const { XmlDocument, XsdValidator } = await import("libxml2-wasm");
  let xmlDocument: InstanceType<typeof XmlDocument> | undefined;
  let schemaDocument: InstanceType<typeof XmlDocument> | undefined;
  let validator: InstanceType<typeof XsdValidator> | undefined;
  try {
    xmlDocument = XmlDocument.fromString(xml);
    schemaDocument = XmlDocument.fromString(schema);
    validator = XsdValidator.fromDoc(schemaDocument);
    validator.validate(xmlDocument);
    return textResult("Valid: the XML document conforms to the supplied XSD schema.", "text");
  } catch (error) {
    throw new Error(`XSD validation failed: ${error instanceof Error ? error.message : "The XML document is invalid."}`);
  } finally {
    validator?.dispose();
    schemaDocument?.dispose();
    xmlDocument?.dispose();
  }
}

async function readTabularInput(source: string, input: string, file?: File): Promise<Record<string, unknown>[]> {
  if (source === "bson") {
    if (!file) throw new Error("Choose a BSON file.");
    const { deserialize } = await import("bson");
    const decoded = deserialize(new Uint8Array(await file.arrayBuffer()));
    return asRecords(decoded);
  }
  const text = file ? await file.text() : input;
  if (!text.trim() && !file) throw new Error("Choose a file or enter data to convert.");
  if (source === "edi") return parseEdi(text);
  if (source === "parquet") throw new Error("Choose a Parquet file to convert.");
  if (source === "json-objects") {
    const parsed: unknown = JSON.parse(text);
    return findRecordArray(parsed) ?? asRecords(parsed);
  }
  if (source === "postman-test-results") {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return asRecords(parsed);
    if (parsed && typeof parsed === "object") {
      const object = parsed as Record<string, unknown>;
      const results = object.results ?? object.tests ?? object.run;
      if (Array.isArray(results)) return asRecords(results);
      if (results && typeof results === "object") {
        const nested = results as Record<string, unknown>;
        if (Array.isArray(nested.results)) return asRecords(nested.results);
      }
    }
    return asRecords(parsed);
  }
  const parsed = parseInput(text, source);
  const records = findRecordArray(parsed) ?? asRecords(parsed);
  return records.map((record) => flattenRecord(record));
}

function findRecordArray(value: unknown): Record<string, unknown>[] | undefined {
  if (Array.isArray(value)) {
    if (value.length && value.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
      return asRecords(value);
    }
    for (const item of value) {
      const nested = findRecordArray(item);
      if (nested) return nested;
    }
  } else if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) {
      const nested = findRecordArray(item);
      if (nested) return nested;
    }
  }
  return undefined;
}

function flattenRecord(record: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const flattened: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenRecord(value as Record<string, unknown>, name));
    } else {
      flattened[name] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
  }
  return flattened;
}

function parseEdi(text: string): Record<string, unknown>[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("The EDI input is empty.");
  const elementSeparator = trimmed.startsWith("ISA") && trimmed.length > 3 ? trimmed[3] : "*";
  const segmentTerminator = trimmed.startsWith("ISA") && trimmed.length > 105 ? trimmed[105] : "~";
  const segments = trimmed.split(segmentTerminator).map((segment) => segment.trim()).filter(Boolean);
  if (!segments.length) throw new Error("No EDI segments were found.");
  return segments.map((segment, index) => {
    const parts = segment.split(elementSeparator);
    return {
      segment: parts[0] ?? "",
      position: index + 1,
      ...Object.fromEntries(parts.slice(1).map((part, partIndex) => [`element_${partIndex + 1}`, part])),
    };
  });
}

async function readOds(file: File): Promise<Record<string, unknown>[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new Error("The selected file is not a readable ODS workbook.");
  }
  const content = zip.file("content.xml");
  if (!content) throw new Error("The ODS workbook is missing content.xml.");
  const document = parseXmlDocument(await content.async("text"));
  const table = document.getElementsByTagNameNS("*", "table").item(0);
  if (!table) throw new Error("No worksheet was found in the ODS workbook.");
  const rows = [...table.getElementsByTagNameNS("*", "table-row")].map((row) => {
    const cells = [...row.children].filter((cell) => ["table-cell", "covered-table-cell"].includes(cell.localName));
    return cells.flatMap((cell) => {
      const repeat = Math.min(Number(attributeByLocalName(cell, "number-columns-repeated") ?? "1"), 1000);
      const type = attributeByLocalName(cell, "value-type");
      const value = attributeByLocalName(cell, "value") ?? [...cell.getElementsByTagNameNS("*", "p")].map((part) => part.textContent ?? "").join("\n");
      const parsed = type === "float" || type === "currency" || type === "percentage" ? Number(value) : type === "boolean" ? value === "true" : value;
      return Array.from({ length: repeat }, () => parsed);
    });
  }).filter((row) => row.some((value) => value !== ""));
  if (rows.length < 2) throw new Error("The first ODS sheet must contain a header and at least one data row.");
  const headers = makeUniqueHeaders(rows[0].map((value, index) => String(value).trim() || `Column ${index + 1}`));
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])))
    .filter((record) => Object.values(record).some((value) => value !== ""));
}

function attributeByLocalName(element: Element | null, name: string): string | null {
  if (!element) return null;
  return [...element.attributes].find((attribute) => attribute.localName === name)?.value ?? null;
}

async function createOds(records: Record<string, unknown>[], toolId: string): Promise<ConversionResult> {
  if (!records.length) throw new Error("No rows were found in the input.");
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (!headers.length) throw new Error("The input records have no columns.");
  const allRows = [headers, ...records.map((record) => headers.map((header) => record[header] ?? ""))];
  const rows = allRows.map((row) => `<table:table-row>${row.map((value) => {
    const text = value === null || value === undefined ? "" : String(value);
    const type = typeof value === "number" && Number.isFinite(value) ? "float" : typeof value === "boolean" ? "boolean" : "string";
    const attribute = type === "float" ? ` office:value="${xmlEscape(text)}"` : type === "boolean" ? ` office:boolean-value="${text}"` : "";
    return `<table:table-cell office:value-type="${type}"${attribute}><text:p>${xmlEscape(text)}</text:p></table:table-cell>`;
  }).join("")}</table:table-row>`).join("");
  const zip = new JSZip();
  zip.file("mimetype", "application/vnd.oasis.opendocument.spreadsheet", { compression: "STORE" });
  zip.file("META-INF/manifest.xml", `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`);
  zip.file("content.xml", `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.3"><office:body><office:spreadsheet><table:table table:name="Sheet1">${rows}</table:table></office:spreadsheet></office:body></office:document-content>`);
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.oasis.opendocument.spreadsheet" });
  return blobResult(blob, `${toolId}.ods`);
}

function parseHtmlMetadata(text: string): Record<string, string>[] {
  const document = new DOMParser().parseFromString(text, "text/html");
  const metadata: Record<string, string> = {};
  if (document.title) metadata.title = document.title;
  for (const element of [...document.querySelectorAll("meta[name],meta[property]")]) {
    const key = element.getAttribute("name") ?? element.getAttribute("property");
    const value = element.getAttribute("content");
    if (key && value) metadata[key] = value;
  }
  if (!Object.keys(metadata).length) throw new Error("No page title or meta tags were found.");
  return [metadata];
}

function parseHtmlTable(text: string): Record<string, string>[] {
  const document = new DOMParser().parseFromString(text, "text/html");
  const table = document.querySelector("table");
  if (!table) throw new Error("No HTML table was found in the input.");
  const rows = [...table.rows].map((row) => [...row.cells].map((cell) => cell.textContent?.trim() ?? ""));
  if (rows.length < 2) throw new Error("The HTML table needs a header and at least one row.");
  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error("Every table column must have a header.");
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function parseSrt(text: string): Record<string, string>[] {
  const records = text.trim().split(/\r?\n\s*\r?\n/).flatMap((block) => {
    const lines = block.split(/\r?\n/);
    const timeIndex = lines.findIndex((line) => /(?:\d{2}:)?\d{2}:\d{2}[,.]\d{3}\s*-->\s*(?:\d{2}:)?\d{2}:\d{2}[,.]\d{3}/.test(line));
    if (timeIndex < 0) return [];
    const times = /((?:\d{2}:)?\d{2}:\d{2})[,.](\d{3})\s*-->\s*((?:\d{2}:)?\d{2}:\d{2})[,.](\d{3})/.exec(lines[timeIndex]);
    if (!times) return [];
    const start = `${times[1].includes(":") && times[1].split(":").length === 2 ? `00:${times[1]}` : times[1]}.${times[2]}`;
    const end = `${times[3].includes(":") && times[3].split(":").length === 2 ? `00:${times[3]}` : times[3]}.${times[4]}`;
    return [{ number: lines[0].trim(), start, end, text: lines.slice(timeIndex + 1).join("\n") }];
  });
  if (!records.length) throw new Error("No valid SRT subtitle cues were found.");
  return records;
}

function parseVtt(text: string): Record<string, string>[] {
  const body = text.replace(/^\uFEFF?WEBVTT[^\r\n]*\r?\n/, "");
  const normalized = body.replace(/^(\d{2}:)?(\d{2}:\d{2})\.(\d{3})(?=\s*-->)/gm, (_, hours: string | undefined, rest: string, fraction: string) => `${hours ?? "00:"}${rest},${fraction}`)
    .replace(/(\d{2}:)?(\d{2}:\d{2})\.(\d{3})(?=\s|$)/gm, (_, hours: string | undefined, rest: string, fraction: string) => `${hours ?? "00:"}${rest},${fraction}`);
  return parseSrt(normalized);
}

function parseAss(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/);
  const eventsSection = lines.findIndex((line) => /^\s*\[Events\]\s*$/i.test(line));
  if (eventsSection === -1) throw new Error("The ASS file does not contain an Events section.");
  const eventLines = lines.slice(eventsSection + 1);
  const formatLine = eventLines.find((line) => /^Format:\s*/i.test(line));
  const fields = formatLine?.replace(/^Format:\s*/i, "").split(",").map((field) => field.trim().toLowerCase());
  const dialogue = eventLines.filter((line) => /^Dialogue:\s*/i.test(line));
  if (!fields || !dialogue.length) throw new Error("The ASS file must contain a Dialogue section and Format row.");
  return dialogue.map((line, index) => {
    const parts = line.replace(/^Dialogue:\s*/i, "").split(",");
    const fixedFields = fields.length - 1;
    const values = [...parts.slice(0, fixedFields), parts.slice(fixedFields).join(",")];
    const record = Object.fromEntries(fields.map((field, fieldIndex) => [field, values[fieldIndex] ?? ""]));
    return {
      number: String(index + 1),
      start: assTimeToSrt(String(record.start ?? "0:00:00.00")),
      end: assTimeToSrt(String(record.end ?? "0:00:01.00")),
      text: String(record.text ?? "").replace(/\{[^}]*\}/g, "").replace(/\\N/g, "\n"),
    };
  });
}

function asRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.map((record) => record !== null && typeof record === "object" ? record as Record<string, unknown> : { value: record });
  if (value !== null && typeof value === "object") return [value as Record<string, unknown>];
  throw new Error("Input must contain an object or an array of objects.");
}

function csvEscape(value: unknown): string {
  const text = value !== null && typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(records: Record<string, unknown>[]): string {
  if (!records.length) throw new Error("No records were found in the input.");
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (!headers.length) throw new Error("The input records have no columns.");
  return [headers.map(csvEscape).join(","), ...records.map((record) => headers.map((header) => csvEscape(record[header])).join(","))].join("\r\n");
}

function toSql(records: Record<string, unknown>[]): string {
  if (!records.length) throw new Error("No records were found in the input.");
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (!headers.length) throw new Error("The input records have no columns.");
  const columns = headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(", ");
  return records.map((record) => {
    const values = headers.map((header) => {
      const value = record[header];
      if (value === null || value === undefined) return "NULL";
      if (typeof value === "number" && Number.isFinite(value)) return String(value);
      if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
      return `'${String(value).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO "records" (${columns}) VALUES (${values.join(", ")});`;
  }).join("\n");
}

function recordsFromXml(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.map((item) => item !== null && typeof item === "object" ? item as Record<string, unknown> : { value: item });
  if (value !== null && typeof value === "object") {
    const values = Object.values(value);
    for (const item of values) {
      if (Array.isArray(item)) return item.map((record) => record !== null && typeof record === "object" ? record as Record<string, unknown> : { value: record });
      if (item !== null && typeof item === "object") {
        for (const nested of Object.values(item)) {
          if (Array.isArray(nested)) return nested.map((record) => record !== null && typeof record === "object" ? record as Record<string, unknown> : { value: record });
        }
      }
    }
    return [value as Record<string, unknown>];
  }
  return [];
}

function xmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function jsonToXml(value: unknown, tag = "item"): string {
  if (Array.isArray(value)) return value.map((item) => jsonToXml(item, tag)).join("");
  if (value !== null && typeof value === "object") {
    return `<${tag}>${Object.entries(value).map(([key, item]) => {
      const clean = key.replace(/[^A-Za-z0-9_.-]/g, "_");
      const safe = /^[A-Za-z_]/.test(clean) ? clean : `_${clean}`;
      return jsonToXml(item, safe);
    }).join("")}</${tag}>`;
  }
  return `<${tag}>${xmlEscape(value)}</${tag}>`;
}

function toSrt(records: Record<string, unknown>[]): string {
  return records.map((record, index) => {
    const normalized = Object.fromEntries(Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]));
    const start = normalized.start || normalized.start_time || normalized.starttime;
    const end = normalized.end || normalized.end_time || normalized.endtime;
    const text = normalized.text || normalized.subtitle || normalized.content;
    if (!start || !end || text === undefined) throw new Error("Subtitle data needs start, end, and text columns to create SRT.");
    return `${index + 1}\n${String(start).replace(".", ",")} --> ${String(end).replace(".", ",")}\n${text}`;
  }).join("\n\n");
}

function fixXml(value: string): string {
  const document = new DOMParser().parseFromString(value, "application/xml");
  if (document.querySelector("parsererror")) throw new Error("The XML input is not well formed.");
  const serializer = new XMLSerializer();
  return `<?xml version="1.0" encoding="UTF-8"?>\n${serializer.serializeToString(document.documentElement)}`;
}

function parseSpreadsheetMl(value: string): Record<string, unknown>[] {
  const document = parseXmlDocument(value);
  const rows = [...document.getElementsByTagNameNS("*", "Row")].map((row) =>
    [...row.getElementsByTagNameNS("*", "Cell")].map((cell) => {
      const data = cell.getElementsByTagNameNS("*", "Data").item(0);
      const type = attributeByLocalName(data, "Type");
      const text = data?.textContent ?? "";
      return type === "Number" ? Number(text) : type === "Boolean" ? text === "1" : text;
    }),
  ).filter((row) => row.some((cell) => cell !== ""));
  if (rows.length < 2) throw new Error("The Excel XML file must contain a header row and at least one data row.");
  const headers = makeUniqueHeaders(rows[0].map((header, index) => String(header).trim() || `Column ${index + 1}`));
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function markdownToPlainText(value: string): string {
  return value
    .replace(/```[^\n]*\n([\s\S]*?)```/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^ {0,3}#{1,6}\s+/gm, "")
    .replace(/^ {0,3}(?:[-+*]|\d+\.)\s+/gm, "")
    .replace(/^ {0,3}>\s?/gm, "")
    .replace(/(\*\*|__|\*|_|~~|`)/g, "")
    .trim();
}

function latexEscape(value: string): string {
  const escapes: Record<string, string> = {
    "\\": "\\textbackslash{}",
    "{": "\\{",
    "}": "\\}",
    "%": "\\%",
    "$": "\\$",
    "&": "\\&",
    "#": "\\#",
    "_": "\\_",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}",
  };
  return value.replace(/[\\{}%$&#_~^]/g, (character) => escapes[character]);
}

function plainTextToLatex(value: string): string {
  return value.split(/\r?\n/).map((line) => latexEscape(line)).join(" \\\\\n");
}

function markdownToLatex(value: string): string {
  return value.split(/\r?\n/).map((line) => {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const command = ["section", "subsection", "subsubsection"][heading[1].length - 1];
      return `\\${command}{${latexEscape(heading[2])}}`;
    }
    return latexEscape(markdownToPlainText(line));
  }).join(" \\\\\n");
}

function recordsToHtml(records: Record<string, unknown>[]): string {
  if (!records.length) throw new Error("No records were found in the input.");
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (!headers.length) throw new Error("The input records have no columns.");
  const headerCells = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rows = records.map((record) => `<tr>${headers.map((header) => `<td>${escapeHtml(String(record[header] ?? ""))}</td>`).join("")}</tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Converted table</title></head><body><table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

async function createDocx(value: string, toolId: string): Promise<ConversionResult> {
  const zip = new JSZip();
  const paragraphs = value.split(/\r?\n/).map((line) => `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`).join("");
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`);
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  return blobResult(blob, `${toolId}.docx`);
}

async function convertText(value: unknown, source: string, target: string): Promise<ConversionResult> {
  if (source === "yaml" && target === "json") return textResult(JSON.stringify(value, null, 2), "json");
  const xmlSource = ["xml", "rss", "sitemap"].includes(source);
  if (target === "excel" || target === "xlsx") return renderRecords(xmlSource ? recordsFromXml(value) : asRecords(value), target, `${source}-to-excel`);
  if (source === "markdown") {
    const text = String(value);
    if (target === "text") return textResult(markdownToPlainText(text), target);
    if (target === "epub") return convertMarkdownToEpub(text);
    if (target === "pdf") return pdfFromText(markdownToPlainText(text), "markdown-to-pdf");
    if (target === "docx" || target === "word") return createDocx(markdownToPlainText(text), "markdown-to-word");
    if (target === "latex") return textResult(markdownToLatex(text), target);
    const html = markdownToHtml(text);
    return textResult(html, target);
  }
  if (source === "html" && target === "markdown") {
    const parsed = new DOMParser().parseFromString(String(value), "text/html");
    return textResult(htmlToMarkdown(parsed.body), "markdown");
  }
  if (source === "xml" && target === "xml") return textResult(fixXml(String(value)), "xml");
  if ((source === "ass" || source === "vtt") && target === "text") {
    const records = value as Record<string, string>[];
    return textResult(records.map((record) => record.text).join("\n"), "text");
  }
  if (["ass", "srt", "vtt"].includes(source) && target === "ass") {
    return textResult(toAss(asRecords(value)), "ass");
  }
  if (["ass", "srt", "vtt"].includes(source) && target === "vtt") {
    return textResult(toVtt(asRecords(value)), "vtt");
  }
  if (["ass", "srt", "vtt"].includes(source) && target === "srt") {
    return textResult(toSrt(asRecords(value)), "srt");
  }
  if (target === "json") return textResult(JSON.stringify(value, null, 2), "json");
  if (target === "jsonl") return textResult((xmlSource ? recordsFromXml(value) : asRecords(value)).map((record) => JSON.stringify(record)).join("\n"), "jsonl");
  if (target === "csv") return textResult(toCsv(xmlSource ? recordsFromXml(value) : asRecords(value)), "csv");
  if (target === "xml") return textResult(`<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(value, "root")}`, "xml");
  if (target === "yaml") return textResult(YAML.stringify(value), "yaml");
  if (target === "sql") return textResult(toSql(xmlSource ? recordsFromXml(value) : asRecords(value)), "sql");
  if (target === "srt") return textResult(toSrt(asRecords(value)), "srt");
  if (target === "ass") return textResult(toAss(asRecords(value)), "ass");
  if (target === "xls") {
    const spreadsheet = recordsToSpreadsheetMl(asRecords(value));
    return blobResult(new Blob([spreadsheet], { type: "application/vnd.ms-excel" }), "converted.xls", spreadsheet);
  }
  if (target === "vtt") return textResult(toVtt(asRecords(value)), "vtt");
  throw new Error(`Conversion from ${source.toUpperCase()} to ${target.toUpperCase()} is not supported locally.`);
}

async function renderRecords(records: Record<string, unknown>[], target: string, toolId: string): Promise<ConversionResult> {
  if (target === "ods") return createOds(records, toolId);
  if (target === "parquet") return createParquet(records, toolId);
  if (target === "xls") {
    const spreadsheet = recordsToSpreadsheetMl(records);
    return blobResult(new Blob([spreadsheet], { type: "application/vnd.ms-excel" }), `${toolId}.xls`, spreadsheet);
  }
  if (target === "excel" || target === "xlsx") {
    if (!records.length) throw new Error("No rows were found in the workbook.");
    const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
    if (!headers.length) throw new Error("The input records have no columns.");
    const workbook = new JSZip();
    const rows = [headers, ...records.map((record) => headers.map((header) => record[header]))];
    const sheetRows = rows.map((row, rowIndex) => {
      const cells = row.map((value, columnIndex) => cellXml(value, `${columnName(columnIndex + 1)}${rowIndex + 1}`)).join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    }).join("");
    workbook.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`);
    workbook.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
    workbook.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>`);
    workbook.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`);
    workbook.file("xl/worksheets/sheet1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`);
    const blob = await workbook.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    return blobResult(blob, `${toolId}.xlsx`);
  }
  if (target === "csv") return textResult(toCsv(records), target);
  if (target === "json") return textResult(JSON.stringify(records, null, 2), target);
  if (target === "jsonl") return textResult(records.map((record) => JSON.stringify(record)).join("\n"), target);
  if (target === "sql") return textResult(toSql(records), target);
  if (target === "xml") return textResult(`<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(records, "rows")}`, target);
  if (target === "srt") return textResult(toSrt(records), target);
  if (target === "ass") return textResult(toAss(records), target);
  if (target === "html") return textResult(recordsToHtml(records), target);
  if (target === "pdf") return pdfFromText(toCsv(records), toolId);
  throw new Error(`Excel to ${target.toUpperCase()} is not supported locally.`);
}

function recordsToSpreadsheetMl(records: Record<string, unknown>[]): string {
  if (!records.length) throw new Error("No records were found in the input.");
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (!headers.length) throw new Error("The input records have no columns.");
  const rows = [headers, ...records.map((record) => headers.map((header) => record[header] ?? ""))];
  const rowXml = rows.map((row) => `<Row>${row.map((value) => {
    const type = typeof value === "number" && Number.isFinite(value) ? "Number" : typeof value === "boolean" ? "Boolean" : "String";
    return `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
  }).join("")}</Row>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table>${rowXml}</Table></Worksheet></Workbook>`;
}

async function createParquet(records: Record<string, unknown>[], toolId: string): Promise<ConversionResult> {
  if (!records.length) throw new Error("No rows were found in the input.");
  const fields = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (!fields.length) throw new Error("The input records have no columns.");
  const arrow = await import("apache-arrow");
  const parquet = await import("parquet-wasm/esm");
  await parquet.default();
  const columns = Object.fromEntries(fields.map((field) => {
    const values = records.map((record) => record[field]);
    const present = values.filter((value) => value !== null && value !== undefined);
    if (!present.length) return [field, values.map(() => "")];
    if (present.every((value) => typeof value === "number")) return [field, values.map((value) => value ?? null)];
    if (present.every((value) => typeof value === "boolean")) return [field, values.map((value) => value ?? null)];
    return [field, values.map((value) => value === null || value === undefined ? null : typeof value === "object" ? JSON.stringify(value) : String(value))];
  }));
  const arrowTable = arrow.tableFromArrays(columns);
  const wasmTable = parquet.Table.fromIPCStream(arrow.tableToIPC(arrowTable, "stream"));
  const bytes = parquet.writeParquet(wasmTable);
  return blobResult(new Blob([new Uint8Array(bytes).buffer], { type: "application/vnd.apache.parquet" }), `${toolId}.parquet`);
}

async function convertParquet(file: File, target: string, toolId: string): Promise<ConversionResult> {
  const arrow = await import("apache-arrow");
  const parquet = await import("parquet-wasm/esm");
  await parquet.default();
  const wasmTable = parquet.readParquet(new Uint8Array(await file.arrayBuffer()));
  const table = arrow.tableFromIPC(wasmTable.intoIPCStream());
  const fields = table.schema.fields.map((field) => field.name);
  const records = Array.from({ length: table.numRows }, (_, row) => Object.fromEntries(fields.map((field) => {
    const value = table.getChild(field)?.get(row);
    return [field, value instanceof Date ? value.toISOString() : value ?? ""];
  })));
  if (target === "parquet") return createParquet(records, toolId);
  return renderRecords(records, target, toolId);
}

function cellXml(value: unknown, reference: string): string {
  if (value === null || value === undefined || value === "") return `<c r="${reference}"/>`;
  if (typeof value === "number" && Number.isFinite(value)) return `<c r="${reference}" t="n"><v>${value}</v></c>`;
  if (typeof value === "boolean") return `<c r="${reference}" t="b"><v>${value ? 1 : 0}</v></c>`;
  const text = value instanceof Date ? value.toISOString() : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(text)}</t></is></c>`;
}

async function readWorkbook(file: File): Promise<Record<string, unknown>[]> {
  let workbook: JSZip;
  try {
    workbook = await JSZip.loadAsync(file);
  } catch {
    throw new Error("The selected file is not a readable XLSX workbook.");
  }
  const workbookXml = await zipXml(workbook, "xl/workbook.xml");
  const firstSheet = workbookXml.getElementsByTagNameNS("*", "sheet").item(0);
  const relationshipId = firstSheet?.getAttribute("r:id") ?? firstSheet?.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
  if (!relationshipId) throw new Error("The workbook does not identify a worksheet.");
  const relationships = await zipXml(workbook, "xl/_rels/workbook.xml.rels");
  const relation = [...relationships.getElementsByTagNameNS("*", "Relationship")].find((item) => item.getAttribute("Id") === relationshipId);
  const target = relation?.getAttribute("Target");
  if (!target) throw new Error("The workbook's first worksheet is missing.");
  const worksheetPath = resolveZipPath("xl/workbook.xml", target);
  const worksheet = await zipXml(workbook, worksheetPath);
  const sharedStringsFile = workbook.file("xl/sharedStrings.xml");
  const sharedStrings = sharedStringsFile ? [...(await parseXmlDocument(await sharedStringsFile.async("text"))).getElementsByTagNameNS("*", "si")].map((item) => item.textContent ?? "") : [];
  const rowElements = [...worksheet.getElementsByTagNameNS("*", "sheetData")].flatMap((data) => [...data.getElementsByTagNameNS("*", "row")]);
  const parsedRows = rowElements.map((row) => {
    const cells = new Map<number, unknown>();
    for (const cell of [...row.getElementsByTagNameNS("*", "c")]) {
      const index = columnNumber(cell.getAttribute("r") ?? "");
      const type = cell.getAttribute("t");
      const value = cell.getElementsByTagNameNS("*", "v").item(0)?.textContent ?? "";
      const inlineText = cell.getElementsByTagNameNS("*", "is").item(0)?.textContent ?? "";
      let parsed: unknown = value;
      if (type === "s") parsed = sharedStrings[Number(value)] ?? "";
      else if (type === "inlineStr") parsed = inlineText;
      else if (type === "b") parsed = value === "1";
      else if (type === "n" || !type) parsed = value === "" ? "" : Number.isFinite(Number(value)) ? Number(value) : value;
      cells.set(index - 1, parsed);
    }
    return cells;
  });
  const headerCells = parsedRows[0];
  if (!headerCells?.size) throw new Error("The first worksheet does not have a header row.");
  const maxColumn = Math.max(...headerCells.keys()) + 1;
  const headers = Array.from({ length: maxColumn }, (_, index) => String(headerCells.get(index) ?? "").trim() || `Column ${index + 1}`);
  const uniqueHeaders = makeUniqueHeaders(headers);
  const records = parsedRows.slice(1).map((row) => Object.fromEntries(uniqueHeaders.map((header, index) => [header, row.get(index) ?? ""]))).filter((record) => Object.values(record).some((value) => value !== ""));
  if (!records.length) throw new Error("No data rows were found after the header row.");
  return records;
}

async function zipXml(zip: JSZip, path: string): Promise<Document> {
  const file = zip.file(path);
  if (!file) throw new Error(`The XLSX workbook is missing ${path}.`);
  return parseXmlDocument(await file.async("text"));
}

function parseXmlDocument(text: string): Document {
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.querySelector("parsererror")) throw new Error("The selected workbook contains invalid XML.");
  return document;
}

function resolveZipPath(basePath: string, target: string): string {
  const parts = target.startsWith("/") ? [] : basePath.split("/").slice(0, -1);
  for (const part of target.replace(/^\/+/, "").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

function columnNumber(reference: string): number {
  const letters = /^([A-Z]+)/i.exec(reference)?.[1]?.toUpperCase();
  if (!letters) throw new Error("The workbook contains an invalid cell reference.");
  return [...letters].reduce((number, letter) => number * 26 + letter.charCodeAt(0) - 64, 0);
}

function columnName(number: number): string {
  let result = "";
  for (let value = number; value > 0; value = Math.floor((value - 1) / 26)) {
    result = String.fromCharCode(65 + (value - 1) % 26) + result;
  }
  return result;
}

function makeUniqueHeaders(headers: string[]): string[] {
  const counts = new Map<string, number>();
  return headers.map((header) => {
    const count = (counts.get(header) ?? 0) + 1;
    counts.set(header, count);
    return count === 1 ? header : `${header}_${count}`;
  });
}

async function convertImage(file: File, source: string, target: string, toolId: string): Promise<ConversionResult> {
  let canvas: HTMLCanvasElement;
  if (source === "tiff") {
    const UTIF = (await import("utif")).default;
    const buffer = await file.arrayBuffer();
    const page = UTIF.decode(buffer)[0];
    if (!page) throw new Error("The TIFF file has no image pages.");
    UTIF.decodeImage(buffer, page);
    const pixels = UTIF.toRGBA8(page);
    canvas = document.createElement("canvas");
    canvas.width = page.width;
    canvas.height = page.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not create an image canvas.");
    context.putImageData(new ImageData(new Uint8ClampedArray(pixels), page.width, page.height), 0, 0);
  } else {
    const decoded = await decodeImage(file, source);
    canvas = document.createElement("canvas");
    canvas.width = decoded.width;
    canvas.height = decoded.height;
    const context = canvas.getContext("2d");
    if (!context) {
      if (decoded instanceof ImageBitmap) decoded.close();
      throw new Error("Your browser could not create an image canvas.");
    }
    if (decoded instanceof ImageData) context.putImageData(decoded, 0, 0);
    else {
      context.drawImage(decoded, 0, 0);
      decoded.close();
    }
  }
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create an image canvas.");
  if (target === "image") {
    const outputType = source === "png" ? "image/png" : source === "webp" ? "image/webp" : "image/jpeg";
    const blob = await canvasBlob(canvas, outputType, 0.72);
    return blobResult(blob, `${toolId}.${outputType === "image/png" ? "png" : outputType === "image/webp" ? "webp" : "jpg"}`);
  }
  if (target === "pgm" || target === "ppm" || target === "pam" || target === "yuv") {
    return blobResult(encodePortableImage(context.getImageData(0, 0, canvas.width, canvas.height), target), `${toolId}.${target}`);
  }
  if (target === "bmp") {
    const bytes = encodeBmp(context.getImageData(0, 0, canvas.width, canvas.height));
    return blobResult(new Blob([new Uint8Array(bytes).buffer], { type: "image/bmp" }), `${toolId}.bmp`);
  }
  if (target === "gif") {
    const bytes = await encodeGif(context.getImageData(0, 0, canvas.width, canvas.height));
    return blobResult(new Blob([new Uint8Array(bytes).buffer], { type: "image/gif" }), `${toolId}.gif`);
  }
  if (target === "tiff") {
    const UTIF = (await import("utif")).default;
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const bytes = UTIF.encodeImage(new Uint8Array(image.data), canvas.width, canvas.height);
    return blobResult(new Blob([bytes], { type: "image/tiff" }), `${toolId}.tiff`);
  }
  if (target === "svg") {
    const png = await canvasBlob(canvas, "image/png");
    const data = await blobToDataUrl(png);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image width="100%" height="100%" href="${data}"/></svg>`;
    return textResult(svg, "svg");
  }
  const type = target === "jpg" ? "image/jpeg" : `image/${target}`;
  if (target === "jxl") {
    const { default: encode } = await import("@jsquash/jxl/encode");
    const buffer = await encode(context.getImageData(0, 0, canvas.width, canvas.height));
    return blobResult(new Blob([buffer], { type: "image/jxl" }), `${toolId}.jxl`);
  }
  if (target === "avif") {
    const { default: encode } = await import("@jsquash/avif/encode");
    const buffer = await encode(context.getImageData(0, 0, canvas.width, canvas.height));
    return blobResult(new Blob([buffer], { type: "image/avif" }), `${toolId}.avif`);
  }
  if (target === "jpg") {
    context.fillStyle = "#ffffff";
    context.globalCompositeOperation = "destination-over";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "source-over";
  }
  const blob = await canvasBlob(canvas, type, 0.92);
  if (blob.type !== type) throw new Error(`This browser cannot encode ${target.toUpperCase()}.`);
  return blobResult(blob, `${toolId}.${target}`);
}

async function decodeImage(file: File, source: string): Promise<ImageBitmap | ImageData> {
  const buffer = await file.arrayBuffer();
  if (source === "avif") {
    const { default: decode } = await import("@jsquash/avif/decode");
    const image = await decode(buffer);
    if (!image) throw new Error("The AVIF image could not be decoded.");
    return image;
  }
  if (source === "jxl") {
    const { default: decode } = await import("@jsquash/jxl/decode");
    return decode(buffer);
  }
  if (source === "heic") {
    const { heicTo } = await import("heic-to");
    return heicTo({ blob: file, type: "bitmap" });
  }
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error(`This browser cannot decode ${source.toUpperCase()} images.`);
  }
}

async function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  if (!blob) throw new Error(`The browser could not create ${type} output.`);
  return blob;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not encode the image."));
    reader.onerror = () => reject(new Error("Could not encode the image."));
    reader.readAsDataURL(blob);
  });
}

function encodePortableImage(image: ImageData, target: string): Blob {
  const { width, height } = image;
  const data = image.data;
  if (target === "pgm") {
    const header = new TextEncoder().encode(`P5\n${width} ${height}\n255\n`);
    const pixels = new Uint8Array(width * height);
    for (let index = 0; index < pixels.length; index += 1) {
      const offset = index * 4;
      pixels[index] = Math.round(0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2]);
    }
    return new Blob([header, pixels], { type: "image/x-portable-graymap" });
  }
  if (target === "ppm") {
    const header = new TextEncoder().encode(`P6\n${width} ${height}\n255\n`);
    const pixels = new Uint8Array(width * height * 3);
    for (let index = 0; index < width * height; index += 1) pixels.set(data.subarray(index * 4, index * 4 + 3), index * 3);
    return new Blob([header, pixels], { type: "image/x-portable-pixmap" });
  }
  if (target === "pam") {
    const header = new TextEncoder().encode(`P7\nWIDTH ${width}\nHEIGHT ${height}\nDEPTH 4\nMAXVAL 255\nTUPLTYPE RGB_ALPHA\nENDHDR\n`);
    const pixels = new Uint8Array(data);
    return new Blob([header, pixels], { type: "image/x-portable-arbitrarymap" });
  }
  if (width % 2 || height % 2) throw new Error("YUV 4:2:0 output requires even image dimensions.");
  const frameSize = width * height;
  const yPlane = new Uint8Array(frameSize);
  const uPlane = new Uint8Array(frameSize / 4);
  const vPlane = new Uint8Array(frameSize / 4);
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const offset = (row * width + column) * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      yPlane[row * width + column] = clampByte(16 + 0.257 * red + 0.504 * green + 0.098 * blue);
      if (row % 2 === 0 && column % 2 === 0) {
        const chroma = (row / 2) * (width / 2) + column / 2;
        uPlane[chroma] = clampByte(128 - 0.148 * red - 0.291 * green + 0.439 * blue);
        vPlane[chroma] = clampByte(128 + 0.439 * red - 0.368 * green - 0.071 * blue);
      }
    }
  }
  return new Blob([yPlane, uPlane, vPlane], { type: "application/octet-stream" });
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function encodeBmp(image: ImageData): Uint8Array {
  const { width, height, data } = image;
  const stride = Math.ceil((width * 3) / 4) * 4;
  const bytes = new Uint8Array(54 + stride * height);
  const view = new DataView(bytes.buffer);
  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, bytes.length, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, stride * height, true);
  for (let y = 0; y < height; y += 1) {
    const targetRow = 54 + (height - y - 1) * stride;
    for (let x = 0; x < width; x += 1) {
      const source = (y * width + x) * 4;
      const destination = targetRow + x * 3;
      bytes[destination] = data[source + 2];
      bytes[destination + 1] = data[source + 1];
      bytes[destination + 2] = data[source];
    }
  }
  return bytes;
}

async function encodeGif(image: ImageData): Promise<Uint8Array> {
  const { quantize, applyPalette, GIFEncoder } = await import("gifenc");
  const rgba = new Uint8Array(image.data);
  const palette = quantize(rgba, 256);
  const indexed = applyPalette(rgba, palette);
  const encoder = GIFEncoder();
  encoder.writeFrame(indexed, image.width, image.height, { palette });
  encoder.finish();
  return encoder.bytes();
}

async function loadPdf(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    useSystemFonts: true,
  }).promise;
}

async function pdfText(file: File): Promise<string> {
  const pdf = await loadPdf(file);
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = content.items.map((item) => "str" in item ? item.str : "").filter(Boolean);
    pages.push(lines.join(" "));
  }
  const text = pages.join("\n\n").trim();
  if (!text) throw new Error("No embedded text was found. Use an OCR converter for scanned PDFs.");
  return text;
}

async function pdfRecords(file: File): Promise<Record<string, unknown>[]> {
  const pdf = await loadPdf(file);
  const rows: { x: number; y: number; text: string }[][] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items.flatMap((item) => "str" in item && item.str.trim()
      ? [{ x: item.transform[4], y: item.transform[5], text: item.str.trim() }]
      : []);
    const lines: { x: number; y: number; text: string }[][] = [];
    for (const item of items.sort((left, right) => right.y - left.y || left.x - right.x)) {
      let line = lines.find((candidate) => Math.abs(candidate[0].y - item.y) < 3);
      if (!line) {
        line = [];
        lines.push(line);
      }
      line.push(item);
    }
    rows.push(...lines.map((line) => line.sort((left, right) => left.x - right.x)));
  }
  const nonEmptyRows = rows.filter((row) => row.length > 1);
  const columnCount = Math.max(...nonEmptyRows.map((row) => row.length));
  if (columnCount < 2) throw new Error("No table-like columns were detected in the PDF text.");
  const headers = Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`);
  return nonEmptyRows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]?.text ?? ""])));
}

async function convertPdf(file: File, target: string, toolId: string): Promise<ConversionResult> {
  if (target === "pdf") {
    const { PDFDocument } = await import("pdf-lib");
    const document = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
    const output = await document.save({ useObjectStreams: true, addDefaultPage: false });
    return blobResult(new Blob([new Uint8Array(output).buffer], { type: "application/pdf" }), `${toolId}.pdf`);
  }
  if (["csv", "excel"].includes(target)) {
    const records = await pdfRecords(file);
    return renderRecords(records, target, toolId);
  }
  if (target === "jpg" || target === "png" || target === "svg" || target === "tiff") {
    const pdf = await loadPdf(file);
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.8 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not create an image canvas.");
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    if (target === "svg") {
      const png = await canvasBlob(canvas, "image/png");
      const data = await blobToDataUrl(png);
      return textResult(`<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image width="100%" height="100%" href="${data}"/></svg>`, "svg");
    }
    if (target === "tiff") {
      const UTIF = (await import("utif")).default;
      const bytes = UTIF.encodeImage(new Uint8Array(context.getImageData(0, 0, canvas.width, canvas.height).data), canvas.width, canvas.height);
      return blobResult(new Blob([new Uint8Array(bytes).buffer], { type: "image/tiff" }), `${toolId}.tiff`);
    }
    const type = target === "jpg" ? "image/jpeg" : "image/png";
    const blob = await canvasBlob(canvas, type, 0.9);
    return blobResult(blob, `${toolId}.${target}`);
  }
  const text = await pdfText(file);
  if (target === "text") return textResult(text, "text");
  if (target === "html") return textResult(`<article>${text.split(/\n{2,}/).map((line) => `<p>${escapeHtml(line)}</p>`).join("\n")}</article>`, "html");
  if (target === "word") return createDocx(text, toolId);
  if (target === "epub") return convertMarkdownToEpub(text);
  if (target === "fb2") return textResult(textToFb2(text), "fb2");
  if (target === "fbz") {
    const zip = new JSZip();
    zip.file("converted.fb2", textToFb2(text));
    const blob = await zip.generateAsync({ type: "blob", mimeType: "application/zip" });
    return blobResult(blob, `${toolId}.fbz`);
  }
  throw new Error(`PDF to ${target.toUpperCase()} is not supported locally.`);
}

function textToFb2(text: string): string {
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink"><description><title-info><genre>prose</genre><author><nickname>Unknown</nickname></author><book-title>Converted document</book-title><lang>en</lang></title-info><document-info><author><nickname>ConvoTools</nickname></author><program-used>ConvoTools</program-used><date>2026</date><id>${crypto.randomUUID()}</id><version>1.0</version></document-info></description><body><section>${paragraphs}</section></body></FictionBook>`;
}

async function htmlToImage(html: string, target: "jpg" | "png"): Promise<ConversionResult> {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelectorAll("script,iframe,object,embed,link,style").forEach((element) => element.remove());
  parsed.querySelectorAll("img,video,audio,source").forEach((element) => element.remove());
  const body = parsed.body.innerHTML;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="box-sizing:border-box;width:1200px;min-height:1600px;padding:48px;color:#172033;background:white;font:16px/1.5 Arial,sans-serif">${body}</div></foreignObject></svg>`;
  const bitmap = await createImageBitmap(new Blob([svg], { type: "image/svg+xml" }));
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create an image canvas.");
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const mime = target === "jpg" ? "image/jpeg" : "image/png";
  const blob = await canvasBlob(canvas, mime, 0.9);
  return blobResult(blob, `converted.${target}`);
}

async function convertWebsite(value: string, target: string, toolId: string): Promise<ConversionResult> {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a complete website URL, including https://.");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS website URLs are supported.");
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("This site blocks browser access (CORS). Try saving the page as an HTML file instead.");
  }
  if (!response.ok) throw new Error(`The website returned an HTTP ${response.status} response.`);
  const html = await response.text();
  if (target === "jpg" || target === "png") return htmlToImage(html, target);
  const document = new DOMParser().parseFromString(html, "text/html");
  const text = document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) throw new Error("No readable page text was found.");
  return pdfFromText(text, toolId);
}

async function runOcr(file: File, target: string, toolId: string): Promise<ConversionResult> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    let text: string;
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdf = await loadPdf(file);
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your browser could not create an image canvas.");
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const recognized = await worker.recognize(canvas);
        pages.push(recognized.data.text.trim());
      }
      text = pages.filter(Boolean).join("\n\n");
    } else {
      const recognized = await worker.recognize(file);
      text = recognized.data.text.trim();
    }
    if (!text) throw new Error("OCR could not recognize readable text in this file.");
    if (target === "pdf") return pdfFromText(text, toolId);
    return textResult(text, "text");
  } finally {
    await worker.terminate();
  }
}

async function convertMedia(file: File, converter: Converter): Promise<ConversionResult> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: "/ffmpeg/ffmpeg-core.js",
    wasmURL: "/ffmpeg/ffmpeg-core.wasm",
  });
  const inputExtension = file.name.split(".").pop()?.toLowerCase() || converter.source;
  const inputName = `input.${inputExtension}`;
  const outputExtension = converter.id === "compress-video" ? "mp4" : converter.target;
  const outputName = `converted.${outputExtension}`;
  try {
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    let args: string[];
    if (converter.id === "compress-video") {
      args = ["-i", inputName, "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", outputName];
    } else if (["mp3", "flac", "wav"].includes(converter.target)) {
      const codec = converter.target === "mp3" ? ["-codec:a", "libmp3lame", "-qscale:a", "2"] :
        converter.target === "flac" ? ["-codec:a", "flac"] : ["-codec:a", "pcm_s16le"];
      args = ["-i", inputName, ...codec, outputName];
    } else {
      args = ["-i", inputName, "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23", "-c:a", "aac", "-movflags", "+faststart", outputName];
    }
    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) throw new Error("The selected media format or codec is not supported by the local FFmpeg build.");
    const output = await ffmpeg.readFile(outputName);
    if (typeof output === "string") throw new Error("The media engine returned invalid output.");
    return blobResult(new Blob([new Uint8Array(output).buffer], { type: mediaMimeType(outputExtension) }), `${converter.id}.${outputExtension}`);
  } finally {
    ffmpeg.terminate();
  }
}

function mediaMimeType(extension: string): string {
  return ({
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    flac: "audio/flac",
  } as Record<string, string>)[extension] ?? "application/octet-stream";
}

async function extractPowerPointText(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  const slides = zip.file(/^ppt\/slides\/slide\d+\.xml$/)
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
  if (!slides.length) throw new Error("No slides were found in this PowerPoint presentation.");
  const content = await Promise.all(slides.map(async (slide, index) => {
    const document = parseXmlDocument(await slide.async("text"));
    const paragraphs = [...document.getElementsByTagNameNS("*", "p")].map((paragraph) =>
      [...paragraph.getElementsByTagNameNS("*", "t")].map((part) => part.textContent ?? "").join(""),
    ).filter(Boolean);
    return paragraphs.length ? `Slide ${index + 1}\n${paragraphs.join("\n")}` : "";
  }));
  const text = content.filter(Boolean).join("\n\n");
  if (!text) throw new Error("No readable slide text was found.");
  return text;
}

async function extractXpsText(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  const pages = zip.file(/^Documents\/[^/]+\/Pages\/[^/]+\.fpage$/)
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
  if (!pages.length) throw new Error("No XPS/OXPS pages were found in this file.");
  const text = (await Promise.all(pages.map(async (page) => {
    const document = parseXmlDocument(await page.async("text"));
    return [...document.getElementsByTagNameNS("*", "Glyphs")]
      .map((glyph) => glyph.getAttribute("UnicodeString") ?? "")
      .filter(Boolean).join("");
  }))).filter(Boolean).join("\n\n");
  if (!text) throw new Error("No selectable text was found in the XPS/OXPS document.");
  return text;
}

async function imageToPdf(file: File): Promise<ConversionResult> {
  const { jsPDF } = await import("jspdf");
  const image = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create an image canvas.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  image.close();
  const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "px", format: [canvas.width, canvas.height] });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, canvas.width, canvas.height);
  return blobResult(pdf.output("blob"), "converted.pdf");
}

async function pdfFromText(text: string, toolId: string): Promise<ConversionResult> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const lines = pdf.splitTextToSize(text, 175);
  let y = 16;
  for (const line of lines) {
    if (y > 280) {
      pdf.addPage();
      y = 16;
    }
    pdf.text(line, 16, y);
    y += 6;
  }
  return blobResult(pdf.output("blob"), `${toolId}.pdf`);
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

async function extractDocxHtml(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

async function extractFb2Text(file: File, format: "fb2" | "fbz"): Promise<string> {
  let xml: string;
  if (format === "fbz" || file.name.toLowerCase().endsWith(".fbz")) {
    const zip = await JSZip.loadAsync(file);
    const bookFile = zip.file(/\.fb2$/i)[0];
    if (!bookFile) throw new Error("The FBZ archive does not contain an FB2 book.");
    xml = await bookFile.async("text");
  } else {
    xml = await file.text();
  }
  const document = parseXmlDocument(xml);
  const text = document.documentElement.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) throw new Error("No readable book text was found in the FB2 file.");
  return text;
}

async function extractKindleText(file: File, format: "azw" | "azw3" | "mobi"): Promise<string> {
  const { initKf8File, initMobiFile } = await import("@lingo-reader/mobi-parser");
  const book = format === "azw3" ? await initKf8File(file) : await initMobiFile(file);
  try {
    const chapters = book.getSpine().map((chapter) => {
      const content = book.loadChapter(chapter.id);
      if (!content) return "";
      const document = new DOMParser().parseFromString(content.html, "text/html");
      document.querySelectorAll("script,style").forEach((element) => element.remove());
      return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
    });
    const text = chapters.filter(Boolean).join("\n\n");
    if (!text) throw new Error("No readable book text was found. DRM-protected ebooks are not supported.");
    return text;
  } finally {
    book.destroy();
  }
}

async function extractEpubText(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) throw new Error("This EPUB has no container.xml package index.");
  const containerXml = new DOMParser().parseFromString(await containerFile.async("text"), "application/xml");
  const rootFile = containerXml.querySelector("rootfile")?.getAttribute("full-path");
  if (!rootFile) throw new Error("This EPUB does not identify a package document.");
  const packageFile = zip.file(rootFile);
  if (!packageFile) throw new Error("The EPUB package document is missing.");
  const packageXml = new DOMParser().parseFromString(await packageFile.async("text"), "application/xml");
  const rootDir = rootFile.includes("/") ? rootFile.slice(0, rootFile.lastIndexOf("/") + 1) : "";
  const manifest = new Map([...packageXml.querySelectorAll("manifest > item")].map((item) => [item.id, item.getAttribute("href") ?? ""]));
  const chapterPaths = [...packageXml.querySelectorAll("spine > itemref")].flatMap((item) => {
    const href = manifest.get(item.getAttribute("idref") ?? "");
    return href ? [`${rootDir}${href}`] : [];
  });
  const chapters = await Promise.all(chapterPaths.map(async (chapterPath) => {
    const chapter = zip.file(chapterPath);
    if (!chapter) return "";
    const document = new DOMParser().parseFromString(await chapter.async("text"), "text/html");
    return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
  }));
  const text = chapters.filter(Boolean).join("\n\n");
  if (!text) throw new Error("This EPUB contains no readable chapters.");
  return text;
}

async function convertMarkdownToEpub(markdown: string): Promise<ConversionResult> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const title = "Converted document";
  const uid = crypto.randomUUID();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  zip.file("OEBPS/content.opf", `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${uid}</dc:identifier><dc:title>${title}</dc:title><dc:language>en</dc:language></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest><spine><itemref idref="chapter"/></spine></package>`);
  const html = markdownToHtml(markdown);
  zip.file("OEBPS/chapter.xhtml", `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title><meta charset="utf-8"/></head><body>${html}</body></html>`);
  zip.file("OEBPS/nav.xhtml", `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Navigation</title></head><body><nav epub:type="toc" id="toc"><ol><li><a href="chapter.xhtml">${title}</a></li></ol></nav></body></html>`);
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
  return blobResult(blob, "converted.epub");
}

function markdownToHtml(markdown: string): string {
  const escape = (text: string) => escapeHtml(text);
  return markdown.split(/\r?\n/).map((line) => {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) return `<h${heading[1].length}>${escape(heading[2])}</h${heading[1].length}>`;
    if (/^[-*]\s+/.test(line)) return `<li>${escape(line.replace(/^[-*]\s+/, ""))}</li>`;
    if (/^\d+\.\s+/.test(line)) return `<li>${escape(line.replace(/^\d+\.\s+/, ""))}</li>`;
    if (!line.trim()) return "";
    return `<p>${escape(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`;
  }).join("\n");
}

function htmlToMarkdown(element: Element): string {
  const blocks = [...element.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,pre,blockquote")];
  return blocks.map((block) => {
    const text = block.textContent?.trim() ?? "";
    const match = /^H([1-6])$/.exec(block.tagName);
    if (match) return `${"#".repeat(Number(match[1]))} ${text}`;
    if (block.tagName === "LI") return `- ${text}`;
    if (block.tagName === "BLOCKQUOTE") return `> ${text}`;
    if (block.tagName === "PRE") return `\`\`\`\n${text}\n\`\`\``;
    return text;
  }).filter(Boolean).join("\n\n");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function toVtt(records: Record<string, unknown>[]): string {
  const body = records.map((record, index) => {
    const start = String(record.start ?? "").replace(",", ".");
    const end = String(record.end ?? "").replace(",", ".");
    return `${index + 1}\n${start} --> ${end}\n${record.text ?? ""}`;
  }).join("\n\n");
  return `WEBVTT\n\n${body}`;
}

function toAss(records: Record<string, unknown>[]): string {
  const dialogue = records.map((record) => `Dialogue: 0,${srtTimeToAss(String(record.start ?? ""))},${srtTimeToAss(String(record.end ?? ""))},Default,,0,0,0,,${String(record.text ?? "").replace(/\n/g, "\\N")}`).join("\n");
  return `[Script Info]\nTitle: Converted subtitles\nScriptType: v4.00+\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${dialogue}`;
}

function assTimeToSrt(value: string): string {
  const match = /^(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})$/.exec(value.trim());
  if (!match) return value.replace(/\./g, ",");
  return `${match[1].padStart(2, "0")}:${match[2]}:${match[3]}.${match[4].padEnd(3, "0")}`;
}

function srtTimeToAss(value: string): string {
  const normalized = value.trim().replace(",", ".");
  const match = /^(\d{1,2}):(\d{2}):(\d{2})\.(\d{1,3})$/.exec(normalized);
  if (!match) return normalized;
  return `${String(Number(match[1]))}:${match[2]}:${match[3]}.${match[4].padEnd(3, "0").slice(0, 2)}`;
}
