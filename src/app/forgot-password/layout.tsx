import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Account Password | AbroadRoute",
  description:
    "Reset your AbroadRoute account password. Secure recovery link sent instantly to registered Indian student, consultant, or university partner email.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
