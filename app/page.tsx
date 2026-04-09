"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const WA_NUMBER = "6285967096912";
const ADMIN_EMAIL = "arwanidgabriel@gmail.com"; // Email penerima file
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ACCEPTED_EXT = [".pdf", ".doc", ".docx", ".txt"];
const MAX_MB = 20; // Disesuaikan ke 20MB agar aman untuk pengiriman lampiran Email

const TICKER_ITEMS = [
  "✦ 100% No Repository",
  "✦ Proses Cepat 24 Jam",
  "✦ Laporan Similarity PDF",
  "✦ Teliti & Terpercaya",
  "✦ Support 24/7 via WhatsApp",
  "✦ Exclude Daftar Pustaka",
  "✦ Exclude Kutipan",
  "✦ Exclude Match Tersedia",
  "✦ 100% No Repository",
  "✦ Proses Cepat 24 Jam",
  "✦ Laporan Similarity PDF",
  "✦ Teliti & Terpercaya",
  "✦ Support 24/7 via WhatsApp",
  "✦ Exclude Daftar Pustaka",
  "✦ Exclude Kutipan",
  "✦ Exclude Match Tersedia",
];

const FEATURES = [
  {
    icon: "🛡️",
    title: "100% No Repository",
    desc: "Dokumen kamu tidak akan masuk ke database Turnitin. Aman & privat.",
  },
  {
    icon: "⚡",
    title: "Hasil 24 Jam",
    desc: "Laporan similarity lengkap dikirim langsung ke WhatsApp kamu.",
  },
  {
    icon: "📊",
    title: "Laporan Detail",
    desc: "Laporan PDF lengkap dengan breakdown per paragraf & sumber.",
  },
  {
    icon: "🔁",
    title: "Recheck Tersedia",
    desc: "Sudah revisi? Cek ulang dengan harga spesial untuk pelanggan setia.",
  },
];

const HOW_TO = [
  { num: "01", title: "Upload File", desc: "Seret atau klik area upload, pilih file dokumen kamu." },
  { num: "02", title: "Isi Data", desc: "Tulis judul file & nomor WhatsApp aktif kamu." },
  { num: "03", title: "Pilih Opsi", desc: "Centang opsi exclude sesuai kebutuhan dokumenmu." },
  { num: "04", title: "Kirim Order", desc: "Tap tombol kirim — kami proses & balas via WhatsApp." },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function buildWaMessage(
  fileName: string,
  fileTitle: string,
  waUser: string,
  excludeBib: boolean,
  excludeQuote: boolean,
  excludeMatch: boolean
): string {
  const opts: string[] = [];
  if (excludeBib)      opts.push("Kecualikan Daftar Pustaka");
  if (excludeQuote)    opts.push("Kecualikan Kutipan");
  if (excludeMatch)    opts.push("Exclude Match");

  const optsText = opts.length > 0 ? opts.join(", ") : "Tidak ada";

  return (
    `Halo Chek & Recheck Turnitin 👋\n\n` +
    `Saya ingin melakukan *Cek Plagiasi Turnitin*.\n\n` +
    `📄 *File:* ${fileName} (Sudah terkirim ke sistem)\n` +
    `📝 *Judul:* ${fileTitle || "(belum diisi)"}\n` +
    `📱 *No. WA Saya:* ${waUser || "(belum diisi)"}\n\n` +
    `⚙️ *Opsi Exclude:*\n${optsText}\n\n` +
    `Mohon informasi harga & prosedur selanjutnya. Terima kasih!`
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);

  const [fileTitle, setFileTitle] = useState("");
  const [waUser, setWaUser] = useState("");
  const [excludeBib, setExcludeBib] = useState(false);
  const [excludeQuote, setExcludeQuote] = useState(false);
  const [excludeMatch, setExcludeMatch] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Scanning animation state
  const [scanActive, setScanActive] = useState(false);
  useEffect(() => {
    if (file) { setScanActive(true); const t = setTimeout(() => setScanActive(false), 1800); return () => clearTimeout(t); }
  }, [file]);

  // ── File validation ──
  const validateFile = (f: File): string => {
    if (!ACCEPTED_TYPES.includes(f.type) && !ACCEPTED_EXT.some(e => f.name.toLowerCase().endsWith(e)))
      return "Format tidak didukung. Gunakan PDF, DOC, DOCX, atau TXT.";
    if (f.size > MAX_MB * 1024 * 1024)
      return `Ukuran file terlalu besar. Maksimum ${MAX_MB} MB.`;
    return "";
  };

  const handleFile = useCallback((f: File) => {
    const err = validateFile(f);
    setFileError(err);
    if (!err) setFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  // ── Form submit (FormSubmit AJAX) ──
  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!file)          errs.file = "Pilih file terlebih dahulu.";
    if (!fileTitle.trim()) errs.fileTitle = "Judul file wajib diisi.";
    if (!waUser.trim()) errs.waUser = "Nomor WhatsApp wajib diisi.";
    else if (!/^[0-9+\s\-()]{8,20}$/.test(waUser.trim()))
      errs.waUser = "Format nomor WhatsApp tidak valid.";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);

    const opts: string[] = [];
    if (excludeBib) opts.push("Kecualikan Daftar Pustaka");
    if (excludeQuote) opts.push("Kecualikan Kutipan");
    if (excludeMatch) opts.push("Exclude Match");
    const optsText = opts.length > 0 ? opts.join(", ") : "Tidak ada";

    // Siapkan data untuk dikirim ke email
    const formData = new FormData();
    formData.append("Nama Pemesan", waUser);
    formData.append("Judul File", fileTitle);
    formData.append("Opsi Exclude", optsText);
    formData.append("attachment", file!); // File dilampirkan
    
    // Konfigurasi FormSubmit
    formData.append("_subject", `🔔 Order Turnitin Baru dari ${waUser}`);
    formData.append("_captcha", "false"); 
    formData.append("_template", "table");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: "POST",
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        // Jika email berhasil terkirim, arahkan user ke WhatsApp
        const msg = buildWaMessage(file!.name, fileTitle, waUser, excludeBib, excludeQuote, excludeMatch);
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
        setSubmitted(true);
      } else {
        alert("Gagal mengirim file. Silakan coba lagi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan. Gagal mengirim data.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFile(null); setFileTitle(""); setWaUser(""); setErrors({});
    setExcludeBib(false); setExcludeQuote(false); setExcludeMatch(false);
    setSubmitted(false); setFileError("");
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="noise-bg min-h-screen relative">

      {/* ── TICKER ── */}
      <div
        style={{
          background: "var(--ink)",
          color: "var(--accent)",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "0.72rem",
          letterSpacing: "0.04em",
          overflow: "hidden",
          height: "36px",
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "3rem",
            whiteSpace: "nowrap",
            animation: "ticker 28s linear infinite",
          }}
        >
          {TICKER_ITEMS.map((t, i) => (
            <span key={i} style={{ flexShrink: 0 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── HEADER ── */}
      <header
        className="anim-up"
        style={{
          background: "var(--ink)",
          color: "var(--surface)",
          padding: "1.5rem 1.25rem 1.75rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {/* Background accent circle */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "220px", height: "220px", borderRadius: "50%",
          background: "var(--accent-glow)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-40px", left: "-30px",
          width: "140px", height: "140px", borderRadius: "50%",
          background: "rgba(200,245,61,0.08)", pointerEvents: "none",
        }} />

        {/* Badge */}
        <div className="badge-pop" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "var(--accent)", color: "var(--ink)",
          borderRadius: "100px", padding: "4px 14px",
          fontFamily: "'Syne', sans-serif", fontWeight: 700,
          fontSize: "0.65rem", letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: "1rem",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ink)", flexShrink: 0,
            animation: "pulse-ring 1.2s ease-out infinite",
            boxShadow: "0 0 0 0 var(--ink)",
          }} />
          Layanan Aktif 24 Jam
        </div>

        <h1 className="anim-up-2" style={{
          fontSize: "clamp(1.7rem, 6vw, 2.6rem)",
          lineHeight: 1.1, marginBottom: "0.6rem",
          letterSpacing: "-0.02em",
        }}>
          Chek & Recheck<br />
          <span style={{ color: "var(--accent)" }}>Turnitin</span>
        </h1>
        <p className="anim-up-3" style={{
          color: "rgba(244,243,238,0.6)", fontSize: "0.9rem",
          fontWeight: 300, maxWidth: "340px", margin: "0 auto",
          lineHeight: 1.6,
        }}>
          Cek plagiasi dokumen akademikmu dengan laporan lengkap.<br />
          <strong style={{ color: "var(--accent)", fontWeight: 600 }}>100% No Repository.</strong>
        </p>
        <p className="anim-up-4" style={{
          marginTop: "0.6rem", fontSize: "0.72rem",
          color: "rgba(244,243,238,0.4)", letterSpacing: "0.06em",
          fontFamily: "'Syne', sans-serif", textTransform: "uppercase",
        }}>
          By Arwani D'Gabriel
        </p>
      </header>

      {/* ── FEATURES STRIP ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "1px", background: "var(--border-strong)",
        borderBottom: "1px solid var(--border-strong)",
      }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{
            background: "var(--surface)",
            padding: "1.1rem 1rem",
            borderBottom: i < 2 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{ fontSize: "1.4rem", marginBottom: "0.35rem" }}>{f.icon}</div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: "0.78rem", marginBottom: "0.25rem", color: "var(--ink)",
            }}>{f.title}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ padding: "0 0 5rem" }}>

        {/* Section label */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "1.5rem 1.25rem 0.75rem",
        }}>
          <div style={{ height: "1px", flex: 1, background: "var(--border-strong)" }} />
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: "0.65rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--muted)",
          }}>Form Order</span>
          <div style={{ height: "1px", flex: 1, background: "var(--border-strong)" }} />
        </div>

        <div ref={formRef} style={{ padding: "0 1.25rem" }}>

          {submitted ? (
            /* ── SUCCESS STATE ── */
            <div style={{
              textAlign: "center", padding: "2.5rem 1.5rem",
              background: "var(--ink)", borderRadius: "20px",
              border: "1.5px solid var(--accent)",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", color: "var(--accent)",
                fontSize: "1.4rem", marginBottom: "0.5rem",
              }}>Order Terkirim!</h2>
              <p style={{ color: "rgba(244,243,238,0.7)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Dokumenmu berhasil dikirimkan ke sistem kami.<br/><br/>
                Silakan lanjut mengobrol dengan Admin di WhatsApp yang sudah terbuka secara otomatis.
              </p>
              <button
                onClick={resetForm}
                style={{
                  background: "var(--accent)", color: "var(--ink)",
                  border: "none", borderRadius: "100px",
                  padding: "0.75rem 2rem", fontFamily: "'Syne', sans-serif",
                  fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                Buat Order Baru
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* ── FILE DROP ZONE ── */}
              <div>
                <label style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: "0.72rem", letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--muted)",
                  display: "block", marginBottom: "0.5rem",
                }}>
                  Upload Dokumen *
                </label>

                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    style={{
                      border: `2px dashed ${dragging ? "var(--accent)" : errors.file ? "#e74c3c" : "var(--border-strong)"}`,
                      borderRadius: "16px",
                      background: dragging ? "rgba(200,245,61,0.06)" : "white",
                      padding: "2.5rem 1.25rem",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>
                      {dragging ? "📂" : "📎"}
                    </div>
                    <p style={{
                      fontFamily: "'Syne', sans-serif", fontWeight: 700,
                      fontSize: "0.9rem", marginBottom: "0.35rem", color: "var(--ink)",
                    }}>
                      {dragging ? "Lepaskan file di sini" : "Klik atau Seret File ke Sini"}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      PDF, DOC, DOCX, TXT · Maks. {MAX_MB} MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_EXT.join(",")}
                      onChange={onFileChange}
                      style={{ display: "none" }}
                    />
                  </div>
                ) : (
                  /* File preview card */
                  <div style={{
                    border: "1.5px solid var(--accent)",
                    borderRadius: "16px",
                    background: "white",
                    padding: "1rem 1.1rem",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    {/* Scanning animation overlay */}
                    {scanActive && (
                      <div style={{
                        position: "absolute", left: 0, right: 0, height: "2px",
                        background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
                        animation: "scan-line 1.2s linear forwards",
                        zIndex: 2,
                      }} />
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "10px",
                        background: "rgba(200,245,61,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.3rem", flexShrink: 0,
                      }}>
                        {file.name.endsWith(".pdf") ? "📕" : file.name.endsWith(".txt") ? "📃" : "📘"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: "'Syne', sans-serif", fontWeight: 700,
                          fontSize: "0.82rem", color: "var(--ink)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{file.name}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "2px" }}>
                          {formatBytes(file.size)} · {file.name.split(".").pop()?.toUpperCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => { setFile(null); setFileError(""); }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "1.1rem", color: "var(--muted)", padding: "4px",
                          flexShrink: 0,
                        }}
                        aria-label="Hapus file"
                        disabled={isSubmitting}
                      >✕</button>
                    </div>
                    <div style={{
                      marginTop: "0.6rem", height: "3px", borderRadius: "100px",
                      background: "var(--surface-warm)", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: "100%",
                        background: "var(--accent)", borderRadius: "100px",
                        transition: "width 1s ease",
                      }} />
                    </div>
                  </div>
                )}

                {(fileError || errors.file) && (
                  <p style={{ color: "#e74c3c", fontSize: "0.75rem", marginTop: "0.35rem" }}>
                    ⚠ {fileError || errors.file}
                  </p>
                )}
              </div>

              {/* ── JUDUL FILE ── */}
              <div>
                <label style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: "0.72rem", letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--muted)",
                  display: "block", marginBottom: "0.5rem",
                }}>
                  Judul File / Dokumen *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Skripsi_Arwani_Bab1-5"
                  value={fileTitle}
                  onChange={e => { setFileTitle(e.target.value); setErrors(v => ({ ...v, fileTitle: "" })); }}
                  disabled={isSubmitting}
                  style={{
                    width: "100%", padding: "0.85rem 1rem",
                    border: `1.5px solid ${errors.fileTitle ? "#e74c3c" : "var(--border-strong)"}`,
                    borderRadius: "12px", fontSize: "0.9rem",
                    fontFamily: "'DM Sans', sans-serif",
                    background: isSubmitting ? "#f5f5f5" : "white", color: "var(--ink)",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "var(--ink)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.fileTitle ? "#e74c3c" : "var(--border-strong)"; }}
                />
                {errors.fileTitle && (
                  <p style={{ color: "#e74c3c", fontSize: "0.75rem", marginTop: "0.35rem" }}>
                    ⚠ {errors.fileTitle}
                  </p>
                )}
              </div>

              {/* ── NOMOR WA ── */}
              <div>
                <label style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: "0.72rem", letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--muted)",
                  display: "block", marginBottom: "0.5rem",
                }}>
                  Nomor WhatsApp Kamu *
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                    fontSize: "1rem",
                  }}>📱</span>
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={waUser}
                    onChange={e => { setWaUser(e.target.value); setErrors(v => ({ ...v, waUser: "" })); }}
                    disabled={isSubmitting}
                    style={{
                      width: "100%", padding: "0.85rem 1rem 0.85rem 2.6rem",
                      border: `1.5px solid ${errors.waUser ? "#e74c3c" : "var(--border-strong)"}`,
                      borderRadius: "12px", fontSize: "0.9rem",
                      fontFamily: "'DM Sans', sans-serif",
                      background: isSubmitting ? "#f5f5f5" : "white", color: "var(--ink)",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                    onFocus={e => { e.target.style.borderColor = "var(--ink)"; }}
                    onBlur={e => { e.target.style.borderColor = errors.waUser ? "#e74c3c" : "var(--border-strong)"; }}
                  />
                </div>
                {errors.waUser && (
                  <p style={{ color: "#e74c3c", fontSize: "0.75rem", marginTop: "0.35rem" }}>
                    ⚠ {errors.waUser}
                  </p>
                )}
                <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.35rem" }}>
                  Hasil cek akan dikirim ke nomor ini via WhatsApp.
                </p>
              </div>

              {/* ── EXCLUDE OPTIONS ── */}
              <div style={{
                background: "white",
                border: "1.5px solid var(--border-strong)",
                borderRadius: "16px",
                overflow: "hidden",
                opacity: isSubmitting ? 0.6 : 1,
                pointerEvents: isSubmitting ? "none" : "auto",
              }}>
                <div style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--ink)",
                }}>
                  <span style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: "0.72rem", letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "var(--accent)",
                  }}>
                    ⚙ Opsi Exclude (Opsional)
                  </span>
                </div>

                {[
                  { key: "bib",      state: excludeBib,      setter: setExcludeBib,      label: "Kecualikan Daftar Pustaka", sub: "Referensi & bibliografi tidak dihitung sebagai plagiasi" },
                  { key: "quote",    state: excludeQuote,    setter: setExcludeQuote,    label: "Kecualikan Kutipan",        sub: "Kutipan langsung dalam tanda petik tidak dihitung" },
                  { key: "match",    state: excludeMatch,    setter: setExcludeMatch,    label: "Exclude Match",             sub: "Exclude sumber yang sudah diketahui milik sendiri" },
                ].map((opt, i, arr) => (
                  <label
                    key={opt.key}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.85rem",
                      padding: "0.9rem 1rem",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                      cursor: "pointer",
                      background: opt.state ? "rgba(200,245,61,0.06)" : "white",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Custom checkbox */}
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                      border: `2px solid ${opt.state ? "var(--ink)" : "var(--border-strong)"}`,
                      background: opt.state ? "var(--accent)" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}>
                      {opt.state && <span style={{ fontSize: "0.75rem", fontWeight: 900 }}>✓</span>}
                    </div>
                    <input
                      type="checkbox"
                      checked={opt.state}
                      onChange={e => opt.setter(e.target.checked)}
                      style={{ display: "none" }}
                    />
                    <div>
                      <p style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 700,
                        fontSize: "0.82rem", color: "var(--ink)",
                      }}>{opt.label}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--muted)", lineHeight: 1.4 }}>{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* ── CATATAN ── */}
              <div style={{
                background: "rgba(200,245,61,0.1)",
                border: "1.5px solid rgba(200,245,61,0.4)",
                borderRadius: "12px",
                padding: "0.85rem 1rem",
                display: "flex",
                gap: "0.6rem",
                alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "1px" }}>💡</span>
                <div>
                  <p style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: "0.75rem", color: "var(--ink)", marginBottom: "0.2rem",
                  }}>Catatan Penting</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    File akan dikirim otomatis ke email kami dengan batas maksimal 20 MB.
                    Dokumen <strong>tidak akan disimpan</strong> di database Turnitin (No Repository).
                  </p>
                </div>
              </div>

              {/* ── SUBMIT BUTTON ── */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "1.05rem",
                  background: isSubmitting ? "#333" : "var(--ink)",
                  color: isSubmitting ? "#888" : "var(--accent)",
                  border: "none",
                  borderRadius: "14px",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: "0.03em",
                  cursor: isSubmitting ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  transition: "transform 0.15s, opacity 0.15s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseDown={e => { if (!isSubmitting) e.currentTarget.style.transform = "scale(0.975)" }}
                onMouseUp={e => { if (!isSubmitting) e.currentTarget.style.transform = "scale(1)" }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ animation: "pulse-ring 1s infinite" }}>⏳</span>
                    Sedang Mengirim File...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "1.1rem" }}>📤</span>
                    Kirim Order & Lanjut WA
                  </>
                )}
              </button>

            </div>
          )}
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ padding: "2.5rem 1.25rem 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            marginBottom: "1.25rem",
          }}>
            <div style={{ height: "1px", flex: 1, background: "var(--border-strong)" }} />
            <span style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: "0.65rem", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--muted)",
            }}>Cara Kerja</span>
            <div style={{ height: "1px", flex: 1, background: "var(--border-strong)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {HOW_TO.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", position: "relative" }}>
                {/* Vertical line connector */}
                {i < HOW_TO.length - 1 && (
                  <div style={{
                    position: "absolute", left: "19px", top: "40px",
                    width: "2px", height: "calc(100% - 8px)",
                    background: "var(--border-strong)",
                  }} />
                )}
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "var(--ink)", color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: "0.7rem", flexShrink: 0,
                  position: "relative", zIndex: 1,
                }}>
                  {s.num}
                </div>
                <div style={{ paddingBottom: "1.5rem" }}>
                  <p style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: "0.9rem", color: "var(--ink)", marginBottom: "0.2rem",
                    paddingTop: "0.6rem",
                  }}>{s.title}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "var(--ink)",
        color: "rgba(244,243,238,0.5)",
        padding: "1.5rem 1.25rem",
        textAlign: "center",
        fontSize: "0.72rem",
        lineHeight: 1.7,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <p style={{ color: "var(--accent)", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: "0.25rem" }}>
          Chek & Recheck Turnitin
        </p>
        <p>Layanan Cek Plagiasi Profesional · 100% No Repository</p>
        <p style={{ marginTop: "0.25rem" }}>By Arwani D'Gabriel · Aktif 24 Jam</p>
      </footer>

    </div>
  );
}