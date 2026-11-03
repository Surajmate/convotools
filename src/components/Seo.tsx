import Head from "next/head";
import { canonicalUrl } from "@/lib/catalog";
import { siteName } from "@/lib/metadata";

export function Seo({ title, description, path }: { title: string; description: string; path: string }) {
  const fullTitle = `${title} | ${siteName}`;
  const url = canonicalUrl(path);
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}
