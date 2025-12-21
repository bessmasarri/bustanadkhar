"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import DhikrCard from "@/components/DhikrCard";
import GardenGrid, { FLOWER_SHOP } from "@/components/GardenGrid";
import dhikrData from "@/data/dhikr.json";
import { Moon, Sun, Flower, LogOut, Cloud, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  // User State
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("البطل");
  const [gender, setGender] = useState<"boy" | "girl">("boy");

  // Game State
  const [points, setPoints] = useState(0);
  const [purchasedFlowers, setPurchasedFlowers] = useState<{ flower_type: string }[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<"dhikr" | "garden">("dhikr");
  const [selectedCategory, setSelectedCategory] = useState<"morning" | "evening" | "sleeping" | null>(null);
  const [mode, setMode] = useState<"morning" | "evening" | "sleeping">("morning");
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  const isBoy = gender === "boy";

  // Initial Load
  useEffect(() => {
    const init = async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = localStorage.getItem("last_active_date");

      const storedId = localStorage.getItem("userId");
      const storedGender = localStorage.getItem("gender") as "boy" | "girl";
      const storedName = localStorage.getItem("username");

      setUserId(storedId);
      if (storedGender) setGender(storedGender);
      if (storedName) setUsername(storedName);

      if (storedId) {
        // Logged In
        const { data: gardenData } = await supabase.from("garden").select("points").eq("user_id", storedId).single();
        const { data: flowerData } = await supabase.from("user_flowers").select("flower_type").eq("user_id", storedId);
        const { data: progressData } = await supabase.from("progress").select("dhikr_id").eq("user_id", storedId).eq("blooming_date", today);

        if (gardenData) setPoints(gardenData.points);
        if (flowerData) setPurchasedFlowers(flowerData);
        if (progressData) setCompletedIds(progressData.map(p => p.dhikr_id));
      } else {
        // Guest
        const savedPoints = parseInt(localStorage.getItem("points") || "50");
        setPoints(savedPoints);

        if (lastActive === today) {
          const savedCompleted = JSON.parse(localStorage.getItem("completed_ids") || "[]");
          setCompletedIds(savedCompleted);
        } else {
          localStorage.removeItem("completed_ids");
          setCompletedIds([]);
        }
      }

      localStorage.setItem("last_active_date", today);
      setLoading(false);
    };

    init();
  }, []);

  // Update theme mode based on selection or time
  useEffect(() => {
    if (selectedCategory) {
      setMode(selectedCategory);
    } else {
      const hours = new Date().getHours();
      if (hours >= 5 && hours < 11) setMode("morning");
      else if (hours >= 11 && hours < 19) setMode("evening");
      else setMode("sleeping");
    }
  }, [selectedCategory]);

  const handleDhikrComplete = async (id: number) => {
    if (completedIds.includes(id)) return;

    const today = new Date().toISOString().split('T')[0];
    const dhikr = dhikrData.find(d => d.id === id);
    if (!dhikr) return;

    // 1. OPTIMISTIC UPDATE (Instant UI Feedback)
    const bonusPossible = selectedCategory ? dhikrData.filter(d => d.category === selectedCategory || d.category === "both").length : 0;
    const isLastInCategory = selectedCategory && (completedIds.filter(cid => {
      const d = dhikrData.find(dx => dx.id === cid);
      return d?.category === selectedCategory || d?.category === "both";
    }).length + 1) === bonusPossible;

    const bonusPoints = isLastInCategory ? 50 : 0;
    const addedPoints = dhikr.points + bonusPoints;
    const newPoints = points + addedPoints;
    const newCompleted = [...completedIds, id];

    setCompletedIds(newCompleted);
    setPoints(newPoints);

    // Initial Celebration
    confetti({
      particleCount: isLastInCategory ? 150 : 50,
      spread: isLastInCategory ? 100 : 70,
      origin: { y: 0.7 },
      colors: isBoy ? ['#22c55e', '#3b82f6'] : ['#f472b6', '#ec4899']
    });

    if (isLastInCategory) {
      alert(`يا بطل! لقد أكملت جميع أذكار ${selectedCategory === "morning" ? "الصباح" : "المساء"}.. لك 50 نقطة إضافية! 🎁💎`);
    }

    // 2. BACKGROUND SYNC
    if (userId) {
      // Run sync in background without blocking UI
      (async () => {
        let success = false;
        let attempts = 0;
        while (!success && attempts < 3) {
          attempts++;
          const { error: pErr } = await supabase.from("garden").update({ points: newPoints }).eq("user_id", userId);
          const { error: prErr } = await supabase.from("progress").insert([{ user_id: userId, dhikr_id: id, blooming_date: today }]);

          if (!pErr && !prErr) {
            success = true;
          } else {
            console.warn(`Sync attempt ${attempts} failed. Retrying...`);
            await new Promise(r => setTimeout(r, 2000));
          }
        }

        if (!success) {
          console.error("Failed to sync points after 3 attempts.");
          // Optional: Show a subtle warning toast instead of blocking alert
        }
      })();
    } else {
      localStorage.setItem("points", newPoints.toString());
      localStorage.setItem("completed_ids", JSON.stringify(newCompleted));
      localStorage.setItem("last_active_date", today);
    }

    // Summary check
    const currentList = dhikrData.filter(d => d.category === selectedCategory || d.category === "both");
    if (newCompleted.length >= currentList.length) {
      setTimeout(() => setShowSummary(true), 1500);
    }
  };

  const handleBuyFlower = async (type: string, price: number) => {
    if (points < price) return;

    const newPoints = points - price;

    // 1. OPTIMISTIC UPDATE
    setPoints(newPoints);
    setPurchasedFlowers([...purchasedFlowers, { flower_type: type }]);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    alert(`مبارك لك الزرع الجديد يا ${isBoy ? "بطل" : "بطلة"}! ✨🌷`);

    // 2. BACKGROUND SYNC
    if (userId) {
      (async () => {
        let success = false;
        let attempts = 0;

        while (!success && attempts < 3) {
          attempts++;
          const { error: pErr } = await supabase.from("garden").update({ points: newPoints }).eq("user_id", userId);
          const { error: fErr } = await supabase.from("user_flowers").insert([{ user_id: userId, flower_type: type }]);

          if (!pErr && !fErr) {
            success = true;
          } else {
            console.warn(`Sync attempt ${attempts} failed. Retrying...`);
            await new Promise(r => setTimeout(r, 2000));
          }
        }

        if (!success) {
          console.error("Failed to sync flower purchase after 3 attempts.");
        }
      })();
    } else {
      localStorage.setItem("points", newPoints.toString());
    }
  };

  const isMorning = mode === "morning";
  const filteredDhikr = dhikrData.filter(d => d.category === selectedCategory || d.category === "both");

  let bgClass = "bg-gradient-to-b from-sky-300 via-sky-100 to-green-100";
  let modeIcon = "☀️";
  let modeText = "صباح الخير";

  if (mode === "evening") {
    bgClass = "bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-900 text-white";
    modeIcon = "🌙";
    modeText = "مساء النور";
  } else if (mode === "sleeping") {
    bgClass = "bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white";
    modeIcon = "⭐";
    modeText = "أذكار النوم";
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 font-cairo">
      <div className="text-2xl font-bold text-sky-600 animate-pulse">جاري تحضير البستان... 🌱</div>
    </div>
  );

  return (
    <main className={`min-h-screen px-4 pb-32 pt-6 transition-colors duration-1000 relative overflow-hidden ${bgClass}`}>
      <div className="absolute inset-0 pattern-overlay opacity-20 pointer-events-none mix-blend-overlay" />

      {/* Header Utilities */}
      <header className="flex flex-col gap-4 relative z-10 mb-8 sm:flex-row sm:justify-between sm:items-center max-w-lg mx-auto">
        <div className="glass-panel-light p-2 rounded-[2rem] flex items-center gap-3 bg-white/40 backdrop-blur-md border border-white/60 pl-6 pr-2 py-2 shadow-xl animate-float">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg text-3xl border-4 border-white">
            {modeIcon}
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-cairo">
              {mode === "morning" && (isBoy ? `صباح الخير أيها البطل ${username}!` : `صباح الخير يا أيتها البطلة ${username}!`)}
              {mode === "evening" && (isBoy ? `مساء النور أيها البطل ${username}!` : `مساء النور يا أيتها البطلة ${username}!`)}
              {mode === "sleeping" && (isBoy ? `أذكار النوم أيها البطل ${username}!` : `أذكار النوم يا أيتها البطلة ${username}!`)}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-black text-2xl drop-shadow-sm">{points}</span>
              <span className={`text-xs font-bold ${isMorning ? "text-slate-600" : "text-slate-300"}`}>نقطة💎</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              window.open("https://t.me/bustan_athkar_bot", "_blank");
              alert("سيفتح لك التلغرام الآن.. اشترك في البوت لتصلك أذكار الصباح والمساء تلقائياً! 🔔✨");
            }}
            className="w-12 h-12 flex items-center justify-center bg-sky-100/50 backdrop-blur rounded-2xl hover:bg-sky-200 transition shadow-lg border-b-4 border-sky-300 active:border-b-0 active:translate-y-1"
          >
            <Send size={20} className="text-sky-600" />
          </button>
          <button onClick={() => { localStorage.clear(); router.push("/login"); }} className="w-12 h-12 flex items-center justify-center bg-red-100/50 backdrop-blur rounded-2xl hover:bg-red-200/50 transition shadow-lg border-b-4 border-red-200/50">
            <LogOut size={20} className="text-red-600" />
          </button>
        </div>
      </header>

      {/* Main Content Area (Tabs) */}
      <section className="w-full max-w-lg mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "garden" ? (
            <motion.div
              key="garden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GardenGrid points={points} purchasedFlowers={purchasedFlowers} onBuy={handleBuyFlower} gender={gender} />
            </motion.div>
          ) : (
            <motion.div
              key="dhikr"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {!selectedCategory ? (
                /* Category Selection Menu */
                <div className="grid grid-cols-1 gap-4 p-2">
                  <h2 className="text-2xl font-black text-center mb-4 font-cairo">اختر أذكارك اليومية ✨</h2>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory("morning")}
                    className="flex items-center gap-6 p-6 bg-gradient-to-r from-amber-200 to-orange-100 rounded-[2.5rem] shadow-lg border-4 border-white text-right"
                  >
                    <div className="text-5xl bg-white p-4 rounded-3xl shadow-sm">☀️</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-orange-900 font-cairo">أذكار الصباح</h3>
                      <p className="text-sm font-bold text-orange-700 font-cairo">ابدأ يومك بنشاط وبركة</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory("evening")}
                    className="flex items-center gap-6 p-6 bg-gradient-to-r from-indigo-200 to-purple-100 rounded-[2.5rem] shadow-lg border-4 border-white text-right"
                  >
                    <div className="text-5xl bg-white p-4 rounded-3xl shadow-sm">🌙</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-indigo-900 font-cairo">أذكار المساء</h3>
                      <p className="text-sm font-bold text-indigo-700 font-cairo">تحصين وراحة لنفسك</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory("sleeping")}
                    className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-300 to-indigo-100 rounded-[2.5rem] shadow-lg border-4 border-white text-right"
                  >
                    <div className="text-5xl bg-white p-4 rounded-3xl shadow-sm">⭐</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-slate-900 font-cairo">أذكار النوم</h3>
                      <p className="text-sm font-bold text-slate-700 font-cairo">نوم هادئ وأحلام سعيدة</p>
                    </div>
                  </motion.button>
                </div>
              ) : (
                /* Selected Dhikr List */
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="bg-white/40 p-3 rounded-2xl border border-white/60 font-bold font-cairo text-sm hover:bg-white/60 transition-all flex items-center gap-2"
                    >
                      <ArrowRight size={18} /> العودة للقائمة
                    </button>
                    <h2 className="text-xl font-black font-cairo">
                      {selectedCategory === "morning" ? "أذكار الصباح" : selectedCategory === "evening" ? "أذكار المساء" : "أذكار النوم"}
                    </h2>
                  </div>
                  <div className="space-y-6 pb-10">
                    {filteredDhikr.map((dhikr) => (
                      <DhikrCard
                        key={dhikr.id}
                        {...dhikr}
                        onComplete={handleDhikrComplete}
                        isAlreadyCompleted={completedIds.includes(dhikr.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Completion Modal & Welcome Modal Same ... */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-8 max-w-md w-full text-center border-8 border-green-100">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl shadow-inner">🏆</div>
              <h2 className="text-4xl font-black text-slate-800 mb-4 font-cairo">أحسنت يا {isBoy ? "بطل" : "بطلة"} {username}!</h2>
              <p className="text-xl text-slate-600 mb-8 font-medium font-cairo">
                {isBoy ? "واصل يا بطل، أنت رائع" : "واصلي يا بطلة، أنتِ رائعة"}! لقد أكملت جميع الأذكار.
                <br /><br />
                <span className="text-3xl text-amber-500 font-black">إنجاز رائع! 💎</span>
              </p>
              <button onClick={() => setShowSummary(false)} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-xl shadow-xl hover:bg-slate-900 active:scale-95">رائع! 🚀</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WelcomeModal purchasedFlowers={purchasedFlowers} isBoy={isBoy} name={username} />

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-md glass-panel rounded-full p-2 flex justify-around z-50 shadow-2xl border border-white/60 bg-white/70 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab("dhikr")}
          className={`flex flex-col items-center gap-1 p-3 rounded-3xl w-full transition-all font-bold font-cairo ${activeTab === "dhikr" ? "bg-indigo-100 text-indigo-600 scale-105" : "text-slate-400"}`}
        >
          <CheckCircle2 size={24} />
          <span>الأذكار</span>
        </button>
        <button
          onClick={() => setActiveTab("garden")}
          className={`flex flex-col items-center gap-1 p-3 rounded-3xl w-full transition-all font-bold font-cairo ${activeTab === "garden" ? "bg-green-100 text-green-600 scale-105" : "text-slate-400"}`}
        >
          <Flower size={24} />
          <span>البستان</span>
        </button>
      </nav>
    </main>
  );
}

function WelcomeModal({ purchasedFlowers, isBoy, name }: { purchasedFlowers: any[], isBoy: boolean, name: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("seenWelcome");
    if (!hasSeenWelcome) setShow(true);
  }, []);
  const handleClose = () => {
    localStorage.setItem("seenWelcome", "true");
    setShow(false);
  };
  if (!show) return null;
  const isEmpty = purchasedFlowers.length === 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center border-4 border-emerald-100 shadow-2xl relative overflow-hidden font-cairo">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-emerald-100 to-transparent opacity-50" />
        <div className="relative z-10">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl shadow-inner animate-bounce text-slate-800 font-bold">🦊</div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">أهلاً يا {name}!</h2>
          <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed">
            {isEmpty ? (
              <>{isBoy ? "واصل يا بطل، بستانك الجميل فارغ حالياً.. انزل للأسفل واقرأ الأذكار لتجمع النقاط! 🌱🌷" : "واصلي يا بطلة، بستانك الجميل فارغ حالياً.. انزلي للأسفل و اقرئي الأذكار لتجمعي النقاط! 🌱🌷"}</>
            ) : (
              <>{isBoy ? "واصل يا بطل، بستانك الجميل ينتظر المزيد من الرعاية. ✨" : "واصلي يا بطلة، بستانك الجميل ينتظر المزيد من الرعاية. ✨"}</>
            )}
          </p>
          <button onClick={handleClose} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-xl shadow-lg">فهمت! هيا بنا 🚀</button>
        </div>
      </motion.div>
    </div>
  );
}
