// Genius API types
interface GeniusSearchHit {
  result: {
    id: number;
    title: string;
    primary_artist: {
      name: string;
    };
    url: string;
    song_art_image_url?: string;
  };
}

interface GeniusSearchResponse {
  response: {
    hits: GeniusSearchHit[];
  };
}

// Result types
interface SongSearchResult {
  success: boolean;
  count?: number;
  songs?: Array<{
    id: number;
    title: string;
    primary_artist: string;
    url: string;
    album_art_url?: string;
  }>;
  error?: string;
}

export interface IdentifySongArgs {
  lyrics: string;
  limit?: number;
}

export async function identifySong(args: IdentifySongArgs): Promise<SongSearchResult> {
  const { lyrics, limit = 3 } = args;

  const geniusToken = process.env.GENIUS_ACCESS_TOKEN;
  if (!geniusToken) {
    console.error('GENIUS_ACCESS_TOKEN is not configured');
    return {
      success: false,
      error: 'Server configuration error: Genius API token not found',
    };
  }

  console.log('[MCP Tool] identify_song called:', { lyrics, limit });

  try {
    const response = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(lyrics)}`,
      {
        headers: {
          Authorization: `Bearer ${geniusToken}`,
        },
        // Next.js fetch with timeout
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      const status = response.status;
      console.error('[MCP Tool] Genius API error:', { status });

      return {
        success: false,
        error:
          status === 401
            ? 'Invalid Genius API token'
            : status === 429
              ? 'Rate limit exceeded'
              : `Genius API error: ${response.statusText}`,
      };
    }

    const data: GeniusSearchResponse = await response.json();
    const hits = data.response.hits;

    if (!hits || hits.length === 0) {
      console.log('[MCP Tool] No songs found for query');
      return {
        success: false,
        error: 'No songs found matching those lyrics. Try different or more specific lyrics.',
      };
    }

    // Limit results
    const limitedHits = hits.slice(0, Math.min(limit, 5));

    // Format response as structured object
    const results = limitedHits.map((hit) => ({
      id: hit.result.id,
      title: hit.result.title,
      primary_artist: hit.result.primary_artist.name,
      url: hit.result.url,
      album_art_url: hit.result.song_art_image_url,
    }));

    console.log('[MCP Tool] Songs found:', { count: results.length });

    return {
      success: true,
      count: results.length,
      songs: results,
    };
  } catch (error) {
    console.error('[MCP Tool] Error during song search:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. Please try again.',
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while searching for the song',
    };
  }
}
