import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileImage, FileSpreadsheet, FileText } from "lucide-react";
import { categoryLabel } from "@/lib/catalog";
import type { Converter } from "@/types/converter";

export function ConverterCard({ converter, index = 0 }: { converter: Converter; index?: number }) {
  const Icon = converter.category === "images" ? FileImage : converter.category === "data" ? FileSpreadsheet : FileText;
  return (
    <Link
      href={`/converter/${converter.id}`}
      className="converter-card group flex min-h-44 flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--brand)_44%,var(--line))] hover:shadow-[var(--shadow)]"
      style={{ "--card-index": index } as React.CSSProperties}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_12%,var(--surface))] text-[var(--brand)]">
        <Icon size={19} />
      </span>
      <span className="mt-4 text-[15px] font-bold leading-snug text-[var(--ink)]">{converter.name}</span>
      <span className="mt-1 text-xs font-medium text-[var(--muted)]">{categoryLabel(converter.category)}</span>
      <span className="mt-auto flex items-center justify-between pt-4 text-xs font-bold text-[var(--brand)]">
        Open converter <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
