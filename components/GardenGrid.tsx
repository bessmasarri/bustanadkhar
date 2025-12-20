"use client";

import { motion } from "framer-motion";

interface GardenGridProps {
    flowers: number; // number of flowers planted
    seeds: number;   // available seeds (based on points/30)
    onPlant: () => void;
}

export default function GardenGrid({ flowers, seeds, onPlant }: GardenGridProps) {
    // 5x4 Grid = 20 slots
    const totalSlots = 20;

    return (
        <div className="w-full bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">بستاني</h2>
                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full shadow-sm">
                        🌱 {seeds} بذور متاحة
                    </span>
                    <button
                        onClick={onPlant}
                        disabled={seeds < 1}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md transition-colors"
                    >
                        ازرع وردة
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2 md:gap-4 aspect-[5/4]">
                {Array.from({ length: totalSlots }).map((_, i) => {
                    const isFlower = i < flowers;
                    // You could add logic for "growing" state if we had stored seed positions

                    return (
                        <div
                            key={i}
                            className="bg-green-100/50 rounded-lg flex items-center justify-center relative border border-green-200/30"
                        >
                            {isFlower ? (
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="text-3xl md:text-4xl filter drop-shadow-md"
                                >
                                    🌷
                                </motion.div>
                            ) : (
                                <div className="w-2 h-2 bg-green-200 rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>

            {flowers >= totalSlots && (
                <div className="mt-4 text-center text-purple-600 font-bold animate-pulse">
                    🎉 مذهل! لقد أكملت البستان!
                </div>
            )}
        </div>
    );
}
