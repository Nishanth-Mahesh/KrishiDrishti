import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";
const RC = { none: "#4ade80", low: "#facc15", moderate: "#fb923c", high: "#f87171" };

const TICKER_ITEMS = [
  "🌿 Early Blight: Remove infected leaves immediately and spray Mancozeb",
  "💧 Water tomato plants at base — never wet the leaves",
  "🌡️ Late Blight spreads fast in cool, wet weather — act within 24 hours",
  "🐛 Check leaf undersides weekly for Spider Mites and whiteflies",
  "🌱 Rotate crops every season to prevent soil-borne diseases",
  "☀️ Plant tomatoes in full sun — 6 to 8 hours daily for healthy growth",
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
      {/* Ambient orbs */}
      <div className="orbs">
        <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
      </div>

      {/* ── TICKER ── */}
      <div className="ticker">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="tick-item">{item}<span className="tick-sep">·</span></span>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <header className="nav">
        <div className="nav-wrap">
          <a href="/" className="logo">
            <div className="logo-ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 5 6 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6 12 2 12 2Z"/>
              </svg>
            </div>
            <span className="logo-name">KrishiDrishti</span>
            <span className="logo-tag">AI</span>
          </a>
          <nav className="nav-links">
            <a href="#how">How it works</a>
            <a href="#diagnose">Diagnose</a>
            <a href="#diseases">Diseases</a>
          </nav>
          <a href="#diagnose" className="nav-btn">Try Free →</a>
          <button className="ham" onClick={() => setMenuOpen(!menuOpen)}>
            <span/><span/><span/>
          </button>
        </div>
        {menuOpen && (
          <div className="mob-nav">
            {["#how|How it works","#diagnose|Diagnose","#diseases|Diseases"].map(x => (
              <a key={x} href={x.split("|")[0]} onClick={() => setMenuOpen(false)}>{x.split("|")[1]}</a>
            ))}
            <a href="#diagnose" className="mob-cta" onClick={() => setMenuOpen(false)}>Try Free →</a>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="wrap">
          <motion.div initial={{opacity:0,y:48}} animate={{opacity:1,y:0}} transition={{duration:1,ease:[0.16,1,0.3,1]}}>
            <div className="hero-pill">
              <span className="pill-dot"/>AI-Powered · Made in India 🇮🇳
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
            <div className="hero-btns">
              <button className="btn-g" onClick={() => document.getElementById("diagnose").scrollIntoView({behavior:"smooth"})}>
                Start Free Diagnosis
              </button>
              <button className="btn-o" onClick={() => document.getElementById("diseases").scrollIntoView({behavior:"smooth"})}>
                View Disease Library
              </button>
            </div>
          </motion.div>
          <motion.div className="stats-row" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:1,delay:0.3}}>
            {[["89%+","Accuracy"],["10","Diseases"],["16,000+","Training Images"],["Free","Always"]].map(([n,l]) => (
              <div key={l} className="stat">
                <div className="stat-n">{n}</div>
                <div className="stat-l">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="sec" id="how">
        <div className="wrap">
          <div className="sec-tag">How it works</div>
          <h2 className="sec-h2">Three steps to<br/>instant diagnosis</h2>
          <div className="steps">
            {[
              {n:"01",icon:"📸",t:"Upload Photo",d:"Take a clear close-up of a tomato leaf in good natural light and upload it."},
              {n:"02",icon:"🤖",t:"AI Analyzes",d:"MobileNetV2 deep learning scans for 10 disease patterns in seconds."},
              {n:"03",icon:"💊",t:"Get Treatment",d:"Receive pesticide name, dosage and market prices in Indian Rupees."},
            ].map(({n,icon,t,d},i) => (
              <motion.div key={n} className="step"
                initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.15,duration:0.6}}>
                <div className="step-n">{n}</div>
                <div className="step-ico">{icon}</div>
                <h3 className="step-t">{t}</h3>
                <p className="step-d">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIAGNOSE ── */}
      <section className="sec sec-alt" id="diagnose">
        <div className="wrap">
          <div className="sec-tag">Diagnosis Tool</div>
          <h2 className="sec-h2">Upload your<br/>leaf photo</h2>
          <p className="sec-p">Works best with close-up, well-lit photos of a single tomato leaf.</p>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="up" className="tool"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                exit={{opacity:0}} transition={{duration:0.4}}>
                <input ref={inputRef} type="file" accept="image/*"
                  onChange={e => handleFile(e.target.files[0])} hidden/>

                {!preview ? (
                  <div className={`dz ${drag?"dz-on":""}`}
                    onClick={() => inputRef.current.click()}
                    onDragOver={e=>{e.preventDefault();setDrag(true)}}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}>
                    <div className="dz-ring">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M20 4C20 4 10 10 10 18C10 23.5 14.5 28 20 29.5C25.5 28 30 23.5 30 18C30 10 20 4 20 4Z"
                          fill="#4ade80" opacity="0.15" stroke="#4ade80" strokeWidth="1.5"/>
                        <path d="M20 12V24M15 17L20 12L25 17" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="dz-t">Drop your tomato leaf photo here</p>
                    <p className="dz-s">or tap to browse &nbsp;·&nbsp; JPG, PNG &nbsp;·&nbsp; Max 10MB</p>
                    <div className="dz-tip">💡 Use a close-up photo with good lighting for best accuracy</div>
                  </div>
                ) : (
                  <div className="prev-wrap">
                    <div className="prev-img-col">
                      <img src={preview} alt="leaf" className="prev-img"/>
                      <button className="prev-rm" onClick={reset}>✕ Remove</button>
                    </div>
                    <div className="prev-info">
                      <p className="prev-name">{file.name}</p>
                      <p className="prev-sz">{(file.size/1024).toFixed(1)} KB · Ready to analyze</p>

                      {!loading && !error && (
                        <button className="btn-g full" onClick={analyze}>🔬 Detect Disease</button>
                      )}
                      {loading && (
                        <div className="ldr">
                          <div className="ldr-track">
                            <motion.div className="ldr-fill"
                              initial={{width:"0%"}}
                              animate={{width:step===0?"20%":step===1?"55%":step===2?"82%":"97%"}}
                              transition={{duration:0.8,ease:"easeInOut"}}/>
                          </div>
                          <div className="ldr-steps">
                            {STEPS.map((s,i) => (
                              <div key={i} className={`ls ${step>i?"ls-done":step===i?"ls-on":""}`}>
                                <span>{step>i?"✓":step===i?"●":"○"}</span>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!loading && error && (
                        <div className="err-wrap">
                          <div className="err-box">⚠️ {error}</div>
                          <button className="btn-g full" onClick={analyze}>Try Again</button>
                          <button className="btn-ghost full" onClick={reset}>Upload Different Photo</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="res" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>

                {/* ── RESULT HERO ── */}
                <div className="res-card" style={{"--rc":RC[result.risk]}}>
                  <div className="res-top">
                    <div className="res-left">
                      <p className="res-tag">AI Diagnosis Complete</p>
                      <h2 className="res-name">{result.emoji} {result.disease}</h2>
                      <div className="res-chip" style={{background:`${RC[result.risk]}15`,color:RC[result.risk],border:`1px solid ${RC[result.risk]}35`}}>
                        {result.risk==="none" ? "✓ Healthy — No Disease Detected" : `⚠ ${riskLabel(result.risk)} — Action Required`}
                      </div>
                    </div>
                    <div className="res-right">
                      <div className="ring-box">
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
                        <div className="ring-mid">
                          <span className="ring-pct" style={{color:RC[result.risk]}}>{result.confidence}%</span>
                          <span className="ring-lbl">confidence</span>
                        </div>
                      </div>
                      <img src={preview} alt="" className="res-thumb"/>
                    </div>
                  </div>
                  <div className="res-meta">
                    {[["Disease",result.disease],["Confidence",`${result.confidence}%`],["Risk",riskLabel(result.risk)],["File",file.name]].map(([k,v]) => (
                      <div key={k} className="meta-item">
                        <span className="mk">{k}</span>
                        <span className="mv" style={k==="Risk"?{color:RC[result.risk],fontWeight:600}:{}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── INFO GRID ── */}
                <div className="info-grid">
                  {[
                    {icon:"🧬",title:"Cause",     body:result.info.causes,     color:"#f87171"},
                    {icon:"🔬",title:"Symptoms",  body:result.info.symptoms,   color:"#fb923c"},
                    {icon:"🛡️",title:"Prevention",body:result.info.prevention, color:"#4ade80"},
                    {icon:"💊",title:"Treatment", body:result.info.pesticide,  color:"#60a5fa", extra:result.info.price},
                  ].map(({icon,title,body,color,extra},i) => (
                    <motion.div key={title} className="i-card"
                      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                      transition={{delay:i*0.09,duration:0.45}}>
                      <div className="i-top">
                        <span className="i-ico" style={{background:`${color}15`,color}}>{icon}</span>
                        <span className="i-title" style={{color}}>{title}</span>
                      </div>
                      <p className="i-body">{body}</p>
                      {extra && <div className="i-price">💰 {extra}</div>}
                    </motion.div>
                  ))}
                </div>

                {/* ── CROP TIPS ── */}
                <div className="tips-card">
                  <h3 className="tips-title">🌱 Farming Tips for {result.disease}</h3>
                  <div className="tips-grid">
                    {result.risk === "none" ? [
                      "✅ Keep monitoring your crop every 3–4 days",
                      "💧 Water at the base of plants, never on leaves",
                      "🌿 Apply neem oil spray every 15 days as prevention",
                      "🌱 Maintain proper spacing for good air circulation",
                    ] : result.risk === "high" ? [
                      "🚨 Act immediately — do not delay treatment",
                      "🗑️ Remove and burn all infected leaves today",
                      "💊 Apply recommended pesticide within 24 hours",
                      "🚫 Do not compost infected plant material",
                      "📞 Consult local agriculture officer if spreading",
                    ] : [
                      "⚠️ Start treatment within 2–3 days",
                      "✂️ Prune infected leaves carefully with clean scissors",
                      "💊 Apply recommended fungicide/pesticide now",
                      "👀 Monitor remaining plants daily for spread",
                    ]}.map((tip, i) => (
                      <div key={i} className="tip-item">{tip}</div>
                    ))}
                  </div>
                </div>

                {/* ── PROBABILITIES ── */}
                <div className="prob-card">
                  <h3 className="prob-title">All Disease Probabilities</h3>
                  {Object.entries(result.all_probabilities).sort((a,b)=>b[1]-a[1]).map(([name,pct],i) => (
                    <div key={name} className={`p-row ${name===result.disease?"p-hi":""}`}>
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

                <div className="res-btn-row">
                  <button className="btn-o" onClick={reset}>↩ Analyze Another Leaf</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── DISEASE LIBRARY ── */}
      <section className="sec" id="diseases">
        <div className="wrap">
          <div className="sec-tag">Disease Library</div>
          <h2 className="sec-h2">10 conditions<br/>we identify</h2>
          <p className="sec-p">Trained on 16,000+ PlantVillage images with 89%+ accuracy.</p>
          <div className="dis-grid">
            {[
              {e:"🦠",n:"Bacterial Spot",       r:"High",    c:"#f87171",d:"Brown spots with yellow halos. Xanthomonas bacteria."},
              {e:"🟤",n:"Early Blight",          r:"Moderate",c:"#fb923c",d:"Concentric ring spots on older leaves. Alternaria fungus."},
              {e:"🖤",n:"Late Blight",            r:"High",    c:"#f87171",d:"Dark patches spreading fast. Can destroy crop in days."},
              {e:"🟡",n:"Leaf Mold",              r:"Low",     c:"#facc15",d:"Pale yellow spots, olive mold below. High humidity."},
              {e:"⚪",n:"Septoria Leaf Spot",     r:"Moderate",c:"#fb923c",d:"White-centered spots. Spreads by rain splash."},
              {e:"🕷️",n:"Spider Mites",           r:"Moderate",c:"#fb923c",d:"Bronze stippling, webbing below leaves. Hot dry weather."},
              {e:"🎯",n:"Target Spot",            r:"Moderate",c:"#fb923c",d:"Target ring pattern on leaves and stems."},
              {e:"🌀",n:"Yellow Leaf Curl",       r:"High",    c:"#f87171",d:"Curling yellow leaves. Spread by whiteflies."},
              {e:"🧩",n:"Mosaic Virus",           r:"High",    c:"#f87171",d:"Mottled mosaic pattern. Spreads by contact."},
              {e:"🟢",n:"Healthy",                r:"None",    c:"#4ade80",d:"Deep green, uniform. No disease detected."},
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

      {/* ── TRUST STRIP ── */}
      <div className="trust">
        <div className="trust-wrap">
          {[
            {i:"🤖",k:"Model",   v:"MobileNetV2 Transfer Learning"},
            {i:"🎯",k:"Accuracy",v:"89%+ Validated on Test Set"},
            {i:"🌾",k:"Dataset", v:"PlantVillage · 16,000+ Images"},
            {i:"🇮🇳",k:"Origin",  v:"Built in India for Farmers"},
          ].map(({i,k,v}) => (
            <div key={k} className="t-item">
              <span className="t-i">{i}</span>
              <div><div className="t-k">{k}</div><div className="t-v">{v}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FLOATING FOOTER ── */}
      <div className="foot-outer">
        <footer className="foot">
          <div className="foot-wrap">
            <div className="foot-brand">
              <div className="logo">
                <div className="logo-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 5 6 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6 12 2 12 2Z"/></svg></div>
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
