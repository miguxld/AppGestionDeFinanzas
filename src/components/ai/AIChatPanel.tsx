"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface AIChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ isOpen, onClose }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "¡Hola! Soy tu asistente de TheOneShot. Conozco tu flujo de caja y metas de ahorro. ¿En qué puedo ayudarte hoy?" }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    const aiMutation = api.ai.ask.useMutation({
        onSuccess: (data: any) => {
            setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
        },
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || aiMutation.isPending) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        aiMutation.mutate({ question: userMessage });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#090b16]/95 border-l border-white/10 z-[70] shadow-2xl flex flex-col glass"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-none">TheOneShot AI</h3>
                                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        En línea
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-white/5 transition-colors">
                                <X className="w-5 h-5 text-[#8899cc]" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-hidden relative">
                            <ScrollArea className="h-full p-6" ref={scrollRef}>
                                <div className="space-y-6">
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-500/20 text-blue-400" : "bg-violet-500/20 text-violet-400"
                                                    }`}>
                                                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                </div>
                                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                                        ? "bg-blue-500 text-white rounded-tr-none font-medium shadow-lg shadow-blue-500/10"
                                                        : "glass border border-white/10 text-[#ccd6f6] rounded-tl-none"
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {aiMutation.isPending && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-3 max-w-[85%]">
                                                <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
                                                    <Bot className="w-4 h-4" />
                                                </div>
                                                <div className="p-4 rounded-2xl glass border border-white/10 rounded-tl-none flex gap-1 items-center">
                                                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                            <div className="relative group">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Escribe tu consulta financiera..."
                                    className="w-full h-14 pl-5 pr-14 rounded-2xl bg-white/5 border-white/10 text-white focus:ring-blue-500/20 placeholder:text-[#4a5880]"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || aiMutation.isPending}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white p-0 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:bg-[#4a5880]"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-center text-[#4a5880] mt-4 font-bold uppercase tracking-widest">
                                Desarrollado con IA para tu libertad financiera
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
