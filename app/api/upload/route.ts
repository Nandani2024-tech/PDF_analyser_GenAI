import { NextRequest, NextResponse } from "next/server";
import { ingestPDF } from "@/lib/ingest";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse FormData
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 20MB limit." }, { status: 400 });
    }

    try {
      // 3. Call ingestPDF() directly with the file blob - no temp files!
      const { chunkCount } = await ingestPDF(file, file.name);

      // 5. Return NextResponse.json
      return NextResponse.json(
        { message: "File ingested successfully", chunkCount, filename: file.name },
        { status: 200 }
      );
    } catch (ingestionError: any) {
      console.error("Ingestion failed:", ingestionError);
      return NextResponse.json(
        { error: "Failed to process and ingest PDF.", details: ingestionError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error during upload.", details: error.message },
      { status: 500 }
    );
  }
}
