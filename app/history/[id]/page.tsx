import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function HistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <PlaceholderPage
      eyebrow={`History · ${params.id}`}
      title="Incident Detail"
      description="Full transcript + Work Notes + Resolution + RCA. Coming in Phase 5."
      hint="History detail view will allow inline editing and one-click re-analysis."
      status="In Progress"
    />
  );
}
