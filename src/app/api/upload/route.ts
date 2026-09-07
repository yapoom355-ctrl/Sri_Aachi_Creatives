import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean file name & make unique
    const originalName = file.name || "custom_design.jpg";
    const ext = path.extname(originalName) || ".jpg";
    const baseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
    });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "File upload failed" },
      { status: 500 }
    );
  }
}
