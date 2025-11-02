"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 animate-in fade-in slide-in-from-bottom duration-500 delay-700">
      <div className="flex w-full items-center justify-center px-4">
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-medium">Podcasts</span> - Made with{" "}
          <span className="text-primary">❤️</span> by{" "}
          <Link
            href="https://github.com/LErnandes"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Luis Ernandes
          </Link>
        </p>
      </div>
    </footer>
  );
}
