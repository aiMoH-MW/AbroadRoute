import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authorized Sign In | AbroadRoute",
  description:
    "Secure sign-in for AbroadRoute portals. Access student shortlists, B2B lead marketplace, university listings dashboard, and ✦ Route AI counsellor history.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
