import * as React from "react"
import TextareaAutosize from "react-textarea-autosize"
import { cn } from "@/lib/utils"

export interface ChatTextareaProps extends React.ComponentProps<typeof TextareaAutosize> {
  minRows?: number
  maxRows?: number
}

export const ChatTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ChatTextareaProps
>(({ className, minRows = 1, maxRows = 6, ...props }, ref) => {
  return (
    <TextareaAutosize
      className={cn(
        "flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2.5 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none transition-all",
        className
      )}
      ref={ref}
      minRows={minRows}
      maxRows={maxRows}
      {...props}
    />
  )
})

ChatTextarea.displayName = "ChatTextarea"
