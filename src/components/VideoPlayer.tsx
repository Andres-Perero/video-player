"use client";
import React, { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  RotateCcw,
} from "lucide-react";

interface VideoData {
  url: string;
  name: string;
  type: "youtube" | "okru" | "standard";
  subtitles?: Array<{ label: string; src: string }>;
  audioTracks?: Array<{ label: string; src: string }>;
}

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoData, setVideoData] = useState<VideoData[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");

  const [subtitles, setSubtitles] = useState<
    Array<{ label: string; src: string }>
  >([]);
  const [audioTracks, setAudioTracks] = useState<
    Array<{ label: string; src: string }>
  >([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [currentAudioTrack, setCurrentAudioTrack] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState<boolean>(false);
  const [isVideoFocused, setIsVideoFocused] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [hoverTime, setHoverTime] = useState<number>(0);

  useEffect(() => {
    // Fetch video data from JSON file and set default video
    fetch("/data/jData.json")
      .then((response) => response.json())
      .then((data: VideoData[]) => {
        setVideoData(data);
        if (data.length > 0) {
          setCurrentVideoIndex(0);
        }
      });
  }, []);

  useEffect(() => {
    if (videoData.length > 0) {
      const video = videoData[currentVideoIndex];
      setVideoUrl(video.url);

      setVideoName(video.name);
      setSubtitles(video.subtitles || []);
      setAudioTracks(video.audioTracks || []);
    }
  }, [currentVideoIndex, videoData]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    }
  }, [brightness, contrast, saturation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVideoFocused) return;

      switch (e.key) {
        case " ":
          togglePlay();
          break;
        case "ArrowLeft":
          handleSeek(-10);
          break;
        case "ArrowRight":
          handleSeek(10);
          break;
        case "ArrowUp":
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case "ArrowDown":
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [volume, isVideoFocused]);
 
   
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsControlsVisible(true);
      if (containerRef.current) {
        clearTimeout(containerRef.current.dataset.timeoutId);
        const timeoutId = setTimeout(() => {
          setIsControlsVisible(false);
        }, 3000);
        containerRef.current.dataset.timeoutId = String(timeoutId);
      }
    };

    const container = containerRef.current;
    container?.addEventListener("mousemove", handleMouseMove);

    return () => {
      container?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  const togglePlay = () => {
    if (videoRef.current && videoUrl) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      showPlayPauseIconBriefly();
    }
  };

  const showPlayPauseIconBriefly = () => {
    setShowPlayPauseIcon(true);
    setTimeout(() => setShowPlayPauseIcon(false), 500);
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleSubtitleChange = (value: string) => {
    setCurrentSubtitle(value);
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = tracks[i].language === value ? "showing" : "hidden";
      }
    }
  };

  const handleAudioTrackChange = (value: string) => {
    setCurrentAudioTrack(value);
    // En un escenario real, aquí cambiarías la pista de audio del video
    console.log(`Cambiando a la pista de audio: ${value}`);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimelineChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    if (clickY < rect.height - 100) {
      togglePlay();
    }
  };

  const resetAdjustment = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    defaultValue: number
  ) => {
    setter(defaultValue);
  };

  const handleSliderHover = (value: number[]) => {
    setHoverTime(value[0]);
  };

  const isYouTubeVideo = (url: string) => {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return ytRegex.test(url);
  };

  const isOkruVideo = (url: string) => {
    const okruRegex = /^(\/\/)?(www\.)?(ok\.ru)\/videoembed\/.+$/;
    return okruRegex.test(url);
  };

  const changeVideo = (index: number) => {
    const video = videoData[index];
    setVideoUrl(video.url);
    setVideoName(video.name);
    setSubtitles(video.subtitles || []);
    setAudioTracks(video.audioTracks || []);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
    setCurrentVideoIndex(index);
  };

  return (
    <div>
      <div className="flex justify-center space-x-4 mb-4">
        {videoData.map((video, index) => (
          <Button
            key={index}
            onClick={() => changeVideo(index)}
            className={`${
              index === currentVideoIndex
                ? "bg-gray-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {video.type}
          </Button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-full aspect-video w-128 h-72"
        onClick={handleVideoClick}
        onMouseEnter={() => setIsVideoFocused(true)}
        onMouseLeave={() => setIsVideoFocused(false)}
      >
        {isYouTubeVideo(videoUrl) ? (
          <iframe
            width="100%"
            height="100%"
            src={videoUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : isOkruVideo(videoUrl) ? (
          <iframe
            src={videoUrl}
            allowFullScreen
            width="100%"
            height="100%"
            allow="autoplay"
            frameBorder="0"
          />
        ) : (
          <>
            <video
              width="100%"
              height="100%"
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onClick={togglePlay}
            ></video>
            {showPlayPauseIcon && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isPlaying ? (
                  <Pause className="text-white opacity-75 text-7xl" />
                ) : (
                  <Play className="text-white opacity-75 text-7xl" />
                )}
              </div>
            )}
            <div
              className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 ${
                isControlsVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex top-10 left-4 text-white text-lg font-semibold mb-10 ">
                {videoName}
              </div>
              <div className="flex items-center mt-2 p-4">
                <span className="text-xs text-white">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  onValueChange={handleTimelineChange}
                  max={duration}
                  step={0.1}
                  onValueCommit={handleTimelineChange}
                  
                  onValueChangeStart={handleSliderHover} 
                  onValueChangeEnd={() => setHoverTime(0)}
                  className="flex-1 mx-4"
                />
                <span className="text-xs text-white">
                  {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Button onClick={togglePlay} variant="ghost" size="icon">
                  {isPlaying ? (
                    <Pause className="text-white" />
                  ) : (
                    <Play className="text-white" />
                  )}
                </Button>
                <Button
                  onClick={() => handleSeek(-10)}
                  variant="ghost"
                  size="icon"
                >
                  <ChevronLeft className="text-white" />
                </Button>
                <Button
                  onClick={() => handleSeek(10)}
                  variant="ghost"
                  size="icon"
                >
                  <ChevronRight className="text-white" />
                </Button>

                <Button onClick={toggleMute} variant="ghost" size="icon">
                  {isMuted ? (
                    <VolumeX className="text-white" />
                  ) : (
                    <Volume2 className="text-white" />
                  )}
                </Button>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="w-24"
                />

                <Select
                  onValueChange={handleSubtitleChange}
                  value={currentSubtitle}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Subtitles" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtitles.map((subtitle, index) => (
                      <SelectItem key={index} value={subtitle.label}>
                        {subtitle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={handleAudioTrackChange}
                  value={currentAudioTrack}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Audio Tracks" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioTracks.map((track, index) => (
                      <SelectItem key={index} value={track.label}>
                        {track.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Settings className="text-white" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Brightness</span>
                        <Slider
                          value={[brightness]}
                          onValueChange={(value) => setBrightness(value[0])}
                          min={0}
                          max={200}
                          step={1}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Contrast</span>
                        <Slider
                          value={[contrast]}
                          onValueChange={(value) => setContrast(value[0])}
                          min={0}
                          max={200}
                          step={1}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Saturation</span>
                        <Slider
                          value={[saturation]}
                          onValueChange={(value) => setSaturation(value[0])}
                          min={0}
                          max={200}
                          step={1}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => resetAdjustment(setBrightness, 100)}
                        >
                          Reset Brightness
                        </Button>
                        <Button
                          onClick={() => resetAdjustment(setContrast, 100)}
                        >
                          Reset Contrast
                        </Button>
                        <Button
                          onClick={() => resetAdjustment(setSaturation, 100)}
                        >
                          Reset Saturation
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="text-white" />
                  ) : (
                    <Maximize className="text-white" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
