import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { HomeModalProvider } from "@/components/home/HomeClientContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#103B47",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default:
      "Abroadroute | Authoritative International Education Discovery Portal",
    template: "%s | Abroadroute",
  },
  description:
    "Compare global study destinations and career disciplines for Indian students. Discover tuition in INR, post-study visas, and verified university rankings.",
  icons: {
    icon: "/brand/logo-symbol-light.png",
    shortcut: "/brand/logo-symbol-light.png",
    apple: "/brand/logo-symbol-light.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FDFCF7] text-[#103B47] pb-16 sm:pb-0">
        <AuthProvider>
          <HomeModalProvider>{children}</HomeModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
