import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";

const RC = { none: "#22c55e", low: "#eab308", moderate: "#f97316", high: "#ef4444" };
const RISK_LABEL = { none: "Healthy", low: "Low Risk", moderate: "Moderate Risk", high: "High Risk" };

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const inputRef = useRef();

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const timers = [800, 1800, 2800].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleFile = useCallback((f) => {
    if (!f?.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axios.post(`${BACKEND}/predict`, fd);
      setResult(res.data);
    } catch (err) {
      const detail = err?.response?.data?.detail || "";
      if (detail.includes("NOT_A_LEAF")) {
        setError("🍃 Not a tomato leaf detected. Please upload a clear tomato leaf photo.");
      } else if (detail.includes("LOW_CONFIDENCE")) {
        setError("📸 Image unclear. Try a well-lit close-up photo of the leaf.");
      } else {
        setError("⚠️ Server error. Please try again in a moment.");
      }
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="app">
      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* Background */}
      <div className="bg-grid" />
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
      <div className="bg-orb orb3" />

      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="logo-icon">🌿</div>
            <span className="logo-text">KrishiDrishti</span>
            <span className="logo-badge">AI</span>
          </div>
          <div className="nav-links">
            <a href="#detect" className="nav-link">Detect</a>
            <a href="#diseases" className="nav-link">Diseases</a>
            <a href="#about" className="nav-link">About</a>
          </div>
          <div className="nav-cta-wrap">
            <button className="nav-cta" onClick={() => document.getElementById("detect").scrollIntoView({ behavior: "smooth" })}>
              Try Free →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <motion.div className="hero-tag" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="tag-dot" />
          AI-Powered · Made for Indian Farmers · Free Forever
        </motion.div>

        <motion.h1 className="hero-h1" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
          Detect Tomato<br />
          <span className="hero-gradient">Disease Instantly</span>
        </motion.h1>

        <motion.p className="hero-p" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          Upload a leaf photo. Our AI identifies the disease in seconds and recommends the right pesticide with prices in ₹.
        </motion.p>

        <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <button className="btn-primary" onClick={() => document.getElementById("detect").scrollIntoView({ behavior: "smooth" })}>
            Start Diagnosis
            <span className="btn-arrow">↓</span>
          </button>
          <div className="hero-stats">
            {[["89%+", "Accuracy"], ["10", "Diseases"], ["16K+", "Images Trained"], ["Free", "Always"]].map(([n, l]) => (
              <div key={l} className="hero-stat">
                <div className="stat-n">{n}</div>
                <div className="stat-l">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="floating-cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}>
          {[
            { emoji: "🦠", name: "Bacterial Spot", conf: "97.2%", risk: "high" },
            { emoji: "🟢", name: "Healthy Leaf", conf: "99.1%", risk: "none" },
            { emoji: "🟤", name: "Early Blight", conf: "94.8%", risk: "moderate" },
          ].map((c, i) => (
            <motion.div key={i} className="float-card"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}>
              <div className="fc-emoji">{c.emoji}</div>
              <div className="fc-info">
                <div className="fc-name">{c.name}</div>
                <div className="fc-conf" style={{ color: RC[c.risk] }}>{c.conf} confidence</div>
              </div>
              <div className="fc-dot" style={{ background: RC[c.risk] }} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Detection Section */}
      <section className="detect-section" id="detect">
        <div className="section-label">Disease Detection</div>
        <h2 className="section-h2">Upload Your Leaf Photo</h2>
        <p className="section-p">Take a clear, close-up photo of a single tomato leaf in good lighting.</p>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="upload" className="upload-card"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}>

              <input ref={inputRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} hidden />

              {!preview ? (
                <div className={`drop-zone ${dragOver ? "drag" : ""}`}
                  onClick={() => inputRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}>
                  <div className="dz-icon">🍃</div>
                  <div className="dz-title">Drop your leaf photo here</div>
                  <div className="dz-sub">or click to browse · JPG, PNG · Max 10MB</div>
                  <div className="dz-hint">⚠️ Tomato leaves only for accurate results</div>
                </div>
              ) : (
                <div className="preview-area">
                  <div className="preview-img-wrap">
                    <img src={preview} alt="leaf" className="preview-img" />
                  </div>
                  <div className="preview-info">
                    <div className="preview-filename">{file.name}</div>
                    <div className="preview-size">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</div>

                    {!loading && (
                      <>
                        <button className="detect-btn" onClick={analyze}>
                          🔬 Detect Disease
                        </button>
                        <button className="ghost-btn" onClick={reset}>Change Photo</button>
                      </>
                    )}

                    {loading && (
                      <div className="loading-area">
                        <div className="loading-ring" />
                        <div className="loading-steps">
                          {["Reading image", "Running AI model", "Preparing report"].map((s, i) => (
                            <div key={i} className={`lstep ${step > i ? "done" : step === i ? "active" : ""}`}>
                              <div className="lstep-icon">{step > i ? "✓" : step === i ? "◉" : "○"}</div>
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="error-box">
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

              <div className="result-card" style={{ "--rc": RC[result.risk] }}>
                <div className="result-header">
                  <div className="result-left">
                    <div className="result-label">AI Diagnosis Complete</div>
                    <div className="result-disease">
                      <span className="disease-emoji">{result.emoji}</span>
                      {result.disease}
                    </div>
                    <div className="result-risk-badge" style={{ color: RC[result.risk], borderColor: RC[result.risk] + "40", background: RC[result.risk] + "15" }}>
                      {RISK_LABEL[result.risk]}
                    </div>
                  </div>
                  <div className="result-ring-wrap">
                    <svg viewBox="0 0 120 120" className="conf-ring">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <motion.circle cx="60" cy="60" r="50" fill="none"
                        stroke={RC[result.risk]} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
                        animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - result.confidence / 100)}` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        transform="rotate(-90 60 60)" />
                    </svg>
                    <div className="conf-inner">
                      <div className="conf-pct">{result.confidence}%</div>
                      <div className="conf-label">confidence</div>
                    </div>
                  </div>
                </div>

                <div className="result-meta">
                  <img src={preview} alt="" className="result-thumb" />
                  <div className="meta-grid">
                    {[["Disease", result.disease], ["Confidence", `${result.confidence}%`], ["Risk Level", RISK_LABEL[result.risk]], ["File", file.name]].map(([k, v]) => (
                      <div key={k} className="meta-item">
                        <div className="meta-key">{k}</div>
                        <div className="meta-val" style={k === "Risk Level" ? { color: RC[result.risk] } : {}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="info-grid">
                {[
                  { icon: "🧬", title: "Cause", key: "causes", color: "#ef4444" },
                  { icon: "🔬", title: "Symptoms", key: "symptoms", color: "#f97316" },
                  { icon: "🛡️", title: "Prevention", key: "prevention", color: "#22c55e" },
                  { icon: "💊", title: "Treatment", key: "pesticide", color: "#3b82f6", extra: result.info.price },
                ].map(({ icon, title, key, color, extra }, i) => (
                  <motion.div key={key} className="info-tile"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}>
                    <div className="tile-icon" style={{ background: color + "20", color }}>{icon}</div>
                    <div className="tile-title" style={{ color }}>{title}</div>
                    <p className="tile-body">{result.info[key]}</p>
                    {extra && <div className="tile-price">💰 {extra}</div>}
                  </motion.div>
                ))}
              </div>

              <div className="probs-card">
                <div className="probs-title">All Disease Probabilities</div>
                <div className="probs-list">
                  {Object.entries(result.all_probabilities).sort((a, b) => b[1] - a[1]).map(([name, pct], i) => (
                    <div key={name} className={`prob-row ${name === result.disease ? "prob-active" : ""}`}>
                      <span className="prob-name">{name}</span>
                      <div className="prob-bar-wrap">
                        <motion.div className="prob-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 0.3)}%` }}
                          transition={{ duration: 0.8, delay: i * 0.04 }}
                          style={{ background: name === result.disease ? RC[result.risk] : "rgba(255,255,255,0.1)" }} />
                      </div>
                      <span className="prob-pct">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reset-wrap">
                <button className="reset-btn" onClick={reset}>↺ Analyze Another Leaf</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Disease Library */}
      <section className="lib-section" id="diseases">
        <div className="section-label">Disease Library</div>
        <h2 className="section-h2">10 Conditions We Detect</h2>
        <p className="section-p">Learn to recognise what you're dealing with before uploading.</p>
        <div className="lib-grid">
          {[
            { e: "🦠", n: "Bacterial Spot", r: "high", d: "Brown spots with yellow halos from Xanthomonas bacteria." },
            { e: "🟤", n: "Early Blight", r: "moderate", d: "Concentric ring spots on older leaves. Alternaria fungus." },
            { e: "🖤", n: "Late Blight", r: "high", d: "Rapid dark patches. Can destroy entire crop in days." },
            { e: "🟡", n: "Leaf Mold", r: "low", d: "Yellow above, fuzzy below. Needs high humidity to spread." },
            { e: "⚪", n: "Septoria Leaf Spot", r: "moderate", d: "White-centred spots spreading through water splash." },
            { e: "🕷️", n: "Spider Mites", r: "moderate", d: "Bronze stippling and webbing in hot dry conditions." },
            { e: "🎯", n: "Target Spot", r: "moderate", d: "Ring pattern spots appearing on leaves and stems." },
            { e: "🌀", n: "Yellow Leaf Curl Virus", r: "high", d: "Curling yellow leaves spread by whiteflies." },
            { e: "🧩", n: "Mosaic Virus", r: "high", d: "Mottled green mosaic spreading by contact." },
            { e: "🟢", n: "Healthy", r: "none", d: "Deep green, no spots. Perfectly healthy tomato leaf." },
          ].map(({ e, n, r, d }) => (
            <motion.div key={n} className="lib-tile" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <div className="lib-emoji">{e}</div>
              <div className="lib-name">{n}</div>
              <div className="lib-desc">{d}</div>
              <div className="lib-risk" style={{ color: RC[r], borderColor: RC[r] + "40", background: RC[r] + "12" }}>
                {RISK_LABEL[r]}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="trust-section" id="about">
        <div className="section-label">About</div>
        <h2 className="section-h2">Built for Real Farmers</h2>
        <p className="section-p">State-of-the-art deep learning to protect your tomato crop.</p>
        <div className="trust-grid">
          {[
            { icon: "🤖", title: "MobileNetV2 Model", desc: "Transfer learning on 16,000+ real leaf images from PlantVillage dataset." },
            { icon: "🎯", title: "89%+ Accuracy", desc: "Validated on 3,200+ test images across all 10 disease categories." },
            { icon: "💊", title: "Treatment Ready", desc: "Every diagnosis includes pesticide names, dosages and Indian market prices." },
            { icon: "🇮🇳", title: "Made in India", desc: "Built specifically for Indian farmers with local pesticide prices in ₹." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="trust-tile">
              <div className="trust-icon">{icon}</div>
              <div className="trust-title">{title}</div>
              <div className="trust-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">🌿 KrishiDrishti</div>
          <div className="footer-tagline">कृषि दृष्टि — AI for Indian Farmers</div>
          <div className="footer-quote">"Strong Farmers Build a Strong Nation 🇮🇳"</div>
          <div className="footer-copy">© 2026 KrishiDrishti · All rights reserved</div>
        </div>
      </footer>
    </div>
  );
}
