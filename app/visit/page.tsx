import { VisitCheckIn } from "./VisitCheckIn";

export default function VisitPage({
  searchParams,
}: {
  searchParams?: { groupId?: string; siteId?: string; site?: string };
}) {
  return (
    <VisitCheckIn
      groupId={searchParams?.groupId}
      siteId={searchParams?.siteId}
      siteName={searchParams?.site}
    />
  );
}
