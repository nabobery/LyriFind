"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useLayoutEffect, useState, FormEvent, Fragment, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Music, User, Sparkles, AlertCircle } from "lucide-react"
import { Visualizer } from "@/components/visualizer"
import { ToolInputDisplay } from "@/components/tool-input-display"
import { SongResultsDisplay } from "@/components/song-results-display"
import { SongDetailsCard } from "@/components/song-details-card"
import type { SongSearchResult, SongDetailsResult } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { ChatTextarea } from "@/components/chat-textarea"

// Generic part type from AI SDK
interface BasePart {
    type: string;
    toolName?: string;
    toolCallId?: string;
    state?: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
    text?: string;
    [key: string]: unknown;
}

// Type guard for text parts
function isTextPart(part: BasePart): part is BasePart & { type: 'text'; text: string } {
    return part.type === 'text' && typeof part.text === 'string';
}

// Check if part is a dynamic tool part (MCP tools)
function isDynamicToolPart(part: BasePart): boolean {
    return part.type === 'dynamic-tool';
}

// Check if part is a regular tool part
function isToolPart(part: BasePart): boolean {
    return part.type.startsWith('tool-');
}

// Get tool name from part
function getToolName(part: BasePart): string {
    if (part.type === 'dynamic-tool') {
        return part.toolName || '';
    }
    return part.type.replace('tool-', '');
}

// Get tool state
function getToolState(part: BasePart): 'input-streaming' | 'input-available' | 'output-available' | 'output-error' {
    return (part.state as 'input-streaming' | 'input-available' | 'output-available' | 'output-error') || 'input-available';
}

// Parse MCP tool output - it comes wrapped in content array with JSON string
function parseMCPToolOutput<T>(output: unknown): T | null {
    if (!output) return null;
    
    // MCP tools return { content: [{ type: 'text', text: 'JSON_STRING' }], isError: boolean }
    const mcpOutput = output as { content?: Array<{ type: string; text: string }>; isError?: boolean };
    
    if (mcpOutput.content && Array.isArray(mcpOutput.content)) {
        const textContent = mcpOutput.content.find(c => c.type === 'text');
        if (textContent?.text) {
            try {
                return JSON.parse(textContent.text) as T;
            } catch {
                console.error('Failed to parse MCP output:', textContent.text);
                return null;
            }
        }
    }
    
    // If it's already parsed, return as-is
    return output as T;
}

export function ChatInterface(): React.JSX.Element {
    const [input, setInput] = useState("")
    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
        onError: (error) => {
            console.error('Chat error:', error);
        },
    })
    const scrollRef = useRef<HTMLDivElement>(null)

    // Debug: Log messages when they change
    useEffect(() => {
        if (messages.length > 0) {
            // console.log('Messages updated:', JSON.stringify(messages, null, 2));
        }
    }, [messages]);

    const handleRetry = () => {
        if (messages.length > 0) {
            const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
            if (lastUserMessage) {
                sendMessage({ parts: lastUserMessage.parts });
            }
        }
    }

    useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        sendMessage({
            parts: [{ type: "text", text: input }],
        })
        setInput("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as FormEvent)
        }
    }

    const isLoading = status === "streaming" || status === "submitted"

    // Render a tool part based on its type
    const renderToolPart = (part: BasePart, messageId: string, index: number) => {
        const toolName = getToolName(part);
        const state = getToolState(part);

        // Handle identify_song tool
        if (toolName === 'identify_song') {
            const toolInput = part.input as { lyrics?: string; limit?: number } | undefined;
            const toolOutput = parseMCPToolOutput<SongSearchResult>(part.output);
            const errorText = part.errorText as string | undefined;

            return (
                <Fragment key={`${messageId}-identify-${index}`}>
                    {/* Show tool input when streaming or available */}
                    {(state === 'input-streaming' || state === 'input-available') && !toolOutput && (
                        <ToolInputDisplay
                            toolName="identify_song"
                            lyrics={toolInput?.lyrics}
                            isStreaming={state === 'input-streaming'}
                        />
                    )}

                    {/* Show results when output is available */}
                    {state === 'output-available' && toolOutput && (
                        <>
                            {toolOutput.success && toolOutput.songs ? (
                                <SongResultsDisplay
                                    songs={toolOutput.songs}
                                    showOnlyTopMatch={toolOutput.songs.length === 1}
                                />
                            ) : toolOutput.error ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm"
                                >
                                    {toolOutput.error}
                                </motion.div>
                            ) : null}
                        </>
                    )}

                    {/* Show error if tool failed */}
                    {state === 'output-error' && errorText && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm"
                        >
                            Error: {errorText}
                        </motion.div>
                    )}
                </Fragment>
            );
        }

        // Handle get_song_details tool
        if (toolName === 'get_song_details') {
            const toolOutput = parseMCPToolOutput<SongDetailsResult>(part.output);
            const errorText = part.errorText as string | undefined;

            return (
                <Fragment key={`${messageId}-details-${index}`}>
                    {/* Show tool input when fetching */}
                    {(state === 'input-streaming' || state === 'input-available') && !toolOutput && (
                        <ToolInputDisplay
                            toolName="get_song_details"
                            songTitle="Loading song details..."
                            isStreaming={state === 'input-streaming'}
                        />
                    )}

                    {/* Show detailed card when output is available */}
                    {state === 'output-available' && toolOutput && (
                        <>
                            {toolOutput.success && toolOutput.details ? (
                                <SongDetailsCard details={toolOutput.details} />
                            ) : toolOutput.error ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm"
                                >
                                    {toolOutput.error}
                                </motion.div>
                            ) : null}
                        </>
                    )}

                    {/* Show error if tool failed */}
                    {state === 'output-error' && errorText && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm"
                        >
                            Error: {errorText}
                        </motion.div>
                    )}
                </Fragment>
            );
        }

        // Generic tool display for unknown tools
        return (
            <div key={`${messageId}-tool-${index}`} className="text-xs text-muted-foreground bg-black/20 p-2 rounded">
                Tool: {toolName} ({state})
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] max-h-[800px] w-full max-w-3xl mx-auto glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/40 flex items-center gap-3 backdrop-blur-md">
                <div className="p-2.5 rounded-full bg-primary/20 ring-2 ring-primary/30 shadow-lg shadow-primary/20">
                    <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="font-semibold text-white text-lg">LyriFind Assistant</h2>
                    <p className="text-xs text-gray-400">Powered by AI & Genius API</p>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
                <div className="space-y-6 max-w-2xl mx-auto">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-6 py-8">
                            <div className="p-5 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 ring-2 ring-primary/20 shadow-xl shadow-primary/10">
                                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-base font-medium text-white/90">Paste some lyrics to find your song</p>
                                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                                    Try something like: &quot;I&apos;ve been reading books of old, the legends and the myths&quot;
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {['Pop', 'Rock', 'Hip-Hop', 'R&B', 'Country'].map((genre) => (
                                    <span key={genre} className="px-3 py-1 text-xs rounded-full bg-white/5 text-white/50 border border-white/10">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                                <Avatar className="w-8 h-8 border border-white/10 flex-shrink-0">
                                    {message.role === "user" ? (
                                        <AvatarFallback className="bg-primary/20 text-primary">
                                            <User className="w-4 h-4" />
                                        </AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                                            <Music className="w-4 h-4" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>

                                <div className={`flex flex-col gap-3 max-w-[90%] md:max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                                    {message.parts.map((part, index) => {
                                        const typedPart = part as BasePart;

                                        // Skip step-start parts
                                        if (typedPart.type === 'step-start') {
                                            return null;
                                        }

                                        // Handle text parts
                                        if (isTextPart(typedPart)) {
                                            return (
                                                <motion.div
                                                    key={`${message.id}-text-${index}`}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${message.role === "user"
                                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                        : "bg-muted text-muted-foreground rounded-tl-sm"
                                                        }`}
                                                >
                                                    {typedPart.text}
                                                </motion.div>
                                            )
                                        }

                                        // Handle dynamic tool parts (MCP tools)
                                        if (isDynamicToolPart(typedPart)) {
                                            return renderToolPart(typedPart, message.id, index);
                                        }

                                        // Handle regular tool parts
                                        if (isToolPart(typedPart)) {
                                            return renderToolPart(typedPart, message.id, index);
                                        }

                                        return null
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
                            role="alert"
                            aria-live="assertive"
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-destructive font-medium mb-1">Something went wrong</p>
                                    <p className="text-xs text-destructive/80">{error.message}</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleRetry}
                                variant="outline"
                                size="sm"
                                className="mt-3 border-destructive/20 hover:bg-destructive/10"
                            >
                                Try Again
                            </Button>
                        </motion.div>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                            role="status"
                            aria-live="polite"
                            aria-busy="true"
                            aria-label="AI is processing"
                        >
                            <Avatar className="w-8 h-8 border border-white/10">
                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                    <Music className="w-4 h-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
                                <Visualizer />
                            </div>
                        </motion.div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 md:p-5 bg-black/40 border-t border-white/10 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-2xl mx-auto">
                    <ChatTextarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste lyrics here... (Shift+Enter for new line)"
                        className="bg-black/40 border-white/10 focus-visible:ring-primary focus-visible:ring-2 text-white placeholder:text-gray-500 text-base"
                        minRows={1}
                        maxRows={5}
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="bg-primary hover:bg-primary/90 text-white flex-shrink-0 h-11 w-11 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
