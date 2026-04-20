import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Leaf, AlertTriangle, CheckCircle, RotateCcw, Sprout, Shield, FlaskConical, Eye } from "lucide-react";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";
const RISK_COLOR = { none: "#4ade80", low: "#facc15", moderate: "#fb923c", high: "#f87171" };
const RISK_GLOW  = { none: "#4ade8033", low: "#facc1533", moderate: "#fb923c33", high: "#f8717133" };

function FloatingOrbs() {
  return (
    <div className="orbs">
      <div className="orb orb1"/>
      <div className="orb orb2"/>
      <div className="orb orb3"/>
    </div>
  );
}

export default function App() {
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error,    setError]    = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (!loading) { setLoadStep(0); return; }
    const steps = [800, 1800, 2800];
    const timers = steps.map((t, i) => setTimeout(() => setLoadStep(i + 1), t));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setResult(null); setError(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await axios.post(`${BACKEND}/predict`, form);
      setResult(res.data);
    } catch(err) {
      const d = err?.response?.data?.detail || "";
      if (d.includes("NOT_A_LEAF"))          setError("🍃 Not a tomato leaf! Please upload a real tomato plant leaf photo.");
      else if (d.includes("LOW_CONFIDENCE")) setError("📸 Image not clear enough. Try a close-up in good lighting.");
      else                                   setError("⏳ Server waking up. Wait 30 seconds and try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null); setPreview(null);
    setResult(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const loadSteps = ["📸 Reading image…", "🧠 Running AI model…", "📋 Preparing report…"];

  return (
    <div className="app">
      <FloatingOrbs />

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-track">
          {[0,1].map(i => (
            <span key={i} className="ticker-inner">
              🌿 AI Crop Doctor &nbsp;·&nbsp; 10 Tomato Diseases &nbsp;·&nbsp;
              Free for Farmers &nbsp;·&nbsp; 89%+ Accuracy &nbsp;·&nbsp;
              MobileNetV2 Deep Learning &nbsp;·&nbsp; कृषि दृष्टि &nbsp;·&nbsp;
              Made in India 🇮🇳 &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav>
        <div className="nav-logo">
          <div className="nav-logo-mark">
            <Sprout size={18} strokeWidth={2.5}/>
          </div>
          <div>
            <div className="nav-name">KrishiDrishti</div>
            <div className="nav-tagline">कृषि दृष्टि</div>
          </div>
        </div>
        <div className="nav-badge">🇮🇳 For Indian Farmers</div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <motion.div className="hero-inner"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>

          <div className="hero-eyebrow">
            <span className="dot"/>
            AI-Powered · MobileNetV2 · 10 Disease Classes
          </div>

          <h1 className="hero-title">
            Your Crop Deserves<br/>
            <span className="hero-accent">Expert Diagnosis</span>
          </h1>

          <p className="hero-sub">
            Upload a tomato leaf. Our AI detects disease in seconds —
            with treatment advice, pesticide names, and prices in INR.
          </p>

          <div className="hero-stats">
            {[
              { n: "89%+", l: "Accuracy" },
              { n: "10",   l: "Diseases" },
              { n: "16K+", l: "Images Trained" },
              { n: "Free", l: "Always" },
            ].map(({ n, l }) => (
              <div key={l} className="hero-stat">
                <div className="hero-stat-n">{n}</div>
                <div className="hero-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
          <div className="leaf-illustration">
            <div className="leaf-glow"/>
            <Leaf size={96} strokeWidth={1} className="leaf-icon-big"/>
            <div className="leaf-ring leaf-ring1"/>
            <div className="leaf-ring leaf-ring2"/>
            <div className="leaf-ring leaf-ring3"/>
          </div>
        </motion.div>
      </section>

      {/* Upload / Result */}
      <section className="main-section">
        <AnimatePresence mode="wait">

          {!result && (
            <motion.div key="upload" className="upload-wrapper"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}>

              <div className="upload-header">
                <h2>Upload Leaf Photo</h2>
                <p>Take a clear, well-lit photo of a single tomato leaf</p>
              </div>

              <div className="upload-zone"
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
                onDragLeave={e => e.currentTarget.classList.remove("drag")}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("drag"); handleFile(e.dataTransfer.files[0]); }}>

                <input ref={inputRef} type="file" accept="image/*"
                  onChange={e => handleFile(e.target.files[0])} hidden />

                {!preview ? (
                  <div className="upload-prompt" onClick={() => inputRef.current.click()}>
                    <div className="upload-icon-wrap">
                      <Upload size={28} strokeWidth={1.5}/>
                    </div>
                    <div className="upload-prompt-text">
                      <strong>Drop your leaf photo here</strong>
                      <span>or click to browse files</span>
                    </div>
                    <div className="upload-hint">JPG, PNG supported · Max 10MB</div>
                  </div>
                ) : (
                  <div className="preview-layout">
                    <div className="preview-img-wrap">
                      <img src={preview} alt="leaf"/>
                      <div className="preview-img-overlay">
                        <button className="change-btn" onClick={reset}>Change</button>
                      </div>
                    </div>
                    <div className="preview-details">
                      <div className="preview-filename">{file.name}</div>
                      <div className="preview-filesize">{(file.size/1024).toFixed(1)} KB</div>

                      {!loading && !error && (
                        <button className="analyze-btn" onClick={analyze}>
                          <span>🔬 Detect Disease</span>
                          <div className="analyze-btn-shine"/>
                        </button>
                      )}

                      {loading && (
                        <div className="loading-state">
                          <div className="loading-spinner">
                            <div className="spinner-ring"/>
                            <Leaf size={18} className="spinner-leaf"/>
                          </div>
                          <div className="loading-steps">
                            {loadSteps.map((s, i) => (
                              <div key={i} className={`load-step ${loadStep > i ? "done" : loadStep === i ? "active" : ""}`}>
                                <div className="load-dot"/>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!loading && error && (
                        <div className="error-card">
                          <AlertTriangle size={16}/>
                          <span>{error}</span>
                        </div>
                      )}

                      {!loading && error && (
                        <div style={{display:"flex",gap:"10px",marginTop:"8px",flexWrap:"wrap"}}>
                          <button className="analyze-btn" onClick={analyze} style={{fontSize:"13px",padding:"10px 20px"}}>
                            <span>Try Again</span>
                          </button>
                          <button className="reset-btn" onClick={reset}>
                            <RotateCcw size={14}/> Change Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div key="result" className="result-wrapper"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}>

              {/* Result Hero */}
              <div className="result-hero"
                style={{ "--rc": RISK_COLOR[result.risk], "--rg": RISK_GLOW[result.risk] }}>
                <div className="result-hero-left">
                  <div className="result-label">AI Diagnosis Complete</div>
                  <h2 className="result-name">
                    {result.emoji} {result.disease}
                  </h2>
                  <div className="result-risk-badge">
                    {result.risk === "none"
                      ? <><CheckCircle size={14}/> Healthy — No Disease Found</>
                      : result.risk === "high"
                        ? <><AlertTriangle size={14}/> High Risk — Act Immediately</>
                        : result.risk === "moderate"
                          ? <><AlertTriangle size={14}/> Moderate Risk — Act This Week</>
                          : <><AlertTriangle size={14}/> Low Risk — Monitor Closely</>}
                  </div>
                </div>

                <div className="result-conf-wrap">
                  <svg className="conf-ring-svg" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                    <motion.circle cx="60" cy="60" r="50" fill="none"
                      stroke={RISK_COLOR[result.risk]} strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - result.confidence / 100)}` }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                      transform="rotate(-90 60 60)"/>
                  </svg>
                  <div className="conf-inner">
                    <div className="conf-pct">{result.confidence}%</div>
                    <div className="conf-lbl">confidence</div>
                  </div>
                </div>
              </div>

              {/* Leaf + Meta */}
              <div className="result-meta-row">
                <img src={preview} alt="analyzed leaf" className="result-thumb"/>
                <div className="result-meta-items">
                  {[
                    ["Disease",    result.disease],
                    ["Confidence", `${result.confidence}%`],
                    ["Risk Level", result.risk === "none" ? "None" : result.risk],
                    ["File",       file.name],
                  ].map(([k, v]) => (
                    <div key={k} className="meta-chip">
                      <span className="meta-chip-k">{k}</span>
                      <span className="meta-chip-v"
                        style={k === "Risk Level" ? { color: RISK_COLOR[result.risk], textTransform: "capitalize" } : {}}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Cards */}
              <div className="info-cards">
                {[
                  { icon: <FlaskConical size={20}/>, label: "Cause of Disease",      key: "causes",     accent: "#f87171" },
                  { icon: <Eye size={20}/>,           label: "Symptoms",             key: "symptoms",   accent: "#fb923c" },
                  { icon: <Shield size={20}/>,        label: "Prevention",           key: "prevention", accent: "#4ade80" },
                  { icon: <Leaf size={20}/>,          label: "Treatment & Pesticide",key: "pesticide",  accent: "#60a5fa",
                    extra: `💰 ${result.info.price}` },
                ].map(({ icon, label, key, accent, extra }, idx) => (
                  <motion.div key={key} className="info-card"
                    style={{ "--a": accent }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}>
                    <div className="info-card-icon" style={{ color: accent, background: `${accent}15` }}>
                      {icon}
                    </div>
                    <div className="info-card-label">{label}</div>
                    <p className="info-card-text">{result.info[key]}</p>
                    {extra && <div className="info-card-price">{extra}</div>}
                  </motion.div>
                ))}
              </div>

              {/* Probabilities */}
              <div className="probs-card">
                <div className="probs-title">📊 All Disease Probabilities</div>
                <div className="probs-list">
                  {Object.entries(result.all_probabilities)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, prob], i) => (
                      <div key={name} className={`prob-row ${name === result.disease ? "prob-row-top" : ""}`}>
                        <span className="prob-name">{name}</span>
                        <div className="prob-track">
                          <motion.div className="prob-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(prob, 0.5)}%` }}
                            transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                            style={{
                              background: name === result.disease
                                ? `linear-gradient(90deg, ${RISK_COLOR[result.risk]}, ${RISK_COLOR[result.risk]}99)`
                                : "rgba(255,255,255,0.1)"
                            }}/>
                        </div>
                        <span className="prob-val">{prob}%</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="result-actions">
                <button className="reset-btn" onClick={reset}>
                  <RotateCcw size={15}/> Analyze Another Leaf
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Disease Library */}
      <section className="library-section">
        <div className="section-tag">Disease Library</div>
        <h2 className="section-title">10 Diseases We Detect</h2>
        <p className="section-sub">Compare your leaf with these disease profiles before uploading.</p>
        <div className="library-grid">
          {[
            { em:"🦠", name:"Bacterial Spot",        risk:"High",     rc:"#f87171", desc:"Water-soaked brown spots with yellow halos. Spreads via rain splash." },
            { em:"🟤", name:"Early Blight",           risk:"Moderate", rc:"#fb923c", desc:"Dark circular rings on older leaves. Caused by Alternaria solani fungus." },
            { em:"🖤", name:"Late Blight",             risk:"High",     rc:"#f87171", desc:"Rapid dark patches. Can destroy entire crop in days." },
            { em:"🟡", name:"Leaf Mold",               risk:"Low",      rc:"#facc15", desc:"Yellow patches above, fuzzy coating below. Needs high humidity." },
            { em:"⚪", name:"Septoria Leaf Spot",      risk:"Moderate", rc:"#fb923c", desc:"White-centred spots on lower leaves. Spreads through water." },
            { em:"🕷️", name:"Spider Mites",            risk:"Moderate", rc:"#fb923c", desc:"Bronze stippling and webbing. Thrives in hot dry conditions." },
            { em:"🎯", name:"Target Spot",             risk:"Moderate", rc:"#fb923c", desc:"Concentric ring spots on leaves and stems." },
            { em:"🌀", name:"Yellow Leaf Curl Virus",  risk:"High",     rc:"#f87171", desc:"Leaves curl yellow. Spread by whiteflies. No cure." },
            { em:"🧩", name:"Mosaic Virus",            risk:"High",     rc:"#f87171", desc:"Mottled green mosaic. Spreads by contact and tools." },
            { em:"🟢", name:"Healthy",                 risk:"None",     rc:"#4ade80", desc:"Deep green uniform leaves. No spots or issues." },
          ].map(({ em, name, risk, rc, desc }) => (
            <div key={name} className="lib-card">
              <div className="lib-em">{em}</div>
              <div className="lib-name">{name}</div>
              <div className="lib-desc">{desc}</div>
              <div className="lib-risk" style={{ color: rc, borderColor: `${rc}30`, background: `${rc}10` }}>
                {risk} Risk
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <div className="trust-bar">
        {[
          { icon:"🤖", k:"Model",    v:"MobileNetV2 Transfer Learning" },
          { icon:"🎯", k:"Accuracy", v:"89%+ Validated" },
          { icon:"🌾", k:"Dataset",  v:"PlantVillage 16,000+ Images" },
          { icon:"🇮🇳", k:"Origin",   v:"Built in India" },
        ].map(({ icon, k, v }) => (
          <div key={k} className="trust-item">
            <div className="trust-icon">{icon}</div>
            <div><div className="trust-k">{k}</div><div className="trust-v">{v}</div></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-left">
          <div className="footer-brand">KrishiDrishti</div>
          <div className="footer-copy">©2026 KrishiDrishti India Pvt. Ltd</div>
        </div>
        <div className="footer-quote">"Strong Farmers Build a Strong Nation 🇮🇳"</div>
      </footer>

    </div>
  );
}
