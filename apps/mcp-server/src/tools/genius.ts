import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

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

export interface IdentifySongArgs {
  lyrics: string;
  limit?: number;
}

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

export async function identifySong(args: IdentifySongArgs): Promise<SongSearchResult> {
  const { lyrics, limit = 3 } = args;

  logger.info({ lyrics, limit }, 'Searching for song');

  try {
    const response = await axios.get<GeniusSearchResponse>(
      'https://api.genius.com/search',
      {
        params: { q: lyrics },
        headers: { Authorization: `Bearer ${env.GENIUS_ACCESS_TOKEN}` },
        timeout: 10000,
      }
    );

    const hits = response.data.response.hits;

    if (!hits || hits.length === 0) {
      logger.info('No songs found for query');
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

    logger.info({ count: results.length }, 'Songs found successfully');

    return {
      success: true,
      count: results.length,
      songs: results,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error({ error: error.message, status: error.response?.status }, 'Genius API error');

      return {
        success: false,
        error: error.response?.status === 401
          ? 'Invalid Genius API token'
          : error.response?.status === 429
            ? 'Rate limit exceeded'
            : `Genius API error: ${error.message}`,
      };
    }

    logger.error({ error }, 'Unexpected error during song search');
    return {
      success: false,
      error: 'An unexpected error occurred while searching for the song',
    };
  }
}
