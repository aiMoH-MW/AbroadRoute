export const metadata = {
  title: "Sanity Studio | AbroadRoute",
  description: "Content Management for AbroadRoute Editorial Guides and Articles",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ margin: 0, height: "100vh", maxHeight: "100dvh", overflow: "hidden" }}>
      {children}
    </div>
  );
}
