import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student & Partner Registration | AbroadRoute",
  description:
    "Register free on AbroadRoute. Access ✦ Route AI university shortlisting, real-time admission tracking, scholarship matching, and expert counseling support.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
