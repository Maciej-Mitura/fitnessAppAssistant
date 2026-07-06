import { PageHeader } from "@/components/layout/page-header";
import { CoachChat } from "@/features/coach/components/coach-chat";

export default function CoachPage() {
  return (
    <>
      <PageHeader
        title="Coach"
        description="Your private AI coach for training and lifestyle guidance."
      />
      <CoachChat />
    </>
  );
}
