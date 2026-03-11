import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Leaf, AlertTriangle, CheckCircle, RotateCcw, ChevronDown } from "lucide-react";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";
const RC = { none:"#30d158", low:"#ffd60a", moderate:"#ff9f0a", high:"#ff453a" };
const RG = { none:"#30d15820", low:"#ffd60a20", moderate:"#ff9f0a20", high:"#ff453a20" };

const stagger = (i) => ({ initial:{opacity:0,y:32}, animate:{opacity:1,y:0}, transition:{duration:0.7, delay:i*0.1, ease:[0.25,0.46,0.45,0.94]} });

export default function App() {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(0);
  const [error,   setError]   = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const t = [700,1600,2500].map((ms,i) => setTimeout(()=>setStep(i+1), ms));
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
      setError(null);
    } catch (err) {
      const detail = err?.response?.data?.detail || "";
      if (detail.includes("NOT_A_LEAF")) {
        setError("🍃 Not a tomato leaf! Please upload a clear photo of a tomato plant leaf only.");
      } else if (detail.includes("LOW_CONFIDENCE")) {
        setError("📸 Image not clear enough. Try a close-up photo of the leaf in good lighting.");
      } else if (err?.response?.status === 422) {
        setError("🍃 Please upload a clear tomato leaf photo. Random or unclear images are not supported.");
      } else {
        setError("⚠️ Backend offline or error. Please try again in a moment.");
      }
      setResult(null);
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    inputRef.current.value = "";
  };

  return (
    <div className="app">

      {/* Ambient */}
      <div className="ambient">
        <div className="amb-blob amb1"/><div className="amb-blob amb2"/><div className="amb-blob amb3"/>
      </div>

      {/* Ticker */}
      <div className="ticker"><div className="ticker-tape">
        {[0,1].map(i=><span key={i}>
          🌿 KrishiDrishti AI &nbsp;·&nbsp; 10 Tomato Diseases &nbsp;·&nbsp;
          89%+ Accuracy &nbsp;·&nbsp; Free for Farmers &nbsp;·&nbsp;
          MobileNetV2 Deep Learning &nbsp;·&nbsp; कृषि दृष्टि &nbsp;·&nbsp;
          Made in India 🇮🇳 &nbsp;·&nbsp;&nbsp;
        </span>)}
      </div></div>

      {/* Nav */}
      <nav>
        <div className="nav-left">
          <div className="nav-mark"><Leaf size={16} strokeWidth={2}/></div>
          <span className="nav-wordmark">KrishiDrishti</span>
          <span className="nav-divider"/>
          <span className="nav-sub">कृषि दृष्टि</span>
        </div>
        <div className="nav-pill">🇮🇳 For Indian Farmers</div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <motion.p className="hero-overline" {...stagger(0)}>
          AI · Deep Learning · MobileNetV2
        </motion.p>
        <motion.h1 className="hero-h1" {...stagger(1)}>
          The Smartest Way<br/>
          to <em>Protect Your Crop</em>
        </motion.h1>
        <motion.p className="hero-body" {...stagger(2)}>
          Upload a tomato leaf photo. Our AI identifies disease in seconds
          and gives you pesticide names, dosages, and prices in INR.
        </motion.p>
        <motion.div className="hero-cta" {...stagger(3)}>
          <button className="cta-primary" onClick={()=>document.getElementById("upload-anchor").scrollIntoView({behavior:"smooth"})}>
            Start Diagnosis <ChevronDown size={16}/>
          </button>
          <div className="cta-trust">
            <div className="trust-dots">
              {["89%+ accuracy","10 diseases","free"].map(t=><span key={t}><span className="tdot"/>  {t}</span>)}
            </div>
          </div>
        </motion.div>

        <motion.div className="hero-chips" {...stagger(4)}>
          {[["89%+","Accuracy"],["10","Disease Classes"],["16K+","Training Images"],["Free","Always"]].map(([n,l])=>(
            <div key={l} className="chip">
              <div className="chip-n">{n}</div>
              <div className="chip-l">{l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── UPLOAD / RESULT ── */}
      <section className="card-section" id="upload-anchor">
        <AnimatePresence mode="wait">

          {!result && (
            <motion.div key="up" className="glass-card"
              initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
              transition={{duration:0.6,ease:[0.25,0.46,0.45,0.94]}}>

              <div className="card-head">
                <div className="card-head-icon"><Upload size={18}/></div>
                <div>
                  <div className="card-title">Upload Leaf Photo</div>
                  <div className="card-sub">Take a clear, well-lit photo of a single tomato leaf</div>
                </div>
              </div>

              <input ref={inputRef} type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} hidden/>

              {!preview ? (
                <div className="drop-zone" onClick={()=>inputRef.current.click()}
                  onDragOver={e=>{e.preventDefault();e.currentTarget.classList.add("drag")}}
                  onDragLeave={e=>e.currentTarget.classList.remove("drag")}
                  onDrop={e=>{e.preventDefault();e.currentTarget.classList.remove("drag");handleFile(e.dataTransfer.files[0])}}>
                  <div className="drop-icon"><Leaf size={32} strokeWidth={1}/></div>
                  <p className="drop-main">Drop your leaf photo here</p>
                  <p className="drop-hint">or tap to browse · JPG, PNG · Max 10MB</p>
                </div>
              ) : (
                <div className="preview-row">
                  <div className="preview-thumb-wrap">
                    <img src={preview} alt="leaf" className="preview-thumb"/>
                  </div>
                  <div className="preview-meta">
                    <div className="preview-name">{file.name}</div>
                    <div className="preview-size">{(file.size/1024).toFixed(1)} KB · Ready to analyze</div>

                    {!loading && (
                      <button className="analyze-btn" onClick={analyze}>
                        🔬 Detect Disease
                      </button>
                    )}
                    {!loading && (
                      <button className="ghost-btn" onClick={reset}>Change photo</button>
                    )}

                    {loading && (
                      <div className="loader-wrap">
                        <div className="loader-ring"/>
                        <div className="loader-steps">
                          {["Reading image","Running AI model","Preparing report"].map((s,i)=>(
                            <div key={i} className={`lstep ${step>i?"done":step===i?"act":""}`}>
                              <div className="lstep-dot"/><span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="err-box">
                        <AlertTriangle size={14}/>
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {result && (
            <motion.div key="res"
              initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              transition={{duration:0.7,ease:[0.25,0.46,0.45,0.94]}}>

              {/* Diagnosis Card */}
              <div className="dx-card glass-card" style={{"--rc":RC[result.risk],"--rg":RG[result.risk]}}>
                <div className="dx-top">
                  <div className="dx-left">
                    <div className="dx-label">AI Diagnosis</div>
                    <div className="dx-disease">{result.emoji} {result.disease}</div>
                    <div className="dx-badge">
                      {result.risk==="none"
                        ? <><CheckCircle size={13}/> Healthy — No Disease</>
                        : result.risk==="high"
                          ? <><AlertTriangle size={13}/> High Risk — Act Today</>
                          : result.risk==="moderate"
                            ? <><AlertTriangle size={13}/> Moderate — Act This Week</>
                            : <><AlertTriangle size={13}/> Low Risk — Monitor</>}
                    </div>
                  </div>
                  <div className="dx-ring-wrap">
                    <svg viewBox="0 0 100 100" className="dx-ring-svg">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                      <motion.circle cx="50" cy="50" r="42" fill="none"
                        stroke={RC[result.risk]} strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={`${2*Math.PI*42}`}
                        initial={{strokeDashoffset:`${2*Math.PI*42}`}}
                        animate={{strokeDashoffset:`${2*Math.PI*42*(1-result.confidence/100)}`}}
                        transition={{duration:1.8,ease:"easeOut"}}
                        transform="rotate(-90 50 50)"/>
                    </svg>
                    <div className="dx-ring-inner">
                      <div className="dx-pct">{result.confidence}%</div>
                      <div className="dx-pct-lbl">confidence</div>
                    </div>
                  </div>
                </div>

                <div className="dx-meta">
                  <img src={preview} alt="" className="dx-thumb"/>
                  {[["Disease",result.disease],["Confidence",`${result.confidence}%`],
                    ["Risk",result.risk==="none"?"None":result.risk],["File",file.name]
                  ].map(([k,v])=>(
                    <div key={k} className="dx-meta-item">
                      <span className="dx-meta-k">{k}</span>
                      <span className="dx-meta-v" style={k==="Risk"?{color:RC[result.risk],textTransform:"capitalize"}:{}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Grid */}
              <div className="info-grid">
                {[
                  {icon:"🧬",title:"Cause",       key:"causes",     ac:"#ff453a"},
                  {icon:"🔬",title:"Symptoms",    key:"symptoms",   ac:"#ff9f0a"},
                  {icon:"🛡",title:"Prevention",  key:"prevention", ac:"#30d158"},
                  {icon:"💊",title:"Treatment",   key:"pesticide",  ac:"#0a84ff", extra:`💰 ${result.info.price}`},
                ].map(({icon,title,key,ac,extra},i)=>(
                  <motion.div key={key} className="info-tile"
                    initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                    transition={{delay:i*0.08,duration:0.5}}>
                    <div className="info-tile-icon" style={{background:`${ac}15`,color:ac}}>{icon}</div>
                    <div className="info-tile-title" style={{color:ac}}>{title}</div>
                    <p className="info-tile-body">{result.info[key]}</p>
                    {extra && <div className="info-tile-price">{extra}</div>}
                  </motion.div>
                ))}
              </div>

              {/* Probabilities */}
              <div className="glass-card probs-card">
                <div className="probs-head">All Disease Probabilities</div>
                {Object.entries(result.all_probabilities)
                  .sort((a,b)=>b[1]-a[1])
                  .map(([name,pct],i)=>(
                  <div key={name} className={`prow ${name===result.disease?"prow-hi":""}`}>
                    <span className="prow-name">{name}</span>
                    <div className="prow-track">
                      <motion.div className="prow-fill"
                        initial={{width:0}} animate={{width:`${Math.max(pct,0.3)}%`}}
                        transition={{duration:0.9,delay:i*0.04,ease:"easeOut"}}
                        style={{background:name===result.disease?RC[result.risk]:"rgba(255,255,255,0.12)"}}/>
                    </div>
                    <span className="prow-val">{pct}%</span>
                  </div>
                ))}
              </div>

              <div className="re-center">
                <button className="ghost-btn-lg" onClick={reset}>
                  <RotateCcw size={14}/> Analyze Another Leaf
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Disease Library */}
      <section className="lib-section">
        <div className="section-eyebrow">Disease Library</div>
        <h2 className="section-h2">10 Conditions We Identify</h2>
        <p className="section-p">Recognise what you're dealing with before you upload.</p>
        <div className="lib-grid">
          {[
            {e:"🦠",n:"Bacterial Spot",       r:"High",     c:"#ff453a", d:"Brown spots with yellow halos from Xanthomonas bacteria."},
            {e:"🟤",n:"Early Blight",          r:"Moderate", c:"#ff9f0a", d:"Concentric ring spots on older leaves. Alternaria fungus."},
            {e:"🖤",n:"Late Blight",            r:"High",     c:"#ff453a", d:"Rapid dark patches. Can destroy crop in days."},
            {e:"🟡",n:"Leaf Mold",              r:"Low",      c:"#ffd60a", d:"Yellow above, fuzzy below. Needs high humidity."},
            {e:"⚪",n:"Septoria Leaf Spot",     r:"Moderate", c:"#ff9f0a", d:"White-centred spots. Spreads through water splash."},
            {e:"🕷️",n:"Spider Mites",           r:"Moderate", c:"#ff9f0a", d:"Bronze stippling and webbing. Hot dry conditions."},
            {e:"🎯",n:"Target Spot",            r:"Moderate", c:"#ff9f0a", d:"Ring pattern spots on leaves and stems."},
            {e:"🌀",n:"Yellow Leaf Curl Virus", r:"High",     c:"#ff453a", d:"Curling yellow leaves spread by whiteflies."},
            {e:"🧩",n:"Mosaic Virus",           r:"High",     c:"#ff453a", d:"Mottled green mosaic. Spreads by contact."},
            {e:"🟢",n:"Healthy",                r:"None",     c:"#30d158", d:"Deep green, no spots. Perfectly healthy leaf."},
          ].map(({e,n,r,c,d})=>(
            <div key={n} className="lib-tile">
              <div className="lib-em">{e}</div>
              <div className="lib-name">{n}</div>
              <div className="lib-desc">{d}</div>
              <div className="lib-badge" style={{color:c,borderColor:`${c}30`,background:`${c}10`}}>{r}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <div className="trust-row">
        {[
          {i:"🤖",k:"Model",    v:"MobileNetV2 Transfer Learning"},
          {i:"🎯",k:"Accuracy", v:"89%+ Validated"},
          {i:"🌾",k:"Dataset",  v:"PlantVillage 16,000+ Images"},
          {i:"🇮🇳",k:"Origin",   v:"Built in India"},
        ].map(({i,k,v})=>(
          <div key={k} className="trust-cell">
            <div className="trust-ico">{i}</div>
            <div><div className="trust-k">{k}</div><div className="trust-v">{v}</div></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer>
        <div>
          <div className="ft-brand">KrishiDrishti</div>
          <div className="ft-copy">©2026 KrishiDrishti India Pvt. Ltd · All rights reserved</div>
        </div>
        <div className="ft-quote">"Strong Farmers Build a Strong Nation 🇮🇳"</div>
      </footer>

    </div>
  );
}
