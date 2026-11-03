import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ArrowDownUp, Search, SlidersHorizontal, X } from "lucide-react";
import { ConverterCard } from "@/components/ConverterCard";
import { Seo } from "@/components/Seo";
import { categories, converters } from "@/lib/catalog";

export default function ConverterDirectory() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const activeCategory = typeof router.query.category === "string" ? router.query.category : "all";
  const visibleConverters = useMemo(() => {
    const search = query.trim().toLowerCase();
    return converters.filter((converter) => {
      const inCategory = activeCategory === "all" || converter.category === activeCategory;
      const matches = !search || [converter.name, converter.source, converter.target, converter.id].some((value) => value.toLowerCase().includes(search));
      return inCategory && matches;
    });
  }, [query, activeCategory]);

  function chooseCategory(category: string) {
    const next = category === "all" ? "/converters" : { pathname: "/converters", query: { category } };
    void router.replace(next, undefined, { shallow: true, scroll: false });
  }

  const selectedLabel = categories.find((category) => category.id === activeCategory)?.label ?? "All converters";

  return (
    <>
      <Seo title="Browse All Converters" description={`Search and explore ${converters.length} free, local-first converters by category.`} path="/converters.html" />
      <section className="relative isolate overflow-hidden border-b border-[var(--line)]">
        <div className="site-grid absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pb-14 sm:pt-20">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--brand)]">The ConvoTools directory</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Find your next tool.</h1>
              <p className="mt-3 max-w-2xl text-base text-[var(--muted)]">Browse helpful converters for your files, data, images and documents — all organized in one place.</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3">
                <p className="text-2xl font-black text-[var(--brand)]">{converters.length}</p>
                <p className="text-xs font-semibold text-[var(--muted)]">non-AI converters</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3">
                <p className="text-2xl font-black text-[var(--brand)]">{categories.length}</p>
                <p className="text-xs font-semibold text-[var(--muted)]">categories</p>
              </div>
            </div>
          </div>
          <label className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 shadow-sm">
            <Search size={18} className="shrink-0 text-[var(--muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a format or converter…" className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]" aria-label="Search converter directory" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="rounded-full p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"><X size={15} /></button>}
          </label>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <aside className="md:sticky md:top-[98px] md:w-60 md:shrink-0">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="mb-3 inline-flex items-center gap-2 px-2 text-xs font-black uppercase tracking-wider text-[var(--muted)]"><SlidersHorizontal size={14} /> Categories</p>
              <button type="button" onClick={() => chooseCategory("all")} className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${activeCategory === "all" ? "bg-brand-900 text-white dark:bg-brand-500 dark:text-brand-950" : "hover:bg-[var(--surface-muted)]"}`}>
                All converters<span className={`text-xs ${activeCategory === "all" ? "text-white/75 dark:text-brand-950/75" : "text-[var(--muted)]"}`}>{converters.length}</span>
              </button>
              {categories.map((category) => {
                const count = converters.filter((item) => item.category === category.id).length;
                return (
                  <button type="button" key={category.id} onClick={() => chooseCategory(category.id)} className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${activeCategory === category.id ? "bg-brand-900 text-white dark:bg-brand-500 dark:text-brand-950" : "hover:bg-[var(--surface-muted)]"}`}>
                    {category.label}<span className={`text-xs ${activeCategory === category.id ? "text-white/75 dark:text-brand-950/75" : "text-[var(--muted)]"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </aside>
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{selectedLabel}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Showing {visibleConverters.length} converter{visibleConverters.length === 1 ? "" : "s"}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)]"><ArrowDownUp size={13} /> A–Z</span>
            </div>
            {visibleConverters.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleConverters.map((converter, index) => <ConverterCard key={converter.id} converter={converter} index={index % 12} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-12 text-center">
                <Search size={25} className="mx-auto text-[var(--muted)]" />
                <h3 className="mt-4 font-bold">No matching converters</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Try another search or choose a different category.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
