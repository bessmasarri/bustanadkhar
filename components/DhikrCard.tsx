"use client";

import { useState, useRef } from "react";
import { Play, Pause, Check, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DhikrCardProps {
    id: number;
    text: string;
    title: string;
    count: number;
    points: number;
    isAlreadyCompleted?: boolean;
    onComplete: (id: number) => void;
    audioUrl?: string;
}

export default function DhikrCard({
    id,
    text,
    title,
    count,
    points,
    isAlreadyCompleted = false,
    onComplete,
    audioUrl,
}: DhikrCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentCount, setCurrentCount] = useState(isAlreadyCompleted ? count : 0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [audioHasError, setAudioHasError] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current || !audioUrl || audioHasError) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => {
                console.error("Audio play failed:", err);
                setAudioHasError(true);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgress = () => {
        if (currentCount < count) {
            const newCount = currentCount + 1;
            setCurrentCount(newCount);
            if (newCount === count) {
                setShowOverlay(true);
                onComplete(id);
            }
        }
    };

    const isCompleted = currentCount >= count;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={cn(
                "bg-white rounded-[2rem] shadow-xl p-6 relative overflow-hidden transition-all border-b-[6px]",
                isCompleted ? "border-green-200" : "border-slate-100"
            )}
        >
            {/* Persisted Completion Badge */}
            {isAlreadyCompleted && (
                <div className="absolute top-4 right-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black font-cairo shadow-lg flex items-center gap-1 animate-pulse">
                    <Check size={12} />
                    تم الحصول على النقاط اليوم 💎
                </div>
            )}

            {/* Completion Overlay (Only shows when just finished) */}
            {showOverlay && (
                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center z-30 backdrop-blur-[2px]">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-2xl"
                    >
                        <div className="bg-green-100 rounded-full p-4 mb-3 shadow-inner">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <p className="text-green-700 font-extrabold text-xl font-cairo">أحسنت يا بطل!</p>
                        <span className="text-sm font-bold text-green-500">+{points} نقطة</span>
                        <button onClick={() => setShowOverlay(false)} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 underline">إغلاق</button>
                    </motion.div>
                </div>
            )}

            {/* Top Bar (Audio Controls Only) */}
            <div className="flex justify-start mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        disabled={!audioUrl || audioHasError}
                        className={cn(
                            "p-3 rounded-2xl transition-all shadow-md active:scale-95",
                            !audioUrl || audioHasError ? "bg-slate-50 text-slate-300 cursor-not-allowed" : (isPlaying ? "bg-red-100 text-red-500" : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100")
                        )}
                    >
                        {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                    </button>
                    <span className="text-xs font-bold text-slate-400 font-cairo">
                        {!audioUrl ? "لا يوجد صوت لهذا الذكر 🔇" : (audioHasError ? "عذراً، الملف الصغير غير موجود ❌" : "استمع للذكر 🔈")}
                    </span>
                </div>
                {audioUrl && (
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        onError={() => setAudioHasError(true)}
                        className="hidden"
                    />
                )}
            </div>

            {/* Content */}
            <p className="text-2xl text-slate-700 font-amiri leading-[2.4] text-center mb-8 px-2">
                {text}
            </p>

            {/* Footer / Actions */}
            <div className="flex flex-col gap-3">
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <motion.div
                        className={cn("h-full rounded-full transition-colors", isAlreadyCompleted ? "bg-green-400" : "bg-indigo-400")}
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentCount / count) * 100}%` }}
                    />
                </div>

                <div className="flex gap-2">
                    {isCompleted && isAlreadyCompleted && (
                        <button
                            onClick={() => { setCurrentCount(0); setShowOverlay(false); }}
                            className="bg-slate-100 p-4 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all font-bold font-cairo"
                            title="إعادة القراءة"
                        >
                            🔄
                        </button>
                    )}
                    <button
                        onClick={handleProgress}
                        disabled={isCompleted}
                        className={cn(
                            "grow py-4 rounded-2xl text-xl font-extrabold transition-all transform active:scale-95 shadow-lg border-b-4",
                            isCompleted
                                ? "bg-slate-50 text-slate-300 border-transparent cursor-default"
                                : (isAlreadyCompleted ? "bg-green-500 text-white border-green-700" : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-700 hover:shadow-indigo-500/40")
                        )}
                    >
                        {isCompleted ? (isAlreadyCompleted ? "تمت القراءة اليوم ✔️" : "اكتمل") : `قرأتُه (${currentCount}/${count})`}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
