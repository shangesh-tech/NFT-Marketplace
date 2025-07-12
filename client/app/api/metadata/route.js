import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(request) {
  try {
    const metadata = await request.json();
    
    if (!metadata) {
      return NextResponse.json(
        { error: "No metadata provided" },
        { status: 400 }
      );
    }

    // Upload JSON metadata to IPFS
    const upload = await pinata.upload.public.json(metadata);
    const url = await pinata.gateways.public.convert(upload.cid);
    
    return NextResponse.json({ 
      success: true,
      ipfsHash: upload.cid,
      url: url 
    }, { status: 200 });
  } catch (e) {
    console.error("Metadata upload error:", e);
    return NextResponse.json(
      { error: e.message || "Internal Server Error" },
      { status: 500 }
    );
  }
} 