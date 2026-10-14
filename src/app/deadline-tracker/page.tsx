import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DeadlineTrackerClient } from "@/components/tools/DeadlineTrackerClient";

export const metadata: Metadata = {
  title:
    "Study Abroad Application Deadline Tracker (2027 Intakes) | AbroadRoute",
  description:
    "Track university application deadlines across UK, USA, Germany, Canada, and Australia. Set automated WhatsApp and Email reminders at 90, 60, 30, 15, 7, and 1 days before cutoff.",
  alternates: {
    canonical: "/deadline-tracker",
  },
};

export default function DeadlineTrackerPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDFCF7]">
      <Header />
      <main className="flex-1">
        <DeadlineTrackerClient />
      </main>
      <Footer />
    </div>
  );
}
