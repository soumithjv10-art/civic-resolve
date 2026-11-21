import { NextRequest, NextResponse } from "next/server";
import { incrementComplaintUpvotes } from "@/lib/firestore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const upvotes = await incrementComplaintUpvotes(id);

    return NextResponse.json({
      success: true,
      upvotes,
    });
  } catch (error) {
    console.error("Error upvoting complaint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upvote" },
      { status: 500 }
    );
  }
}
