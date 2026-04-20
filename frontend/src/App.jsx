import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";
const RC = { none: "#4ade80", low: "#facc15", moderate: "#fb923c", high: "#f87171" };

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [drag, setDrag] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const t = [800, 1800, 2800].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => t.forEach(clearTimeout);
  }, [loading]);

  const handleFile = f => {
    if (!f?.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    setLoading(true); setError(null); setResult(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await axios.post(`${BACKEND}/predict`, fd);
      setResult(res.data);
    } catch (err) {
      const d = err?.response?.data?.detail || "";
      if (d.includes("NOT_A_LEAF")) setError("Please upload a real tomato leaf photo only.");
      else if (d.includes("LOW_CONFIDENCE")) setError("Image unclear. Use a close-up photo in good lighting.");
      else setError("Server is starting up. Please wait 30 seconds and try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const riskLabel = r => ({ none: "Healthy", low: "Low Risk", moderate: "Moderate Risk", high: "High Risk" }[r] || r);
  const STEPS = ["Reading image", "Running AI model", "Preparing report"];

  return (
    <div className="app">
      {/* Ambient background */}
      <div className="ambient-wrap">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      {/* ── NAV ── */}
      <header className="nav">
        <div className="nav-container">
          <a href="/" className="logo">
            <div className="logo-leaf">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 5 6 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6 12 2 12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <span>KrishiDrishti</span>
            <span className="logo-ai">AI</span>
          </a>

          <nav className="nav-links">
            <a href="#how">How it works</a>
            <a href="#diagnose">Diagnose</a>
            <a href="#diseases">Diseases</a>
          </nav>

          <a href="#diagnose" className="nav-cta">
            Try Free
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#diagnose" onClick={() => setMenuOpen(false)}>Diagnose</a>
            <a href="#diseases" onClick={() => setMenuOpen(false)}>Diseases</a>
            <a href="#diagnose" className="mob-cta" onClick={() => setMenuOpen(false)}>Try Free →</a>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              AI-Powered · Made in India
            </div>

            <h1 className="hero-title">
              Protect Your<br />
              <em>Tomato Crop</em><br />
              With AI
            </h1>

            <p className="hero-desc">
              Upload a leaf photo. Get instant disease diagnosis, pesticide
              recommendations and prices in rupees — built for Indian farmers.
            </p>

            <div className="hero-actions">
              <button
                className="btn-primary"
                onClick={() => document.getElementById("diagnose").scrollIntoView({ behavior: "smooth" })}
              >
                Start Free Diagnosis
              </button>
              <button
                className="btn-secondary"
                onClick={() => document.getElementById("diseases").scrollIntoView({ behavior: "smooth" })}
              >
                View Diseases
              </button>
            </div>
          </motion.div>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {[
              { n: "89%+", l: "Accuracy" },
              { n: "10", l: "Diseases Detected" },
              { n: "16K+", l: "Training Images" },
              { n: "Free", l: "Always" },
            ].map(({ n, l }) => (
              <div key={l} className="stat-card">
                <div className="stat-num">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how">
        <div className="container">
          <div className="section-tag">How it works</div>
          <h2 className="section-title">Three steps to<br />instant diagnosis</h2>
          <div className="steps-grid">
            {[
              { n: "01", icon: "📸", t: "Upload Photo", d: "Take a clear close-up of a tomato leaf in good natural light and upload it." },
              { n: "02", icon: "🤖", t: "AI Analyzes", d: "Our MobileNetV2 deep learning model scans for 10 different disease patterns in seconds." },
              { n: "03", icon: "💊", t: "Get Treatment", d: "Receive pesticide name, dosage instructions and market prices in Indian Rupees." },
            ].map(({ n, icon, t, d }, i) => (
              <motion.div
                key={n}
                className="step-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="step-number">{n}</div>
                <div className="step-icon">{icon}</div>
                <h3 className="step-title">{t}</h3>
                <p className="step-desc">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIAGNOSE TOOL ── */}
      <section className="section diagnose-section" id="diagnose">
        <div className="container">
          <div className="section-tag">Diagnosis Tool</div>
          <h2 className="section-title">Upload your<br />leaf photo</h2>
          <p className="section-sub">Works best with close-up, well-lit photos of a single tomato leaf.</p>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="upload"
                className="tool-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <input ref={inputRef} type="file" accept="image/*"
                  onChange={e => handleFile(e.target.files[0])} hidden />

                {!preview ? (
                  <div
                    className={`dropzone ${drag ? "dz-over" : ""}`}
                    onClick={() => inputRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                  >
                    <div className="dz-circle">
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <path d="M18 4C18 4 9 9 9 17C9 21.9 13 26 18 27.5C23 26 27 21.9 27 17C27 9 18 4 18 4Z" fill="#4ade80" opacity="0.2" stroke="#4ade80" strokeWidth="1.5"/>
                        <path d="M18 12V22M13 17L18 12L23 17" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="dz-title">Drop your tomato leaf photo here</p>
                    <p className="dz-hint">or tap to browse &nbsp;·&nbsp; JPG, PNG &nbsp;·&nbsp; Max 10MB</p>
                    <div className="dz-badge">
                      💡 Use a close-up photo with good lighting for best accuracy
                    </div>
                  </div>
                ) : (
                  <div className="preview-layout">
                    <div className="preview-img-wrap">
                      <img src={preview} alt="leaf" className="preview-img" />
                      <button className="remove-btn" onClick={reset}>✕</button>
                    </div>
                    <div className="preview-actions">
                      <div className="file-details">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                      </div>

                      {!loading && !error && (
                        <button className="btn-primary full-w" onClick={analyze}>
                          🔬 Detect Disease
                        </button>
                      )}

                      {loading && (
                        <div className="loader-wrap">
                          <div className="progress-bar">
                            <motion.div
                              className="progress-fill"
                              initial={{ width: "0%" }}
                              animate={{ width: step === 0 ? "20%" : step === 1 ? "55%" : step === 2 ? "82%" : "97%" }}
                              transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                          </div>
                          <div className="loader-steps">
                            {STEPS.map((s, i) => (
                              <div key={i} className={`lstep ${step > i ? "done" : step === i ? "active" : ""}`}>
                                <span className="lstep-dot">
                                  {step > i ? "✓" : step === i ? "●" : "○"}
                                </span>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!loading && error && (
                        <div className="error-wrap">
                          <div className="error-box">⚠️ {error}</div>
                          <button className="btn-primary full-w" onClick={analyze}>Try Again</button>
                          <button className="btn-ghost full-w" onClick={reset}>Upload Different Photo</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Result Card */}
                <div className="result-card" style={{ "--rc": RC[result.risk] }}>
                  <div className="result-top">
                    <div className="result-info">
                      <p className="result-tag">AI Diagnosis Complete</p>
                      <h2 className="result-disease">
                        {result.emoji} {result.disease}
                      </h2>
                      <div
                        className="risk-chip"
                        style={{
                          background: `${RC[result.risk]}18`,
                          color: RC[result.risk],
                          border: `1px solid ${RC[result.risk]}40`
                        }}
                      >
                        {result.risk === "none" ? "✓ Healthy — No Disease" : `⚠ ${riskLabel(result.risk)}`}
                      </div>
                    </div>
                    <div className="result-visual">
                      <div className="ring-wrap">
                        <svg viewBox="0 0 120 120" className="conf-ring">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                          <motion.circle
                            cx="60" cy="60" r="52" fill="none"
                            stroke={RC[result.risk]} strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 52}`}
                            initial={{ strokeDashoffset: `${2 * Math.PI * 52}` }}
                            animate={{ strokeDashoffset: `${2 * Math.PI * 52 * (1 - result.confidence / 100)}` }}
                            transition={{ duration: 1.8, ease: "easeOut" }}
                            transform="rotate(-90 60 60)"
                          />
                        </svg>
                        <div className="ring-center">
                          <span className="ring-pct" style={{ color: RC[result.risk] }}>{result.confidence}%</span>
                          <span className="ring-lbl">confidence</span>
                        </div>
                      </div>
                      <img src={preview} alt="" className="result-thumb" />
                    </div>
                  </div>

                  <div className="result-meta">
                    {[["Disease", result.disease], ["Confidence", `${result.confidence}%`], ["Risk", riskLabel(result.risk)], ["File", file.name]].map(([k, v]) => (
                      <div key={k} className="meta-row">
                        <span className="meta-k">{k}</span>
                        <span className="meta-v" style={k === "Risk" ? { color: RC[result.risk] } : {}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Cards */}
                <div className="info-grid">
                  {[
                    { icon: "🧬", title: "Cause", body: result.info.causes, color: "#f87171" },
                    { icon: "🔬", title: "Symptoms", body: result.info.symptoms, color: "#fb923c" },
                    { icon: "🛡️", title: "Prevention", body: result.info.prevention, color: "#4ade80" },
                    { icon: "💊", title: "Treatment", body: result.info.pesticide, color: "#60a5fa", extra: result.info.price },
                  ].map(({ icon, title, body, color, extra }, i) => (
                    <motion.div
                      key={title}
                      className="info-card"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <div className="ic-header">
                        <span className="ic-icon" style={{ background: `${color}18`, color }}>{icon}</span>
                        <span className="ic-title" style={{ color }}>{title}</span>
                      </div>
                      <p className="ic-body">{body}</p>
                      {extra && <div className="ic-price">💰 {extra}</div>}
                    </motion.div>
                  ))}
                </div>

                {/* Probabilities */}
                <div className="probs-card">
                  <h3 className="probs-title">All Disease Probabilities</h3>
                  {Object.entries(result.all_probabilities)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, pct], i) => (
                      <div key={name} className={`prob-row ${name === result.disease ? "prob-active" : ""}`}>
                        <span className="prob-name">{name}</span>
                        <div className="prob-bar">
                          <motion.div
                            className="prob-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(pct, 0.3)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.04 }}
                            style={{ background: name === result.disease ? RC[result.risk] : "rgba(255,255,255,0.1)" }}
                          />
                        </div>
                        <span className="prob-val">{pct}%</span>
                      </div>
                    ))}
                </div>

                <div className="result-footer">
                  <button className="btn-secondary" onClick={reset}>
                    ↩ Analyze Another Leaf
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── DISEASE LIBRARY ── */}
      <section className="section" id="diseases">
        <div className="container">
          <div className="section-tag">Disease Library</div>
          <h2 className="section-title">10 conditions<br />we identify</h2>
          <p className="section-sub">Trained on 16,000+ PlantVillage images with 89%+ accuracy.</p>
          <div className="disease-grid">
            {[
              { e: "🦠", n: "Bacterial Spot", r: "High", c: "#f87171", d: "Brown spots with yellow halos. Xanthomonas bacteria." },
              { e: "🟤", n: "Early Blight", r: "Moderate", c: "#fb923c", d: "Concentric ring spots on older leaves. Alternaria fungus." },
              { e: "🖤", n: "Late Blight", r: "High", c: "#f87171", d: "Dark patches spreading fast. Can destroy crop in days." },
              { e: "🟡", n: "Leaf Mold", r: "Low", c: "#facc15", d: "Pale yellow spots, olive mold below. High humidity." },
              { e: "⚪", n: "Septoria Leaf Spot", r: "Moderate", c: "#fb923c", d: "White-centered spots. Spreads by rain splash." },
              { e: "🕷️", n: "Spider Mites", r: "Moderate", c: "#fb923c", d: "Bronze stippling, webbing below leaves. Hot dry weather." },
              { e: "🎯", n: "Target Spot", r: "Moderate", c: "#fb923c", d: "Target ring pattern on leaves and stems." },
              { e: "🌀", n: "Yellow Leaf Curl", r: "High", c: "#f87171", d: "Curling yellow leaves. Spread by whiteflies." },
              { e: "🧩", n: "Mosaic Virus", r: "High", c: "#f87171", d: "Mottled mosaic pattern. Spreads by contact." },
              { e: "🟢", n: "Healthy", r: "None", c: "#4ade80", d: "Deep green, uniform. No disease detected." },
            ].map(({ e, n, r, c, d }) => (
              <div key={n} className="disease-card">
                <span className="d-emoji">{e}</span>
                <h4 className="d-name">{n}</h4>
                <p className="d-desc">{d}</p>
                <span className="d-risk" style={{ color: c, background: `${c}12`, border: `1px solid ${c}30` }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="trust-strip">
        <div className="trust-inner">
          {[
            { i: "🤖", k: "Model", v: "MobileNetV2 Transfer Learning" },
            { i: "🎯", k: "Accuracy", v: "89%+ Validated" },
            { i: "🌾", k: "Dataset", v: "PlantVillage · 16,000+ Images" },
            { i: "🇮🇳", k: "Built in", v: "India for Indian Farmers" },
          ].map(({ i, k, v }) => (
            <div key={k} className="trust-item">
              <span className="t-icon">{i}</span>
              <div>
                <div className="t-label">{k}</div>
                <div className="t-value">{v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FLOATING FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-leaf">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 5 6 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6 12 2 12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span>KrishiDrishti</span>
            </div>
            <p>AI-powered tomato disease detection for Indian farmers.</p>
          </div>
          <div className="footer-links">
            <a href="#how">How it works</a>
            <a href="#diagnose">Diagnose</a>
            <a href="#diseases">Diseases</a>
          </div>
          <div className="footer-right">
            <p className="footer-copy">© 2026 KrishiDrishti</p>
            <p className="footer-quote">"Strong Farmers,<br/>Strong Nation 🇮🇳"</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
