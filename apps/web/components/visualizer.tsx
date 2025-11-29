"use client"

import { motion } from "framer-motion"

export function Visualizer() {
    return (
        <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 bg-primary rounded-full"
                    animate={{
                        height: ["20%", "80%", "20%"],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut",
                    }}
                    style={{
                        height: "40%",
                    }}
                />
            ))}
        </div>
    )
}
