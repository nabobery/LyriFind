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
        <div className="flex flex-col flex-1 w-full h-full glass-card border-0 rounded-none relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-background/40 flex items-center justify-between backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 ring-1 ring-primary/30 shadow-[0_0_15px_rgba(215,181,109,0.1)]">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight text-white">
                            Lyri<span className="text-primary">Find</span>
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-default">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-xs text-primary font-medium">AI Music Assistant</span>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 md:p-6 bg-gradient-to-b from-transparent to-black/20" ref={scrollRef}>
                {/* ... (rest of the component remains the same until input area) ... */}
                <div className="space-y-8 max-w-3xl mx-auto pb-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-8 py-12">
                            <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-primary/20 shadow-[0_0_30px_rgba(215,181,109,0.1)]">
                                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-xl font-medium text-white/90 tracking-tight">Paste some lyrics to find your song</p>
                                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mx-auto">
                                    Try something like: &quot;I&apos;ve been reading books of old, the legends and the myths&quot;
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {['Pop', 'Rock', 'Hip-Hop', 'R&B', 'Jazz'].map((genre) => (
                                    <span key={genre} className="px-4 py-1.5 text-xs font-medium rounded-full bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-primary transition-colors cursor-default">
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
                                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                                <Avatar className="w-9 h-9 border border-white/10 flex-shrink-0 shadow-lg">
                                    {message.role === "user" ? (
                                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                            <User className="w-4 h-4" />
                                        </AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="bg-secondary text-white">
                                            <Music className="w-4 h-4" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>

                                <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${message.role === "user" ? "items-end" : "items-start"}`}>
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
                                                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${message.role === "user"
                                                        ? "bg-primary text-primary-foreground rounded-tr-sm font-medium"
                                                        : "bg-muted/50 text-foreground/90 rounded-tl-sm border border-white/5"
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
                            className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl max-w-2xl mx-auto"
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
                                className="mt-3 border-destructive/20 hover:bg-destructive/10 text-destructive hover:text-destructive"
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
                            className="flex gap-4"
                            role="status"
                            aria-live="polite"
                            aria-busy="true"
                            aria-label="AI is processing"
                        >
                            <Avatar className="w-9 h-9 border border-white/10 shadow-lg">
                                <AvatarFallback className="bg-secondary text-white">
                                    <Music className="w-4 h-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-sm border border-white/5">
                                <Visualizer />
                            </div>
                        </motion.div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-background/60 border-t border-white/5 backdrop-blur-xl z-20">
                <form onSubmit={handleSubmit} className="flex gap-4 items-end max-w-3xl mx-auto relative">
                    <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <ChatTextarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Paste lyrics here... (Shift+Enter for new line)"
                            className="relative bg-black/40 border-white/10 focus-visible:ring-primary/50 focus-visible:ring-1 text-white placeholder:text-muted-foreground/50 text-base rounded-xl py-3 px-4 min-h-[50px]"
                            minRows={1}
                            maxRows={6}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="bg-primary text-primary-foreground flex-shrink-0 h-[50px] w-[50px] rounded-xl shadow-[0_0_15px_rgba(215,181,109,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(215,181,109,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                    >
                        <Send className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                    </Button>
                </form>
            </div>
        </div>
    )
}
