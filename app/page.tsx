"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Palette, 
  FileText, 
  Layout, 
  Coffee, 
  GraduationCap, 
  Bookmark, 
  PartyPopper,
  Instagram,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Relatable topic starters for students
const TOPIC_STARTERS = [
  {
    icon: "💰",
    title: "Danusan Dessert Box",
    org: "Kepanitiaan / Danus",
    topic: "Danusan jualan brownies dessert box premium & makaroni pedas gurih buat nambah dana operasional proker",
    keywords: "lancar jaya, menyala abangku, danus super"
  },
  {
    icon: "📢",
    title: "Oprec Panitia Seminar HIMA",
    org: "HIMA",
    topic: "Pendaftaran panitia (Open Recruitment) untuk Seminar Nasional Teknologi Masa Depan HIMA Informatika",
    keywords: "ambis, maba, kuy gabung"
  },
  {
    icon: "📚",
    title: "KRS Lancar & Terhindar Kelas Pagi",
    org: "Mahasiswa Umum",
    topic: "Tips jitu nyusun KRS biar server siakad gak crash dan tidak dapet kelas subuh jam 7 pagi",
    keywords: "anti-revisi, KRS lancar"
  },
  {
    icon: "🗑️",
    title: "Kampanye Kantin Bebas Plastik",
    org: "BEM",
    topic: "BEM mengajak mahasiswa bawa tumbler & kotak makan sendiri ke kantin kampus demi kurangi sampah plastik",
    keywords: "anak senja, bumi sehat, maba"
  },
  {
    icon: "🤝",
    title: "Oprec Anggota Baru UKM Musik",
    org: "UKM",
    topic: "Oprec anggota UKM musik kampus: wadah asik buat yang hobi nyanyi, main band, atau belajar sound system",
    keywords: "lancar jaya, menyala abangku"
  },
  {
    icon: "🎓",
    title: "Strategi Menghadapi Dosbing Killer",
    org: "Mahasiswa Umum",
    topic: "Strategi jitu nge-chat & bimbingan skripsi dengan dosen pembimbing super pelit nilai biar cepet di-acc",
    keywords: "anti-revisi, dosbing"
  }
];

// Trendy predefined student tags
const POPULAR_TAGS = [
  "menyala abangku",
  "lancar jaya",
  "anak senja",
  "ambis",
  "dosbing",
  "fokus proker",
  "maba",
  "danusan",
  "anti-revisi",
  "ipk idaman"
];

// Humorous loading messages related to campus life
const LOADING_MESSAGES = [
  "Sedang merundingkan konsep dengan seluruh jajaran menteri KampusKreatif AI...",
  "Konsultasi kilat ke Dosen Pembimbing AI tingkat dewa agar ide di-ACC...",
  "Lagi ngitung potensi omset jualan danus biar gak rugi bandar...",
  "Menyeduh kopi sachet tipis-tipis biar idenya makin encer...",
  "Mencari kombinasi warna pastel ter-senja dan estetik se-fakultas...",
  "Memilah kalimat slang maba biar kontennya ga kaku kayak dosen senior...",
  "Menyelaraskan frekuensi kreatifitas mahasiswa masa kini... Stay tuned!"
];

interface CaptionOption {
  nomor: number;
  pendekatan: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}

interface ContentIdea {
  judul: string;
  formatVisual: string;
  arahanDesain: string;
  paletWarna: {
    nama: string;
    hex: string;
  }[];
  draftCaption: string;
}

interface GenerationResult {
  requestType: "caption" | "concept" | "both";
  captionOptions?: CaptionOption[];
  contentIdeas?: ContentIdea[];
  tipsDesign?: string[];
  reviewKreatif: string;
}

// Helper to deduce platform limitations and requirements
const getPlatformDetails = (currentPlatform: string) => {
  const p = currentPlatform.toLowerCase();
  if (p.includes("reels") || p.includes("tiktok")) {
    return { max: 2200, ideal: 150, name: "Instagram Reels & TikTok" };
  } else if (p.includes("whatsapp") || p.includes("story")) {
    return { max: 700, ideal: 250, name: "WhatsApp Story" };
  } else if (p.includes("twitter") || p.includes("x")) {
    return { max: 280, ideal: 280, name: "Twitter/X Post" };
  } else {
    // Instagram Feed/Carousel
    return { max: 2200, ideal: 1500, name: "Instagram Feed/Carousel" };
  }
};

export default function Home() {
  // Form State
  const [orgType, setOrgType] = useState<string>("BEM");
  const [topic, setTopic] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [visualStyle, setVisualStyle] = useState<string>("🌸 Trendy & Playful");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [requestType, setRequestType] = useState<"caption" | "concept" | "both">("both");
  const [platform, setPlatform] = useState<string>("Instagram Feed/Reels");

  // Interaction State
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1); // For generated captions tab

  // Result state (Pre-filled with helper moodboard state for absolute visual polish)
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Dynamic interactive editor, color customizer & validation states
  const [customCardBg, setCustomCardBg] = useState<string>("");
  const [editedText, setEditedText] = useState<string>("");
  const [editorMode, setEditorMode] = useState<"view" | "edit">("view");

  const handleSelectTab = (nomor: number, customResult?: GenerationResult) => {
    setActiveTab(nomor);
    const targetResult = customResult || result;
    if (targetResult?.captionOptions) {
      const activeOpt = targetResult.captionOptions.find(o => o.nomor === nomor);
      if (activeOpt) {
        setEditedText(`${activeOpt.hook}\n\n${activeOpt.body}\n\n${activeOpt.cta}\n\n${activeOpt.hashtags.join(" ")}`);
      }
    }
  };

  // Auto-rotate loading messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Click-to-copy utility
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`Berhasil disalin: ${label}! 📋`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectStarter = (starter: typeof TOPIC_STARTERS[0]) => {
    setOrgType(starter.org);
    setTopic(starter.topic);
    setKeywords(starter.keywords);
    
    // Smooth scroll to form
    const element = document.getElementById("form-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddTag = (tag: string) => {
    if (keywords.includes(tag)) return;
    setKeywords(prev => prev ? `${prev}, ${tag}` : tag);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || topic.trim() === '') {
      setError("Isi dulu kolom topik atau ide proker kamu ya!");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingMsgIdx(0);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgType,
          topic,
          keywords,
          visualStyle,
          userPrompt,
          requestType,
          platform
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungi KampusKreatif AI.");
      }

      setResult(data);
      setCustomCardBg("");
      handleSelectTab(1, data);
      
      // Smooth scroll to result
      setTimeout(() => {
        const resultElement = document.getElementById("result-section");
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);

    } catch (err: any) {
      setError(err.message || "Waduh, koneksi ke siakad AI lagi bermasalah. Coba sekali lagi ya!");
    } finally {
      setLoading(false);
    }
  };

  // Pre-seed creative moodboard example when application launches first time
  const demoSeed = () => {
    const seedResult: GenerationResult = {
      requestType: "both",
      captionOptions: [
        {
          nomor: 1,
          pendekatan: "Humoris & Relatable (Mahasiswa Banget)",
          hook: "⚠️ STOP SCROLLING! Kas proker kamu udah setipis harapan dosbing buat buru-buru acc judul? 💸",
          body: "Tenang brosist! Solusi instan penyelamat kas ada di sini. Kenalin nih 'Danus Brownies Lumerrr' yang manisnya melebihi janji manis pacar waktu pacaran di gazebo rektorat. Cuma 15k udah dapet kebahagiaan hakiki penenang KRS stres!",
          cta: "Yuk lgsg pre-order di link bio kita ya sebelum kehabisan! Support proker kita biar terlaksana lancar jaya abangku! 🔥🚀",
          hashtags: ["#DanusLancarJaya", "#MenyalaAbangku", "#BrowniesLumer", "#StudentLifeGokil"]
        },
        {
          nomor: 2,
          pendekatan: "Interaktif / Tantangan Mahasiswa",
          hook: "🔥 Tantangan buat kamu yang seharian habis energi bantai revisian dari pagi sampai senja!",
          body: "Butuh asupan glukosa biar otak gak nge-crash? Makaroni Pedas & Dessert Box premium dari divisi Danus Seni siap menemani sisa hari kamu dengan rasa yang gurih renyah nan meledak-ledak!",
          cta: "Ketik 'MAU PARAH' di kolom komentar, ntar admin meluncur bawain list varian rasa ter-kece kampus!",
          hashtags: ["#NgedanusTerus", "#AmbisSkripsi", "#SiakadLancar", "#KantinKampus"]
        },
        {
          nomor: 3,
          pendekatan: "Inspiratif & Bangga Berorganisasi",
          hook: "✨ Sedikit demi sedikit, langkah kecil kita hari ini menentukan suksesnya Proker Terbesar Tahun Ini! Bener gak?",
          body: "Support perjuangan divisi Dana Usaha HIMA lewat jualan Makaroni & Dessert Box premium. Setiap gigitan manis dan gurihnya murni didedikasikan untuk mensponsori acara Seminar Nasional kita nanti!",
          cta: "Buruan serbu form pemesanannya di link bio. Bersama kita sukseskan proker estetik kita tahun ini! 🤝🌸",
          hashtags: ["#HIMAKreatif", "#DanusanBakti", "#KreatifMuda", "#MahasiswaMenyala"]
        }
      ],
      contentIdeas: [
        {
          judul: "Bongkar Rahasia Pertahanan Kas Proker Tetap Menyala 🔥",
          formatVisual: "Carousel (6 Slides)",
          arahanDesain: "Desain slider yang menggemaskan dengan tipografi yang bold tapi soft. Slide pertama menampilkan visual kartun/emoji dessert box gemoy yang melayang. Gunakan background bertekstur kertas tipis dengan grid garis-garis estetik. Di slide-slide berikutnya, gunakan panah soft pastel mengarahkan fokus teks ke detail menu makanan secara bersih dan lapang.",
          paletWarna: [
            { nama: "Milky Peach", hex: "#FFE5D9" },
            { nama: "Soft Lilac", "hex": "#D8B4E2" },
            { nama: "Mint Green", "hex": "#B5EAD7" },
            { nama: "Warm Vanilla", "hex": "#FBE7C6" }
          ],
          draftCaption: "Gak usah pusing mikirin kas proker seret! Ini dia jurus rahasia kita bertahan hidup demi jalannya event kampus ter-kece se-fakultas. Swipe left buat liat menu gemoy kita! 🍩🌸"
        }
      ],
      tipsDesign: [
        "Gunakan font Sans-Serif yang ramah anak muda seperti 'Plus Jakarta Sans' atau 'Outfit' untuk judul gambar, dipadukan dengan coretan coretan tangan (hand-drawn elements) agar terasa lebih humanis & ramah maba.",
        "Gunakan kontras yang pas antara teks dengan warna pastel di background. Atur opasitas bayangan (box shadow) sangat tipis agar visual tetap terasa soft, tidak terlalu brutalist.",
        "Visual produk jangan kaku! Foto produk dessert box kamu mending ditaro miring atau ditumpuk dengan efek crop lingkaran mulus (rounded clipping) biar makin kekinian."
      ],
      reviewKreatif: "Wih, ide asik bgt ini abangku! Topik jualan danus brownies bener-bener jadi penyelamat proker yang anti-revisi. Sebagai Art Director kamu hari ini, aku saranin pake Palet Milky Peach (#FFE5D9) dikombinasiin sama Soft Lilac (#D8B4E2) biar feeds Instagram kamu keliatan asik, estetik, dan pastinya auto dirubung pembeli. Tetap menyala, lancar jaya prokernya ya! 🪄✨🚀"
    };

    setResult(seedResult);
    setCustomCardBg("");
    handleSelectTab(1, seedResult);
    
    // Scroll smoothly to seed visual
    setTimeout(() => {
      const resultElement = document.getElementById("result-section");
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[250px] -left-[200px] w-[600px] h-[600px] rounded-full bg-pink-100/40 blur-[130px]" />
        <div className="absolute -top-[200px] -right-[200px] w-[550px] h-[550px] rounded-full bg-blue-100/40 blur-[120px]" />
        <div className="absolute top-[350px] left-[15%] w-[450px] h-[450px] rounded-full bg-purple-100/30 blur-[100px]" />
      </div>

      {/* Modern Header Nav */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between border-b border-stone-200/60 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-300 via-purple-300 to-teal-200 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-stone-800" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                KampusKreatif AI
              </span>
              <span className="block text-[10px] font-mono tracking-wider text-stone-500 uppercase">
                Social Media Strategist & Art Director
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm text-stone-600">
            <span className="flex items-center font-medium bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs">
              <Coffee className="w-3.5 h-3.5 mr-1 text-amber-600" /> Teman Setia Begadang Proker
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Short, Aesthetic Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-pink-50 border border-pink-100 text-pink-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              ✨ BEM | HIMA | UKM | Mahasiswa Umum
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight text-stone-800 leading-tight">
              Bikin Ide Konten & Copywriting Kampus <br/>
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent italic">
                Paling Estetik & Senja!
              </span>
            </h1>
            <p className="mt-4 text-base text-stone-600 leading-relaxed font-sans max-w-2xl mx-auto">
              Kesulitan mikirin copywriting caption BEM, proker HIMA, cari cuan danusan, atau feeds UKM? Tenang abangku! KampusKreatif AI bikinin copy interaktif dan rekomendasi palet warna modern pastel ter-acc!
            </p>
          </motion.div>
        </div>

        {/* TOPIC STARTERS (Inspirasi Cepat) */}
        <div className="mb-14">
          <div className="flex items-center space-x-2 mb-4">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Instan</span>
            <h3 className="font-display font-extrabold text-stone-800 text-lg">💡 Butuh Inspirasi Cepat? Pilih Template Proker Ini:</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPIC_STARTERS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectStarter(s)}
                className="group relative text-left bg-white border border-stone-200/80 p-5 rounded-2xl hover:border-pink-300 hover:shadow-md transition-all duration-300 pointer-events-auto cursor-pointer flex flex-col justify-between"
              >
                <div className="absolute top-4 right-4 text-xs font-mono text-stone-400 bg-stone-50 group-hover:bg-pink-50 group-hover:text-pink-600 px-2 py-0.5 rounded transition-colors">
                  {s.org}
                </div>
                <div>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h4 className="font-display font-bold text-stone-800 group-hover:text-pink-600 transition-colors">
                    {s.title}
                  </h4>
                  <p className="mt-2 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {s.topic}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center text-xs text-stone-400 group-hover:text-pink-600 transition-colors">
                  Gunakan template <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={demoSeed}
              className="inline-flex items-center text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 mr-1.5" /> Lihat Contoh Live Moodboard & Caption Demo Estetik
            </button>
          </div>
        </div>

        {/* INPUT FORM SECTION */}
        <div id="form-section" className="bg-white border-2 border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden mb-12">
          {/* Subtle design element */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-pink-300 via-purple-300 to-indigo-300" />
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-pink-600" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-stone-800 text-xl">Briefing KampusKreatif</h2>
              <p className="text-xs text-stone-500">Sesuaikan dengan event, danus, atau keluh kesah perkuliahanmu abangku!</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Role & Target & Style */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    1. Siapa Kamu / Organisasimu?
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {["BEM", "HIMA", "UKM", "Danus", "Mahasiswa"].map((role) => (
                      <button
                        type="button"
                        key={role}
                        onClick={() => setOrgType(role)}
                        className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                          orgType === role 
                            ? "bg-purple-600 border-purple-600 text-white shadow-sm font-bold scale-[1.03]" 
                            : "bg-white border-stone-200 text-stone-600 hover:border-purple-300"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    2. Pilih Mood Visual / Target Vibe
                  </label>
                  <select 
                    value={visualStyle} 
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-stone-800"
                  >
                    <option value="🌸 Trendy & Playful">🌸 Trendy & Playful (Desain Ceria, Soft, Dominan Pink/Lilac Pastel)</option>
                    <option value="🌿 Minimalist Aesthetic">🌿 Minimalist Aesthetic (Tenang, Senja, Rapi, Cream/Sage/Beige)</option>
                    <option value="⚡ Bold & Retro">⚡ Bold & Retro (Energetik, Nostalgik, Sedikit Brutalist Soft Pastel)</option>
                    <option value="🧠 Edukatif & Informasional">🧠 Edukatif & Informasional (Infografis, Bersih, Biru Pastel/Teal Soft)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    3. Target Platform Media Sosial
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Instagram Feed/Carousel",
                      "Instagram Reels & TikTok",
                      "WhatsApp Story / Line Square",
                      "Twitter/X Thread"
                    ].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`py-2.5 px-3 text-[11px] font-medium rounded-xl border transition-all text-left flex items-center space-x-2 cursor-pointer ${
                          platform === p 
                            ? "bg-stone-800 border-stone-800 text-white font-bold" 
                            : "bg-white border-stone-200 text-stone-600 hover:border-neutral-300"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${platform === p ? "bg-teal-300" : "bg-stone-300"}`} />
                        <span className="truncate">{p}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    4. output Kreatif yang Kamu Butuhkan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { key: "caption", label: "📝 Caption Saja", desc: "3 Pilihan Caption" },
                      { key: "concept", label: "🎨 Ide Desain Saja", desc: "Warna & Kunci Visual" },
                      { key: "both", label: "📦 Paket Lengkap", desc: "Caption & Ide Desain" }
                    ].map((type) => (
                      <button
                        type="button"
                        key={type.key}
                        onClick={() => setRequestType(type.key as any)}
                        className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                          requestType === type.key 
                            ? "bg-teal-50 border-teal-400 text-teal-900 shadow-sm" 
                            : "bg-white border-stone-200 text-stone-500 hover:border-teal-200"
                        }`}
                      >
                        <span className={`text-xs font-extrabold ${requestType === type.key ? "text-teal-800" : "text-stone-700"}`}>
                          {type.label}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-1 block group-hover:block uppercase font-mono">
                          {type.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Topic Description, Slang Chips, Additional Prompts */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    5. Jelaskan Detail Acara / Proker / Jualanmu <span className="text-pink-500">*</span>
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={4}
                    required
                    placeholder="cth: Kepanitiaan lagi butuh danus gede dengan jualan desert box brownies, ato info seminar HIMA tentang pemrograman machine learning maba..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-stone-800 placeholder-stone-400 font-sans leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      6. Kata Kunci Kampus / Slang Populer
                    </label>
                    <span className="text-[10px] text-purple-600 font-medium">Klik untuk tambah</span>
                  </div>
                  
                  {/* Smart auto chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-[75px] overflow-y-auto p-1 bg-stone-50 rounded-lg border border-stone-100">
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="text-[10px] bg-white text-stone-600 border border-stone-200 hover:border-purple-300 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer inline-flex items-center"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Warna-warni slang atau keyword khusus dipisah koma (cth: maba gokil, anti-revisi, senja)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-stone-800 placeholder-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    7. Catatan Tambahan Dari Kamu (Opsional)
                  </label>
                  <input
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="cth: Tolong buat hooks yang sangat bombastis / perbanyak emoji / dll."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-stone-800 placeholder-stone-400"
                  />
                </div>
              </div>

            </div>

            {/* Error Message banner */}
            {error && (
              <div id="error-banner" className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs text-red-600 flex items-start space-x-2">
                <span className="font-bold">Error:</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit & Generate buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-500 space-y-1">
                <div className="flex items-center space-x-2">
                  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>Generasi utama menggunakan model cerdas <strong>gemini-3.5-flash</strong></span>
                </div>
                <p className="text-[11px] text-purple-600 font-medium">
                  💡 <strong>Bebas Hambatan:</strong> Dilengkapi deteksi kegagalan otomatis. Jika server cloud sibuk atau dibatasi, sistem langsung mengaktifkan <em>Mode Kreatif Lokal Instan</em> agar proker kamu berjalan lancar jaya!
                </p>
              </div>
              
              <div className="flex space-x-3 w-full sm:w-auto">
                {result && (
                  <button
                    type="button"
                    onClick={() => {
                      setTopic("");
                      setKeywords("");
                      setUserPrompt("");
                      setResult(null);
                    }}
                    className="flex-1 sm:flex-none border border-stone-300 text-stone-700 bg-stone-50 hover:bg-stone-100 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 sm:flex-none bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto cursor-pointer"
                >
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                  <span>{loading ? "Menyusun Idenya..." : "Ramu Konsep Kreatif!"}</span>
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* LOADING SCREEN POPUP */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white border-2 border-stone-850 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
              >
                <div className="relative mx-auto w-20 h-20">
                  {/* Nested spinning circles */}
                  <div className="absolute inset-0 border-4 border-pink-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-pink-500 border-r-purple-500 rounded-full animate-spin" />
                  <div className="absolute top-[18px] left-[18px] w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center animate-pulse">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-black text-stone-800 text-lg">🪄 Sedang Diracik Kreatif...</h3>
                  <p className="text-xs text-stone-400 font-mono tracking-wider uppercase">KampusKreatif AI Pro-Director</p>
                </div>

                <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl min-h-[72px] flex items-center justify-center">
                  <motion.p 
                    key={loadingMsgIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs font-sans text-stone-600 leading-relaxed italic"
                  >
                    &ldquo;{LOADING_MESSAGES[loadingMsgIdx]}&rdquo;
                  </motion.p>
                </div>

                <div className="text-[10px] text-stone-400">
                  Tolong jangan ditutup ya abangku, racikan terbaik butuh konsentrasi!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RECENT NOTIFICATION TOAST */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-xs border border-stone-700"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-stone-900 font-bold">
                ✓
              </div>
              <span className="font-medium">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS SECTION */}
        <div id="result-section">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              
              {/* Review & Chat Header Persona */}
              <div className="bg-gradient-to-tr from-[#FFF5F5] to-[#F3F0FF] border border-pink-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-sm from-pink-300/10 to-transparent rounded-full pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center shadow">
                      <span className="text-xl">🪄</span>
                    </div>
                    <div>
                      <h3 className="font-display font-black text-stone-850 text-base">Wejangan & Review Art Director KampusKreatif AI</h3>
                      <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Status: Kurasi Desain & Copywriting Berhasil di-ACC! 🎉</p>
                    </div>
                  </div>
                  <div className="text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-200 px-3 py-1 rounded-full">
                    {orgType} Mode
                  </div>
                </div>

                <div className="mt-4 bg-white/90 border border-stone-150 p-4 sm:p-5 rounded-2xl">
                  <p className="text-sm text-stone-700 leading-relaxed font-sans prose-stone text-justify">
                    {result.reviewKreatif}
                  </p>
                </div>
              </div>

              {/* Grid 2-Column: Left (Visual Direction & Color palette), Right (Copywriting Option details) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual Concept (4 cols on wide screens) */}
                {(result.requestType === "concept" || result.requestType === "both") && result.contentIdeas && result.contentIdeas.length > 0 ? (
                  <div className="lg:col-span-5 space-y-6">
                    {result.contentIdeas.map((idea, ideaIdx) => {
                      // Grab colors or provide default pastel range as fallback safely
                      const colors = idea.paletWarna || [
                        { nama: "Lilac Sweet", hex: "#D8B4E2" },
                        { nama: "Sage Soft", hex: "#B5EAD7" },
                        { nama: "Sun Peach", hex: "#FFDAC1" },
                        { nama: "Pink Milk", hex: "#FFB7B2" }
                      ];
                      
                      const mainPastelBg = colors[0]?.hex || "#FFE5D9";
                      const secondPastelBg = colors[1]?.hex || "#D8B4E2";

                      return (
                        <div key={ideaIdx} className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-sm space-y-5">
                          
                          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2">
                              <Palette className="w-4 h-4 text-pink-500" />
                              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Aesthetic Visual Card Mockup</span>
                            </div>
                            <span className="bg-stone-100 text-stone-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                              {idea.formatVisual}
                            </span>
                          </div>

                          {/* Interactive Mockup Preview Box */}
                          <div 
                            style={{ backgroundColor: customCardBg || mainPastelBg }} 
                            className="relative w-full rounded-2xl min-h-[300px] p-6 flex flex-col justify-between overflow-hidden shadow-inner transition-all duration-300 transform hover:scale-[1.01]"
                          >
                            {/* Visual design fluff background bubbles */}
                            <div className="absolute top-10 right-10 w-24 h-24 rounded-full opacity-35 mix-blend-multiply blur-xl animate-pulse" style={{ backgroundColor: secondPastelBg }} />
                            <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full opacity-25 mix-blend-multiply blur-xl" style={{ backgroundColor: colors[2]?.hex || "#B5EAD7" }} />

                            {/* Header grid design */}
                            <div className="flex items-center justify-between z-10">
                              <div className="flex items-center space-x-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-stone-800" />
                                <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
                                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                              </div>
                              <span className="text-[9px] font-mono tracking-wider font-extrabold uppercase bg-stone-900/10 text-stone-900/70 px-2 py-0.5 rounded-full">
                                carousel.psd
                              </span>
                            </div>

                            {/* Center Main Text */}
                            <div className="my-8 text-center z-10 px-2">
                              <h4 className="font-display font-extrabold text-stone-900 text-xl sm:text-2xl tracking-normal leading-tight">
                                {idea.judul || "Judul Kreatif Di Sini"}
                              </h4>
                              <p className="text-[10px] font-mono font-semibold tracking-wider text-stone-700/80 uppercase mt-3">
                                ✨ Powered by {orgType} Visual Strategist ✨
                              </p>
                            </div>

                            {/* Bottom aesthetic footer inside Mockup */}
                            <div className="flex justify-between items-center z-10 pt-4 border-t border-stone-900/10 text-stone-850">
                              <div className="text-[10px] uppercase font-mono tracking-widest font-black flex items-center">
                                <span className="mr-1">🎀</span> {orgType} KREATIF
                              </div>
                              <div className="w-6 h-6 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center">
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>

                          {/* Palet Warna Section (Soft / Pastel Aesthetics) */}
                          <div className="space-y-2.5">
                            <span className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                              🎨 Rekomendasi Palet Warna (Pasti Soft Pastel):
                            </span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {colors.map((color, colorIdx) => (
                                <button
                                  key={colorIdx}
                                  onClick={() => {
                                    copyToClipboard(color.hex, color.nama);
                                    setCustomCardBg(color.hex);
                                  }}
                                  className="group flex items-center p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-150 transition-all text-left cursor-pointer pointer-events-auto"
                                >
                                  <div 
                                    style={{ backgroundColor: color.hex }} 
                                    className="w-10 h-10 rounded-lg shadow-sm mr-2.5 border border-stone-200/50 flex-shrink-0"
                                  />
                                  <div className="truncate pr-1">
                                    <span className="block text-xs font-bold text-stone-800 tracking-tight truncate">
                                      {color.nama}
                                    </span>
                                    <span className="block text-[10px] font-mono text-stone-500 uppercase">
                                      {color.hex}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <span className="block text-[10px] text-center text-stone-400 font-medium">Tips: Klik warna untuk salin HEX & ubah background mockup di atas! 🎨</span>
                          </div>

                          {/* Design instructions */}
                          <div className="space-y-2 bg-stone-50/70 border border-stone-100 p-4 rounded-2xl">
                            <h5 className="text-xs font-bold text-stone-700 flex items-center">
                              <Bookmark className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                              Arahan Layout Gambar & Visual:
                            </h5>
                            <p className="text-xs text-stone-600 leading-relaxed text-justify font-sans">
                              {idea.arahanDesain}
                            </p>
                          </div>

                          {/* Quick visual caption sync block */}
                          <div className="pt-2">
                            <span className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                              📌 Ide Teaser Caption Singkat:
                            </span>
                            <div className="bg-gradient-to-r from-teal-50/40 to-[#F6F4FF]/40 border border-stone-150 p-3 rounded-xl">
                              <p className="text-xs text-stone-600 font-sans leading-relaxed italic">
                                &ldquo;{idea.draftCaption}&rdquo;
                              </p>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Empty or Placeholder state for visual concept column (to look gorgeous even if requestType is only captions)
                  <div className="lg:col-span-5 bg-stone-50 border-2 border-dashed border-stone-300 p-6 rounded-3xl text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-lg text-stone-400">
                      🎨
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-black text-stone-800 text-sm">Mode Desain Dinonaktifkan</h4>
                      <p className="text-xs text-stone-400 max-w-xs mx-auto">
                        Kamu memilih opsi &quot;Caption Saja&quot;. Hasil palet warna, layout desain visual, dan infografis estetik tidak diderifikasi.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRequestType("both");
                        handleSubmit({ preventDefault: () => {} } as any);
                      }}
                      className="text-xs text-purple-600 font-bold bg-white border border-stone-200 hover:border-purple-300 px-4 py-2 rounded-xl"
                    >
                      Buka Paket Lengkap Sekarang!
                    </button>
                  </div>
                )}

                {/* Copywriting Option details (8 cols if concept empty, else 7 cols) */}
                <div className={`${(result.requestType === "concept" || result.requestType === "both") && result.contentIdeas && result.contentIdeas.length > 0 ? "lg:col-span-7" : "lg:col-span-12"} space-y-6`}>
                  
                  {/* Copywriting Options Block */}
                  {result.captionOptions && result.captionOptions.length > 0 ? (
                    <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 shadow-sm space-y-5">
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Copywriting Pilihan Caption (3 Opsi Eksklusif)</span>
                        </div>
                      </div>

                      {/* Micro-tabs selectors for caption options */}
                      <div className="flex space-x-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-150/60">
                        {result.captionOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt.nomor}
                            onClick={() => handleSelectTab(opt.nomor)}
                            className={`flex-1 py-2.5 px-3 text-xs rounded-xl transition-all cursor-pointer ${
                              activeTab === opt.nomor
                                ? "bg-white text-stone-850 shadow-sm font-extrabold border-stone-200 border"
                                : "text-stone-500 hover:text-stone-800"
                            }`}
                          >
                            Opsi {opt.nomor}
                            <span className="hidden sm:inline block text-[9.5px] font-medium text-stone-400 ml-1 font-sans">
                              ({opt.pendekatan.split(' ')[0]})
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Displaying Current Copywriting Tab Detail */}
                      {result.captionOptions.map((opt) => {
                        if (opt.nomor !== activeTab) return null;
                        
                        // Assemble aggregate caption text for single copying click
                        const aggregateText = `${opt.hook}\n\n${opt.body}\n\n${opt.cta}\n\n${opt.hashtags.join(" ")}`;

                        return (
                          <div key={opt.nomor} className="space-y-4">
                            
                            <div className="flex justify-between items-center bg-purple-50 p-3 rounded-2xl border border-purple-100">
                              <div className="text-xs">
                                <span className="font-bold text-purple-800">Gaya Pendekatan: </span>
                                <span className="text-stone-700">{opt.pendekatan}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(aggregateText, `Caption Opsi ${opt.nomor}`)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition-colors shadow-sm active:scale-95 flex items-center cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 mr-1" /> Salin Utuh
                              </button>
                            </div>

                            {/* Segmented Controller: View and Edit */}
                            <div className="flex bg-stone-100 p-1 rounded-xl mb-4 text-xs max-w-[280px]">
                              <button 
                                type="button"
                                onClick={() => setEditorMode("view")}
                                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${editorMode === "view" ? "bg-white text-stone-850 shadow-sm" : "text-stone-500 hover:text-stone-850"}`}
                              >
                                🗺️ Hasil Kurasi Detail
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditorMode("edit")}
                                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${editorMode === "edit" ? "bg-white text-stone-850 shadow-sm" : "text-stone-500 hover:text-stone-850"}`}
                              >
                                ✍️ Tulis & Edit Langsung
                              </button>
                            </div>

                            {editorMode === "view" ? (
                              /* Section structure */
                              <div className="space-y-3 font-sans">
                                
                                {/* Hook element */}
                                <div className="space-y-1">
                                  <span className="inline-block bg-pink-50 border border-pink-100 text-pink-700 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                                    Hook (Stopping Power):
                                  </span>
                                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-sm text-stone-800 font-bold leading-relaxed">
                                    {opt.hook}
                                  </div>
                                </div>

                                {/* Body element */}
                                <div className="space-y-1">
                                  <span className="inline-block bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                                    Body (Konsep Pesan):
                                  </span>
                                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 text-sm text-stone-700 leading-relaxed font-sans text-justify bg-white">
                                    {opt.body}
                                  </div>
                                </div>

                                {/* CTA element */}
                                <div className="space-y-1">
                                  <span className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                                    Call to Action (CTA):
                                  </span>
                                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-sm text-stone-700 leading-relaxed">
                                    {opt.cta}
                                  </div>
                                </div>

                                {/* Hashtags element */}
                                <div className="space-y-1">
                                  <span className="inline-block bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                                    Hashtags yang Relevan:
                                  </span>
                                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs font-mono text-purple-600 font-semibold space-x-2">
                                    {opt.hashtags.map((h, hIdx) => (
                                      <span key={hIdx} className="hover:underline cursor-pointer">{h}</span>
                                    ))}
                                  </div>
                                </div>

                              </div>
                            ) : (
                              /* Sandbox Editor */
                              <div className="space-y-4 font-sans">
                                <div className="flex justify-between items-center bg-teal-50 border border-teal-150 p-3 rounded-xl">
                                  <div className="text-xs text-teal-800 font-semibold">
                                    Platform aktif: {getPlatformDetails(platform).name}
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(editedText, "Hasil Custom Edit")}
                                    className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center cursor-pointer font-sans"
                                  >
                                    <Copy className="w-3.5 h-3.5 mr-1" /> Salin Hasil Editan
                                  </button>
                                </div>

                                <textarea
                                  value={editedText}
                                  onChange={(e) => setEditedText(e.target.value)}
                                  rows={8}
                                  className="w-full bg-stone-50 border border-stone-250 rounded-2xl p-4 text-xs font-sans text-stone-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white"
                                  placeholder="Ubah atau murnikan teks caption kamu di sini..."
                                />

                                {/* Smart platform gauge */}
                                {(() => {
                                  const limits = getPlatformDetails(platform);
                                  const currentLen = editedText.length;
                                  const pct = Math.min(100, (currentLen / limits.max) * 100);
                                  
                                  let progressBg = "bg-teal-500";
                                  let statusMsg = "Ukuran pas & mantap abangku!";
                                  let colorLabel = "text-teal-700";
                                  
                                  if (currentLen > limits.max) {
                                    progressBg = "bg-red-500";
                                    statusMsg = `⚠️ Waduh! Gawat abangku, muatan melebihi batas ${limits.max} karakter untuk postingan ${limits.name}!`;
                                    colorLabel = "text-red-600";
                                  } else if (currentLen > limits.ideal) {
                                    progressBg = "bg-amber-400";
                                    statusMsg = `💡 Panjang teks aman, tapi disarankan kurang dari ${limits.ideal} krtr biar gak kepotong di timeline!`;
                                    colorLabel = "text-amber-700";
                                  } else {
                                    statusMsg = `✅ Karakter pas & ideal untuk engagement tinggi se-kampus di ${limits.name}!`;
                                    colorLabel = "text-teal-700";
                                  }

                                  return (
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center text-[10.5px] font-medium">
                                        <span className={`font-bold ${colorLabel}`}>{statusMsg}</span>
                                        <span className="font-mono text-stone-500 font-bold">{currentLen} / {limits.max} krtr</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-stone-150 rounded-full overflow-hidden">
                                        <div 
                                          style={{ width: `${pct}%` }} 
                                          className={`h-full rounded-full transition-all duration-300 ${progressBg}`}
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Fast assets injector */}
                                <div className="space-y-2 pt-2 border-t border-stone-100">
                                  <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Sisipkan cepat elemen asik:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {["🚀", "🔥", "✨", "💸", "🌸", "⚠️", "🎓", "📚", "💰"].map((emoji) => (
                                      <button
                                        type="button"
                                        key={emoji}
                                        onClick={() => setEditedText(prev => prev + "" + emoji)}
                                        className="text-xs bg-stone-50 hover:bg-stone-100 border border-stone-200 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                    {["#menyalaabangku", "#lancarjaya", "#ambis", "#fokusproker", "#maba"].map((tag) => (
                                      <button
                                        type="button"
                                        key={tag}
                                        onClick={() => setEditedText(prev => prev.trim() + " " + tag)}
                                        className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-150 px-2.5 py-1 rounded-lg font-bold transition-all active:scale-95 cursor-pointer"
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Self copywriting editor container */}
                            <div className="pt-2 border-t border-stone-100">
                              <span className="block text-[11px] text-stone-400 font-medium">✨ Copywriting di atas sudah teruji secara psikologis maba dan mahasiswa umum agar mengundang klik dan jempol interaksi!</span>
                            </div>

                          </div>
                        );
                      })}

                    </div>
                  ) : (
                    // Default feedback if user explicitly asked for ideas only
                    <div className="bg-stone-50 border-2 border-dashed border-stone-300 p-6 rounded-3xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-lg text-stone-400">
                        📝
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display font-black text-stone-800 text-sm">Mode Copywriting Caption Dinonaktifkan</h4>
                        <p className="text-xs text-stone-400 max-w-xs mx-auto">
                          Kamu memilih opsi &quot;Ide Desain Saja&quot;. Hasil copywriting, hook menarik, body, dan hashtag interaktif tidak diderifikasi.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setRequestType("both");
                          handleSubmit({ preventDefault: () => {} } as any);
                        }}
                        className="text-xs text-teal-600 font-bold bg-white border border-stone-200 hover:border-teal-300 px-4 py-2 rounded-xl"
                      >
                        Buka Paket Lengkap Sekarang!
                      </button>
                    </div>
                  )}

                  {/* Art Director Design Tips Section (2-4 bullets) */}
                  {result.tipsDesign && result.tipsDesign.length > 0 && (
                    <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center space-x-2">
                        <Layout className="w-4 h-4 text-blue-500" />
                        <h4 className="font-display font-black text-stone-800 text-sm">💡 Rekomendasi Eksekusi & Tips Art Director Kampus:</h4>
                      </div>
                      
                      <ul className="space-y-3">
                        {result.tipsDesign.map((tip, tipIdx) => (
                          <li key={tipIdx} className="flex items-start space-x-2.5 text-xs text-stone-600 leading-relaxed">
                            <span className="w-5 h-5 bg-stone-100 text-purple-600 rounded-lg flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">
                              {tipIdx + 1}
                            </span>
                            <span className="font-sans text-justify">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

              </div>

            </motion.div>
          )}
        </div>

      </main>

      {/* Aesthetic Footer */}
      <footer className="mt-16 bg-[#F5F3ED] border-t border-stone-200/80 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center space-x-1.5 text-stone-700 text-sm">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <span className="font-display font-bold">KampusKreatif AI</span>
            <span className="text-stone-300">|</span>
            <span className="text-xs italic">Menyulut Inspirasi Mahasiswa Indonesia 🇮🇩</span>
          </div>
          <p className="text-xs text-stone-400 font-sans max-w-xl mx-auto">
            Dirancang khusus untuk HIMA, BEM, UKM, Panitia Danus, dan Mahasiswa Ambis IPK Tinggi. Menggunakan teknologi Gemini model-generative server-side yang aman dan estetik.
          </p>
          <div className="text-[10px] text-stone-400 font-mono">
            © 2026 KampusKreatif AI • Pro-Crafted Design • Jakarta, Indonesia
          </div>
        </div>
      </footer>
    </div>
  );
}
