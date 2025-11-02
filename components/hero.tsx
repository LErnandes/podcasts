"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Discover & Play
            <span className="block text-primary">Podcasts</span>
          </h1>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground sm:text-xl">
            Search and stream your favorite podcasts from YouTube
          </p>
        </div>
        <div className="group relative">
          <div className="relative">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ${
                isFocused ? "scale-110 text-primary" : ""
              }`}
            >
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="search"
              placeholder="Search for podcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`h-14 pl-11 pr-24 text-base shadow-lg transition-all duration-300 ${
                isFocused ? "scale-[1.02] shadow-xl" : ""
              }`}
            />
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2"
              size="default"
            >
              Search
            </Button>
          </div>
          <div
            className={`absolute -inset-1 -z-10 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl transition-opacity duration-500 ${
              isFocused ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </section>
  );
}
