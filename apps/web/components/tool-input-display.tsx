"use client"

import { motion } from "framer-motion"
import { Search, Info, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ToolInputDisplayProps {
    toolName: 'identify_song' | 'get_song_details';
    lyrics?: string;
    songTitle?: string;
    isStreaming?: boolean;
}

export function ToolInputDisplay({ toolName, lyrics, songTitle, isStreaming }: ToolInputDisplayProps) {
    const isSearching = toolName === 'identify_song';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4 w-full max-w-md backdrop-blur-sm"
        >
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                    {isSearching ? (
                        <Search className="w-4 h-4 text-primary" />
                    ) : (
                        <Info className="w-4 h-4 text-primary" />
                    )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium text-foreground">
                        {isSearching ? 'Searching for song' : 'Fetching details'}
                    </span>
                    {isStreaming && (
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    )}
                </div>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    {isSearching ? 'identify_song' : 'get_song_details'}
                </Badge>
            </div>

            {isSearching && lyrics && (
                <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Query</p>
                    <p className="text-sm text-foreground/90 italic leading-relaxed">
                        &quot;{lyrics}&quot;
                    </p>
                </div>
            )}

            {!isSearching && songTitle && (
                <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Song</p>
                    <p className="text-sm text-foreground/90 font-medium">
                        {songTitle}
                    </p>
                </div>
            )}
        </motion.div>
    );
}
