import { PageHeader } from "@/components/layout/page-header";
import { CoachPanel } from "@/features/coach/components/coach-panel";

export default function CoachPage() {
  return (
    <>
      <PageHeader
        title="Coach"
        description="Your private AI coach for training and lifestyle guidance."
      />
      <CoachPanel />
    </>
  );
}
