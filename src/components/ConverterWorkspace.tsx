import { Check, Clipboard, Download, FileUp, LoaderCircle, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { acceptedFileTypes, converterAvailabilityMessage, convertFile, supportsConverter } from "@/lib/converter-engine";
import type { ConversionResult } from "@/lib/converter-engine";
import { categoryLabel } from "@/lib/catalog";
import type { Converter } from "@/types/converter";

export function ConverterWorkspace({ converter }: { converter?: Converter }) {
  const [input, setInput] = useState("");
  const [schema, setSchema] = useState("");
  const [file, setFile] = useState<File>();
  const [result, setResult] = useState<ConversionResult>();
  const [downloadUrl, setDownloadUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const supported = Boolean(converter && supportsConverter(converter));
  const isImage = converter?.category === "images";
  const fileOnly = supported && (isImage || converter?.category === "media" || converter?.id.startsWith("ocr-") || ["excel", "ods", "bson", "parquet", "pdf", "powerpoint", "oxps", "xls", "docx", "word", "jpg", "png", "azw", "azw3", "mobi"].includes(converter?.source ?? ""));
  const fileAccept = useMemo(() => converter ? acceptedFileTypes(converter.source) : ".txt", [converter]);

  useEffect(() => {
    if (!result) {
      setDownloadUrl("");
      return;
    }
    const url = URL.createObjectURL(result.blob);
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  if (!converter) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--brand)]">Converter unavailable</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">We couldn&apos;t find that converter.</h1>
        <p className="mt-3 text-[var(--muted)]">Choose a converter from the directory to get started.</p>
        <Link href="/converters" className="mt-7 inline-flex rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white dark:bg-brand-500 dark:text-brand-950">Browse converters</Link>
      </div>
    );
  }

  async function runConversion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!converter || busy) return;
    setBusy(true);
    setMessage("");
    setIsError(false);
    setResult(undefined);
    try {
      const converted = await convertFile(converter, input, file, schema);
      setResult(converted);
      setMessage("Conversion complete. Your file was processed locally.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "The conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  async function copyOutput() {
    if (!result?.preview) return;
    try {
      await navigator.clipboard.writeText(result.preview);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setIsError(true);
      setMessage("The browser could not copy this output. Select and copy the text instead.");
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--brand)]">Home</Link><span>/</span>
        <Link href="/converters" className="hover:text-[var(--brand)]">Converters</Link><span>/</span>
        <span className="truncate text-[var(--ink)]">{converter.name}</span>
      </nav>
      <div className="mx-auto max-w-4xl">
        <div className="enter mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--brand)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />{categoryLabel(converter.category)}
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{converter.name}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--muted)]">
            Convert {converter.source.toUpperCase()} to {converter.target.toUpperCase()} with a simple, private workflow.
          </p>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
          <div className="border-b border-[var(--line)] bg-[var(--surface-muted)] px-6 py-5 sm:px-8">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--brand)]"><RefreshCw size={18} /></span>
              <div>
                <h2 className="font-bold">Add your input</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{supported ? "Your data is processed in this browser and is not uploaded." : converterAvailabilityMessage(converter)}</p>
                {supported && converter.source === "excel" && <p className="mt-2 text-xs text-[var(--muted)]">Reads the first worksheet&apos;s cell values; formulas, macros and workbook styling aren&apos;t preserved.</p>}
                {supported && ["azw", "azw3", "mobi"].includes(converter.source) && <p className="mt-2 text-xs text-[var(--muted)]">Extracts chapter text into a new file; original layout, images and rich formatting aren&apos;t preserved. DRM-protected books can&apos;t be opened.</p>}
              </div>
            </div>
          </div>
          {supported ? (
            <form onSubmit={runConversion} className="space-y-5 p-5 sm:p-8">
              {!fileOnly && (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Input {converter.source.toUpperCase()} data</span>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    className="min-h-56 w-full resize-y rounded-2xl border border-[var(--line)] bg-[var(--page)] p-4 font-mono text-sm text-[var(--ink)] placeholder:text-[var(--muted)]"
                    placeholder={`Paste ${converter.source.toUpperCase()} content here…`}
                    spellCheck={false}
                    aria-label={`${converter.source.toUpperCase()} input`}
                  />
                </label>
              )}
              {converter.id === "validate-xml-xsd" && (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">XSD schema</span>
                  <textarea
                    value={schema}
                    onChange={(event) => setSchema(event.target.value)}
                    className="min-h-40 w-full resize-y rounded-2xl border border-[var(--line)] bg-[var(--page)] p-4 font-mono text-sm text-[var(--ink)] placeholder:text-[var(--muted)]"
                    placeholder="Paste an XML Schema (XSD) here…"
                    spellCheck={false}
                    required
                    aria-label="XSD schema"
                  />
                </label>
              )}
              <label className="drop-target block cursor-pointer rounded-2xl border border-dashed border-[var(--line)] p-6 text-center">
                <input
                  type="file"
                  accept={fileAccept}
                  className="sr-only"
                  onChange={(event) => {
                    setFile(event.target.files?.[0]);
                    setResult(undefined);
                  }}
                  aria-label={`Choose a ${converter.source.toUpperCase()} file`}
                />
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface-muted)] text-[var(--brand)]"><FileUp size={20} /></span>
                <span className="mt-3 block text-sm font-bold">{file ? file.name : "Choose a file from your device"}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{file ? `${(file.size / 1024).toFixed(1)} KB · click to replace` : `Accepted: ${fileAccept.replaceAll(",", ", ")}`}</span>
              </label>
              {message && (
                <div role="status" className={`rounded-xl px-4 py-3 text-sm font-semibold ${isError ? "bg-red-500/10 text-red-600 dark:text-red-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
                  {message}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-900 px-7 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400">
                  {busy ? <LoaderCircle size={17} className="animate-spin" /> : <RefreshCw size={16} />}
                  {busy ? "Converting…" : "Convert file"}
                </button>
                <button type="button" onClick={() => { setInput(""); setSchema(""); setFile(undefined); setResult(undefined); setMessage(""); setIsError(false); }} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-bold text-[var(--muted)] transition hover:bg-[var(--surface-muted)]">
                  Clear
                </button>
                <span className="sm:ml-auto inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><LockKeyhole size={14} /> Files stay on your device</span>
              </div>
              {result && (
                <section aria-label="Conversion output" className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[.04] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300"><Check size={17} /> Your converted file is ready</div>
                    <div className="flex gap-2">
                      {result.preview && <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-bold"><Clipboard size={14} />{copied ? "Copied" : "Copy"}</button>}
                      <a href={downloadUrl} download={result.filename} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"><Download size={14} />Download</a>
                    </div>
                  </div>
                  {result.preview && <textarea readOnly value={result.preview} aria-label="Converted output preview" className="mt-4 min-h-48 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 font-mono text-xs text-[var(--ink)]" />}
                </section>
              )}
            </form>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
                <p className="font-bold">This conversion isn&apos;t supported in the browser.</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{converterAvailabilityMessage(converter)}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Files are never uploaded, and unsupported conversions won&apos;t produce a mislabeled download.</p>
              </div>
              <Link href="/converters" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">Explore available formats <ShieldCheck size={16} /></Link>
            </div>
          )}
        </div>
        <p className="mt-5 text-center text-xs text-[var(--muted)]">No account. No file uploads. Your data stays right where you opened it.</p>
      </div>
    </section>
  );
}
