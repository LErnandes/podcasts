import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("id");

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch video info");
    }

    const data = await response.json();
    
    return NextResponse.json({
      videoId,
      title: data.title,
      author: data.author_name,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1`,
      streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch video information" },
      { status: 500 }
    );
  }
}

