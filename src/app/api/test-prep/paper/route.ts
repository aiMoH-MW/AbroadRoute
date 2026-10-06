import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePaper } from "@/lib/testPrep/paper";
import { getTestSettings } from "@/lib/testPrep/settings";

const paperSchema = z.object({
  examSlug: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { examSlug } = paperSchema.parse(await req.json());
    const settings = await getTestSettings(examSlug.toLowerCase());
    const paper = settings?.enabled ? generatePaper(settings) : null;

    if (!paper) {
      return NextResponse.json(
        { error: "The online test for this exam is currently unavailable." },
        { status: 404 },
      );
    }

    return NextResponse.json(paper);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to generate paper" }, { status: 500 });
  }
}
