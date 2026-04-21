import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";
const RC = { none:"#22c55e", low:"#eab308", moderate:"#f97316", high:"#ef4444" };

const TICKS = [
  "🌿 Monitor your crop every 3 days for early disease signs",
  "💧 Water at the base — never wet the leaves",
  "🌡️ Late Blight spreads fast in cool wet weather — act within 24 hours",
  "🐛 Check leaf undersides weekly for Spider Mites",
  "🌱 Rotate crops every season to prevent soil-borne diseases",
  "☀️ Tomatoes need 6–8 hours of full sun daily",
  "💊 Copper Oxychloride prevents Bacterial Spot — spray every 7 days",
  "🇮🇳 KrishiDrishti — Free AI disease detection for Indian farmers",
  "🧪 Neem Oil spray every 15 days protects against pests and fungi",
  "📸 Upload a clear close-up leaf photo for best AI accuracy",
];

const DISEASES = [
  {e:"🦠",n:"Bacterial Spot",      r:"High",    c:"#ef4444",d:"Brown water-soaked spots with yellow halos. Caused by Xanthomonas bacteria."},
  {e:"🟤",n:"Early Blight",         r:"Moderate",c:"#f97316",d:"Concentric ring spots on older leaves. Alternaria solani fungus."},
  {e:"🖤",n:"Late Blight",           r:"High",    c:"#ef4444",d:"Dark water-soaked patches. Can destroy entire crop in days."},
  {e:"🟡",n:"Leaf Mold",             r:"Low",     c:"#eab308",d:"Pale yellow spots above, olive-green mold below. High humidity."},
  {e:"⚪",n:"Septoria Leaf Spot",    r:"Moderate",c:"#f97316",d:"White-centered spots with dark borders. Spreads by rain splash."},
  {e:"🕷️",n:"Spider Mites",          r:"Moderate",c:"#f97316",d:"Bronze leaf stippling with webbing underneath. Hot dry weather."},
  {e:"🎯",n:"Target Spot",           r:"Moderate",c:"#f97316",d:"Circular target-ring pattern on leaves and stems."},
  {e:"🌀",n:"Yellow Leaf Curl Virus",r:"High",    c:"#ef4444",d:"Leaves curl upward and yellow at edges. Spread by whiteflies."},
  {e:"🧩",n:"Mosaic Virus",          r:"High",    c:"#ef4444",d:"Mottled light-dark green mosaic pattern. Spreads by contact."},
  {e:"🟢",n:"Healthy",               r:"None",    c:"#22c55e",d:"Deep green, uniform color. No disease detected."},
];

export default function App() {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(0);
  const [error,   setError]   = useState(null);
  const [drag,    setDrag]    = useState(false);
  const [menu,    setMenu]    = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const t = [900, 2000, 3100].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
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
      if (d.includes("NOT_A_LEAF"))        setError("Please upload a real tomato leaf photo only.");
      else if (d.includes("LOW_CONFIDENCE")) setError("Image unclear. Use a close-up in good lighting.");
      else setError("Server is starting up. Wait 30 seconds and try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const riskLabel = r => ({none:"Healthy",low:"Low Risk",moderate:"Moderate Risk",high:"High Risk"}[r]||r);
  const STEPS = ["Reading image","Running AI model","Preparing report"];

  const tips = result ? (
    result.risk === "none"    ? ["✅ Keep monitoring your crop every 3–4 days","💧 Water at the base, never on leaves","🌿 Apply Neem Oil spray every 15 days","🌱 Maintain spacing for good air circulation"] :
    result.risk === "high"    ? ["🚨 Act immediately — do not delay","🗑️ Remove and burn all infected leaves today","💊 Apply recommended pesticide within 24 hours","🚫 Do not compost infected material","📞 Contact local agriculture officer"] :
                                ["⚠️ Start treatment within 2–3 days","✂️ Prune infected leaves with clean scissors","💊 Apply recommended fungicide now","👀 Monitor remaining plants daily"]
  ) : [];

  return (
    <div className="app">

      {/* ── BACKGROUND ── */}
      <div className="bg-mesh" />
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      {/* ── TICKER ── */}
      <div className="ticker" aria-label="Farming tips">
        <div className="ticker-label">LIVE TIPS</div>
        <div className="ticker-viewport">
          <div className="ticker-track">
            {[...TICKS,...TICKS].map((t,i) => (
              <span key={i} className="tick">{t}<span className="tick-sep">·</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <header className="nav">
        <div className="nav-inner">
          <a href="/" className="brand">
            <div className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 5 6.5 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6.5 12 2 12 2Z"/>
              </svg>
            </div>
            <span className="brand-name">KrishiDrishti</span>
            <span className="brand-badge">AI</span>
          </a>

          <nav className="nav-menu">
            <a href="#how">How it works</a>
            <a href="#diagnose">Diagnose</a>
            <a href="#diseases">Diseases</a>
          </nav>

          <div className="nav-end">
            <a href="#diagnose" className="nav-btn">
              Try Free
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <button className="hamburger" onClick={() => setMenu(!menu)} aria-label="Menu">
              <span className={menu?"open":""}/>
              <span className={menu?"open":""}/>
              <span className={menu?"open":""}/>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menu && (
            <motion.div className="mob-nav"
              initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
              exit={{height:0,opacity:0}} transition={{duration:0.25}}>
              <a href="#how" onClick={() => setMenu(false)}>How it works</a>
              <a href="#diagnose" onClick={() => setMenu(false)}>Diagnose</a>
              <a href="#diseases" onClick={() => setMenu(false)}>Diseases</a>
              <a href="#diagnose" className="mob-btn" onClick={() => setMenu(false)}>Try Free →</a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section className="hero" id="top">
        <div className="container">

          <div className="hero-grid">
            <div className="hero-text">
              <div className="hero-eyebrow">
                <span className="eyebrow-pulse"/>
                AI-Powered Plant Health · Made in India 🇮🇳
              </div>

              <h1 className="hero-title">
                Protect Your<br/>
                <span className="hero-gradient">Tomato Crop</span><br/>
                With AI
              </h1>

              <p className="hero-desc">
                Upload a leaf photo. Get instant disease diagnosis, full treatment plan
                and pesticide prices in ₹ — designed for Indian farmers.
              </p>

              <div className="hero-ctas">
                <button className="cta-primary" onClick={() => document.getElementById("diagnose").scrollIntoView({behavior:"smooth"})}>
                  <span>Start Free Diagnosis</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="cta-secondary" onClick={() => document.getElementById("diseases").scrollIntoView({behavior:"smooth"})}>
                  View Disease Library
                </button>
              </div>

              <div className="hero-trust">
                {["89%+ Accuracy","10 Diseases","16,000+ Images","Free Forever"].map(t => (
                  <div key={t} className="trust-pill">
                    <span className="trust-check">✓</span>{t}
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card-big">
                <div className="hc-label">Live Detection</div>
                <div className="hc-badge healthy">
                  <span className="hc-dot"/>Healthy Leaf
                </div>
                <div className="hc-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="6"/>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="6"
                      strokeDasharray="197" strokeDashoffset="20" strokeLinecap="round"
                      transform="rotate(-90 50 50)"/>
                  </svg>
                  <div className="hc-ring-text">
                    <span className="hc-pct">89%</span>
                    <span className="hc-lbl">confidence</span>
                  </div>
                </div>
                <div className="hc-bottom">
                  <div className="hc-stat"><span>Disease</span><strong>Healthy</strong></div>
                  <div className="hc-stat"><span>Risk</span><strong style={{color:"#22c55e"}}>None</strong></div>
                </div>
              </div>
              <div className="hero-card-sm card-sm-1">
                <span className="csm-ico">🌱</span>
                <span className="csm-txt">MobileNetV2<br/>Deep Learning</span>
              </div>
              <div className="hero-card-sm card-sm-2">
                <span className="csm-ico">🇮🇳</span>
                <span className="csm-txt">Built for<br/>Indian Farmers</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-bar">
            {[
              {n:"89%+",l:"Model Accuracy",i:"🎯"},
              {n:"10",  l:"Disease Classes",i:"🔬"},
              {n:"16K+",l:"Training Images",i:"🗂️"},
              {n:"<3s", l:"Detection Speed",i:"⚡"},
              {n:"Free",l:"Always Free",    i:"🎁"},
            ].map(({n,l,i}) => (
              <div key={l} className="stat-item">
                <span className="stat-ico">{i}</span>
                <div>
                  <div className="stat-n">{n}</div>
                  <div className="stat-l">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">How it works</p>
            <h2 className="section-title">Three steps to instant diagnosis</h2>
            <p className="section-desc">No expertise needed. Just upload a photo and let the AI do the work.</p>
          </div>
          <div className="how-grid">
            {[
              {n:"01",e:"📸",t:"Upload Photo",   d:"Take a clear, well-lit close-up of a single tomato leaf and upload it from your phone or computer."},
              {n:"02",e:"🤖",t:"AI Analyzes",    d:"Our MobileNetV2 model checks for 10 different disease patterns in just 2–3 seconds."},
              {n:"03",e:"💊",t:"Get Treatment",  d:"Receive the disease name, cause, symptoms, prevention tips and pesticide with Indian market prices."},
            ].map(({n,e,t,d},i) => (
              <div key={n} className="how-card">
                <div className="how-num">{n}</div>
                <div className="how-icon">{e}</div>
                <h3 className="how-title">{t}</h3>
                <p className="how-desc">{d}</p>
                {i < 2 && <div className="how-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIAGNOSE TOOL ── */}
      <section className="section section-tinted" id="diagnose">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Diagnosis Tool</p>
            <h2 className="section-title">Upload your leaf photo</h2>
            <p className="section-desc">Works best with close-up, well-lit photos of a single tomato leaf.</p>
          </div>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="upload" className="tool-panel"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                exit={{opacity:0,y:-10}} transition={{duration:0.35}}>
                <input ref={inputRef} type="file" accept="image/*"
                  onChange={e => handleFile(e.target.files[0])} hidden/>

                {!preview ? (
                  <div className={`dropzone ${drag?"dz-hover":""}`}
                    onClick={() => inputRef.current.click()}
                    onDragOver={e => {e.preventDefault();setDrag(true)}}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => {e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}>
                    <div className="dz-circle">
                      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                        <path d="M22 5C22 5 11 11 11 20C11 26 15.9 30.8 22 32.5C28.1 30.8 33 26 33 20C33 11 22 5 22 5Z"
                          fill="#22c55e" opacity="0.12" stroke="#22c55e" strokeWidth="1.5"/>
                        <path d="M22 14V28M16 20L22 14L28 20" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="dz-title">Drop your tomato leaf photo here</h3>
                    <p className="dz-sub">or <span className="dz-link">click to browse</span> · JPG, PNG · Max 10MB</p>
                    <div className="dz-tips-row">
                      {["📸 Use natural daylight","🍃 Single leaf only","🔍 Close-up shot"].map(t => (
                        <span key={t} className="dz-pill">{t}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="preview-panel">
                    <div className="preview-img-side">
                      <img src={preview} alt="Leaf preview" className="preview-img"/>
                      <div className="preview-img-overlay">
                        <button className="overlay-rm" onClick={reset}>✕ Remove</button>
                      </div>
                    </div>
                    <div className="preview-action-side">
                      <div className="preview-file-info">
                        <div className="pfi-icon">🍃</div>
                        <div>
                          <p className="pfi-name">{file.name}</p>
                          <p className="pfi-size">{(file.size/1024).toFixed(1)} KB · Ready to analyze</p>
                        </div>
                      </div>

                      {!loading && !error && (
                        <button className="analyze-btn" onClick={analyze}>
                          <span className="analyze-ico">🔬</span>
                          <span>Detect Disease</span>
                        </button>
                      )}

                      {loading && (
                        <div className="loader-panel">
                          <p className="loader-title">Analyzing your leaf...</p>
                          <div className="prog-outer">
                            <motion.div className="prog-inner"
                              initial={{width:"0%"}}
                              animate={{width:step===0?"18%":step===1?"52%":step===2?"80%":"97%"}}
                              transition={{duration:0.9,ease:"easeInOut"}}/>
                          </div>
                          <div className="loader-steps">
                            {STEPS.map((s,i) => (
                              <div key={i} className={`loader-step ${step>i?"done":step===i?"active":""}`}>
                                <div className="ls-dot">
                                  {step>i ? <span className="ls-check">✓</span>
                                   : step===i ? <span className="ls-spin">◉</span>
                                   : <span className="ls-empty">○</span>}
                                </div>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!loading && error && (
                        <div className="error-panel">
                          <div className="error-msg">
                            <span className="err-icon">⚠️</span>
                            <p>{error}</p>
                          </div>
                          <button className="analyze-btn" onClick={analyze}>Try Again</button>
                          <button className="ghost-btn" onClick={reset}>Upload Different Photo</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="result"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.45}}>

                {/* ── RESULT HEADER CARD ── */}
                <div className="result-hero" style={{"--rc":RC[result.risk]}}>
                  <div className="rh-left">
                    <p className="rh-tag">AI Diagnosis Complete</p>
                    <h2 className="rh-disease">
                      <span className="rh-emoji">{result.emoji}</span>
                      {result.disease}
                    </h2>
                    <div className="rh-risk-pill" style={{background:`${RC[result.risk]}12`,color:RC[result.risk],border:`1px solid ${RC[result.risk]}30`}}>
                      {result.risk==="none"
                        ? "✓ Healthy — No Disease Detected"
                        : `⚠ ${riskLabel(result.risk)} — Action Required`}
                    </div>
                    <div className="rh-meta">
                      {[["Disease",result.disease],["Confidence",`${result.confidence}%`],["Risk Level",riskLabel(result.risk)]].map(([k,v]) => (
                        <div key={k} className="rh-meta-item">
                          <span className="rhm-k">{k}</span>
                          <span className="rhm-v" style={k==="Risk Level"?{color:RC[result.risk]}:{}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rh-right">
                    <div className="rh-ring">
                      <svg viewBox="0 0 130 130" className="rh-svg">
                        <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                        <motion.circle cx="65" cy="65" r="56" fill="none"
                          stroke={RC[result.risk]} strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${2*Math.PI*56}`}
                          initial={{strokeDashoffset:`${2*Math.PI*56}`}}
                          animate={{strokeDashoffset:`${2*Math.PI*56*(1-result.confidence/100)}`}}
                          transition={{duration:1.8,ease:"easeOut"}}
                          transform="rotate(-90 65 65)"/>
                      </svg>
                      <div className="rh-ring-inner">
                        <span className="rh-pct" style={{color:RC[result.risk]}}>{result.confidence}%</span>
                        <span className="rh-lbl">confidence</span>
                      </div>
                    </div>
                    <img src={preview} alt="" className="rh-thumb"/>
                  </div>
                </div>

                {/* ── INFO CARDS ── */}
                <div className="info-cards">
                  {[
                    {ico:"🧬",title:"Cause",     body:result.info.causes,     color:"#ef4444"},
                    {ico:"🔬",title:"Symptoms",  body:result.info.symptoms,   color:"#f97316"},
                    {ico:"🛡️",title:"Prevention",body:result.info.prevention, color:"#22c55e"},
                    {ico:"💊",title:"Treatment", body:result.info.pesticide,  color:"#3b82f6", extra:result.info.price},
                  ].map(({ico,title,body,color,extra},i) => (
                    <motion.div key={title} className="info-card"
                      initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
                      transition={{delay:i*0.1,duration:0.4}}>
                      <div className="ic-top">
                        <div className="ic-icon" style={{background:`${color}12`,color}}>{ico}</div>
                        <span className="ic-title" style={{color}}>{title}</span>
                      </div>
                      <p className="ic-body">{body}</p>
                      {extra && <div className="ic-price">💰 {extra}</div>}
                    </motion.div>
                  ))}
                </div>

                {/* ── FARMER TIPS ── */}
                <div className="farmer-tips">
                  <div className="ft-header">
                    <span className="ft-icon">🌾</span>
                    <h3>Farmer Action Plan — {result.disease}</h3>
                  </div>
                  <div className="ft-grid">
                    {tips.map((tip,i) => (
                      <div key={i} className="ft-item">
                        <div className="fti-num">{String(i+1).padStart(2,"0")}</div>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── PROBABILITIES ── */}
                <div className="probs-panel">
                  <h3 className="probs-title">All Disease Probabilities</h3>
                  <div className="probs-list">
                    {Object.entries(result.all_probabilities).sort((a,b)=>b[1]-a[1]).map(([name,pct],i) => (
                      <div key={name} className={`prob-row ${name===result.disease?"prob-active":""}`}>
                        <span className="prob-name">{name}</span>
                        <div className="prob-track">
                          <motion.div className="prob-bar"
                            initial={{width:0}} animate={{width:`${Math.max(pct,0.3)}%`}}
                            transition={{duration:0.8,delay:i*0.04}}
                            style={{background:name===result.disease?RC[result.risk]:"rgba(255,255,255,0.08)"}}/>
                        </div>
                        <span className="prob-pct">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="result-bottom">
                  <button className="cta-secondary wide" onClick={reset}>↩ Analyze Another Leaf</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── DISEASE LIBRARY ── */}
      <section className="section" id="diseases">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Disease Library</p>
            <h2 className="section-title">10 conditions we identify</h2>
            <p className="section-desc">Trained on 16,000+ PlantVillage images to detect these tomato diseases with 89%+ accuracy.</p>
          </div>
          <div className="disease-grid">
            {DISEASES.map(({e,n,r,c,d}) => (
              <div key={n} className="disease-card">
                <span className="dc-emoji">{e}</span>
                <h4 className="dc-name">{n}</h4>
                <p className="dc-desc">{d}</p>
                <span className="dc-risk" style={{color:c,background:`${c}10`,border:`1px solid ${c}25`}}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODEL STATS ── */}
      <section className="section section-dark">
        <div className="container">
          <div className="model-grid">
            <div className="model-text">
              <p className="section-tag">About the Model</p>
              <h2 className="section-title">Built on world-class<br/>deep learning</h2>
              <p className="section-desc">KrishiDrishti uses MobileNetV2 transfer learning, trained on the PlantVillage dataset — one of the world's largest crop disease datasets.</p>
              <div className="model-features">
                {[
                  {i:"⚡",t:"Fast",d:"2–3 second detection"},
                  {i:"🎯",t:"Accurate",d:"89%+ validation accuracy"},
                  {i:"📱",t:"Mobile Ready",d:"Works on any device"},
                  {i:"🔒",t:"Private",d:"Photos never stored"},
                ].map(({i,t,d}) => (
                  <div key={t} className="mf-item">
                    <span className="mf-ico">{i}</span>
                    <div>
                      <strong>{t}</strong>
                      <p>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="model-stats-side">
              {[
                {n:"89.49%",l:"Validation Accuracy"},
                {n:"16,011",l:"Training Images"},
                {n:"10",    l:"Disease Classes"},
                {n:"<3s",   l:"Inference Speed"},
              ].map(({n,l}) => (
                <div key={l} className="ms-card">
                  <div className="ms-n">{n}</div>
                  <div className="ms-l">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="trust-band">
        <div className="container">
          <div className="trust-row">
            {[
              {i:"🤖",k:"Model",    v:"MobileNetV2 Transfer Learning"},
              {i:"🎯",k:"Accuracy", v:"89%+ Validated on Test Set"},
              {i:"🌾",k:"Dataset",  v:"PlantVillage · 16,000+ Images"},
              {i:"🇮🇳",k:"Origin",   v:"Built in India for Farmers"},
            ].map(({i,k,v}) => (
              <div key={k} className="trust-col">
                <span className="trust-ico">{i}</span>
                <div>
                  <div className="trust-k">{k}</div>
                  <div className="trust-v">{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FLOATING FOOTER ── */}
      <div className="footer-wrap">
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="/" className="brand" style={{marginBottom:"12px",display:"inline-flex"}}>
                <div className="brand-mark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 5 6.5 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6.5 12 2 12 2Z"/>
                  </svg>
                </div>
                <span className="brand-name">KrishiDrishti</span>
              </a>
              <p>AI-powered tomato disease detection for Indian farmers. Completely free, always.</p>
            </div>
            <div className="footer-nav">
              <p className="footer-nav-title">Navigation</p>
              <a href="#how">How it works</a>
              <a href="#diagnose">Diagnose</a>
              <a href="#diseases">Diseases</a>
            </div>
            <div className="footer-nav">
              <p className="footer-nav-title">Technology</p>
              <span>MobileNetV2</span>
              <span>FastAPI Backend</span>
              <span>React Frontend</span>
            </div>
            <div className="footer-right">
              <div className="footer-quote">"Strong Farmers,<br/>Strong Nation 🇮🇳"</div>
              <p className="footer-copy">© 2026 KrishiDrishti · All rights reserved</p>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}
