const converterCatalog = window.convoConverterCatalog;
const converterId = new URLSearchParams(window.location.search).get("tool");
const converter = converterCatalog?.find((item) => item.id === converterId);
const converterTitle = document.getElementById("converterTitle");
const converterSummary = document.getElementById("converterSummary");
const capability = document.getElementById("converterCapability");
const converterForm = document.getElementById("converterForm");
const fileInput = document.getElementById("converterFile");
const input = document.getElementById("converterInput");
const output = document.getElementById("converterOutput");
const outputSection = document.getElementById("converterOutputSection");
const downloadLink = document.getElementById("downloadOutput");
const message = document.getElementById("converterMessage");
const convertButton = document.getElementById("convertButton");
const textSources = new Set(["json", "jsonl", "csv", "xml", "html", "rss", "sitemap", "srt"]);
const textTargets = new Set(["json", "jsonl", "csv", "xml", "sql", "yaml", "srt"]);
const imageFormats = new Set(["jpg", "jpeg", "png", "webp"]);
let downloadUrl;

if (!converter) {
  converterTitle.textContent = "Converter not found";
  converterSummary.textContent = "Choose a converter from the directory to continue.";
  capability.textContent = "This converter is not in the ConvoTools directory.";
  converterForm.hidden = true;
} else {
  document.title = `${converter.name} | ConvoTools`;
  converterTitle.textContent = converter.name;
  converterSummary.textContent = `Convert ${converter.source.toUpperCase()} to ${converter.target.toUpperCase()} with ConvoTools.`;
  const imageConversion =
    converter.category === "images" &&
    imageFormats.has(converter.source) &&
    imageFormats.has(converter.target);
  const textConversion =
    textSources.has(converter.source) &&
    textTargets.has(converter.target) &&
    isTextConversionSupported(converter.source, converter.target, converter.id);
  const isSupported = imageConversion || textConversion;

  if (imageConversion) {
    fileInput.accept = "image/*";
    input.hidden = true;
    document.querySelector('label[for="converterInput"]').hidden = true;
  } else if (textSources.has(converter.source)) {
    fileInput.accept = `.${converter.source},text/plain,application/json,application/xml,text/csv`;
  }

  capability.classList.add(isSupported ? "is-supported" : "is-unavailable");
  capability.textContent = imageConversion
    ? "Available locally — this conversion runs in your browser. Animated frames and image metadata may not be preserved."
    : isSupported
      ? "Available locally — this conversion runs in your browser."
      : "Not available yet — this format needs a specialized or server-side engine that is not installed on this site.";
  convertButton.disabled = !isSupported;

  converterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    outputSection.hidden = true;

    try {
      if (imageConversion) {
        const file = fileInput.files?.[0];
        if (!file) throw new Error("Choose an image file to convert.");
        const blob = await convertImage(file, converter.target);
        showDownload(blob, `converted-image.${converter.target === "jpg" ? "jpg" : converter.target}`);
        output.value = "Your converted image is ready to download.";
      } else {
        const file = fileInput.files?.[0];
        const sourceText = file ? await file.text() : input.value;
        if (!sourceText.trim()) throw new Error("Choose a file or enter text to convert.");
        const convertedText = convertText(sourceText, converter.source, converter.target);
        const extension = converter.target === "yaml" ? "yaml" : converter.target;
        showDownload(
          new Blob([convertedText], { type: mimeTypeFor(converter.target) }),
          `converted.${extension}`,
        );
        output.value = convertedText;
      }

      outputSection.hidden = false;
      message.textContent = "Conversion complete. Download or copy the output below.";
      message.classList.add("is-success");
      message.classList.remove("is-error");
    } catch (error) {
      message.textContent =
        error instanceof Error ? error.message : "The conversion failed.";
      message.classList.add("is-error");
      message.classList.remove("is-success");
    }
  });
}

function isTextConversionSupported(source, target, toolId) {
  const supportedPairs = new Set([
    "json:json",
    "json:csv",
    "json:xml",
    "json:yaml",
    "json:sql",
    "json:jsonl",
    "jsonl:json",
    "jsonl:csv",
    "jsonl:sql",
    "csv:json",
    "csv:jsonl",
    "csv:xml",
    "csv:sql",
    "csv:srt",
    "xml:json",
    "xml:csv",
    "srt:csv",
    "html:csv",
    "html:json",
    "rss:csv",
    "sitemap:csv",
  ]);
  return (
    supportedPairs.has(`${source}:${target}`) &&
    (source !== "json" ||
      target !== "json" ||
      toolId === "format-json" ||
      toolId === "validate-json")
  );
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"' && cell.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("The CSV input contains an unclosed quoted field.");
  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  if (rows.length === 0) throw new Error("The CSV input is empty.");

  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim(),
  );
  if (headers.some((header) => !header)) {
    throw new Error("Every CSV column must have a header.");
  }

  return rows.slice(1).map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ),
  );
}

function csvEscape(value) {
  const text =
    value !== null && typeof value === "object"
      ? JSON.stringify(value)
      : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("The input must contain at least one data record.");
  }
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  if (!headers.length) throw new Error("The input records have no columns.");
  return [
    headers.map(csvEscape).join(","),
    ...records.map((record) =>
      headers.map((header) => csvEscape(record[header])).join(","),
    ),
  ].join("\r\n");
}

function parseXml(text) {
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error("The XML input is not well formed.");
  }

  function readElement(element) {
    const result = {};
    for (const attribute of element.attributes) {
      result[`@${attribute.name}`] = attribute.value;
    }
    for (const child of element.children) {
      const value = readElement(child);
      if (Object.hasOwn(result, child.tagName)) {
        result[child.tagName] = Array.isArray(result[child.tagName])
          ? [...result[child.tagName], value]
          : [result[child.tagName], value];
      } else {
        result[child.tagName] = value;
      }
    }
    const textContent = [...element.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .join(" ");
    if (textContent) {
      if (Object.keys(result).length) result["#text"] = textContent;
      else return textContent;
    }
    return result;
  }

  return { [document.documentElement.tagName]: readElement(document.documentElement) };
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function jsonToXml(value, tag = "item") {
  if (Array.isArray(value)) {
    return value.map((item) => jsonToXml(item, tag)).join("");
  }
  if (value !== null && typeof value === "object") {
    return `<${tag}>${Object.entries(value)
      .map(([key, item]) => {
        const cleaned = key.replace(/[^A-Za-z0-9_.-]/g, "_");
        const safeTag = /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
        return jsonToXml(item, safeTag);
      })
      .join("")}</${tag}>`;
  }
  return `<${tag}>${xmlEscape(value ?? "")}</${tag}>`;
}

function recordsFromXml(value) {
  if (Array.isArray(value)) {
    if (value.every((item) => item !== null && typeof item === "object")) {
      return value;
    }
    return value.map((item) => ({ value: item }));
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const records = recordsFromXml(item);
      if (records) return records;
    }
    return [value];
  }
  return null;
}

function parseSrt(text) {
  const blocks = text.trim().split(/\r?\n\s*\r?\n/);
  const records = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    const timeIndex = lines.findIndex((line) =>
      /\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}/.test(line),
    );
    if (timeIndex === -1) continue;
    const [start, end] = lines[timeIndex]
      .split("-->")
      .map((part) => part.trim().replace(",", "."));
    records.push({
      number: lines[0].trim(),
      start,
      end,
      text: lines.slice(timeIndex + 1).join("\n"),
    });
  }
  if (!records.length) throw new Error("No valid SRT subtitle cues were found.");
  return records;
}

function toSql(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("The input must contain at least one data record.");
  }
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  const columns = headers
    .map((header) => `"${header.replace(/"/g, '""')}"`)
    .join(", ");
  const statements = records.map((record) => {
    const values = headers
      .map((header) => {
        const value = record[header];
        if (value === null || value === undefined) return "NULL";
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
        if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
        return `'${String(value).replace(/'/g, "''")}'`;
      })
      .join(", ");
    return `INSERT INTO "records" (${columns}) VALUES (${values});`;
  });
  return statements.join("\n");
}

function flattenHtmlTable(text) {
  const document = new DOMParser().parseFromString(text, "text/html");
  const table = document.querySelector("table");
  if (!table) throw new Error("No HTML table was found in the input.");
  const rows = [...table.rows].map((row) =>
    [...row.cells].map((cell) => cell.textContent.trim()),
  );
  if (rows.length < 2) throw new Error("The HTML table needs a header and at least one row.");
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

function parseInput(text, source) {
  if (source === "json") return JSON.parse(text);
  if (source === "jsonl") {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }
  if (source === "csv") return parseCsv(text);
  if (source === "xml") return parseXml(text);
  if (source === "srt") return parseSrt(text);
  if (source === "html") return flattenHtmlTable(text);
  if (source === "rss" || source === "sitemap") {
    return parseXml(text);
  }
  throw new Error(`The ${source.toUpperCase()} input format is not supported locally.`);
}

function asRecords(value) {
  if (Array.isArray(value)) {
    return value.map((record) =>
      record !== null && typeof record === "object" ? record : { value: record },
    );
  }
  if (value !== null && typeof value === "object") return [value];
  throw new Error("JSON input must be an object or an array of objects.");
}

function toSrt(records) {
  return records
    .map((record, index) => {
      const normalized = Object.fromEntries(
        Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]),
      );
      const start = normalized.start || normalized.start_time || normalized.starttime;
      const end = normalized.end || normalized.end_time || normalized.endtime;
      const subtitle = normalized.text || normalized.subtitle || normalized.content;
      if (!start || !end || subtitle === undefined) {
        throw new Error("CSV needs start, end, and text/subtitle columns to create SRT.");
      }
      return `${index + 1}\n${String(start).replace(".", ",")} --> ${String(end).replace(".", ",")}\n${subtitle}`;
    })
    .join("\n\n");
}

function toYaml(value, depth = 0) {
  const indent = "  ".repeat(depth);
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        item !== null && typeof item === "object"
          ? `${indent}-\n${toYaml(item, depth + 1)}`
          : `${indent}- ${JSON.stringify(item)}`,
      )
      .join("\n");
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) =>
        item !== null && typeof item === "object"
          ? `${indent}${JSON.stringify(key)}:\n${toYaml(item, depth + 1)}`
          : `${indent}${JSON.stringify(key)}: ${JSON.stringify(item)}`,
      )
      .join("\n");
  }
  return `${indent}${JSON.stringify(value)}`;
}

function convertText(text, source, target) {
  const value = parseInput(text, source);
  if (target === "json") {
    if (source === "srt") return JSON.stringify(value, null, 2);
    if (source === "xml" || source === "rss" || source === "sitemap") {
      return JSON.stringify(value, null, 2);
    }
    return JSON.stringify(value, null, 2);
  }
  if (target === "jsonl") {
    return asRecords(value).map((record) => JSON.stringify(record)).join("\n");
  }
  if (target === "csv") {
    if (source === "xml" || source === "rss" || source === "sitemap") {
      const records = recordsFromXml(value);
      if (!records?.length) throw new Error("No tabular records could be found in the XML.");
      return toCsv(records);
    }
    return toCsv(source === "html" ? value : asRecords(value));
  }
  if (target === "xml") {
    const xml = jsonToXml(value, "root");
    return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
  }
  if (target === "yaml") return toYaml(value);
  if (target === "sql") return toSql(asRecords(value));
  if (target === "srt") return toSrt(asRecords(value));
  throw new Error(`Conversion from ${source.toUpperCase()} to ${target.toUpperCase()} is not supported locally.`);
}

async function convertImage(file, target) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a valid image file.");
  }
  const image = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create an image canvas.");
  if (target === "jpg" || target === "jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0);
  image.close();
  const mimeType = target === "jpg" ? "image/jpeg" : `image/${target}`;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.92));
  if (!blob) throw new Error(`Your browser could not encode this image as ${target.toUpperCase()}.`);
  return blob;
}

function mimeTypeFor(format) {
  return {
    csv: "text/csv;charset=utf-8",
    json: "application/json;charset=utf-8",
    jsonl: "application/jsonl;charset=utf-8",
    xml: "application/xml;charset=utf-8",
    yaml: "text/yaml;charset=utf-8",
    sql: "application/sql;charset=utf-8",
    srt: "text/plain;charset=utf-8",
  }[format] || "text/plain;charset=utf-8";
}

function showDownload(blob, filename) {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = URL.createObjectURL(blob);
  downloadLink.href = downloadUrl;
  downloadLink.download = filename;
}

window.addEventListener("beforeunload", () => {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
});
