import { QRCodeCanvas } from "qrcode.react";
import jsQR from "jsqr";
import { ArrowDownToLine, Check, Clipboard, KeyRound, QrCode, WandSparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ConverterWorkspace } from "@/components/ConverterWorkspace";
import { getConverter } from "@/lib/catalog";
import type { ToolDefinition } from "@/data/tools";

type Props = { tool: ToolDefinition };

export function UtilityTool({ tool }: Props) {
  if (tool.mode === "file-conversion") return <ConverterWorkspace converter={getConverter(tool.slug)} />;
  if (tool.mode === "contribution") return <Contribution />;
  return <UtilityForm tool={tool} />;
}

function UtilityShell({ tool, children }: { tool: ToolDefinition; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8 flex gap-2 text-sm text-[var(--muted)]"><Link href="/" className="hover:text-[var(--brand)]">Home</Link><span>/</span><span>{tool.category}</span><span>/</span><span className="text-[var(--ink)]">{tool.title}</span></nav>
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--brand)]"><WandSparkles size={14} />{tool.category}</span>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{tool.title}</h1>
        <p className="mt-3 text-base text-[var(--muted)]">{tool.description}</p>
      </header>
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">{children}</div>
    </section>
  );
}

function UtilityForm({ tool }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");
  const [date, setDate] = useState("");
  const [extra, setExtra] = useState("");
  const [count, setCount] = useState("1");
  const [file, setFile] = useState<File>();
  const [quality, setQuality] = useState(78);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [blob, setBlob] = useState<Blob>();
  const [blobUrl, setBlobUrl] = useState("");
  const [cameraText, setCameraText] = useState("");
  const [paymentName, setPaymentName] = useState("");
  const [paymentVpa, setPaymentVpa] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [html, setHtml] = useState("<h1>Hello, world!</h1>\n<p>Edit this markup and preview it here.</p>");
  const [jsonRows, setJsonRows] = useState<Record<string, unknown>[]>([]);
  const [key, setKey] = useState("");
  const [outputUrl, setOutputUrl] = useState("");

  useEffect(() => {
    if (!blob) {
      setBlobUrl("");
      return;
    }
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  useEffect(() => {
    if (!output) {
      setOutputUrl("");
      return;
    }
    const url = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" }));
    setOutputUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [output]);

  function reportError(message: string) {
    setError(message);
    setNotice("");
  }

  function reportSuccess(message: string) {
    setNotice(message);
    setError("");
  }

  async function copy(value = output) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1700);
    } catch {
      reportError("Your browser could not copy the text. Select it and copy it manually.");
    }
  }

  function encodeBase64(value: string) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function decodeBase64(value: string) {
    const binary = atob(value.trim());
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }

  function transform(action: string) {
    try {
      setError("");
      setNotice("");
      if (action === "base64-encode") setOutput(encodeBase64(input));
      else if (action === "base64-decode") setOutput(decodeBase64(input));
      else if (action === "url-encode") setOutput(encodeURIComponent(input));
      else if (action === "url-decode") setOutput(decodeURIComponent(input.replace(/\+/g, " ")));
      else if (action === "one-line") setOutput(input.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim());
      else if (action === "json-beautify") setOutput(JSON.stringify(JSON.parse(input), null, 2));
      else if (action === "json-minify") setOutput(JSON.stringify(JSON.parse(input)));
      else if (action === "json-stringify") setOutput(JSON.stringify(input));
      else if (action === "json-unstringify") {
        const parsed: unknown = JSON.parse(input);
        setOutput(typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2));
      } else if (action === "case-upper") setOutput(input.toUpperCase());
      else if (action === "case-lower") setOutput(input.toLowerCase());
      else if (action === "case-title") setOutput(input.toLowerCase().replace(/(^|[\s([{])\p{L}/gu, (match) => match.toUpperCase()));
      else if (action === "case-sentence") setOutput(input.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (match) => match.toUpperCase()));
      else if (action === "case-camel") setOutput(input.trim().replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part, index) => index ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part.toLowerCase()).join(""));
      else if (action === "case-snake") setOutput(input.trim().replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part) => part.toLowerCase()).join("_"));
      else if (action === "case-kebab") setOutput(input.trim().replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part) => part.toLowerCase()).join("-"));
      else if (action === "uuid") {
        const quantity = Math.min(1000, Math.max(1, Number(count) || 1));
        setOutput(Array.from({ length: quantity }, () => crypto.randomUUID()).join("\n"));
      }
      reportSuccess("Done. Copy or download your result.");
    } catch (reason) {
      reportError(reason instanceof Error ? reason.message : "The operation could not be completed.");
    }
  }

  function calculateAge() {
    if (!date) return reportError("Choose your date of birth.");
    const [year, month, day] = date.split("-").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    if (Number.isNaN(birthDate.getTime()) || birthDate > today) return reportError("Enter a valid date that is not in the future.");
    let years = today.getFullYear() - year;
    let months = today.getMonth() - (month - 1);
    let days = today.getDate() - day;
    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    setOutput(`${years} years, ${months} months and ${days} days`);
    reportSuccess("Your age has been calculated.");
  }

  function calculateEmi() {
    const principal = Number(amount);
    const annualRate = Number(rate);
    const months = Number(term);
    if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isFinite(months) || months <= 0) {
      return reportError("Enter a loan amount above zero, an interest rate of zero or more, and a term above zero.");
    }
    const monthlyRate = annualRate / 1200;
    const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
    const total = emi * months;
    setOutput(`Monthly payment: ₹${emi.toFixed(2)}\nTotal interest: ₹${(total - principal).toFixed(2)}\nTotal repayment: ₹${total.toFixed(2)}`);
    reportSuccess("Your estimate is ready.");
  }

  function calculateSip() {
    const monthly = Number(amount);
    const annualRate = Number(rate);
    const years = Number(term);
    if (!Number.isFinite(monthly) || monthly <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isFinite(years) || years <= 0) {
      return reportError("Enter a monthly investment above zero, an expected return of zero or more, and a term above zero.");
    }
    const months = Math.round(years * 12);
    const monthlyRate = annualRate / 1200;
    const futureValue = monthlyRate === 0 ? monthly * months : monthly * ((1 + monthlyRate) ** months - 1) / monthlyRate * (1 + monthlyRate);
    setOutput(`Estimated future value: ₹${futureValue.toFixed(2)}\nTotal invested: ₹${(monthly * months).toFixed(2)}\nEstimated returns: ₹${(futureValue - monthly * months).toFixed(2)}`);
    reportSuccess("This estimate assumes the return rate remains constant. Investment returns are not guaranteed.");
  }

  async function processImage() {
    if (!file) return reportError("Choose an image to compress.");
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      return reportError("Your browser could not open this image. Try a JPG, PNG or WebP file.");
    }
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return reportError("Your browser could not create an image canvas.");
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality / 100));
    if (!compressed) return reportError("Your browser could not compress this image.");
    setBlob(compressed);
    setOutput(`Original size: ${(file.size / 1024).toFixed(1)} KB\nCompressed size: ${(compressed.size / 1024).toFixed(1)} KB\nDimensions: ${canvas.width} × ${canvas.height}px`);
    reportSuccess("Your image is ready to preview and download.");
  }

  async function scanQr() {
    if (!file) return reportError("Choose an image containing a QR code.");
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        bitmap.close();
        return reportError("Your browser could not open this image.");
      }
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(pixels.data, pixels.width, pixels.height);
      if (!code) return reportError("No readable QR code was found. Try a clearer image.");
      setCameraText(code.data);
      reportSuccess("QR code decoded.");
    } catch {
      reportError("Your browser could not read this image.");
    }
  }

  async function createPdf() {
    if (!input.trim() && !file) return reportError("Enter text or choose a DOCX document first.");
    try {
      let text = input;
      if (file) {
        if (file.name.toLowerCase().endsWith(".docx")) {
          const mammoth = await import("mammoth/mammoth.browser");
          text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
        } else text = await file.text();
      }
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF();
      let y = 16;
      for (const line of pdf.splitTextToSize(text, 175)) {
        if (y > 280) {
          pdf.addPage();
          y = 16;
        }
        pdf.text(line, 16, y);
        y += 6;
      }
      setBlob(pdf.output("blob"));
      reportSuccess("Your PDF is ready to download.");
    } catch (reason) {
      reportError(reason instanceof Error ? reason.message : "The document could not be converted.");
    }
  }

  async function encrypt(decrypt: boolean) {
    if (!key.trim()) return reportError("Enter a secret password first.");
    if (!input) return reportError("Enter text to encrypt or decrypt.");
    try {
      if (!decrypt) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const aesKey = await deriveAesKey(key, salt, "encrypt");
        const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", iv }, aesKey, new TextEncoder().encode(input)));
        setOutput(bytesToBase64(concatenateBytes(salt, iv, encrypted)));
      } else {
        const payload = base64ToBytes(input.trim());
        if (payload.length < 48 || (payload.length - 32) % 16 !== 0) throw new Error("The encrypted value is not a valid ConvoTools AES-256-CBC payload.");
        const salt = payload.slice(0, 16);
        const iv = payload.slice(16, 32);
        const ciphertext = payload.slice(32);
        const aesKey = await deriveAesKey(key, salt, "decrypt");
        const plaintext = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, aesKey, ciphertext);
        setOutput(new TextDecoder("utf-8", { fatal: true }).decode(plaintext));
      }
      reportSuccess(decrypt ? "Decrypted successfully." : "Encrypted locally. Keep your password safe.");
    } catch (reason) {
      reportError(decrypt
        ? "The password is incorrect or the encrypted data is damaged."
        : reason instanceof Error ? reason.message : "The operation could not be completed.");
    }
  }

  async function makeTable() {
    try {
      const value: unknown = JSON.parse(input);
      const records = Array.isArray(value) ? value : [value];
      if (!records.length || records.some((item) => item === null || typeof item !== "object" || Array.isArray(item))) {
        throw new Error("Enter an array of JSON objects to display as a table.");
      }
      setJsonRows(records as Record<string, unknown>[]);
      reportSuccess("Table generated from your JSON.");
    } catch (reason) {
      reportError(reason instanceof Error ? reason.message : "The JSON could not be parsed.");
    }
  }

  function outputControls() {
    return output ? (
      <div className="mt-5">
        <label htmlFor={`${tool.slug}-output`} className="mb-2 block text-sm font-bold">Output</label>
        <textarea id={`${tool.slug}-output`} readOnly value={output} className="min-h-36 w-full rounded-2xl border border-[var(--line)] bg-[var(--page)] p-4 font-mono text-sm" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void copy()} className={secondaryButton}><Clipboard size={15} />{copied ? "Copied" : "Copy"}</button>
          <a href={outputUrl} download={`${tool.slug}.txt`} className={secondaryButton}><ArrowDownToLine size={15} />Download</a>
        </div>
      </div>
    ) : null;
  }

  function feedback() {
    return error || notice ? <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${error ? "bg-red-500/10 text-red-600 dark:text-red-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{error || notice}</p> : null;
  }

  const isJson = ["json-format", "json-stringify", "json-unstringify", "json-table"].includes(tool.mode);
  const isText = ["base64", "case", "one-line", "url"].includes(tool.mode);
  const showInput = isJson || isText || ["aes", "playground"].includes(tool.mode);
  const paymentUri = paymentVpa.trim() && paymentName.trim() ? `upi://pay?${new URLSearchParams({ pa: paymentVpa.trim(), pn: paymentName.trim(), cu: "INR", ...(paymentAmount ? { am: paymentAmount } : {}) }).toString()}` : "";
  const generatedHtml = html;

  return (
    <UtilityShell tool={tool}>
      {showInput && (
        <label className="block">
          <span className="mb-2 block text-sm font-bold">{tool.mode === "aes" ? "Text or encrypted value" : "Input"}</span>
          <textarea value={tool.mode === "playground" ? html : input} onChange={(event) => tool.mode === "playground" ? setHtml(event.target.value) : setInput(event.target.value)} placeholder={tool.mode === "playground" ? "" : "Type or paste here…"} spellCheck={tool.mode !== "json-format"} className="min-h-44 w-full rounded-2xl border border-[var(--line)] bg-[var(--page)] p-4 font-mono text-sm" />
        </label>
      )}

      {tool.mode === "base64" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => transform("base64-encode")} className={primaryButton}>Encode to Base64</button><button type="button" onClick={() => transform("base64-decode")} className={secondaryButton}>Decode Base64</button></div>}
      {tool.mode === "url" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => transform("url-encode")} className={primaryButton}>Encode URL text</button><button type="button" onClick={() => transform("url-decode")} className={secondaryButton}>Decode URL text</button></div>}
      {tool.mode === "one-line" && <button type="button" onClick={() => transform("one-line")} className={`mt-4 ${primaryButton}`}>Clean up text</button>}
      {tool.mode === "case" && <div className="mt-4 flex flex-wrap gap-2">{[["case-upper", "UPPERCASE"], ["case-lower", "lowercase"], ["case-title", "Title Case"], ["case-sentence", "Sentence case"], ["case-camel", "camelCase"], ["case-snake", "snake_case"], ["case-kebab", "kebab-case"]].map(([action, label]) => <button type="button" key={action} onClick={() => transform(action)} className={secondaryButton}>{label}</button>)}</div>}
      {tool.mode === "json-format" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => transform("json-beautify")} className={primaryButton}>Format JSON</button><button type="button" onClick={() => transform("json-minify")} className={secondaryButton}>Minify JSON</button></div>}
      {tool.mode === "json-stringify" && <button type="button" onClick={() => transform("json-stringify")} className={`mt-4 ${primaryButton}`}>Stringify JSON</button>}
      {tool.mode === "json-unstringify" && <button type="button" onClick={() => transform("json-unstringify")} className={`mt-4 ${primaryButton}`}>Parse JSON string</button>}

      {tool.mode === "json-table" && <button type="button" onClick={() => void makeTable()} className={`mt-4 ${primaryButton}`}>Create table</button>}
      {jsonRows.length > 0 && tool.mode === "json-table" && <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--line)]"><table className="w-full border-collapse text-left text-sm"><thead className="bg-[var(--surface-muted)]"><tr>{[...new Set(jsonRows.flatMap((row) => Object.keys(row)))].map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-bold">{header}</th>)}</tr></thead><tbody>{jsonRows.map((row, index) => <tr key={index} className="border-t border-[var(--line)]">{[...new Set(jsonRows.flatMap((item) => Object.keys(item)))].map((header) => <td key={header} className="max-w-64 px-4 py-3">{typeof row[header] === "object" ? JSON.stringify(row[header]) : String(row[header] ?? "")}</td>)}</tr>)}</tbody></table></div>}

      {tool.mode === "age" && <><label className="block"><span className="mb-2 block text-sm font-bold">Date of birth</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} max={(() => { const today = new Date(); return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`; })()} className={inputClass} /></label><button type="button" onClick={calculateAge} className={`mt-4 ${primaryButton}`}>Calculate age</button></>}
      {["emi", "sip"].includes(tool.mode) && <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-bold">{tool.mode === "emi" ? "Loan amount (₹)" : "Monthly investment (₹)"}</span><input type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} /></label><label><span className="mb-2 block text-sm font-bold">{tool.mode === "emi" ? "Annual interest rate (%)" : "Expected annual return (%)"}</span><input type="number" min="0" step="any" value={rate} onChange={(event) => setRate(event.target.value)} className={inputClass} /></label><label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">{tool.mode === "emi" ? "Term (months)" : "Investment period (years)"}</span><input type="number" min="0" step="any" value={term} onChange={(event) => setTerm(event.target.value)} className={inputClass} /></label><button type="button" onClick={tool.mode === "emi" ? calculateEmi : calculateSip} className={`sm:col-span-2 ${primaryButton}`}>Calculate {tool.mode === "emi" ? "EMI" : "SIP"}</button></div>}

      {tool.mode === "uuid" && <><label className="block max-w-xs"><span className="mb-2 block text-sm font-bold">Number of UUIDs (1–1000)</span><input type="number" min="1" max="1000" value={count} onChange={(event) => setCount(event.target.value)} className={inputClass} /></label><button type="button" onClick={() => transform("uuid")} className={`mt-4 ${primaryButton}`}>Generate UUID{Number(count) > 1 ? "s" : ""}</button></>}

      {tool.mode === "aes" && <><label className="mt-4 block"><span className="mb-2 flex items-center gap-2 text-sm font-bold"><KeyRound size={15} />Secret password</span><input type="password" autoComplete="new-password" value={key} onChange={(event) => setKey(event.target.value)} className={inputClass} /></label><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => void encrypt(false)} className={primaryButton}>Encrypt</button><button type="button" onClick={() => void encrypt(true)} className={secondaryButton}>Decrypt</button></div></>}

      {tool.mode === "image-compressor" && <div className="space-y-4"><label className="drop-target block cursor-pointer rounded-2xl border border-dashed border-[var(--line)] p-5 text-center"><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { setFile(event.target.files?.[0]); setBlob(undefined); }} /><span className="block text-sm font-bold">{file?.name ?? "Choose a JPG, PNG or WebP image"}</span><span className="mt-1 block text-xs text-[var(--muted)]">Processed locally. Animated images export as a single frame.</span></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-bold">JPEG quality: {quality}%</span><input type="range" min="20" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="w-full accent-[var(--brand)]" /></label><label><span className="mb-2 block text-sm font-bold">Maximum width: {maxWidth}px</span><input type="range" min="320" max="3840" step="80" value={maxWidth} onChange={(event) => setMaxWidth(Number(event.target.value))} className="w-full accent-[var(--brand)]" /></label></div><button type="button" onClick={() => void processImage()} className={primaryButton}>Compress image</button></div>}

      {tool.mode === "qr-generator" && <><label className="block"><span className="mb-2 block text-sm font-bold">Text or URL</span><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter text or a URL…" className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-[var(--page)] p-4 text-sm" /></label>{input.trim() && <div className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl bg-[var(--surface-muted)] p-5"><div id="generated-qr" className="rounded-xl bg-white p-3"><QRCodeCanvas value={input} size={192} marginSize={2} /></div><div><h3 className="font-bold">QR code ready</h3><p className="mt-1 max-w-xs text-sm text-[var(--muted)]">Scan to open the encoded text or URL.</p><button type="button" onClick={() => { const canvas = document.querySelector<HTMLCanvasElement>("#generated-qr canvas"); if (canvas) { const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = "convotools-qr.png"; link.click(); } }} className={`mt-4 ${secondaryButton}`}><QrCode size={15} />Download QR</button></div></div>}</>}

      {tool.mode === "payment-qr" && <div className="space-y-4"><label className="block"><span className="mb-2 block text-sm font-bold">Payee name</span><input value={paymentName} onChange={(event) => setPaymentName(event.target.value)} className={inputClass} /></label><label className="block"><span className="mb-2 block text-sm font-bold">UPI ID</span><input value={paymentVpa} onChange={(event) => setPaymentVpa(event.target.value)} placeholder="name@bank" className={inputClass} /></label><label className="block"><span className="mb-2 block text-sm font-bold">Amount in INR (optional)</span><input type="number" min="1" step="any" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className={inputClass} /></label>{paymentUri && <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-[var(--surface-muted)] p-5"><div className="rounded-xl bg-white p-3"><QRCodeCanvas value={paymentUri} size={184} marginSize={2} /></div><p className="max-w-xs text-sm text-[var(--muted)]">Scan with a compatible UPI app and verify the payee and amount before paying.</p></div>}</div>}

      {tool.mode === "qr-scanner" && <div className="space-y-4"><label className="drop-target block cursor-pointer rounded-2xl border border-dashed border-[var(--line)] p-6 text-center"><input type="file" accept="image/*" className="sr-only" onChange={(event) => setFile(event.target.files?.[0])} /><span className="block text-sm font-bold">{file?.name ?? "Choose an image containing a QR code"}</span><span className="mt-1 block text-xs text-[var(--muted)]">The image is analyzed in your browser and never uploaded.</span></label><button type="button" onClick={() => void scanQr()} className={primaryButton}>Scan QR image</button>{cameraText && <div><label className="mb-2 block text-sm font-bold">QR content</label><textarea readOnly value={cameraText} className="min-h-24 w-full rounded-xl border border-[var(--line)] bg-[var(--page)] p-3 font-mono text-sm" /><button type="button" onClick={() => void copy(cameraText)} className={`mt-3 ${secondaryButton}`}><Clipboard size={15} />Copy content</button></div>}</div>}

      {tool.mode === "word-to-pdf" && <div className="space-y-4"><label className="drop-target block cursor-pointer rounded-2xl border border-dashed border-[var(--line)] p-5 text-center"><input type="file" accept=".docx,.txt,text/plain" className="sr-only" onChange={(event) => setFile(event.target.files?.[0])} /><span className="block text-sm font-bold">{file?.name ?? "Choose a DOCX or text file (optional)"}</span><span className="mt-1 block text-xs text-[var(--muted)]">DOCX formatting and embedded media are not preserved in the PDF.</span></label><label className="block"><span className="mb-2 block text-sm font-bold">Or enter text</span><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type or paste text…" className="min-h-36 w-full rounded-2xl border border-[var(--line)] bg-[var(--page)] p-4 text-sm" /></label><button type="button" onClick={() => void createPdf()} className={primaryButton}>Create PDF</button></div>}

      {tool.mode === "playground" && <div className="space-y-4"><div className="flex items-center justify-between"><span className="text-sm font-bold">Live preview</span><span className="text-xs text-[var(--muted)]">Scripts run in an isolated frame.</span></div><iframe title="HTML playground preview" sandbox="allow-scripts" srcDoc={generatedHtml} className="h-72 w-full rounded-xl border border-[var(--line)] bg-white" /></div>}

      {feedback()}
      {blob && blobUrl && <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[.04] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-bold text-emerald-700 dark:text-emerald-300"><Check size={15} className="mr-1 inline" /> File ready</span><a href={blobUrl} download={tool.mode === "image-compressor" ? "compressed.jpg" : `${tool.slug}.pdf`} className={primaryButton}><ArrowDownToLine size={15} />Download</a></div>{tool.mode === "image-compressor" && <img src={blobUrl} alt="Compressed image preview" className="mt-4 max-h-80 max-w-full rounded-xl object-contain" />}</div>}
      {outputControls()}
    </UtilityShell>
  );
}

function Contribution() {
  return <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8"><span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--brand)]">Community</span><h1 className="mt-5 text-4xl font-black tracking-tight">Support our community initiative.</h1><p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">The original contribution page described a food initiative, but its payment ID and QR code were sample placeholders. We have removed those misleading payment details while they are being verified.</p><div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-left"><h2 className="font-bold">No payment is collected here</h2><p className="mt-2 text-sm text-[var(--muted)]">If you would like to support ConvoTools, check back when verified contribution information is published. We will not ask you to send funds to a sample account.</p></div><Link href="/converters" className="mt-7 inline-flex rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white dark:bg-brand-500 dark:text-brand-950">Explore ConvoTools</Link></section>;
}

async function deriveAesKey(password: string, salt: Uint8Array, usage: "encrypt" | "decrypt"): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new Uint8Array(salt), iterations: 65536, hash: "SHA-1" },
    passwordKey,
    { name: "AES-CBC", length: 256 },
    false,
    [usage],
  );
}

function concatenateBytes(...parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

const primaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-900 px-5 text-sm font-bold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400 disabled:opacity-50";
const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]";
const inputClass = "min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--page)] px-4 text-sm";
