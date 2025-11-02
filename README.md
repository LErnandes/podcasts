# Podcast Frontend

A modern web application that allows you to stream YouTube videos as podcasts with a clean, audio-focused interface and playlist management.

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Steps

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd podcast-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Verify installation**:
   Ensure all dependencies are installed correctly by checking that `node_modules` directory exists.

## Running the Application

### Development Mode

To run the application in development mode with hot-reload:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

To create an optimized production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

To start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
```

### Linting

To check code quality and style:

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## How the Application Works

### Overview

This application provides a podcast-style interface for streaming YouTube videos, focusing on audio playback with a minimal, distraction-free design.

### Key Features

1. **YouTube Video Streaming**: Paste any YouTube URL and stream it as an audio-focused podcast experience
2. **Playlist Management**: Build custom playlists by adding multiple videos, reorder them via drag-and-drop
3. **Audio Controls**: Custom playback controls with play/pause, seek, and time display
4. **Auto-advance**: Automatically plays the next video in your playlist when the current one ends
5. **Theme Support**: Built-in dark/light theme toggle

### Application Flow

1. **Home Page** (`/`):
   - Users land on a hero section with an input field
   - Paste a YouTube URL in any format (youtube.com/watch?v=..., youtu.be/..., etc.)
   - The application extracts the video ID using pattern matching
   - Navigates to `/stream/[videoId]`

2. **Stream Page** (`/stream/[id]`):
   - Fetches video metadata (title, author, thumbnail) via the `/api/youtube/info` endpoint
   - The API endpoint uses YouTube's oEmbed API to retrieve video information
   - Initializes a hidden YouTube IFrame Player using the YouTube IFrame API
   - Renders a custom player interface with:
     - Video title and author display
     - Progress slider for seeking
     - Play/pause controls
     - Fullscreen toggle

3. **Playlist Management**:
   - Add videos to playlist by entering URLs or video IDs in the sidebar
   - Drag and drop playlist items to reorder
   - Remove individual videos or clear the entire playlist
   - Click the play button on any playlist item to navigate to that video
   - When a video ends, automatically advances to the next video in the playlist

### Technical Architecture

- **Frontend Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives for accessible components
- **YouTube Integration**: YouTube IFrame API for player control
- **API Routes**: Next.js API routes for fetching video metadata via YouTube oEmbed
- **Type Safety**: Full TypeScript implementation

### API Endpoints

- `GET /api/youtube/info?id=[videoId]`: Fetches video metadata from YouTube using their oEmbed API, returns title, author, thumbnail, and embed URLs.

### Browser Requirements

- Modern browser with JavaScript enabled
- Internet connection (for YouTube API and video streaming)
- Recommended: Latest versions of Chrome, Firefox, Safari, or Edge

## Project Structure

```
podcast-frontend/
├── app/
│   ├── api/youtube/info/    # API endpoint for video metadata
│   ├── stream/[id]/         # Dynamic route for video playback
│   ├── page.tsx              # Home page
│   └── layout.tsx            # Root layout with theme provider
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── header.tsx            # Navigation header
│   ├── hero.tsx              # Home page hero section
│   ├── youtube-player.tsx    # Main video player component
│   └── footer.tsx            # Footer component
└── lib/                      # Utility functions
```

## Notes

- The application requires an active internet connection to fetch video metadata and stream content
- YouTube's terms of service apply to all video content accessed through this application
- The player uses YouTube's IFrame API and may be subject to their usage policies
