import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";
const RC = { none: "#4ade80", low: "#facc15", moderate: "#fb923c", high: "#f87171" };

const TICKS = [
  "🌿 Monitor your tomato crop every 3 days for early disease signs",
  "💧 Always water at the base — never wet the leaves",
  "🌡️ Late Blight spreads fast in cool wet weather — act within 24 hours",
  "🐛 Check leaf undersides weekly for Spider Mites and Whiteflies",
  "🌱 Rotate crops every season to prevent soil-borne diseases",
  "☀️ Tomatoes need 6–8 hours of full sun daily for healthy growth",
  "💊 Copper Oxychloride prevents Bacterial Spot — spray every 7 days",
  "🇮🇳 KrishiDrishti — Free AI disease detection for Indian farmers",
  "🧪 Neem Oil spray every 15 days protects against pests and fungi",
  "📸 Upload a clear close-up leaf photo for best AI accuracy",
];

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
    setFile(f); setPreview(URL.createObjectURL(f));
    setResult(null); setError(null);
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
      <div className="orbs">
        <div className="orb o1"/><div className="orb o2"/><div className="orb o3"/>
      </div>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-inner">
          {[...TICKS, ...TICKS].map((t, i) => (
            <span key={i} className="t-item">{t}<span className="t-dot">·</span></span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <header className="nav">
        <div className="nav-wrap">
          <a href="/" className="logo">
            <div className="logo-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 5 6 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6 12 2 12 2Z"/>
              </svg>
            </div>
            <span className="logo-name">KrishiDrishti</span>
            <span className="logo-ai">AI</span>
          </a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#diagnose">Diagnose</a>
            <a href="#diseases">Diseases</a>
          </div>
          <a href="#diagnose" className="nav-cta">Try Free →</a>
          <button className="ham" onClick={() => setMenuOpen(!menuOpen)}>
            <span/><span/><span/>
          </button>
        </div>
        {menuOpen && (
          <div className="mob-menu">
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#diagnose" onClick={() => setMenuOpen(false)}>Diagnose</a>
            <a href="#diseases" onClick={() => setMenuOpen(false)}>Diseases</a>
            <a href="#diagnose" className="mob-cta" onClick={() => setMenuOpen(false)}>Try Free →</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="pill-dot"/>
              AI-Powered · Made in India 🇮🇳
            </div>
            <h1 className="hero-h1">
              Protect Your<br/>
              <em>Tomato Crop</em><br/>
              With AI
            </h1>
            <p className="hero-p">
              Upload a leaf photo. Get instant disease diagnosis, treatment plan
              and pesticide prices in ₹ — built for Indian farmers.
            </p>
            <div className="hero-actions">
              <button className="btn-green" onClick={() => document.getElementById("diagnose").scrollIntoView({behavior:"smooth"})}>
                Start Free Diagnosis
              </button>
              <button className="btn-outline" onClick={() => document.getElementById("diseases").scrollIntoView({behavior:"smooth"})}>
                View Disease Library
              </button>
            </div>
          </div>
          <div className="hero-stats">
            {[["89%+","Accuracy"],["10","Diseases"],["16,000+","Training Images"],["Free","Always"]].map(([n,l]) => (
              <div key={l} className="stat">
                <div className="stat-n">{n}</div>
                <div className="stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="container">
          <p className="sec-tag">How it works</p>
          <h2 className="sec-h2">Three steps to instant diagnosis</h2>
          <div className="steps">
            {[
              {n:"01",e:"📸",t:"Upload Photo",d:"Take a clear close-up of a tomato leaf in good natural light and upload it."},
              {n:"02",e:"🤖",t:"AI Analyzes",d:"MobileNetV2 deep learning scans for 10 disease patterns in seconds."},
              {n:"03",e:"💊",t:"Get Treatment",d:"Receive pesticide name, dosage and Indian market prices in Rupees."},
            ].map(({n,e,t,d}) => (
              <div key={n} className="step">
                <div className="step-n">{n}</div>
                <div className="step-e">{e}</div>
                <h3 className="step-t">{t}</h3>
                <p className="step-d">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIAGNOSE */}
      <section className="section sec-alt" id="diagnose">
        <div className="container">
          <p className="sec-tag">Diagnosis Tool</p>
          <h2 className="sec-h2">Upload your leaf photo</h2>
          <p className="sec-sub">Works best with close-up, well-lit photos of a single tomato leaf.</p>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="upload" className="tool-card"
                initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                exit={{opacity:0}} transition={{duration:0.35}}>
                <input ref={inputRef} type="file" accept="image/*"
                  onChange={e => handleFile(e.target.files[0])} hidden/>
                {!preview ? (
                  <div className={`dropzone ${drag?"dz-active":""}`}
                    onClick={() => inputRef.current.click()}
                    onDragOver={e=>{e.preventDefault();setDrag(true)}}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}>
                    <div className="dz-ico">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M20 4C20 4 10 10 10 18C10 23.5 14.5 28 20 29.5C25.5 28 30 23.5 30 18C30 10 20 4 20 4Z"
                          fill="#4ade80" opacity="0.15" stroke="#4ade80" strokeWidth="1.5"/>
                        <path d="M20 12V24M15 17L20 12L25 17" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="dz-title">Drop your tomato leaf photo here</p>
                    <p className="dz-hint">or tap to browse · JPG, PNG · Max 10MB</p>
                    <div className="dz-badge">💡 Close-up photo in good lighting = best accuracy</div>
                  </div>
                ) : (
                  <div className="preview-row">
                    <div className="preview-left">
                      <img src={preview} alt="leaf" className="preview-img"/>
                      <button className="remove-btn" onClick={reset}>✕ Remove</button>
                    </div>
                    <div className="preview-right">
                      <p className="file-name">{file.name}</p>
                      <p className="file-size">{(file.size/1024).toFixed(1)} KB · Ready to analyze</p>
                      {!loading && !error && (
                        <button className="btn-green full" onClick={analyze}>🔬 Detect Disease</button>
                      )}
                      {loading && (
                        <div className="loader">
                          <div className="prog-track">
                            <motion.div className="prog-bar"
                              initial={{width:"0%"}}
                              animate={{width: step===0?"20%":step===1?"55%":step===2?"82%":"97%"}}
                              transition={{duration:0.8,ease:"easeInOut"}}/>
                          </div>
                          <div className="l-steps">
                            {STEPS.map((s,i) => (
                              <div key={i} className={`l-step ${step>i?"l-done":step===i?"l-act":""}`}>
                                <span>{step>i?"✓":step===i?"●":"○"}</span>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!loading && error && (
                        <div className="err-area">
                          <div className="err-msg">⚠️ {error}</div>
                          <button className="btn-green full" onClick={analyze}>Try Again</button>
                          <button className="btn-ghost" onClick={reset}>Upload Different Photo</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="result"
                initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                transition={{duration:0.4}}>

                {/* Result Card */}
                <div className="res-card" style={{"--rc": RC[result.risk]}}>
                  <div className="res-head">
                    <div className="res-left">
                      <p className="res-label">AI Diagnosis Complete</p>
                      <h2 className="res-disease">{result.emoji} {result.disease}</h2>
                      <div className="res-risk" style={{background:`${RC[result.risk]}15`,color:RC[result.risk],border:`1px solid ${RC[result.risk]}35`}}>
                        {result.risk==="none" ? "✓ Healthy — No Disease Detected" : `⚠ ${riskLabel(result.risk)} — Action Required`}
                      </div>
                    </div>
                    <div className="res-ring-area">
                      <div className="ring-wrap">
                        <svg viewBox="0 0 120 120" className="ring-svg">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                          <motion.circle cx="60" cy="60" r="52" fill="none"
                            stroke={RC[result.risk]} strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${2*Math.PI*52}`}
                            initial={{strokeDashoffset:`${2*Math.PI*52}`}}
                            animate={{strokeDashoffset:`${2*Math.PI*52*(1-result.confidence/100)}`}}
                            transition={{duration:1.8,ease:"easeOut"}}
                            transform="rotate(-90 60 60)"/>
                        </svg>
                        <div className="ring-text">
                          <span className="ring-pct" style={{color:RC[result.risk]}}>{result.confidence}%</span>
                          <span className="ring-lbl">confidence</span>
                        </div>
                      </div>
                      <img src={preview} alt="" className="res-thumb"/>
                    </div>
                  </div>
                  <div className="res-meta">
                    {[["Disease",result.disease],["Confidence",`${result.confidence}%`],["Risk",riskLabel(result.risk)],["File",file.name]].map(([k,v]) => (
                      <div key={k} className="meta-cell">
                        <span className="meta-k">{k}</span>
                        <span className="meta-v" style={k==="Risk"?{color:RC[result.risk],fontWeight:600}:{}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Cards */}
                <div className="info-grid">
                  {[
                    {ico:"🧬",title:"Cause",     body:result.info.causes,     color:"#f87171"},
                    {ico:"🔬",title:"Symptoms",  body:result.info.symptoms,   color:"#fb923c"},
                    {ico:"🛡️",title:"Prevention",body:result.info.prevention, color:"#4ade80"},
                    {ico:"💊",title:"Treatment", body:result.info.pesticide,  color:"#60a5fa", extra:result.info.price},
                  ].map(({ico,title,body,color,extra},i) => (
                    <motion.div key={title} className="i-card"
                      initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
                      transition={{delay:i*0.08,duration:0.4}}>
                      <div className="i-head">
                        <span className="i-ico" style={{background:`${color}15`,color}}>{ico}</span>
                        <span className="i-title" style={{color}}>{title}</span>
                      </div>
                      <p className="i-body">{body}</p>
                      {extra && <div className="i-price">💰 {extra}</div>}
                    </motion.div>
                  ))}
                </div>

                {/* Farming Tips */}
                <div className="tips-box">
                  <h3 className="tips-h">🌱 Farming Tips for {result.disease}</h3>
                  <div className="tips-grid">
                    {(result.risk==="none" ? [
                      "✅ Keep monitoring your crop every 3–4 days",
                      "💧 Water at the base of plants, never on leaves",
                      "🌿 Apply Neem Oil spray every 15 days as prevention",
                      "🌱 Maintain proper spacing for good air circulation",
                    ] : result.risk==="high" ? [
                      "🚨 Act immediately — do not delay treatment",
                      "🗑️ Remove and burn all infected leaves today",
                      "💊 Apply recommended pesticide within 24 hours",
                      "🚫 Do not compost infected plant material",
                      "📞 Consult local agriculture officer if it is spreading fast",
                    ] : [
                      "⚠️ Start treatment within 2–3 days",
                      "✂️ Prune infected leaves with clean scissors",
                      "💊 Apply recommended fungicide or pesticide now",
                      "👀 Monitor remaining plants daily for spread",
                    ]).map((tip, i) => (
                      <div key={i} className="tip">{tip}</div>
                    ))}
                  </div>
                </div>

                {/* Probabilities */}
                <div className="prob-box">
                  <h3 className="prob-h">All Disease Probabilities</h3>
                  {Object.entries(result.all_probabilities).sort((a,b)=>b[1]-a[1]).map(([name,pct],i) => (
                    <div key={name} className={`p-row ${name===result.disease?"p-active":""}`}>
                      <span className="p-name">{name}</span>
                      <div className="p-track">
                        <motion.div className="p-fill"
                          initial={{width:0}} animate={{width:`${Math.max(pct,0.3)}%`}}
                          transition={{duration:0.8,delay:i*0.04}}
                          style={{background:name===result.disease?RC[result.risk]:"rgba(255,255,255,0.09)"}}/>
                      </div>
                      <span className="p-val">{pct}%</span>
                    </div>
                  ))}
                </div>

                <div className="res-actions">
                  <button className="btn-outline" onClick={reset}>↩ Analyze Another Leaf</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* DISEASE LIBRARY */}
      <section className="section" id="diseases">
        <div className="container">
          <p className="sec-tag">Disease Library</p>
          <h2 className="sec-h2">10 conditions we identify</h2>
          <p className="sec-sub">Trained on 16,000+ PlantVillage images with 89%+ accuracy.</p>
          <div className="disease-grid">
            {[
              {e:"🦠",n:"Bacterial Spot",      r:"High",    c:"#f87171",d:"Brown spots with yellow halos. Xanthomonas bacteria."},
              {e:"🟤",n:"Early Blight",         r:"Moderate",c:"#fb923c",d:"Concentric ring spots on older leaves. Alternaria fungus."},
              {e:"🖤",n:"Late Blight",           r:"High",    c:"#f87171",d:"Dark patches. Can destroy entire crop in days."},
              {e:"🟡",n:"Leaf Mold",             r:"Low",     c:"#facc15",d:"Pale yellow spots above, olive mold below."},
              {e:"⚪",n:"Septoria Leaf Spot",    r:"Moderate",c:"#fb923c",d:"White-centered spots. Spreads by rain splash."},
              {e:"🕷️",n:"Spider Mites",          r:"Moderate",c:"#fb923c",d:"Bronze stippling and webbing below leaves."},
              {e:"🎯",n:"Target Spot",           r:"Moderate",c:"#fb923c",d:"Target ring pattern on leaves and stems."},
              {e:"🌀",n:"Yellow Leaf Curl",      r:"High",    c:"#f87171",d:"Curling yellow leaves. Spread by whiteflies."},
              {e:"🧩",n:"Mosaic Virus",          r:"High",    c:"#f87171",d:"Mottled mosaic pattern. Spreads by contact."},
              {e:"🟢",n:"Healthy",               r:"None",    c:"#4ade80",d:"Deep green, uniform. No disease detected."},
            ].map(({e,n,r,c,d}) => (
              <div key={n} className="d-card">
                <span className="d-e">{e}</span>
                <h4 className="d-n">{n}</h4>
                <p className="d-d">{d}</p>
                <span className="d-r" style={{color:c,background:`${c}12`,border:`1px solid ${c}30`}}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-inner">
          {[
            {i:"🤖",k:"Model",   v:"MobileNetV2 Transfer Learning"},
            {i:"🎯",k:"Accuracy",v:"89%+ Validated on Test Set"},
            {i:"🌾",k:"Dataset", v:"PlantVillage · 16,000+ Images"},
            {i:"🇮🇳",k:"Origin",  v:"Built in India for Farmers"},
          ].map(({i,k,v}) => (
            <div key={k} className="trust-item">
              <span className="ti">{i}</span>
              <div>
                <div className="tk">{k}</div>
                <div className="tv">{v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING FOOTER */}
      <div className="foot-pad">
        <footer className="footer">
          <div className="foot-inner">
            <div className="foot-brand">
              <div className="logo" style={{marginBottom:"10px"}}>
                <div className="logo-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 5 6 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6 12 2 12 2Z"/></svg></div>
                <span className="logo-name">KrishiDrishti</span>
              </div>
              <p>AI-powered disease detection for Indian farmers. Free forever.</p>
            </div>
            <div className="foot-links">
              <a href="#how">How it works</a>
              <a href="#diagnose">Diagnose</a>
              <a href="#diseases">Diseases</a>
            </div>
            <div className="foot-right">
              <p className="foot-copy">© 2026 KrishiDrishti</p>
              <p className="foot-quote">"Strong Farmers,<br/>Strong Nation 🇮🇳"</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
