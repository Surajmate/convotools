import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Braces, Code2, FileImage, FileSpreadsheet, Files, LockKeyhole, Search, Sparkles, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { ConverterCard } from "@/components/ConverterCard";
import { converters } from "@/lib/catalog";
import { siteDescription } from "@/lib/metadata";
import { tools } from "@/data/tools";

const highlights = [
  { icon: LockKeyhole, title: "Private by design", text: "Files are handled in your browser. We don’t collect or upload your documents." },
  { icon: Sparkles, title: "Simple, useful tools", text: "A carefully organized collection of converters and everyday utilities." },
  { icon: WandSparkles, title: "Made for everyone", text: "A clean, friendly experience that works just as well on your phone." },
];

const categories = [
  { id: "data", name: "Data", icon: Braces, href: "/converters?category=data" },
  { id: "documents", name: "Documents", icon: Files, href: "/converters?category=documents" },
  { id: "ebooks", name: "E-books", icon: FileSpreadsheet, href: "/converters?category=ebooks" },
  { id: "images", name: "Images", icon: FileImage, href: "/converters?category=images" },
  { id: "media", name: "Media", icon: Code2, href: "/converters?category=media" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const featured = useMemo(() => {
    const text = query.trim().toLowerCase();
    return converters.filter((item) => !text || item.name.toLowerCase().includes(text)).slice(0, 6);
  }, [query]);

  return (
    <>
      <Seo title="Free Online Converters & Utilities" description={siteDescription} path="/" />
      <section className="relative isolate overflow-hidden border-b border-[var(--line)]">
        <div className="site-grid absolute inset-0 -z-10 opacity-60" />
        <div className="pointer-events-none absolute -right-36 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-[color-mix(in_srgb,var(--brand)_13%,transparent)] blur-3xl" />
        <div className="mx-auto grid min-h-[610px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-4 py-2 text-xs font-bold tracking-wide text-[var(--brand)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> YOUR EVERYDAY DIGITAL TOOLBOX
            </span>
            <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.05] tracking-[-.045em] sm:text-6xl lg:text-[4.35rem]">
              Make file work
              <span className="block text-[var(--brand)]">feel effortless.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              Convert files, clean up data and get small tasks done — with friendly tools that keep your files on your device.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/converters" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-900 px-6 text-sm font-bold text-white shadow-lg shadow-brand-900/15 transition hover:-translate-y-0.5 hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400">
                Explore converters <ArrowRight size={17} />
              </Link>
              <a href="#tools" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 text-sm font-bold transition hover:border-[var(--brand)] hover:text-[var(--brand)]">
                Browse tools <ArrowDown size={16} />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5"><LockKeyhole size={14} className="text-[var(--brand)]" /> Private by design</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-[var(--brand)]" /> Free to use</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles size={14} className="text-[var(--brand)]" /> No sign-up</span>
            </div>
          </div>

          <div className="enter enter-delay-2 relative mx-auto w-full max-w-[500px]">
            <div className="absolute -left-7 top-10 h-24 w-24 rounded-[30px] border border-[var(--line)] bg-[var(--surface)] shadow-lg [transform:rotate(-12deg)] sm:-left-12">
              <span className="grid h-full place-items-center text-[var(--brand)]"><FileSpreadsheet size={31} /></span>
            </div>
            <div className="absolute -right-4 bottom-12 h-20 w-20 rounded-[25px] border border-[var(--line)] bg-[var(--surface)] shadow-lg [transform:rotate(11deg)] sm:-right-8">
              <span className="grid h-full place-items-center text-[var(--brand)]"><FileImage size={27} /></span>
            </div>
            <div className="relative rounded-[30px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--muted)]">Start with a tool</p>
                  <p className="mt-1 text-xl font-black tracking-tight">What do you need?</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200"><Search size={20} /></span>
              </div>
              <label className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--page)] px-4 py-3.5">
                <Search size={17} className="shrink-0 text-[var(--muted)]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search converters…" className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]" aria-label="Search converters" />
                <kbd className="hidden rounded-md border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--muted)] sm:inline">Find</kbd>
              </label>
              <div className="mt-4 space-y-2">
                {featured.map((item) => (
                  <Link key={item.id} href={`/converter/${item.id}`} className="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-[var(--surface-muted)]">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{item.name}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted)]">{item.source.toUpperCase()} <span aria-hidden="true">→</span> {item.target.toUpperCase()}</span>
                    </span>
                    <ArrowUpRight size={16} className="ml-3 shrink-0 text-[var(--muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
                  </Link>
                ))}
                {!featured.length && <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">No converters match that search.</p>}
              </div>
              <Link href="/converters" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] py-3 text-sm font-bold text-[var(--brand)] transition hover:bg-[var(--surface-muted)]">
                Browse all converters <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--brand)]">A better way to get things done</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your tools, one simple place.</h2>
          </div>
          <Link href="/converters" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">See the full directory <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map(({ id, name, icon: Icon, href }, index) => (
            <Link key={name} href={href} className="enter group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]" style={{ animationDelay: `${index * 55}ms` }}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_11%,var(--surface))] text-[var(--brand)]"><Icon size={20} /></span>
              <span className="mt-5 flex items-center justify-between text-base font-bold">{name}<ArrowUpRight size={16} className="text-[var(--muted)] transition group-hover:text-[var(--brand)]" /></span>
              <span className="mt-1 block text-xs text-[var(--muted)]">{converters.filter((converter) => converter.category === id).length} converters</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--brand)]">ConvoTools, by design</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Useful first. Private always.</h2>
            <p className="mt-4 text-[var(--muted)]">The best tool is one that gets out of your way. ConvoTools brings together practical conversions and everyday utilities in one fast, thoughtful workspace.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-[var(--line)] bg-[var(--page)] p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface)] text-[var(--brand)] shadow-sm"><Icon size={20} /></span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--brand)]">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Explore the toolbox.</h2>
          </div>
          <Link href="/converters" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-sm font-bold hover:border-[var(--brand)]">All converters <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {converters.slice(0, 6).map((converter, index) => <ConverterCard key={converter.id} converter={converter} index={index} />)}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/converters" className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950">Find the right tool <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="rounded-[30px] bg-brand-950 px-6 py-10 text-white sm:px-10 sm:py-12 dark:bg-[#11263a]">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-brand-300">More than file conversions</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Small utilities. Big time-savers.</h2>
              <p className="mt-3 max-w-xl text-sm text-slate-300">Explore calculators, code helpers, text tools and secure browser-based utilities.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tools.filter((tool) => !["contribution", "file-conversion"].includes(tool.mode)).slice(0, 5).map((tool) => (
                <Link key={tool.slug} href={`/${tool.slug}.html`} className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition hover:border-brand-300 hover:bg-white/10">{tool.title}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
