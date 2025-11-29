import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface SongDetailsArgs {
    song_id: number;
}

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

export async function getSongDetails(args: SongDetailsArgs): Promise<SongDetailsResult> {
    const { song_id } = args;
    logger.info({ song_id }, 'Fetching song details');

    if (!song_id || typeof song_id !== 'number') {
        return {
            success: false,
            error: 'Song ID is required. Use the id from identify_song results.',
        };
    }

    try {
        // Make API request to get song details
        const response = await axios.get<GeniusSongResponse>(
            `https://api.genius.com/songs/${song_id}`,
            {
                headers: {
                    Authorization: `Bearer ${env.GENIUS_ACCESS_TOKEN}`
                },
                timeout: 10000,
            }
        );

        const song = response.data.response.song;

        logger.info({ song_id, title: song.title }, 'Song details fetched successfully');

        return {
            success: true,
            details: {
                id: song.id,
                title: song.title,
                url: song.url,
                release_date: song.release_date_for_display,
                album: song.album ? {
                    name: song.album.name,
                    url: song.album.url,
                    cover_art_url: song.album.cover_art_url,
                } : undefined,
                primary_artist: {
                    name: song.primary_artist.name,
                    url: song.primary_artist.url,
                },
                featured_artists: song.featured_artists.map(artist => artist.name),
                producers: song.producer_artists.map(artist => artist.name),
                writers: song.writer_artists.map(artist => artist.name),
                description: song.description?.plain,
                song_art_url: song.song_art_image_url,
                header_image_url: song.header_image_url,
                apple_music_url: song.apple_music_player_url,
                spotify_uri: song.spotify_uri,
                youtube_url: song.youtube_url,
            },
        };

    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error({
                error: error.message,
                status: error.response?.status,
                song_id
            }, 'Genius API error');

            return {
                success: false,
                error: error.response?.status === 401
                    ? 'Invalid Genius API token'
                    : error.response?.status === 404
                        ? 'Song not found'
                        : error.response?.status === 429
                            ? 'Rate limit exceeded'
                            : `Genius API error: ${error.message}`,
            };
        }

        logger.error({ error, song_id }, 'Unexpected error fetching song details');
        return {
            success: false,
            error: 'An unexpected error occurred while fetching song details',
        };
    }
}
