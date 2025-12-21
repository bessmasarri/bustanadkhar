"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flower, ShoppingBag, Sparkles } from "lucide-react";

interface FlowerItem {
    type: string;
    emoji: string;
    price: number;
    label: string;
}

export const FLOWER_SHOP: FlowerItem[] = [
    { type: "tulip", emoji: "🌷", price: 30, label: "توليب" },
    { type: "rose", emoji: "🌹", price: 50, label: "جوري" },
    { type: "sunflower", emoji: "🌻", price: 80, label: "دوار الشمس" },
    { type: "blooming", emoji: "🌸", price: 100, label: "زهرة الربيع" },
    { type: "cactus", emoji: "🌵", price: 40, label: "صبار خجول" },
];

interface GardenProps {
    points: number;
    purchasedFlowers: { flower_type: string }[];
    onBuy: (type: string, price: number) => void;
    gender: "boy" | "girl";
}

export default function GardenGrid({ points, purchasedFlowers, onBuy, gender }: GardenProps) {
    const isBoy = gender === "boy";

    return (
        <div className="space-y-6">
            {/* Garden Area */}
            <div className="glass-panel-light rounded-[2.5rem] p-6 border-4 border-white shadow-2xl bg-white/40">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 font-cairo">
                        <Flower className="text-green-500" />
                        بستانك الجميل ✨
                    </h3>
                    <div className="px-4 py-1 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                        لديك {purchasedFlowers.length} {purchasedFlowers.length === 1 ? "زهرة" : "زهور"}
                    </div>
                </div>

                {purchasedFlowers.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400 bg-white/20 rounded-3xl border-2 border-dashed border-white/60 text-center px-4">
                        <p className="font-bold text-lg">{isBoy ? "واصل يا بطل" : "واصلي يا بطلة"}، بستانك فارغ حالياً..</p>
                        <p className="text-sm">{isBoy ? "اقرأ الأذكار لتجمع النقاط وتشتري الزهور!" : "اقرئي الأذكار لتجمعي النقاط وتشتري الزهور!"} 👇</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-2">
                        <AnimatePresence>
                            {purchasedFlowers.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="aspect-square bg-white/50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white hover:scale-110 transition-transform cursor-default"
                                >
                                    {FLOWER_SHOP.find(s => s.type === f.flower_type)?.emoji || "🌸"}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Shop Area */}
            <div className="glass-panel-light rounded-[2.5rem] p-6 border-4 border-white shadow-2xl bg-indigo-50/50">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6 font-cairo">
                    <ShoppingBag className="text-indigo-500" />
                    متجر الزهور 🧺
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {FLOWER_SHOP.map((item) => {
                        const canAfford = points >= item.price;
                        return (
                            <motion.div
                                key={item.type}
                                whileHover={{ y: -5 }}
                                className="bg-white p-4 rounded-3xl shadow-md border border-slate-100 flex flex-col items-center gap-2"
                            >
                                <span className="text-4xl mb-1">{item.emoji}</span>
                                <span className="font-bold text-slate-700 font-cairo">{item.label}</span>
                                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm">
                                    <span>{item.price}</span>
                                    <Sparkles size={12} />
                                </div>

                                <button
                                    onClick={() => onBuy(item.type, item.price)}
                                    disabled={!canAfford}
                                    className={`mt-2 w-full py-2 rounded-xl font-bold transition-all shadow-sm font-cairo ${canAfford
                                        ? "bg-green-500 text-white hover:bg-green-600 active:scale-95"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        }`}
                                >
                                    {canAfford ? "اشترِ الآن" : "نقاطك لا تكفي"}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
