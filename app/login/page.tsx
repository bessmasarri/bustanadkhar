"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { User, Lock, Phone, ArrowRight, Star, AlertTriangle } from "lucide-react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState<"boy" | "girl">("boy");
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [envError, setEnvError] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [registeredUser, setRegisteredUser] = useState<{ id: string, username: string, gender: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if env vars are loaded
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || url.includes("xyzcompany") || !key || key === "public-anon-key") {
            setEnvError(true);
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (password.length < 4) {
            alert("رقم السر قصير جداً! يا بطل، يجب أن يكون 4 أرقام على الأقل ليكون بستانك آمناً 🛡️");
            return;
        }

        if (isRegistering && phone.length > 0 && phone.length < 8) {
            console.warn("Short phone number, continuing anyway...");
        }

        console.log(`Starting ${isRegistering ? "Registration" : "Login"} for:`, username);
        setLoading(true);

        try {
            if (isRegistering) {
                // REGISTER FLOW
                const { data: existingUser, error: checkError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("username", username)
                    .maybeSingle();

                if (checkError) throw checkError;

                if (existingUser) {
                    alert("يا بطل، هذا الاسم محجوز لبستان آخر! اختر اسماً جديداً ومميزاً لك 🌸");
                    setLoading(false);
                    return;
                }

                const { data: newUser, error: createError } = await supabase
                    .from("users")
                    .insert([{ username, password, phone: phone || null, gender }])
                    .select()
                    .single();

                if (createError) throw createError;

                // Initialize garden
                const { error: gardenError } = await supabase.from("garden").insert([{ user_id: newUser.id, points: 0 }]);
                if (gardenError) console.error("Garden creation error:", gardenError);

                // Instead of redirecting, show the password modal
                setRegisteredUser({ id: newUser.id, username, gender });
                setShowPasswordModal(true);

            } else {
                // LOGIN FLOW
                const { data: user, error: loginError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("username", username)
                    .maybeSingle();

                if (loginError) throw loginError;

                if (!user) {
                    alert("لم نجد بستاناً بهذا الاسم.. تأكد من كتابة اسمك بشكل صحيح يا بطل! 🤔");
                    setLoading(false);
                    return;
                }

                if (user.password !== password) {
                    alert("رقم السر غير صحيح! حاول مرة أخرى بتركيز، أنت تستطيع 🛑");
                    setLoading(false);
                    return;
                }

                localStorage.setItem("userId", user.id);
                localStorage.setItem("username", user.username);
                localStorage.setItem("gender", user.gender || "boy");
                router.push("/");
            }

        } catch (error: any) {
            console.error("Full Auth Error:", JSON.stringify(error, null, 2));
            const errorMsg = error?.message || error?.details || JSON.stringify(error);

            if (error?.code === "42P01") {
                alert("⚠️ خطأ في التواصل مع البستان (الجداول غير موجودة).");
            } else {
                alert(`حدث خطأ غير متوقع: ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmRegistration = () => {
        if (!registeredUser) return;
        localStorage.setItem("userId", registeredUser.id);
        localStorage.setItem("username", registeredUser.username);
        localStorage.setItem("gender", registeredUser.gender);
        router.push("/");
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#e0f2fe] overflow-hidden font-cairo">
            {/* Same background Blobs as before */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute top-40 -left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />
            <motion.div
                animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
                transition={{ duration: 18, repeat: Infinity }}
                className="absolute -bottom-20 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />

            <div className="relative z-10 w-full max-w-6xl h-full min-h-screen flex flex-col md:flex-row items-center justify-center p-4 md:p-8">

                {/* Left Side (Mascot) */}
                <div className="hidden md:flex flex-col items-start justify-center w-full md:w-1/2 p-4 lg:p-12 text-right">
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-800 mb-6 leading-tight">
                            بستان <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-green-500 to-teal-400">
                                الأذكار
                            </span>
                        </h1>
                        <p className="text-lg lg:text-2xl text-slate-600 mb-8 font-medium leading-relaxed max-w-md">
                            رحلة ممتعة لقراءة الأذكار وكسب<br />الورود في بستانك الخاص!
                        </p>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-56 h-56 lg:w-72 lg:h-72"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-500 rounded-[3rem] rotate-6 shadow-2xl opacity-80" />
                        <div className="absolute inset-0 bg-white rounded-[3rem] shadow-xl flex items-center justify-center text-7xl lg:text-9xl border-4 border-green-100">
                            🦊
                        </div>
                    </motion.div>
                </div>

                {/* Right Side (Form) */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full md:w-1/2 lg:w-1/3 max-w-md bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 md:p-10 relative overflow-hidden my-auto"
                >
                    {envError && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-bold flex flex-col gap-2 shadow-sm">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} />
                                <span>خطأ في الإعدادات (.env.local)</span>
                            </div>
                            <p className="font-normal text-xs leading-relaxed">
                                ملف التحميل لا يحتوي على بيانات Supabase الصحيحة.
                                تأكد من وضع URL و API Key في ملف .env.local
                            </p>
                        </div>
                    )}

                    <div className="text-center mb-6 md:mb-8">
                        <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm mb-2">
                            {isRegistering ? "حساب جديد ✨" : "تسجيل الدخول 👋"}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                            {isRegistering ? "انضم للمغامرة" : "مرحباً يا صديقي"}
                        </h2>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4 md:space-y-5">
                        <div className="space-y-3 md:space-y-4">
                            {/* Gender Picker (Register only) */}
                            {isRegistering && (
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm font-bold text-slate-500 text-center mb-1">هل أنت ولد أم بنت؟ ✨</p>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setGender("boy")}
                                            className={`flex-1 p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 font-black ${gender === "boy" ? "border-sky-400 bg-sky-50 text-sky-700 shadow-lg scale-105" : "border-slate-50 bg-white/50 text-slate-400"}`}
                                        >
                                            <span className="text-4xl">👦</span>
                                            <span className="text-lg">ولد</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setGender("girl")}
                                            className={`flex-1 p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 font-black ${gender === "girl" ? "border-pink-400 bg-pink-50 text-pink-700 shadow-lg scale-105" : "border-slate-50 bg-white/50 text-slate-400"}`}
                                        >
                                            <span className="text-4xl">👧</span>
                                            <span className="text-lg">بنت</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 transition-colors focus-within:border-green-400 focus-within:ring-4 focus-within:ring-green-100">
                                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={gender === "boy" ? "اسمك يا بطل" : "اسمك يا بطلة"}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-transparent outline-none text-right font-bold text-slate-700 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 transition-colors focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                                <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="كلمة السر الخاصة بك"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent outline-none text-right font-bold text-slate-700 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            {isRegistering && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 transition-colors focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100"
                                >
                                    <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                                        <Phone size={20} />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="رقم الهاتف (اختياري لاسترجاع الحساب)"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-transparent outline-none text-right font-bold text-slate-700 placeholder:text-slate-400"
                                    />
                                </motion.div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-black py-4 rounded-2xl text-xl shadow-xl shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isRegistering ? "هيا بنا لنبدأ!" : "دخول للبستان"}</span>
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
                            >
                                {isRegistering ? "عندي حساب بالفعل.. تسجيل دخول" : "أنا بطل جديد.. إنشاء حساب"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Password Reveal Modal */}
            {showPasswordModal && registeredUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[3rem] p-8 max-w-md w-full text-center border-8 border-green-100 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-transparent opacity-50" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner animate-bounce">
                                🎉
                            </div>

                            <h2 className="text-3xl font-black text-slate-800 mb-2">مرحباً بك يا {registeredUser.username}!</h2>
                            <p className="text-lg text-slate-600 mb-8 font-bold">هذا هو رقمك السري، تذكره جيداً أو دونه في ورقة لتستطيع الدخول دائماً:</p>

                            <div className="bg-slate-50 p-6 rounded-[2rem] border-4 border-dashed border-green-200 mb-8">
                                <span className="text-5xl font-black text-green-600 tracking-widest">{password}</span>
                            </div>

                            <button
                                onClick={confirmRegistration}
                                className="w-full bg-slate-800 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                            >
                                <Star className="text-yellow-400 fill-yellow-400" />
                                <span>حفظته ودونته في ورقة! 🚀</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
