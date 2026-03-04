"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AIOrbProps {
    onClick: () => void;
    isThinking?: boolean;
}

export const AIOrb: React.FC<AIOrbProps> = ({ onClick, isThinking = false }) => {
    return (
        <div className="fixed bottom-8 right-8 z-50">
            <motion.button
                onClick={onClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer group"
            >
                {/* Outer Glow */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />

                {/* Animated Background Rings */}
                <AnimatePresence>
                    {isThinking && (
                        <>
                            <motion.div
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.8, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full border border-blue-400/30"
                            />
                            <motion.div
                                initial={{ scale: 1, opacity: 0.3 }}
                                animate={{ scale: 2.2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                className="absolute inset-0 rounded-full border border-violet-400/20"
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* Main Orb Body */}
                <motion.div
                    animate={isThinking ? {
                        background: [
                            "linear-gradient(45deg, #3b82f6, #8b5cf6)",
                            "linear-gradient(45deg, #8b5cf6, #3b82f6)",
                            "linear-gradient(45deg, #3b82f6, #8b5cf6)"
                        ],
                        scale: [1, 1.05, 1],
                    } : {
                        background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative w-full h-full rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center overflow-hidden border border-white/20"
                >
                    {/* Internal Particles/Cloud effect */}
                    <div className="absolute inset-0 bg-blue-400/10 mix-blend-overlay animate-pulse" />
                    <Sparkles className={`w-8 h-8 text-white ${isThinking ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
                </motion.div>

                {/* Status indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#090b16] rounded-full" />
            </motion.button>
        </div>
    );
};
