import rawCatalog from "@/data/converters.json";
import type { Converter, ConverterCategory } from "@/types/converter";

export const converters = rawCatalog as Converter[];

export const categories: { id: ConverterCategory; label: string; description: string }[] = [
  { id: "data", label: "Data", description: "Structured data, spreadsheets and developer formats." },
  { id: "documents", label: "Documents", description: "Document and text conversions that work in your browser." },
  { id: "ebooks", label: "E-books", description: "Common e-book formats and text exports." },
  { id: "images", label: "Images", description: "Popular image formats, processed locally on your device." },
  { id: "media", label: "Media", description: "Subtitle and audio/video format utilities." },
];

export function getConverter(id: string): Converter | undefined {
  return converters.find((converter) => converter.id === id);
}

export function categoryLabel(id: string): string {
  return categories.find((category) => category.id === id)?.label ?? id;
}

export function canonicalUrl(path: string): string {
  return `https://convotools.in${path}`;
}
