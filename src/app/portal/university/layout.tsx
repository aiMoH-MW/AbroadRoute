import { Metadata } from "next";

export const metadata: Metadata = {
  title: "University Partner Portal | AbroadRoute",
  description:
    "Official university partner portal on AbroadRoute. Manage verified program listings, track student inquiries, and view impression performance analytics.",
};

export default function UniversityPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
