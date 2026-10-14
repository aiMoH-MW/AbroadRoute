import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Operations Center | AbroadRoute",
  description:
    "AbroadRoute Operations & Lead Distribution Engine control center for authorized administrators.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
