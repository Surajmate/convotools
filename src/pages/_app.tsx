import type { AppProps } from "next/app";
import Head from "next/head";
import { Providers } from "@/components/Providers";
import { SiteLayout } from "@/components/SiteLayout";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Head>
        <title>ConvoTools — Free Online Converters & Utilities</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10243b" />
        <link rel="icon" href="/img/ConvoTools-head.png" />
      </Head>
      <SiteLayout>
        <Component {...pageProps} />
      </SiteLayout>
    </Providers>
  );
}
