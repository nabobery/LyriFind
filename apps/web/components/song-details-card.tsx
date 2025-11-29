"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    ExternalLink,
    Music2,
    Calendar,
    Disc3,
    Users,
    Mic2,
    PenTool,
    Youtube,
    Music,
    Apple,
    Sparkles
} from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { SongDetailsResult, spotifyUriToUrl } from "@/lib/types"
import { useState } from "react"

interface SongDetailsCardProps {
    details: NonNullable<SongDetailsResult['details']>;
}

// Check if URL is from an allowed image host
function isAllowedImageHost(url: string): boolean {
    try {
        const hostname = new URL(url).hostname;
        const allowedHosts = ['images.genius.com', 'images.rapgenius.com', 's3.amazonaws.com', 'i.scdn.co'];
        return allowedHosts.some(host => hostname === host || hostname.endsWith(`.${host}`));
    } catch {
        return false;
    }
}

export function SongDetailsCard({ details }: SongDetailsCardProps) {
    const [imageError, setImageError] = useState(false);
    const spotifyUrl = spotifyUriToUrl(details.spotify_uri);
    
    const imageUrl = details.song_art_url || details.album?.cover_art_url || '';
    const validImageUrl = imageUrl && isAllowedImageHost(imageUrl) && !imageError;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-lg"
        >
            <Card className="overflow-hidden glass-card border-primary/30 shadow-2xl shadow-primary/10">
                {/* Hero Image Section */}
                <div className="relative h-56 group">
                    {validImageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={`${details.title} by ${details.primary_artist.name}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 512px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-purple-900/30">
                            <Music2 className="h-20 w-20 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    {/* Top Match Badge */}
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-primary/90 text-primary-foreground gap-1 px-2.5 py-1 shadow-lg backdrop-blur-sm">
                            <Sparkles className="w-3 h-3" />
                            Best Match
                        </Badge>
                    </div>

                    {/* Title & Artist */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl font-bold text-white truncate drop-shadow-lg">
                            {details.title}
                        </h2>
                        <a
                            href={details.primary_artist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-primary transition-colors font-medium inline-flex items-center gap-1 group/artist"
                        >
                            {details.primary_artist.name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/artist:opacity-100 transition-opacity" />
                        </a>
                    </div>
                </div>

                <CardContent className="p-4 space-y-4">
                    {/* Meta Info Row */}
                    <div className="flex flex-wrap gap-2">
                        {details.release_date && (
                            <Badge variant="secondary" className="gap-1.5">
                                <Calendar className="w-3 h-3" />
                                {details.release_date}
                            </Badge>
                        )}
                        {details.album && (
                            <Badge variant="secondary" className="gap-1.5 max-w-[180px]">
                                <Disc3 className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{details.album.name}</span>
                            </Badge>
                        )}
                    </div>

                    {/* Credits Section */}
                    {(details.featured_artists.length > 0 || details.producers.length > 0 || details.writers.length > 0) && (
                        <>
                            <Separator className="bg-white/10" />
                            <div className="space-y-2.5 text-sm">
                                {details.featured_artists.length > 0 && (
                                    <div className="flex items-start gap-2">
                                        <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-muted-foreground">Featuring: </span>
                                            <span className="text-foreground">{details.featured_artists.join(', ')}</span>
                                        </div>
                                    </div>
                                )}
                                {details.producers.length > 0 && (
                                    <div className="flex items-start gap-2">
                                        <Mic2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-muted-foreground">Produced by: </span>
                                            <span className="text-foreground">{details.producers.slice(0, 3).join(', ')}{details.producers.length > 3 && ` +${details.producers.length - 3} more`}</span>
                                        </div>
                                    </div>
                                )}
                                {details.writers.length > 0 && (
                                    <div className="flex items-start gap-2">
                                        <PenTool className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-muted-foreground">Written by: </span>
                                            <span className="text-foreground">{details.writers.slice(0, 3).join(', ')}{details.writers.length > 3 && ` +${details.writers.length - 3} more`}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <Separator className="bg-white/10" />

                    {/* Streaming Links */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Listen on</p>
                        <div className="grid grid-cols-2 gap-2">
                            {spotifyUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 h-10 border-[#1DB954]/30 hover:bg-[#1DB954]/10 hover:border-[#1DB954]/50 transition-all"
                                    asChild
                                >
                                    <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
                                        <Music className="h-4 w-4 text-[#1DB954]" />
                                        <span>Spotify</span>
                                    </a>
                                </Button>
                            )}
                            {details.youtube_url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 h-10 border-[#FF0000]/30 hover:bg-[#FF0000]/10 hover:border-[#FF0000]/50 transition-all"
                                    asChild
                                >
                                    <a href={details.youtube_url} target="_blank" rel="noopener noreferrer">
                                        <Youtube className="h-4 w-4 text-[#FF0000]" />
                                        <span>YouTube</span>
                                    </a>
                                </Button>
                            )}
                            {details.apple_music_url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 h-10 border-[#FC3C44]/30 hover:bg-[#FC3C44]/10 hover:border-[#FC3C44]/50 transition-all"
                                    asChild
                                >
                                    <a href={details.apple_music_url} target="_blank" rel="noopener noreferrer">
                                        <Apple className="h-4 w-4 text-[#FC3C44]" />
                                        <span>Apple Music</span>
                                    </a>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 h-10 border-[#FFFF64]/30 hover:bg-[#FFFF64]/10 hover:border-[#FFFF64]/50 transition-all"
                                asChild
                            >
                                <a href={details.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 text-[#FFFF64]" />
                                    <span>Genius</span>
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* No streaming links fallback */}
                    {!spotifyUrl && !details.youtube_url && !details.apple_music_url && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                            No streaming links available. Check Genius for more info.
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

