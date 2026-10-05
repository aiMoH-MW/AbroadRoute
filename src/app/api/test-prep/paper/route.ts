import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePaper } from "@/lib/testPrep/paper";

const paperSchema = z.object({
  examSlug: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { examSlug } = paperSchema.parse(await req.json());
    const paper = generatePaper(examSlug.toLowerCase());

    if (!paper) {
      return NextResponse.json(
        { error: "No online test is available for this exam yet." },
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
