"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YouTubePlayer } from "@/components/youtube-player";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface VideoInfo {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
}

export default function StreamPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/youtube/info?id=${videoId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch video information");
        }
        const data = await response.json();
        setVideoInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoInfo();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading video...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !videoInfo) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <p className="text-destructive font-medium">Error loading video</p>
            <p className="text-muted-foreground text-sm">
              {error || "Video not found"}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-shrink-0 py-4 px-4">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-0 px-4 pb-4">
          <YouTubePlayer
            videoId={videoInfo.videoId}
            title={videoInfo.title}
            author={videoInfo.author}
            thumbnail={videoInfo.thumbnail}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

