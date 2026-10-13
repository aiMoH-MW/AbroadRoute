import { NextResponse } from "next/server";
import {
  fetchAiSuggestedQuestions,
  fetchSiteSettings,
  fetchTrustBadges,
  fetchWalletPacks,
} from "@/lib/siteContent";

export const dynamic = "force-dynamic";

// Public site content needed by client components
const LOADERS: Record<string, () => Promise<unknown>> = {
  "ai-questions": fetchAiSuggestedQuestions,
  "wallet-packs": fetchWalletPacks,
  "site-settings": fetchSiteSettings,
  "trust-badges": fetchTrustBadges,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const loader = LOADERS[(await params).kind];
  if (!loader) {
    return NextResponse.json(
      { success: false, error: "Unknown content" },
      { status: 404 },
    );
  }
  try {
    return NextResponse.json({ success: true, data: await loader() });
  } catch (error: any) {
    console.error("API /api/site-content error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load content" },
      { status: 500 },
    );
  }
}
