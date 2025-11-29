// Genius API types
interface GeniusSongResponse {
  response: {
    song: {
      id: number;
      title: string;
      url: string;
      release_date_for_display: string;
      song_art_image_url: string;
      header_image_url: string;
      album: {
        name: string;
        url: string;
        cover_art_url: string;
      } | null;
      primary_artist: {
        name: string;
        url: string;
      };
      featured_artists: Array<{
        name: string;
      }>;
      producer_artists: Array<{
        name: string;
      }>;
      writer_artists: Array<{
        name: string;
      }>;
      description: {
        plain?: string;
      };
      apple_music_player_url?: string;
      spotify_uri?: string;
      youtube_url?: string;
    };
  };
}

// Result types
interface SongDetailsResult {
  success: boolean;
  details?: {
    id: number;
    title: string;
    url: string;
    release_date: string;
    album?: {
      name: string;
      url: string;
      cover_art_url: string;
    };
    primary_artist: {
      name: string;
      url: string;
    };
    featured_artists: string[];
    producers: string[];
    writers: string[];
    description?: string;
    song_art_url: string;
    header_image_url: string;
    apple_music_url?: string;
    spotify_uri?: string;
    youtube_url?: string;
  };
  error?: string;
}

export interface SongDetailsArgs {
  song_id: number;
}

export async function getSongDetails(args: SongDetailsArgs): Promise<SongDetailsResult> {
  const { song_id } = args;

  const geniusToken = process.env.GENIUS_ACCESS_TOKEN;
  if (!geniusToken) {
    console.error('GENIUS_ACCESS_TOKEN is not configured');
    return {
      success: false,
      error: 'Server configuration error: Genius API token not found',
    };
  }

  console.log('[MCP Tool] get_song_details called:', { song_id });

  if (!song_id || typeof song_id !== 'number') {
    return {
      success: false,
      error: 'Song ID is required. Use the id from identify_song results.',
    };
  }

  try {
    const response = await fetch(`https://api.genius.com/songs/${song_id}`, {
      headers: {
        Authorization: `Bearer ${geniusToken}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const status = response.status;
      console.error('[MCP Tool] Genius API error:', { status, song_id });

      return {
        success: false,
        error:
          status === 401
            ? 'Invalid Genius API token'
            : status === 404
              ? 'Song not found'
              : status === 429
                ? 'Rate limit exceeded'
                : `Genius API error: ${response.statusText}`,
      };
    }

    const data: GeniusSongResponse = await response.json();
    const song = data.response.song;

    console.log('[MCP Tool] Song details fetched:', { song_id, title: song.title });

    return {
      success: true,
      details: {
        id: song.id,
        title: song.title,
        url: song.url,
        release_date: song.release_date_for_display,
        album: song.album
          ? {
              name: song.album.name,
              url: song.album.url,
              cover_art_url: song.album.cover_art_url,
            }
          : undefined,
        primary_artist: {
          name: song.primary_artist.name,
          url: song.primary_artist.url,
        },
        featured_artists: song.featured_artists.map((artist) => artist.name),
        producers: song.producer_artists.map((artist) => artist.name),
        writers: song.writer_artists.map((artist) => artist.name),
        description: song.description?.plain,
        song_art_url: song.song_art_image_url,
        header_image_url: song.header_image_url,
        apple_music_url: song.apple_music_player_url,
        spotify_uri: song.spotify_uri,
        youtube_url: song.youtube_url,
      },
    };
  } catch (error) {
    console.error('[MCP Tool] Error fetching song details:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. Please try again.',
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while fetching song details',
    };
  }
}
