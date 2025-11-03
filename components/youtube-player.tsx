"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, Maximize2, Minimize2, GripVertical, Trash2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

interface PlaylistItem {
  id: string;
  key: string;
  title: string;
  author: string;
}

export function YouTubePlayer({ videoId, title, author }: YouTubePlayerProps) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const playlistRef = useRef<PlaylistItem[]>([]);
  const routerRef = useRef(router);
  const [playlistInput, setPlaylistInput] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
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
        autoplay: 1,
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
            const currentPlaylist = playlistRef.current;
            if (currentPlaylist.length > 0) {
              const currentIndex = currentPlaylist.findIndex(item => item.id === videoId);
              if (currentIndex >= 0 && currentIndex < currentPlaylist.length - 1) {
                const nextVideo = currentPlaylist[currentIndex + 1];
                routerRef.current.push(`/stream/${nextVideo.id}`);
              } else if (currentIndex < 0) {
                const firstVideo = currentPlaylist[0];
                routerRef.current.push(`/stream/${firstVideo.id}`);
              }
            }
          }
        },
      },
    });
  }, [videoId, startTimeUpdate, stopTimeUpdate]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

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

  const togglePlay = useCallback(() => {
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
  }, [isPlayerReady, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && isPlayerReady) {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
        
        if (!isInputFocused) {
          e.preventDefault();
          togglePlay();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlayerReady, togglePlay]);

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

  const extractYouTubeId = (urlOrId: string): string | null => {
    const trimmed = urlOrId.trim();
    if (!trimmed) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const handleAddToPlaylist = async () => {
    const newVideoId = extractYouTubeId(playlistInput);
    if (newVideoId && newVideoId !== videoId && !playlist.some(item => item.id === newVideoId)) {
      setAddingIds(prev => new Set(prev).add(newVideoId));
      try {
        const response = await fetch(`/api/youtube/info?id=${newVideoId}`);
        if (response.ok) {
          const data = await response.json();
          const newItem: PlaylistItem = {
            id: newVideoId,
            key: `${newVideoId}-${Date.now()}`,
            title: data.title || newVideoId,
            author: data.author || "Unknown",
          };
          setPlaylist(prev => [...prev, newItem]);
          setPlaylistInput("");
          setTimeout(() => {
            requestAnimationFrame(() => {
              setAddingIds(prev => {
                const next = new Set(prev);
                next.delete(newVideoId);
                return next;
              });
            });
          }, 50);
        } else {
          setAddingIds(prev => {
            const next = new Set(prev);
            next.delete(newVideoId);
            return next;
          });
        }
      } catch {
        setAddingIds(prev => {
          const next = new Set(prev);
          next.delete(newVideoId);
          return next;
        });
      }
    }
  };

  const handleRemoveFromPlaylist = (idToRemove: string) => {
    setRemovingIds(prev => new Set(prev).add(idToRemove));
    setTimeout(() => {
      setPlaylist(prev => prev.filter(item => item.id !== idToRemove));
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(idToRemove);
        return next;
      });
    }, 300);
  };

  const handleClearPlaylist = () => {
    playlist.forEach(item => {
      setRemovingIds(prev => new Set(prev).add(item.id));
    });
    setTimeout(() => {
      setPlaylist([]);
      setRemovingIds(new Set());
    }, 300);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      setPlaylist(prev => {
        const newPlaylist = [...prev];
        const draggedItem = newPlaylist[draggedIndex];
        newPlaylist.splice(draggedIndex, 1);
        newPlaylist.splice(dropIndex, 0, draggedItem);
        return newPlaylist;
      });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddToPlaylist();
    }
  };

  const handlePlayVideo = (playlistVideoId: string) => {
    router.push(`/stream/${playlistVideoId}`);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto max-h-full overflow-hidden flex flex-col">
      <CardContent className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          <div className="flex-1 min-w-0 flex flex-col space-y-3">
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

            <div className="space-y-3 flex-shrink-0">
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
          </div>

          <div className="lg:w-80 flex-shrink-0 flex flex-col space-y-3 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Add video URL or ID"
                value={playlistInput}
                onChange={(e) => setPlaylistInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddToPlaylist}
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
              {playlist.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearPlaylist}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {playlist.length > 0 && (
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
                {playlist.map((item, index) => (
                  <div
                    key={item.key}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      flex items-start gap-2 p-3 rounded-md border bg-card transition-all duration-300
                      ${removingIds.has(item.id) ? "opacity-0 scale-95 -translate-x-4" : addingIds.has(item.id) ? "opacity-0 scale-95" : "opacity-100 scale-100 translate-x-0"}
                      ${draggedIndex === index ? "opacity-50 scale-95 cursor-grabbing" : ""}
                      ${dragOverIndex === index ? "border-ring bg-accent translate-y-1" : "border-border"}
                    `}
                    style={{
                      transition: draggedIndex === index ? "none" : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="text-sm font-medium truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.author}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVideo(item.id);
                      }}
                      className="shrink-0 h-7 w-7"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromPlaylist(item.id)}
                      className="shrink-0 h-7 w-7"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

