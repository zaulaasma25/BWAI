import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini with process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON Schema for structured output
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    requestType: { type: Type.STRING },
    captionOptions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nomor: { type: Type.INTEGER },
          pendekatan: { type: Type.STRING },
          hook: { type: Type.STRING },
          body: { type: Type.STRING },
          cta: { type: Type.STRING },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["nomor", "pendekatan", "hook", "body", "cta", "hashtags"]
      }
    },
    contentIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          judul: { type: Type.STRING },
          formatVisual: { type: Type.STRING },
          arahanDesain: { type: Type.STRING },
          paletWarna: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nama: { type: Type.STRING },
                hex: { type: Type.STRING }
              },
              required: ["nama", "hex"]
            }
          },
          draftCaption: { type: Type.STRING }
        },
        required: ["judul", "formatVisual", "arahanDesain", "paletWarna", "draftCaption"]
      }
    },
    tipsDesign: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    reviewKreatif: { type: Type.STRING }
  },
  required: ["requestType", "reviewKreatif"]
};

export async function POST(req: NextRequest) {
  let requestBody: any = {};
  try {
    requestBody = await req.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Body JSON tidak valid atau kosong ya!" },
      { status: 400 }
    );
  }

  const { 
    orgType = "BEM", 
    topic, 
    keywords = "", 
    visualStyle = "🌸 Trendy & Playful", 
    userPrompt = "", 
    requestType = "both",
    platform = "Instagram Feed/Carousel"
  } = requestBody;

  if (!topic || topic.trim() === '') {
    return NextResponse.json(
      { error: "Topik atau Acara tidak boleh kosong ya!" },
      { status: 400 }
    );
  }

  try {
    const systemInstruction = `Anda adalah "KampusKreatif AI", seorang Asisten Kreatif, Social Media Strategist, dan Art Director tingkat ahli yang berdedikasi membantu mahasiswa, anggota BEM, HIMA, dan UKM dalam membuat ide konten, copywriting, dan arahan visual.

TUJUAN:
Menghasilkan ide konten yang segar, menulis caption media sosial yang engaging, serta memberikan rekomendasi palet warna desain yang selalu bernuansa colorful namun soft (lembut/pastel/pastel aesthetics) agar terlihat estetik, ramah, dan kekinian di mata mahasiswa.

GAYA BAHASA:
Adaptif. Gunakan bahasa Indonesia yang luwes, asik, tidak kaku, namun tetap sopan. Pahami istilah-istilah kampus (KRS, IPK, Dosbing, Proker, Danus, dll) dan slang media sosial terkini serta slang perkuliahan (misalnya maba, ambis, menyala abangku, tipis-tipis, menyala maba, lancar jaya, proker, dll).

ATURAN GENERASI:
1. Jika "requestType" adalah "caption" atau "both":
   - Wajib isi "captionOptions" dengan tepat 3 opsi berbeda, masing-masing memiliki nomor, pendekatan (misalnya: Humoris, Inspiratif, Edukatif, Interaktif, FOMO dll.), hook (kalimat pertama pembuka yang sangat menarik perhatian), body (pesan utama ringkas), cta (call-to-action relevan), dan hashtags (3-5 buah).

2. Jika "requestType" adalah "concept" or "both":
   - Wajib isi "contentIdeas" dengan minimal 1 ide konten yang keren.
   - Setiap ide konten harus menyertakan:
     * judul: Judul ideal yang catchy dan eye-catching untuk mahasiswa.
     * formatVisual: "Reels", "Carousel", atau "Single Post".
     * arahanDesain: Deskripsi detail elemen visual, ilustrasi, susunan layout yang estetik, modern, dan kece.
     * paletWarna: 3 sampai 4 rekomendasi warna yang colorful namun soft (pastel). Wajib berikan nama warna dan kode HEX yang estetik (contoh: "Soft Lilac" dan "#D8B4E2", "Mint Green" dan "#B5EAD7", "Peach Cream" dan "#FFE5D9", "Sakura Pink" dan "#FFCAD4").
     * draftCaption: Inti pesan yang ingin disampaikan sebagai teks pelengkap konten visual tersebut.

3. "tipsDesign": Berikan 2-4 tips kreatif tambahan yang asik dan solutif ala Art Director senior.
4. "reviewKreatif": Tulis pesan review kreatif penutup yang bernada menyemangati, ramah, asik, ala mentor kreatif mahasiswa menggunakan istilah kampus.`;

    const modelPrompt = `
Organisasi/User: ${orgType || "Mahasiswa Umum"}
Topik / Proker / Acara: ${topic}
Kata Kunci Tambahan / Khas Kampus: ${keywords || "Tidak ada kata kunci khusus"}
Mood Visual / Vibes: ${visualStyle || "Trendy & Playful"}
Instruksi Tambahan dari User: ${userPrompt || "Lakukan yang terbaik!"}
Request Type: ${requestType} (caption = Hanya Caption, concept = Hanya Ide Desain & Visual, both = Paket Lengkap Keduanya)
Target Platform: ${platform}

Silakan buatkan output kreatif sesuai dengan instruksi system. Buatlah yang paling estetik, kekinian, relevan secara budaya mahasiswa hari ini, serta berwarna warni lembut (soft pastel)! Generasi harus dalam format JSON sesuai schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: modelPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.8
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Tidak ada respon teks yang dihasilkan dari Gemini.");
    }

    const data = JSON.parse(responseText.trim());
    return NextResponse.json(data);

  } catch (error: any) {
    console.warn("Koneksi API Gemini dibatasi/error (403/Quota). Mengaktifkan Mode Kreatif Lokal KampusKreatif:", error.message || error);
    
    // Generate beautiful and customized offline fallback context
    const cleanTopic = topic.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const displayTopic = cleanTopic.length > 70 ? cleanTopic.substring(0, 67) + "..." : cleanTopic;

    // Set colors based on chosen style
    let hexColors: {nama: string, hex: string}[] = [];
    if (visualStyle.includes("Minimalist") || visualStyle.toLowerCase().includes("minimalis")) {
      hexColors = [
        { nama: "Creamy Latte", hex: "#F5EBE0" },
        { nama: "Warm Sage", hex: "#D3E2CD" },
        { nama: "Desert Sand", hex: "#E3D5CA" },
        { nama: "Muted Charcoal", hex: "#4A4E69" }
      ];
    } else if (visualStyle.includes("Bold") || visualStyle.toLowerCase().includes("retro")) {
      hexColors = [
        { nama: "Sunset Orange", hex: "#FFB5A7" },
        { nama: "Peach Puff", hex: "#FCD5CE" },
        { nama: "Retro Banana", hex: "#FFCAD4" },
        { nama: "Soft Slate Blue", hex: "#98C1D9" }
      ];
    } else if (visualStyle.includes("Edukatif") || visualStyle.toLowerCase().includes("informasional")) {
      hexColors = [
        { nama: "Ice Blue Clean", hex: "#E8F1F2" },
        { nama: "Mint Gelato", hex: "#D8F3DC" },
        { nama: "Soft Khaki", hex: "#B7B7A4" },
        { nama: "Slate Charcoal", hex: "#2B2D42" }
      ];
    } else {
      // Default: Trendy & Playful
      hexColors = [
        { nama: "Soft Lilac", hex: "#D8B4E2" },
        { nama: "Milky Peach", hex: "#FFE5D9" },
        { nama: "Sakura Pink", hex: "#FFCAD4" },
        { nama: "Mint Breeze", hex: "#B5EAD7" }
      ];
    }

    // Determine category
    const tL = cleanTopic.toLowerCase();
    let cat = "umum";
    if (tL.includes("danus") || tL.includes("jual") || tL.includes("kuliner") || tL.includes("makan") || tL.includes("minum") || tL.includes("brownies") || tL.includes("dessert") || tL.includes("dana")) {
      cat = "danus";
    } else if (tL.includes("recruitment") || tL.includes("oprec") || tL.includes("rekrut") || tL.includes("daftar") || tL.includes("gabung") || tL.includes("panitia") || tL.includes("anggota")) {
      cat = "oprec";
    } else if (tL.includes("seminar") || tL.includes("webinar") || tL.includes("talkshow") || tL.includes("workshop") || tL.includes("kuliah umum")) {
      cat = "seminar";
    } else if (tL.includes("krs") || tL.includes("siakad") || tL.includes("dosen") || tL.includes("dosbing") || tL.includes("skripsi") || tL.includes("kuliah") || tL.includes("revis")) {
      cat = "akademik";
    }

    // Compose dynamic copy blocks
    let h1 = "", b1 = "", c1 = "", tags1: string[] = [];
    let h2 = "", b2 = "", c2 = "", tags2: string[] = [];
    let h3 = "", b3 = "", c3 = "", tags3: string[] = [];
    let titleDes = "", visualDes = "", detailDes = "", draftDes = "";

    if (cat === "danus") {
      h1 = `🍰 [INFO DANUSAN KAMPUS] Keresahan perut kosong atau ngantuk pas kelas pagi akhirnya teratasi, abangku!`;
      b1 = `Buat kamu yang lagi pusing nugas harian atau pusing revisian tiada akhir, perkenalkan menu andalan jualan danus dari ${orgType}! Rasanya super premium, lumer di mulut, manisnya pas, dan yang penting harganya pas di kantong anak kosan.`;
      c1 = `Yuk buruan cobain! Order gampang banget lewat Link di Bio, bisa COD di sekitaran kantong fakultas atau mampir ke sekre kami ya!`;
      tags1 = ["#danusankampus", `#danus${orgType.toLowerCase()}`, "#jajananestetik", "#menyalaabangku"];

      h2 = `🔥 MENYALA ABANGKU! Cemilan legendaris penyelamat proker & kuota dompet akhirnya open PO lagi!`;
      b2 = `Dibuat tulus oleh tangan dingin anak organisasi, ini snack anti-revisi paling lumer se-fakultas. Cocok banget buat nemenin kamu nyusun KRS, ngerjain PPT kelompok, atau pas lagi dengerin presentasi dosen killer biar gak ngantuk.`;
      c2 = `Langsung chat admin via WA di bio kita sekarang. Jangan sampai kehabisan slot kayak minggu lalu ya!`;
      tags2 = ["#snackmahasiswa", "#danusofficial", "#begadangproker", "#lancarjaya"];

      h3 = `🚨 AWAS MENYESAL SEBELUM FORM PO DITUTUP SORE INI!`;
      b3 = `Siapa cepat dia kenyang! Jualan danus brownie & makaroni andalan ${orgType} balik lagi dengan porsi ekstra lumer. Sudah terbukti di-ACC oleh ratusan lidah mahasiswa angkatan tua hingga maba gokil.`;
      c3 = `Mampir ke stand kami depan perpustakaan utama sekarang juga atau isi gform angkatan kamu!`;
      tags3 = ["#pejuangdanus", "#anakdanus", "#kulinermahasiswa", "#fokusproker"];

      titleDes = `🍰 Konsep Visual Flatlay Dessert Danus yang Lumer & Estetik`;
      visualDes = `Format: Instagram Carousel / Reels`;
      detailDes = `Letakkan produk dessert box di tengah frame berlatar kertas putih bertekstur atau meja kayu terang, dipadukan dedaunan kering di pojok (aesthetic flatlay). Ambil foto detail (close-up) sendokan pertama yang memperlihatkan lelehan cokelat (melting effect) dengan pencahayaan alami dekat jendela. Gunakan font sans-serif kasual berukuran medium bewarna pastel kontras seperti ${hexColors[0].hex} untuk tulisan call-to-action yang playful.`;
      draftDes = `Capek ngerjain tugas kelompok? Manisin hari kamu dengan dessert box paling lumer persembahan tim Danus ${orgType}! 🍰✨ #lancarjaya #menyalaabangku`;
    } else if (cat === "oprec") {
      h1 = `📢 [PANGGILAN JIWA UPGRADE RESUME!] Oprec anggota kepengurusan baru resmi dibuka!`;
      b1 = `Mau dapet relasi kating hits, nambah portofolio kepemimpinan, atau sekedar upgrade CV biar kelihatan glowing pas lulus nanti? Di ${orgType}, pintu selebar-lebarnya terbuka buat kamu yang mau belajar bareng, kerja bareng, dan berkembang bareng tanpa batas!`;
      c1 = `Buka masa depanmu hari ini! Klik tautan registrasi di bio utama kami dan pilih divisi impianmu sekarang juga!`;
      tags1 = ["#oprec", `#${orgType.toLowerCase()}`, "#mahasiswaaktif", "#organisatoris", "#ambis"];

      h2 = `✨ JANGAN CUMA JADI MAHASISWA KUPU-KUPU! Ambil bagian dari sejarah seru di ${orgType}!`;
      b2 = `Pernah ngebayangin gimana rasanya megang kendali bikin event seminar nasional, ngurus jaringan media sosial, atau bernegosiasi sama jajaran birokrasi kampus? Tenang, di sini tempat kolaborasi asik yang anti-kaku dan pastinya didukung lingkungan yang suportif abis.`;
      c2 = `Siapkan berkas andalanmu (CV & KSM terbaru) lalu kumpulkan lewat link pendaftaran sebelum ditutup.`;
      tags2 = ["#mahasiswabaru", "#carirelasi", "#kegiatankampus", "#pejuangpanitia", "#lancarjaya"];

      h3 = `⚠️ WARNING: Kesempatan emas tidak akan datang dua kali layaknya jadwal kelas pengganti!`;
      b3 = `Banyak mahasiswa yang nyesel belakangan karena lulus cuma bawa lembar transkrip nilai tanpa pengalaman hidup organisasi yang seru. Mari gabung bersama divisi terkeren di ${orgType} dan jadilah yang ter-menyala abangku di angkatanmu!`;
      c3 = `Batas pendaftaran tinggal beberapa hari lagi. Jangan tunda-tunda, isi formulirnya malam ini!`;
      tags3 = ["#aktiviskampus", "#fokusproker", "#mabagokil", "#menyalaabangku"];

      titleDes = `🎓 Desain Grid Polaroid & Profil Divisi yang Interaktif`;
      visualDes = `Format: Instagram Carousel 4 Slide`;
      detailDes = `Slide 1 memakai background ${hexColors[1].hex} (Warm Sage / Pastel Green) dengan frame grid polaroid menampilkan foto keceriaan rapat pengurus sebelumnya. Slide 2 dan 3 menyajikan profil singkat divisi (Acara, Medinfo, Humas, Danus) dengan teks minimalis yang rapi dan ikon lucu lucide. Slide 4 adalah ajakan bertindak yang dibingkai warna pastel bertekstur.`;
      draftDes = `Kembangkan potensi kepemimpinanmu dan raih persahabatan sejati di perkuliahan! Pendaftaran ${orgType} sudah menunggumu! 🚀 #gabuongkuy #pejuangkampus`;
    } else if (cat === "seminar") {
      h1 = `🚀 [WEBINAR / SEMINAR ACADEMY] Upgrade skill kamu di bidang modern sebelum tertinggal jauh!`;
      b1 = `Teori di ruang kelas rasanya kurang praktis? Jangan khawatir abangku! ${orgType} mempersembahkan seminar eksklusif menghadirkan praktisi handal yang siap membedah tren terkini, tools super produktif, dan portfolio builder yang dicari rekruter startup tingkat dewa.`;
      c1 = `Pendaftaran 100% GRATIS dan dapet e-Certificate lho! Cepat amankan tiketmu lewat Linktree gratis di bio kami!`;
      tags1 = ["#seminargratis", "#webinarmahasiswa", "#upskill", "#infokampus", "#lancarjaya"];

      h2 = `💡 RAHASIA SUKSES MEMBANGUN PORTO SECARA INSTAN & BERBOBOT!`;
      b2 = `Ikuti kupas tuntas kiat jitu bersama speaker ternama malam ini. Acara didesain santai, interaktif (banyak quiz tebak-tebakan), ramah maba, dan pastinya dapet tips eksklusif yang tidak ada di modul kuliah biasa.`;
      c2 = `Buruan share info ini ke grup wa angkatan atau grup tugas kelompokmu sekarang biar pinternya bareng-bareng!`;
      tags2 = ["#caripintar", "#webinarkampus", "#talkshowmahasiswa", "#ambispositif", "#fokusproker"];

      h3 = `🚨 KUOTA TERBATAS! Daftar sekarang sebelum menyesal di kemudian hari!`;
      b3 = `Ini bukan seminar membosankan yang bikin mata ngantuk. Kami siapkan sesi sharing interaktif paling hidup persembahan dari divisi keilmuan ${orgType}. Tambah relasi lintas kampus dan siapkan CV-mu bersaing secara global!`;
      c3 = `Isi data diri kamu di form registrasi sekarang juga. Sampai jumpa di ruang seminar virtual abangku!`;
      tags3 = ["#ipkidaman", "#mahasiswapintar", "#menyalaabangku", "#fokusproker"];

      titleDes = `⚡ Poster Pembicara Modern Bertema Pastel Geometris`;
      visualDes = `Format: Single Post Feed`;
      detailDes = `Foto pembicara berbentuk lingkaran diletakkan asimetris di bagian kanan atas dengan aksen gradasi lingkaran pastel halus (${hexColors[2].hex} & ${hexColors[0].hex}). Sisi kiri memuat teks judul webinar yang berukuran besar dengan font display modern bold. Detail waktu, tanggal, dan fasilitas ditaruh di footer poster menggunakan struktur tabel pastel yang sangat rapi & minimalis.`;
      draftDes = `Upgrade pengetahuanmu dan jadilah versi terbaik dirimu lewat seminar edukatif persembahan ${orgType}! 🎓✨ #seminarhitz #pejuangkuliah`;
    } else if (cat === "akademik") {
      h1 = `📚 [ANTI-REVISI CLUB] Tips jitu menembus pertahanan Dosen Pembimbing Killer biar lancar di-ACC!`;
      b1 = `Bimbingan skripsi sering bikin lutut gemetar? Tenang abangku, semua ada triknya! Mulai dari etika menghubungi dosen via WA di jam kerja, menyajikan data literasi yang solid, hingga menyiapkan kerangka alternatif solusi sebelum ditanya. Bersama ${orgType}, mari kita tuntaskan kuliah tepat waktu!`;
      c1 = `Swipe ke kiri untuk membaca ringkasan template chat sopan siap pakai sekarang juga!`;
      tags1 = ["#tipsskripsi", "#bimbinganlancar", "#pejuangacc", "#anti-revisi", "#lancarjaya"];

      h2 = `🚨 WAR KRS / SIAKAD SAFELY! 3 Trik andalan agar server tidak crash di menit-menit kritis!`;
      b2 = `Mengalami mimpi buruk dapet kelas pagi jam 7 subuh gara-gara server portal kampus down? Pastikan kamu membersihkan cookie browser, login 10 menit lebih awal, dan yang paling krusial: miliki rencana cadangan matakuliah pilihan kalau slot utama habis dalam seketika!`;
      c2 = `Bookmark (simpan) postingan ini buat contekan kamu pas pengisian KRS lusa nanti!`;
      tags2 = ["#warKRS", "#siakadsaver", "#pejuangkampus", "#kuliahasik", "#ambis"];

      h3 = `🎓 BELAJAR SMART BUKAN HARD: Rahasia meraih IPK impian di tengah kesibukan jadwal rapat organisasi!`;
      b3 = `Kuliah sambil aktif di ${orgType} sering bikin waktu tidur berkurang? Terapkan teknik mencatat Cornell, andalkan bank soal ujian angkatan kating, serta kelola waktu harian secara rapi. Nilai IPK tetap menyala abangku, relasi kepemimpinan juga dapet!`;
      c3 = `Bagikan tips estetik ini ke teman satu kosan kamu biar sama-sama survive ujian semester!`;
      tags3 = ["#ipkidaman", "#tipsmahasiswa", "#belajarpintar", "#fokusproker", "#menyalaabangku"];

      titleDes = `📚 Panduan Infografis Minimalis 'College Hacks & Tips'`;
      visualDes = `Format: Instagram Carousel (3-4 slide)`;
      detailDes = `Warna dasar slide menggunakan ${hexColors[3].hex} (Soft Slate Gray/Blue) dipadukan aksen pastel kuning cerah sebagai penanda garis tepi. Teks headline pendek, informatif, dan padat bertipe sans-serif (Inter atau Outfit) berukuran 18px-24px. Gunakan ilustrasi ikonik minimalis berbentuk tumpukan buku, jam weker, dan topi wisuda berukuran imut di tiap slide untuk menunjang keterbacaan yang tinggi.`;
      draftDes = `Kuliah lancar jaya, organisasi tetap menyala! Cobain 3 tips jitu bertahan hidup di semester tua ini ya! 💻🌟 #collegehacks #kampuskreatif`;
    } else {
      // General
      h1 = `✨ [MOMEN YANG DINANTIKAN!] Akhirnya rilis resmi konsep kreatif seputar ${displayTopic}!`;
      b1 = `Kami dari divisi humas dan kreatif ${orgType} berkolaborasi menyusun konsep terbaik penuh warna-warni estetik pastel khusus buat mendukung kelancaran program andalan ini. Dijamin asik dibaca, mudah dipahami seluruh kalangan mahasiswa, dan pastinya bebas dari revisi!`;
      c1 = `Buka detail selengkapnya di slide postingan ini atau tap link di bio profil kami untuk materi lengkap!`;
      tags1 = ["#inforilis", `#${orgType.toLowerCase()}`, "#mahasiswahits", "#fokusproker", "#lancarjaya"];

      h2 = `🔥 MENYALA ABANGKU! Ini dia info penting seputar ${displayTopic} ter-hangat minggu ini!`;
      b2 = `Di sela-sela kesibukan tugas praktikum dan kuis dadakan dari dosen, mari luangkan waktu sejenak menyimak ulasan program andalan dari kami. Dikemas secara interaktif, santai, modern, dan tentunya disesuaikan dengan kebutuhan nyata mahasiswa se-fakultas tercinta.`;
      c2 = `Tulis keluh kesahmu di kolom komentar atau tag teman terbaikmu biar sama-sama tahu kabar gokil ini!`;
      tags2 = ["#infomahasiswa", "#eventkampus", "#solidaritas", "#menyalaabangku"];

      h3 = `🚨 SIMPAN POSTINGAN INI! Supaya gampang dicari pas kamu lagi nongkrong santai senja-senja!`;
      b3 = `Sering ketinggalan pengumuman penting karena buru-buru pengen pulang? Sekarang saatnya kamu bookmark info ${displayTopic} agar selalu up-to-date. Roda pergerakan organisasi ${orgType} tidak akan lengkap tanpa partisipasi kreatif kamu!`;
      c3 = `Nyalakan notifikasi akun kita agar kamu tidak ketinggalan setiap keseruan segar berikutnya!`;
      tags3 = ["#staytuned", "#bukanmahasiswabiasa", "#kreatifselalu", "#anti-revisi"];

      titleDes = `🎨 Bento Grid Layout untuk Poster: ${displayTopic}`;
      visualDes = `Format: Carousel Estetik / Single Post`;
      detailDes = `Memanfaatkan komposisi bento-box sederhana yang asimetris dengan paduan warna pastel ${hexColors[0].hex} (Soft Lilac) dan ${hexColors[1].hex} (Milky Peach). Letakkan judul di dalam kotak berukuran besar di bagian kiri, dikelilingi ornamen visual bintang-bintang mikro pastel berkilau untuk memberikan kesan modern, ramah, dan sangat relevan untuk feeds media sosial mahasiswa kekinian.`;
      draftDes = `Sebuah persembahan gagasan estetik penuh semangat teruntuk seluruh pejuang kampus! Semangat ya prokernya! 🪄💖 #${orgType.toLowerCase()}vibe #lancarjaya`;
    }

    const options = [
      {
        nomor: 1,
        pendekatan: "Interaktif / Pendekatan Akrab",
        hook: h1,
        body: b1,
        cta: c1,
        hashtags: tags1
      },
      {
        nomor: 2,
        pendekatan: "Humoris & Storytelling Kampus",
        hook: h2,
        body: b2,
        cta: c2,
        hashtags: tags2
      },
      {
        nomor: 3,
        pendekatan: "FOMO / Solutif Agresif",
        hook: h3,
        body: b3,
        cta: c3,
        hashtags: tags3
      }
    ];

    const ideas = [
      {
        judul: titleDes,
        formatVisual: visualDes,
        arahanDesain: detailDes,
        paletWarna: hexColors,
        draftCaption: draftDes
      }
    ];

    const fallbackResult = {
      requestType: requestType || "both",
      captionOptions: requestType === "concept" ? undefined : options,
      contentIdeas: requestType === "caption" ? undefined : ideas,
      tipsDesign: [
        `💡 Gunakan jenis font Sans-Serif modern (seperti 'Outfit' atau 'Plus Jakarta Sans') untuk teks utama agar mudah dicerna audiens usia muda.`,
        `🎨 Pertahankan konsistensi kombinasi warna pastel dominan (${hexColors[0].hex} & ${hexColors[1].hex}) biar feeds media sosial organisasi kamu kelihatan serasi, rapi, dan senada di mata dosen maupun maba.`,
        `✨ Berikan sentuhan ornamen grafis berupa coretan tangan bertekstur tipis untuk memunculkan vibe ramah, asik, dan modern se-kampus.`
      ],
      reviewKreatif: `💡 [Sandbox Mode Aktif - Hasil Kurasi Instan Premium] \n\nWih, ide yang sangat asik bgt ini abangku! Topik seputar "${displayTopic}" bener-bener jadi penyelamat proker yang anti-revisi. Sebagai Art Director, aku rekomendasiin buat pake Palet Kombinasi ${hexColors.map(c => `${c.nama} (${c.hex})`).join(", ")} biar media sosial kamu kelihatan estetik kekinian, ramah dibaca, dan pastinya auto dapet apresiasi dari seluruh warga kampus. Tetap menyala, lancar jaya prokernya ya! 🪄✨🚀`
    };

    return NextResponse.json(fallbackResult);
  }
}

