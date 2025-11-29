import { ChatInterface } from "@/components/chat-interface"
import { Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 pt-8 md:p-8 md:pt-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-6 md:gap-8">

        {/* Compact Header */}
        <header className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium backdrop-blur-sm">
            <Sparkles className="w-3 h-3 mr-1.5" />
            AI-Powered Music Discovery
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            LyriFind
          </h1>
          <p className="text-muted-foreground max-w-[500px] mx-auto text-sm md:text-base">
            Can&apos;t remember that song? Just paste the lyrics and let our AI find it instantly.
          </p>
        </header>

        {/* Main Chat Interface - Takes Most Space */}
        <div className="w-full flex-1">
          <ChatInterface />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground/60 pb-4">
          Built with Next.js, Vercel AI SDK, and Shadcn UI
        </footer>
      </div>

      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[30%] h-[30%] rounded-full bg-indigo-900/10 blur-[80px]" />
      </div>
    </main>
  )
}
