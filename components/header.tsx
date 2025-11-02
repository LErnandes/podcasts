import Link from "next/link";
import { Github } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-4">
        <Link href="/" className="ml-4 flex items-center space-x-2">
          <span className="text-xl font-semibold">Podcasts</span>
        </Link>
        <Link
          href="https://github.com/LErnandes/podcasts"
          target="_blank"
          rel="noopener noreferrer"
          className="mr-4 flex items-center space-x-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </Link>
      </div>
    </header>
  );
}
