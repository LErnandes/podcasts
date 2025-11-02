"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
}

enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: YouTubePlayerState;
}

interface YouTubePlayer {
  getCurrentTime(): number;
  getDuration(): number;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}

interface YouTubePlayerConfig {
  height: string;
  width: string;
  videoId: string;
  playerVars: {
    autoplay: number;
    controls: number;
    disablekb: number;
    enablejsapi: number;
    fs: number;
    iv_load_policy: number;
    modestbranding: number;
    playsinline: number;
    rel: number;
  };
  events: {
    onReady: (event: { target: YouTubePlayer }) => void;
    onStateChange: (event: YouTubePlayerEvent) => void;
  };
}

interface YouTubeAPI {
  Player: new (elementId: string, config: YouTubePlayerConfig) => YouTubePlayer;
  PlayerState: typeof YouTubePlayerState;
}

interface WindowWithYouTube extends Window {
  YT?: YouTubeAPI;
  onYouTubeIframeAPIReady?: () => void;
}

export function YouTubePlayer({ videoId, title, author }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
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
    const ytWindow = window as WindowWithYouTube;
    if (!ytWindow.YT) return;
    playerRef.current = new ytWindow.YT.Player(playerId, {
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
        onReady: (event: { target: YouTubePlayer }) => {
          try {
            const duration = event.target.getDuration();
            setDuration(duration);
            setIsPlayerReady(true);
          } catch {
          }
        },
        onStateChange: (event: YouTubePlayerEvent) => {
          if (event.data === YouTubePlayerState.PLAYING) {
            setIsPlaying(true);
            startTimeUpdate();
          } else if (event.data === YouTubePlayerState.PAUSED) {
            setIsPlaying(false);
            stopTimeUpdate();
          } else if (event.data === YouTubePlayerState.ENDED) {
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
      const ytWindow = window as WindowWithYouTube;
      if (ytWindow.YT && ytWindow.YT.Player) {
        if (!apiReadyRef.current) {
          apiReadyRef.current = true;
        }
        initializePlayer();
        return;
      }

      if (!ytWindow.onYouTubeIframeAPIReady) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      ytWindow.onYouTubeIframeAPIReady = () => {
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
    <Card className="w-full max-w-4xl mx-auto max-h-full overflow-hidden flex flex-col">
        <CardContent className="space-y-4 flex-1 min-h-0 flex flex-col">
        <div
          id={`player-container-${videoId}`}
          className="relative w-full bg-muted rounded-lg overflow-hidden flex-shrink-0"
          style={{ aspectRatio: "16/9" }}
        >
          <div
            id={`youtube-player-${videoId}`}
            className="hidden"
          />
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="shrink-0 bg-background/80 backdrop-blur-sm"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight px-2">
                {title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground px-2">
                {author}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 flex-shrink-0 pt-2">
          <div className="flex items-center gap-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <div className="text-xs sm:text-sm text-muted-foreground min-w-[80px] sm:min-w-[100px] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

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
        </div>
      </CardContent>
    </Card>
  );
}

