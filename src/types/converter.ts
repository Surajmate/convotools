export type ConverterCategory = "data" | "documents" | "ebooks" | "images" | "media";

export type Converter = {
  id: string;
  name: string;
  category: ConverterCategory;
  source: string;
  target: string;
};
