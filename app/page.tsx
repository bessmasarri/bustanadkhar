"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import DhikrCard from "@/components/DhikrCard";
import GardenGrid from "@/components/GardenGrid";
import dhikrData from "@/data/dhikr.json";
import { Moon, Sun, Flower } from "lucide-react";

export default function Home() {
  // Game State
  const [points, setPoints] = useState(0);
  const [flowers, setFlowers] = useState(0);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  // UI State
  const [mode, setMode] = useState<"morning" | "evening">("morning");

  // Derived State
  const totalSeedsEarned = Math.floor(points / 30);
  const availableSeeds = totalSeedsEarned - flowers;

  // Load state from localStorage on mount (Client-side only)
  useEffect(() => {
    const savedPoints = parseInt(localStorage.getItem("points") || "0");
    const savedFlowers = parseInt(localStorage.getItem("flowers") || "0");
    const savedCompleted = JSON.parse(localStorage.getItem("completedIds") || "[]");

    setPoints(savedPoints);
    setFlowers(savedFlowers);
    setCompletedIds(savedCompleted);

    // Auto-detect time for mode
    const hours = new Date().getHours();
    if (hours >= 18 || hours < 5) {
      setMode("evening");
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem("points", points.toString());
    localStorage.setItem("flowers", flowers.toString());
    localStorage.setItem("completedIds", JSON.stringify(completedIds));
  }, [points, flowers, completedIds]);

  const handleDhikrComplete = (id: number) => {
    if (completedIds.includes(id)) return;

    const dhikr = dhikrData.find(d => d.id === id);
    if (!dhikr) return;

    setCompletedIds(prev => [...prev, id]);
    setPoints(prev => prev + dhikr.points);

    // Mini confetti for task completion
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#fbbf24']
    });
  };

  const plantFlower = () => {
    if (availableSeeds > 0) {
      setFlowers(prev => prev + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const filteredDhikr = dhikrData.filter(d =>
    d.category === mode || d.category === "both"
  );

  const bgClass = mode === "morning"
    ? "bg-gradient-to-br from-amber-50 to-sky-100"
    : "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white";

  return (
    <main className={`min-h-screen p-4 pb-24 transition-colors duration-1000 ${bgClass}`}>

      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-2xl">
            {mode === "morning" ? "☀️" : "🌙"}
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${mode === "evening" ? "text-white" : "text-slate-800"}`}>
              {mode === "morning" ? "صباح الخير!" : "مساء النور!"}
            </h1>
            <p className={`text-sm ${mode === "evening" ? "text-indigo-200" : "text-slate-500"}`}>
              {points} نقطة
            </p>
          </div>
        </div>

        <button
          onClick={() => setMode(mode === "morning" ? "evening" : "morning")}
          className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition shadow-lg border border-white/50"
        >
          {mode === "morning" ? <Moon className="text-indigo-600" /> : <Sun className="text-amber-400" />}
        </button>
      </header>

      {/* Garden Section */}
      <section className="mb-8">
        <GardenGrid
          flowers={flowers}
          seeds={availableSeeds}
          onPlant={plantFlower}
        />
      </section>

      {/* Dhikr List */}
      <section className="max-w-md mx-auto">
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${mode === "evening" ? "text-white" : "text-slate-800"}`}>
          <span className="bg-indigo-500 text-white px-2 py-1 rounded-lg text-sm">
            {filteredDhikr.length}
          </span>
          أذكار {mode === "morning" ? "الصباح" : "المساء"}
        </h2>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredDhikr.map((dhikr) => (
              <DhikrCard
                key={dhikr.id}
                {...dhikr}
                onComplete={handleDhikrComplete}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom Nav Placeholder (Visual Only for MVP) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 p-4 flex justify-around text-xs font-bold text-slate-500 z-50">
        <div className="flex flex-col items-center gap-1 text-green-600">
          <Flower size={24} />
          <span>البستان</span>
        </div>
        {/* Adds more nav items here */}
      </nav>

    </main>
  );
}
