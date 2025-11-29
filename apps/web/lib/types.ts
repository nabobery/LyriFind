// Base song type from search results
export interface Song {
    id: number;
    title: string;
    primary_artist: string;
    url: string;
    album_art_url?: string;
}

// Search result from identify_song tool
export interface SongSearchResult {
    success: boolean;
    count?: number;
    songs?: Song[];
    error?: string;
}

// Artist info for detailed song data
export interface ArtistInfo {
    name: string;
    url: string;
}

// Album info
export interface AlbumInfo {
    name: string;
    url: string;
    cover_art_url: string;
}

// Comprehensive song details from get_song_details tool
export interface SongDetailsResult {
    success: boolean;
    details?: {
        id: number;
        title: string;
        url: string;
        release_date: string;
        album?: AlbumInfo;
        primary_artist: ArtistInfo;
        featured_artists: string[];
        producers: string[];
        writers: string[];
        description?: string;
        song_art_url: string;
        header_image_url: string;
        // Streaming links
        apple_music_url?: string;
        spotify_uri?: string;
        youtube_url?: string;
    };
    error?: string;
}

// Tool input types for display
export interface IdentifySongInput {
    lyrics: string;
    limit?: number;
}

export interface GetSongDetailsInput {
    song_id: number;
}

// Tool state types for UI
export type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error';

// UI Part types for message rendering
export interface TextPart {
    type: 'text';
    text: string;
}

export interface IdentifySongToolPart {
    type: 'tool-identify_song';
    toolCallId: string;
    state: ToolState;
    input?: IdentifySongInput;
    output?: SongSearchResult;
    errorText?: string;
}

export interface GetSongDetailsToolPart {
    type: 'tool-get_song_details';
    toolCallId: string;
    state: ToolState;
    input?: GetSongDetailsInput;
    output?: SongDetailsResult;
    errorText?: string;
}

export type MessagePart = TextPart | IdentifySongToolPart | GetSongDetailsToolPart;

// Type guards
export function isTextPart(part: unknown): part is TextPart {
    return typeof part === 'object' && part !== null && (part as TextPart).type === 'text';
}

export function isIdentifySongPart(part: unknown): part is IdentifySongToolPart {
    return typeof part === 'object' && part !== null && (part as IdentifySongToolPart).type === 'tool-identify_song';
}

export function isGetSongDetailsPart(part: unknown): part is GetSongDetailsToolPart {
    return typeof part === 'object' && part !== null && (part as GetSongDetailsToolPart).type === 'tool-get_song_details';
}

// Utility to convert Spotify URI to URL
export function spotifyUriToUrl(uri?: string): string | undefined {
    if (!uri) return undefined;
    // spotify:track:6rqhFgbbKwnb9MLmUQDhG6 -> https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6
    const parts = uri.split(':');
    if (parts.length === 3 && parts[0] === 'spotify') {
        return `https://open.spotify.com/${parts[1]}/${parts[2]}`;
    }
    return undefined;
}
