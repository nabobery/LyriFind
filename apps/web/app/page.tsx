import { ChatInterface } from "@/components/chat-interface"
import { Sparkles, Github } from "lucide-react"

export default function Home() {
  return (
    <main className="h-screen w-screen bg-background overflow-hidden relative flex flex-col">
      <ChatInterface />

      <footer className="w-full py-2 px-6 border-t border-white/5 bg-background/40 backdrop-blur-md flex items-center justify-between text-xs text-muted-foreground/60 z-10 shrink-0">
        <div>
          Built with Next.js, Vercel AI SDK, and Shadcn UI
        </div>
        <a
          href="https://github.com/nabobery/LyriFind"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub</span>
        </a>
      </footer>

      {/* Background Gradients - Nocturnal Blue Jazz */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[80px]" />
      </div>
    </main>
  )
}
