"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Maximize2, Minimize2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
}

export function YouTubePlayer({ videoId, title, author, thumbnail }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiReadyRef = useRef(false);

  const stopTimeUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimeUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const current = playerRef.current.getCurrentTime();
          setCurrentTime(current);
        } catch {
        }
      }
    }, 100);
  }, []);

  const initializePlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
      }
    }

    const playerId = `youtube-player-${videoId}`;
    playerRef.current = new (window as any).YT.Player(playerId, {
      height: "0",
      width: "0",
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          try {
            const duration = event.target.getDuration();
            setDuration(duration);
            setIsPlayerReady(true);
          } catch {
          }
        },
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTimeUpdate();
          } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopTimeUpdate();
          } else if (event.data === (window as any).YT.PlayerState.ENDED) {
            setIsPlaying(false);
            setCurrentTime(0);
            stopTimeUpdate();
          }
        },
      },
    });
  }, [videoId, startTimeUpdate, stopTimeUpdate]);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        if (!apiReadyRef.current) {
          apiReadyRef.current = true;
        }
        initializePlayer();
        return;
      }

      if (!(window as any).onYouTubeIframeAPIReady) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      (window as any).onYouTubeIframeAPIReady = () => {
        apiReadyRef.current = true;
        initializePlayer();
      };
    };

    loadYouTubeAPI();

    return () => {
      stopTimeUpdate();
      setIsPlayerReady(false);
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.destroy === "function") {
            playerRef.current.destroy();
          }
        } catch {
        }
      }
    };
  }, [videoId, initializePlayer, stopTimeUpdate]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (playerRef.current && isPlayerReady) {
      try {
        if (isPlaying) {
          if (typeof playerRef.current.pauseVideo === "function") {
            playerRef.current.pauseVideo();
          }
        } else {
          if (typeof playerRef.current.playVideo === "function") {
            playerRef.current.playVideo();
          }
        }
      } catch {
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (playerRef.current && isPlayerReady && typeof playerRef.current.seekTo === "function") {
      try {
        playerRef.current.seekTo(value[0], true);
        setCurrentTime(value[0]);
      } catch {
      }
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById(`player-container-${videoId}`);
    if (!document.fullscreenElement) {
      if (container?.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{author}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          id={`player-container-${videoId}`}
          className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
        >
          <div
            id={`youtube-player-${videoId}`}
            className="hidden"
          />
          <div
            className="w-full h-full flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnail})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 text-white text-center">
              <Headphones className="w-16 h-16 mx-auto mb-4 opacity-75" />
              <p className="text-sm font-medium">Audio Mode</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <div className="text-sm text-muted-foreground min-w-[100px] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                className="shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="shrink-0"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

