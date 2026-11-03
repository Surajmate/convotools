import type { GetStaticPaths, GetStaticProps } from "next";
import { Seo } from "@/components/Seo";
import { UtilityTool } from "@/components/UtilityTool";
import { getTool, tools } from "@/data/tools";
import type { ToolDefinition } from "@/data/tools";

export default function UtilityPage({ tool }: { tool: ToolDefinition }) {
  return (
    <>
      <Seo title={tool.title} description={tool.description} path={`/${tool.slug}.html`} />
      <UtilityTool tool={tool} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: tools.map((tool) => ({ params: { tool: tool.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ tool: ToolDefinition }> = async ({ params }) => {
  const tool = typeof params?.tool === "string" ? getTool(params.tool) : undefined;
  return tool ? { props: { tool } } : { notFound: true };
};
