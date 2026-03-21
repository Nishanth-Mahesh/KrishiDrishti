import { useState, useRef } from "react";
import axios from "axios";

// ─── Inline styles as JS objects ──────────────────────────────────────────────
const S = {
  // Root
  root: {
    minHeight: "100vh",
    background: "#080808",
    color: "#f0f0f0",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    overflowX: "hidden",
  },

  // ── Ticker bar ────────────────────────────────────────────────────────────
  tickerWrap: {
    background: "#0d9e5e",
    padding: "10px 0",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  tickerInner: {
    display: "inline-block",
    animation: "ticker 28s linear infinite",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#fff",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "22px 56px",
    borderBottom: "1px solid #1a1a1a",
    position: "sticky",
    top: 0,
    background: "rgba(8,8,8,0.85)",
    backdropFilter: "blur(24px)",
    zIndex: 100,
  },
  logo: {
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#fff",
    margin: 0,
  },
  logoAccent: { color: "#0d9e5e" },
  headerTag: {
    fontSize: "12px",
    color: "#555",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  nav: { display: "flex", gap: "36px" },
  navItem: {
    fontSize: "13px",
    color: "#888",
    textDecoration: "none",
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "color 0.2s",
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    padding: "110px 56px 80px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  heroEyebrow: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "#0d9e5e",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: "20px",
  },
  heroH1: {
    fontSize: "clamp(48px, 7vw, 86px)",
    fontWeight: 900,
    lineHeight: 1.0,
    letterSpacing: "-0.04em",
    margin: "0 0 28px",
    color: "#fff",
  },
  heroSub: {
    fontSize: "18px",
    color: "#777",
    lineHeight: 1.7,
    maxWidth: "520px",
    margin: "0 0 48px",
  },
  heroBtnRow: { display: "flex", gap: "16px", flexWrap: "wrap" },
  btnPrimary: {
    background: "#0d9e5e",
    color: "#fff",
    border: "none",
    padding: "16px 36px",
    borderRadius: "100px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "transform 0.15s, background 0.2s",
  },
  btnSecondary: {
    background: "transparent",
    color: "#fff",
    border: "1px solid #2a2a2a",
    padding: "16px 36px",
    borderRadius: "100px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "border-color 0.2s",
  },

  // ── Stat bar ──────────────────────────────────────────────────────────────
  stats: {
    display: "flex",
    gap: "0",
    borderTop: "1px solid #151515",
    borderBottom: "1px solid #151515",
    margin: "0 56px 0",
    maxWidth: "calc(100% - 112px)",
  },
  statItem: {
    flex: 1,
    padding: "32px 28px",
    borderRight: "1px solid #151515",
  },
  statNum: {
    fontSize: "36px",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.03em",
  },
  statLabel: {
    fontSize: "12px",
    color: "#555",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginTop: "4px",
  },

  // ── Upload panel ──────────────────────────────────────────────────────────
  uploadSection: {
    padding: "80px 56px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  sectionLabel: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "#0d9e5e",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "38px",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    margin: "0 0 40px",
    color: "#fff",
  },
  uploadArea: {
    border: "1.5px dashed #282828",
    borderRadius: "20px",
    padding: "56px 40px",
    textAlign: "center",
    background: "#0c0c0c",
    cursor: "pointer",
    transition: "border-color 0.2s",
    position: "relative",
    overflow: "hidden",
  },
  uploadIcon: { fontSize: "44px", marginBottom: "16px" },
  uploadText: { color: "#555", fontSize: "15px", marginBottom: "24px" },
  fileInput: { display: "none" },
  fileName: {
    marginTop: "12px",
    fontSize: "13px",
    color: "#0d9e5e",
    fontWeight: 600,
  },

  // ── Result panel ──────────────────────────────────────────────────────────
  resultSection: {
    maxWidth: "960px",
    margin: "0 auto 80px",
    padding: "0 56px",
  },
  resultCard: {
    background: "#0e0e0e",
    border: "1px solid #1e1e1e",
    borderRadius: "24px",
    padding: "48px",
    position: "relative",
    overflow: "hidden",
  },
  resultGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: "linear-gradient(90deg, transparent, #0d9e5e, transparent)",
  },
  diseaseTag: {
    display: "inline-block",
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "#0d9e5e",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: "12px",
  },
  diseaseName: {
    fontSize: "52px",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    margin: "0 0 32px",
    color: "#fff",
    lineHeight: 1.1,
  },

  // Confidence bar
  confLabel: {
    fontSize: "12px",
    color: "#555",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  barTrack: {
    height: "6px",
    background: "#191919",
    borderRadius: "100px",
    marginBottom: "48px",
    overflow: "hidden",
  },
  barFill: (pct) => ({
    height: "100%",
    width: pct + "%",
    background: "linear-gradient(90deg, #0d9e5e, #24e89f)",
    borderRadius: "100px",
    transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
  }),

  // Info grid
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  infoCard: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "16px",
    padding: "28px",
  },
  infoCardTitle: {
    fontSize: "11px",
    letterSpacing: "0.16em",
    color: "#0d9e5e",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: "12px",
  },
  infoCardText: {
    fontSize: "15px",
    color: "#bbb",
    lineHeight: 1.75,
    margin: 0,
  },

  // ── Education ─────────────────────────────────────────────────────────────
  eduSection: {
    padding: "80px 56px",
    maxWidth: "1200px",
    margin: "0 auto",
    borderTop: "1px solid #111",
  },
  eduGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "40px",
  },
  eduCard: {
    background: "#0c0c0c",
    border: "1px solid #1a1a1a",
    borderRadius: "20px",
    padding: "32px",
    transition: "border-color 0.2s, transform 0.2s",
  },
  eduIcon: { fontSize: "32px", marginBottom: "16px" },
  eduTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "12px",
  },
  eduText: {
    fontSize: "14px",
    color: "#666",
    lineHeight: 1.8,
    margin: 0,
  },

  // ── Quote strip ───────────────────────────────────────────────────────────
  quoteStrip: {
    background: "#0d9e5e",
    padding: "56px",
    textAlign: "center",
    margin: "0",
  },
  quoteText: {
    fontSize: "clamp(28px, 4vw, 48px)",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "#fff",
    margin: "0 auto",
    maxWidth: "800px",
    lineHeight: 1.15,
  },
  quoteSub: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    marginTop: "12px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    padding: "40px 56px",
    borderTop: "1px solid #111",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  footerLeft: { fontSize: "13px", color: "#444" },
  footerRight: { fontSize: "13px", color: "#444" },

  // ── Loading state ─────────────────────────────────────────────────────────
  loadingBox: {
    maxWidth: "960px",
    margin: "0 auto 60px",
    padding: "0 56px",
    textAlign: "center",
  },
  loadingText: {
    fontSize: "18px",
    color: "#0d9e5e",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  loadingDots: { color: "#333", fontSize: "32px" },
};

// ─── Education data ────────────────────────────────────────────────────────────
const EDU = [
  {
    icon: "🦠",
    title: "Why Diseases Spread",
    text: "Fungal spores travel through air and water. High humidity, excess irrigation, and poor air circulation create the perfect environment. Rain spreads infection leaf to leaf rapidly.",
  },
  {
    icon: "🔎",
    title: "Early Symptoms",
    text: "Check for small yellow or brown spots, water-soaked patches, curling edges, and unusual dark rings. Early-stage spots are small — don't wait for them to grow large.",
  },
  {
    icon: "🌿",
    title: "Prevention First",
    text: "Use certified disease-free seeds. Space plants 40–50 cm apart for airflow. Water at soil level only. Remove and destroy infected leaves immediately.",
  },
  {
    icon: "💊",
    title: "Pesticide Safety",
    text: "Always match pesticide to detected disease. Spray at dawn or dusk. Wear gloves, mask and goggles. Never exceed recommended dosage — overuse harms soil health.",
  },
  {
    icon: "📅",
    title: "Crop Monitoring Routine",
    text: "Inspect plants every 3–4 days. Take photos of suspicious leaves. Rotate crops each season to break disease cycles. Record treatment dates in a notebook.",
  },
  {
    icon: "📈",
    title: "Improve Your Yield",
    text: "Healthy crops produce 30–50% more. Combine soil testing, balanced fertiliser, drip irrigation and AI-based disease detection to maximise your harvest every season.",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function KrishiDrishti() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!file) { alert("Please upload a leaf image first."); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axios.post("http://127.0.0.1:8000/predict", fd);
      setResult(res.data);
    } catch {
      alert("Cannot reach backend. Make sure the FastAPI server is running at port 8000.");
    }
    setLoading(false);
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={S.root}>
      {/* ── Keyframe injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap');
        @keyframes ticker { from { transform: translateX(100vw) } to { transform: translateX(-100%) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .btn-p:hover { background: #0a8a50 !important; transform: scale(1.03); }
        .btn-s:hover { border-color: #444 !important; }
        .edu-card:hover { border-color: #0d9e5e !important; transform: translateY(-4px); }
        .upload-area:hover { border-color: #0d9e5e !important; }
        .nav-item:hover { color: #fff !important; }
        @media (max-width: 768px) {
          .info-grid { grid-template-columns: 1fr !important; }
          .edu-grid  { grid-template-columns: 1fr !important; }
          .stats-row { flex-direction: column; margin: 0 !important; max-width:100% !important; }
          .stats-row > * { border-right: none !important; border-bottom: 1px solid #151515; }
          .hero-pad  { padding: 60px 24px 40px !important; }
          .section-pad { padding: 48px 24px !important; }
          .header-pad { padding: 18px 24px !important; }
          .footer-pad { padding: 32px 24px !important; }
          .quote-pad  { padding: 48px 24px !important; }
        }
      `}</style>

      {/* ── Ticker ── */}
      <div style={S.tickerWrap}>
        <span style={S.tickerInner}>
          &nbsp;&nbsp;&nbsp;🌾 KrishiDrishti — AI Crop Disease Detection &nbsp;•&nbsp;
          Early detection saves crops &nbsp;•&nbsp; Trusted by Indian farmers &nbsp;•&nbsp;
          Powered by Deep Learning &nbsp;•&nbsp; Upload. Detect. Protect. &nbsp;•&nbsp;
          🌿 Smart Farming for a Better India &nbsp;•&nbsp;&nbsp;&nbsp;
        </span>
      </div>

      {/* ── Header ── */}
      <header style={S.header} className="header-pad">
        <div>
          <h1 style={S.logo}>
            Krishi<span style={S.logoAccent}>Drishti</span>
          </h1>
          <div style={S.headerTag}>कृषि दृष्टि — AI Crop Vision</div>
        </div>
        <nav style={S.nav}>
          {["Detect", "How It Works", "Farmer Guide"].map((n) => (
            <span
              key={n}
              className="nav-item"
              style={S.navItem}
              onClick={() => scrollTo(n.toLowerCase().replace(/ /g, "-"))}
            >{n}</span>
          ))}
        </nav>
      </header>

      {/* ── Hero ── */}
      <section style={S.hero} className="hero-pad" id="detect">
        <p style={S.heroEyebrow}>AI-Powered Agriculture · India</p>
        <h1 style={S.heroH1}>Protect Your<br />Crops. Early.</h1>
        <p style={S.heroSub}>
          KrishiDrishti uses Convolutional Neural Networks trained on thousands
          of crop images to detect diseases instantly — so farmers can act before
          damage spreads.
        </p>
        <div style={S.heroBtnRow}>
          <button
            className="btn-p"
            style={S.btnPrimary}
            onClick={() => scrollTo("upload")}
          >Analyze Your Crop →</button>
          <button
            className="btn-s"
            style={S.btnSecondary}
            onClick={() => scrollTo("farmer-guide")}
          >Farmer Guide</button>
        </div>
      </section>

      {/* ── Stats ── */}
      <div style={S.stats} className="stats-row">
        {[
          { num: "95.6%", label: "Detection Accuracy" },
          { num: "4", label: "Disease Classes" },
          { num: "6,800+", label: "Training Images" },
          { num: "< 3s", label: "Average Analysis Time" },
        ].map((s) => (
          <div key={s.label} style={S.statItem}>
            <div style={S.statNum}>{s.num}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Upload ── */}
      <section id="upload" style={S.uploadSection} className="section-pad">
        <p style={S.sectionLabel}>Step 1</p>
        <h2 style={S.sectionTitle}>Upload a Leaf Photo</h2>

        <div
          className="upload-area"
          style={S.uploadArea}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={S.fileInput}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {preview ? (
            <img
              src={preview}
              alt="preview"
              style={{ maxHeight: 240, maxWidth: "100%", borderRadius: 12, objectFit: "contain" }}
            />
          ) : (
            <>
              <div style={S.uploadIcon}>🌿</div>
              <p style={S.uploadText}>
                Drag & drop your leaf image here, or click to browse.<br />
                JPG, PNG accepted.
              </p>
            </>
          )}
          {file && <div style={S.fileName}>✓ {file.name}</div>}
        </div>

        {file && !loading && (
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <button className="btn-p" style={S.btnPrimary} onClick={analyze}>
              Detect Disease →
            </button>
          </div>
        )}
      </section>

      {/* ── Loading ── */}
      {loading && (
        <div style={S.loadingBox} className="section-pad">
          <div style={S.loadingText}>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 8 }}>⟳</span>
            AI Vision Processing…
          </div>
          <p style={{ color: "#333", fontSize: 14, marginTop: 8 }}>
            Analyzing texture, color patterns and lesion signatures
          </p>
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <section id="result" style={S.resultSection} className="section-pad">
          <div style={S.resultCard}>
            <div style={S.resultGlow} />
            <div style={S.diseaseTag}>Detection Result</div>
            <h2 style={S.diseaseName}>{result.disease}</h2>

            <div style={S.confLabel}>
              <span>Model Confidence</span>
              <span style={{ color: "#0d9e5e" }}>{result.confidence}%</span>
            </div>
            <div style={S.barTrack}>
              <div style={S.barFill(result.confidence)} />
            </div>

            <div className="info-grid" style={S.infoGrid}>
              {[
                {
                  title: "Cause",
                  text: result.info.causes +
                    " Diseases typically thrive in moist, warm conditions. Fungal spores can survive in soil between seasons — early action is critical.",
                },
                {
                  title: "Symptoms",
                  text: result.info.symptoms +
                    " Inspect both upper and lower leaf surfaces. Discolouration often appears first near leaf margins before spreading inward.",
                },
                {
                  title: "Prevention",
                  text: result.info.prevention +
                    " Remove and bag infected plant material — never compost it. Rotate crops each season and choose resistant seed varieties when available.",
                },
                {
                  title: "Recommended Pesticide",
                  text: result.info.pesticide +
                    " Always read the label. Spray during cool morning hours for best absorption. Avoid spraying before rain to prevent runoff.",
                },
              ].map((c) => (
                <div key={c.title} style={S.infoCard}>
                  <div style={S.infoCardTitle}>{c.title}</div>
                  <p style={S.infoCardText}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Quote Strip ── */}
      <div style={S.quoteStrip} className="quote-pad">
        <p style={S.quoteText}>"A farmer who detects early, loses nothing."</p>
        <p style={S.quoteSub}>KrishiDrishti — Built for India's Farmers</p>
      </div>

      {/* ── Education ── */}
      <section id="farmer-guide" style={S.eduSection} className="section-pad">
        <p style={S.sectionLabel}>Farmer Guide</p>
        <h2 style={S.sectionTitle}>Know Your Crops</h2>
        <div className="edu-grid" style={S.eduGrid}>
          {EDU.map((e) => (
            <div key={e.title} className="edu-card" style={S.eduCard}>
              <div style={S.eduIcon}>{e.icon}</div>
              <div style={S.eduTitle}>{e.title}</div>
              <p style={S.eduText}>{e.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ ...S.eduSection, borderTop: "1px solid #111" }} className="section-pad">
        <p style={S.sectionLabel}>Technology</p>
        <h2 style={S.sectionTitle}>How KrishiDrishti Works</h2>
        <div className="edu-grid" style={{ ...S.eduGrid, gridTemplateColumns: "repeat(3,1fr)" }}>
          {[
            { step: "01", title: "Upload Leaf Photo", text: "Take a clear photo of an affected leaf. Good lighting helps — natural daylight works best." },
            { step: "02", title: "AI Analysis", text: "Our CNN model scans texture, colour variation and lesion patterns across 224×224 pixel regions." },
            { step: "03", title: "Get Your Result", text: "Receive disease identification, confidence score, causes, prevention steps and pesticide recommendation instantly." },
          ].map((s) => (
            <div key={s.step} className="edu-card" style={S.eduCard}>
              <div style={{ fontSize: "11px", color: "#0d9e5e", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 12 }}>{s.step}</div>
              <div style={S.eduTitle}>{s.title}</div>
              <p style={S.eduText}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={S.footer} className="footer-pad">
        <div style={S.footerLeft}>
          ©2026 "KrishiDrishti" India Pvt. Ltd · All rights reserved
        </div>
        <div style={S.footerRight}>
          Made in India · AI for Farmers · कृषि दृष्टि
        </div>
      </footer>
    </div>
  );
}
