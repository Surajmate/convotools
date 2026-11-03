import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--page)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="ConvoTools home">
            <img className="h-10 w-auto object-contain" src="/img/convotools.gif" alt="ConvoTools" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/converters" className="text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]">Converters</Link>
            <a href="/#tools" className="text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]">Tools</a>
            <a href="/#about" className="text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]">About</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link href="/converters" className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400">
              Explore tools <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)]">
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-[var(--line)] px-5 py-3 md:hidden">
            <Link href="/converters" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)]">Converters</Link>
            <a href="/#tools" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)]">Tools</a>
            <a href="/#about" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)]">About</a>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer id="about" className="mt-20 border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 text-sm font-black text-white dark:bg-brand-500 dark:text-brand-950">C</span>
              <span className="text-lg font-extrabold tracking-tight">Convo<span className="text-[var(--brand)]">Tools</span></span>
            </Link>
            <p className="mt-2 text-sm text-[var(--muted)]">Useful tools. Thoughtfully made. Your files stay on your device.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Need additional tools or updates? Email us at{" "}
              <a href="mailto:support@codelaunchtechnologies.com" className="font-semibold text-[var(--brand)] hover:underline">
                support@codelaunchtechnologies.com
              </a>
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/converters" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]">Browse converters</Link>
            <a href="https://www.codelaunchtechnologies.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 transition hover:border-[var(--brand)]">
              <img src="/img/codelaunch-logo.png" alt="CodeLaunch Technologies" className="h-8 w-auto" />
              <span className="text-xs font-bold text-[var(--muted)]">Powered by CodeLaunch <ArrowUpRight size={13} className="ml-1 inline" /></span>
            </a>
          </div>
        </div>
        <div className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--muted)]">© {new Date().getFullYear()} ConvoTools. Free tools that keep things simple.</div>
      </footer>
    </div>
  );
}
