import { useEffect } from "react";
import { useRouter } from "next/router";
import { Seo } from "@/components/Seo";

export default function LegacyConverterRedirect() {
  const router = useRouter();
  const tool = typeof router.query.tool === "string" ? router.query.tool : "";
  useEffect(() => {
    if (router.isReady && tool) void router.replace(`/converter/${encodeURIComponent(tool)}`);
    else if (router.isReady) void router.replace("/converters");
  }, [router, tool]);

  return (
    <>
      <Seo title="Opening converter" description="Opening a ConvoTools converter." path="/converter" />
      <div className="grid min-h-[50vh] place-items-center text-sm font-semibold text-[var(--muted)]">Opening converter…</div>
    </>
  );
}
