"use client";

import { useState, useRef } from "react";
import { Play, Pause, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DhikrCardProps {
    id: number;
    text: string;
    title: string;
    count: number;
    points: number;
    onComplete: (id: number) => void;
    audioUrl?: string; // Optional for now
}

export default function DhikrCard({
    id,
    text,
    title,
    count,
    points,
    onComplete,
    audioUrl,
}: DhikrCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentCount, setCurrentCount] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgress = () => {
        if (currentCount < count) {
            const newCount = currentCount + 1;
            setCurrentCount(newCount);
            if (newCount === count) {
                onComplete(id);
            }
        }
    };

    const isCompleted = currentCount >= count;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-4 relative overflow-hidden border border-slate-100"
        >
            {isCompleted && (
                <div className="absolute inset-0 bg-green-50/80 flex items-center justify-center z-10 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="bg-green-500 rounded-full p-4 mb-2 shadow-lg">
                            <Check className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-green-700 font-bold text-lg">أحسنت! (+{points})</p>
                    </motion.div>
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-700">{title}</h3>
                <div className="flex gap-2">
                    {/* Audio Player Placeholder */}
                    <button
                        onClick={togglePlay}
                        className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <audio
                        ref={audioRef}
                        src={audioUrl || "/audio/placeholder.mp3"}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                    />
                </div>
            </div>

            <p className="text-xl md:text-2xl text-slate-800 font-amiri leading-loose text-center mb-6">
                {text}
            </p>

            <div className="flex flex-col items-center gap-2">
                <button
                    onClick={handleProgress}
                    disabled={isCompleted}
                    className={cn(
                        "w-full py-4 rounded-xl text-xl font-bold transition-all transform active:scale-95",
                        isCompleted
                            ? "bg-green-200 text-green-700 cursor-default"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/30"
                    )}
                >
                    {isCompleted ? "اكتمل" : `قرأتُه (${currentCount}/${count})`}
                </button>
                <span className="text-xs text-slate-400">تحصل على {points} نقطة</span>
            </div>
        </motion.div>
    );
}
