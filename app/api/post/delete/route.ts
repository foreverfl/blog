import { NextResponse } from "next/server";
import { deleteAllPostsFromMongoDB } from "@/lib/mongodb";

// POST 요청을 처리
export async function GET() {
  try {
    const result = await deleteAllPostsFromMongoDB();
    return NextResponse.json({
      message: `Deleted ${result.deletedCount} posts successfully.`,
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting posts:", error);
    return NextResponse.json(
      {
        message: "Error deleting posts",
        status: "error",
      },
      {
        status: 500,
      }
    );
  }
}
