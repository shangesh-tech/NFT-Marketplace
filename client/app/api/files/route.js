import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const upload = await pinata.upload.public.file(file);
    
    // Creating a gateway URL to access the file
    const url = await pinata.gateways.public.convert(upload.cid);
    
    return NextResponse.json({ 
      success: true,
      ipfsHash: upload.cid,
      url: url 
    }, { status: 200 });
  } catch (e) {
    console.error("File upload error:", e);
    return NextResponse.json(
      { error: e.message || "Internal Server Error" },
      { status: 500 }
    );
  }
} 