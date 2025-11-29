"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Music2, Sparkles } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"

interface SongCardProps {
    title: string
    artist: string
    albumArt?: string
    url?: string
    compact?: boolean
    isTopMatch?: boolean
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

export function SongCard({ title, artist, albumArt, url, compact, isTopMatch }: SongCardProps) {
    const [imageError, setImageError] = useState(false);
    const validAlbumArt = albumArt && isAllowedImageHost(albumArt) && !imageError;

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={cn(
                "w-full overflow-hidden glass-card border-white/10 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
                compact ? "max-w-full" : "max-w-md",
                isTopMatch && "ring-1 ring-primary/50 border-primary/30"
            )}>
                <div className={cn("relative bg-muted overflow-hidden", compact ? "h-36" : "h-44")}>
                    {validAlbumArt ? (
                        <Image
                            src={albumArt}
                            alt={`${title} by ${artist}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-purple-900/20">
                            <Music2 className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    {/* Top Match Badge */}
                    {isTopMatch && (
                        <div className="absolute top-2.5 right-2.5">
                            <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 gap-1 shadow-lg backdrop-blur-sm">
                                <Sparkles className="w-2.5 h-2.5" />
                                TOP MATCH
                            </Badge>
                        </div>
                    )}

                    {/* Title & Artist */}
                    <div className="absolute bottom-3 left-3 right-3">
                        <h3 className={cn(
                            "font-bold text-white truncate drop-shadow-md leading-tight",
                            compact ? "text-base" : "text-lg"
                        )}>
                            {title}
                        </h3>
                        <p className="text-sm text-gray-300 truncate font-medium drop-shadow-md mt-0.5">
                            {artist}
                        </p>
                    </div>
                </div>

                <CardContent className="p-3">
                    <Button
                        className="w-full gap-2 h-9 text-xs font-medium"
                        variant="default"
                        size="sm"
                        asChild
                    >
                        <a href={url || "#"} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View on Genius
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    )
}
