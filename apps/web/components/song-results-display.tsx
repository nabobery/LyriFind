"use client"

import { Song } from "@/lib/types"
import { SongCard } from "./song-card"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface SongResultsDisplayProps {
    songs: Song[];
    showOnlyTopMatch?: boolean;
}

export function SongResultsDisplay({ songs, showOnlyTopMatch = false }: SongResultsDisplayProps) {
    if (!songs || songs.length === 0) return null;

    const displaySongs = showOnlyTopMatch ? [songs[0]] : songs;

    return (
        <div className="w-full space-y-3 mt-2">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
            >
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                    {showOnlyTopMatch
                        ? 'Found your song!'
                        : `Found ${songs.length} potential match${songs.length !== 1 ? 'es' : ''}`
                    }
                </span>
            </motion.div>

            <div className={showOnlyTopMatch ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
                {displaySongs.map((song, index) => (
                    <motion.div
                        key={`${song.id}-${index}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <SongCard
                            title={song.title}
                            artist={song.primary_artist}
                            url={song.url}
                            albumArt={song.album_art_url}
                            compact={!showOnlyTopMatch && songs.length > 1}
                            isTopMatch={index === 0}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
