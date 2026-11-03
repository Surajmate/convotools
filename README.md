# ConvoTools

ConvoTools is a Next.js and React collection of browser-based file converters and small utilities. It uses Tailwind CSS 4 and supports system, light, and dark themes.

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open the local address printed by Next.js. The converter directory is available at `/converters`.

## Validate and build

```powershell
npm run typecheck
npm run build
npm start
```

The development and production build hooks regenerate the converter catalog and sitemap and stage the local PDF/FFmpeg browser assets. Existing `.html` tool URLs are preserved through Next.js rewrites. AI converters are intentionally excluded.

Tabular conversions include CSV, JSON/JSONL, XML, YAML, BSON, EDI, Excel, ODS and Parquet. Browser-compatible document, image and media conversions use local PDF, image-codec, OCR and FFmpeg/WASM engines. The first use of FFmpeg downloads about 32 MB of engine assets from this site; OCR may download its English language model. User files remain in the browser and are not uploaded.

DRM-free AZW, AZW3 and MOBI ebooks can be converted to text-based PDF or EPUB files; this extracts chapter text and does not preserve the original layout, images or other rich formatting. Some formats still have no suitable browser-only engine in this build: Apple Numbers import, HEIC output, Excel-to-XPS, AZW/MOBI format interchange, and PDF/EPUB-to-AZW/MOBI. Those converter pages explain the limitation and remain disabled rather than returning mislabeled files.

## Privacy

Supported conversions run in the visitor's browser; files are not uploaded to ConvoTools. An individual tool can still use a browser-native API, such as clipboard access, only after the visitor takes the corresponding action.
