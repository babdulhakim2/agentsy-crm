import { LeadCapture } from "./LeadCapture";

export default function LeadPage({
  searchParams,
}: {
  searchParams?: { groupId?: string; siteId?: string; site?: string };
}) {
  return (
    <LeadCapture
      groupId={searchParams?.groupId}
      siteId={searchParams?.siteId}
      siteName={searchParams?.site}
    />
  );
}
