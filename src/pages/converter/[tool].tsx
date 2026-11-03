import type { GetStaticPaths, GetStaticProps } from "next";
import { ConverterWorkspace } from "@/components/ConverterWorkspace";
import { Seo } from "@/components/Seo";
import { converters, getConverter } from "@/lib/catalog";
import type { Converter } from "@/types/converter";

export default function ConverterPage({ converter }: { converter?: Converter }) {
  if (!converter) return <ConverterWorkspace />;
  return (
    <>
      <Seo title={converter.name} description={`Convert ${converter.source.toUpperCase()} to ${converter.target.toUpperCase()} online with ConvoTools. Free and private in your browser.`} path={`/converter/${converter.id}`} />
      <ConverterWorkspace converter={converter} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: "blocking" });

export const getStaticProps: GetStaticProps<{ converter?: Converter }> = async ({ params }) => {
  const converter = typeof params?.tool === "string" ? getConverter(params.tool) : undefined;
  return converter ? { props: { converter } } : { notFound: true };
};
