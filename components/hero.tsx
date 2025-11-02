"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export function Hero() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeId(youtubeUrl);
    if (videoId) {
      router.push(`/stream/${videoId}`);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            Stream YouTube
            <span className="block text-primary animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">As Podcasts</span>
          </h1>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground sm:text-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            Paste a YouTube link and stream it as a podcast
          </p>
        </div>
        <form onSubmit={handleSubmit} className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="relative">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ${
                isFocused ? "scale-110 text-primary" : ""
              }`}
            >
              <Link2 className="h-5 w-5" />
            </div>
            <Input
              type="url"
              placeholder="Paste YouTube URL here..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`h-14 pl-11 pr-24 text-base shadow-lg transition-all duration-300 ${
                isFocused ? "scale-[1.02] shadow-xl" : ""
              }`}
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              size="default"
            >
              Stream
            </Button>
          </div>
          <div
            className={`absolute -inset-1 -z-10 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl transition-opacity duration-500 ${
              isFocused ? "opacity-100" : "opacity-0"
            }`}
          />
        </form>
      </div>
    </section>
  );
}
