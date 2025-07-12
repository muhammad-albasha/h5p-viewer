import { getH5PContents } from "@/app/utils/h5pUtils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const contents = await getH5PContents();
    return NextResponse.json(contents);
  } catch (error) {
    // Error in H5P content API
    return NextResponse.json(
      { error: "Failed to fetch H5P contents" },
      { status: 500 }
    );
  }
}
