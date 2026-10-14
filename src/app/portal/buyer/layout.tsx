import { Metadata } from "next";

export const metadata: Metadata = {
  title: "B2B Educational Consultant Portal | AbroadRoute",
  description:
    "B2B consultant portal on AbroadRoute. Access high-intent Indian student lead marketplace feeds, lead delivery automation, and wallet management.",
};

export default function BuyerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
