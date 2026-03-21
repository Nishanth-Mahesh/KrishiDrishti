import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";
const RC = { none:"#22c55e", low:"#eab308", moderate:"#f97316", high:"#ef4444" };
const fade = (d=0) => ({ initial:{opacity:0,y:24}, animate:{opacity:1,y:0}, transition:{duration:0.6,delay:d,ease:[0.25,0.46,0.45,0.94]} });

export default function App() {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(0);
  const [error,   setError]   = useState(null);
  const [drag,    setDrag]    = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const t = [900,2000,3100].map((ms,i) => setTimeout(()=>setStep(i+1), ms));
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
    } catch(err) {
      const d = err?.response?.data?.detail || "";
      if (d.includes("NOT_A_LEAF"))       setError("🍃 Not a tomato leaf. Upload a clear tomato plant leaf photo.");
      else if (d.includes("LOW_CONFIDENCE")) setError("📸 Image unclear. Try a close-up in good natural lighting.");
      else setError("⏳ Server waking up. Wait 30 seconds and try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const STEPS = ["Reading image","Running AI model","Preparing report"];
  const riskText = r => ({none:"Healthy",low:"Low Risk",moderate:"Moderate Risk",high:"High Risk"}[r]||r);

  return (
    <div className="app">
      {/* Background */}
      <div className="bg-dots"/>
      <div className="glow g1"/><div className="glow g2"/>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-in">
          <a href="/" className="brand">
            <span className="brand-icon">🌿</span>
            <span className="brand-name">KrishiDrishti</span>
            <span className="brand-badge">AI</span>
          </a>
          <div className="nav-menu">
            <a href="#how">How it works</a>
            <a href="#tool">Diagnose</a>
            <a href="#diseases">Diseases</a>
            <a href="#tool" className="nav-btn">Try Free →</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-in">
          <motion.div {...fade(0)} className="hero-pill">
            <span className="pill-dot"/>AI-Powered Plant Health · Made in India 🇮🇳
          </motion.div>

          <motion.h1 {...fade(0.1)} className="hero-h1">
            Detect Tomato<br/>Disease <span className="hero-em">Instantly</span>
          </motion.h1>

          <motion.p {...fade(0.2)} className="hero-p">
            Upload a tomato leaf photo. Our AI diagnoses disease in seconds and gives you
            pesticide names, dosages and prices in ₹ — built for Indian farmers.
          </motion.p>

          <motion.div {...fade(0.3)} className="hero-btns">
            <button className="btn-green" onClick={()=>document.getElementById("tool").scrollIntoView({behavior:"smooth"})}>
              Start Free Diagnosis ↓
            </button>
            <button className="btn-outline" onClick={()=>document.getElementById("diseases").scrollIntoView({behavior:"smooth"})}>
              View Disease Library
            </button>
          </motion.div>

          <motion.div {...fade(0.4)} className="hero-stats">
            {[["89%+","Accuracy"],["10","Diseases"],["16,000+","Images Trained"],["Free","Always"]].map(([n,l])=>(
              <div key={l} className="hstat">
                <div className="hstat-n">{n}</div>
                <div className="hstat-l">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how">
        <div className="sec-in">
          <div className="sec-tag">How it works</div>
          <h2 className="sec-h2">Three steps to diagnosis</h2>
          <div className="steps">
            {[
              {n:"01",icon:"📸",t:"Upload Photo",   d:"Take a clear, well-lit close-up of a single tomato leaf and upload it."},
              {n:"02",icon:"🤖",t:"AI Analyzes",    d:"Our MobileNetV2 deep learning model checks for 10 disease patterns in seconds."},
              {n:"03",icon:"💊",t:"Get Treatment",  d:"Receive full treatment plan with pesticide names, dosage and ₹ prices."},
            ].map(({n,icon,t,d})=>(
              <div key={n} className="step-card">
                <div className="step-no">{n}</div>
                <div className="step-ico">{icon}</div>
                <div className="step-t">{t}</div>
                <div className="step-d">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIAGNOSIS TOOL ── */}
      <section className="section bg-alt" id="tool">
        <div className="sec-in">
          <div className="sec-tag">Diagnosis Tool</div>
          <h2 className="sec-h2">Upload your leaf photo</h2>
          <p className="sec-p">Works best with close-up, well-lit photos of a single tomato leaf.</p>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="up" className="tool-card"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                exit={{opacity:0,y:-10}} transition={{duration:0.4}}>

                <input ref={inputRef} type="file" accept="image/*"
                  onChange={e=>handleFile(e.target.files[0])} hidden/>

                {!preview ? (
                  /* DROP ZONE */
                  <div className={`dropzone ${drag?"dz-active":""}`}
                    onClick={()=>inputRef.current.click()}
                    onDragOver={e=>{e.preventDefault();setDrag(true)}}
                    onDragLeave={()=>setDrag(false)}
                    onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}>
                    <div className="dz-icon">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="23" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>
                        <path d="M24 8C24 8 14 13.5 14 22C14 27.3 18 31.8 24 33.5C30 31.8 34 27.3 34 22C34 13.5 24 8 24 8Z" fill="#22c55e" opacity="0.15" stroke="#22c55e" strokeWidth="1.5"/>
                        <path d="M24 16V28M19 21L24 16L29 21" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="dz-title">Drop your tomato leaf photo here</div>
                    <div className="dz-sub">or <span className="dz-link">click to browse</span> · JPG, PNG · Max 10MB</div>
                    <div className="dz-tip">💡 Use a close-up, well-lit photo of a single leaf for best results</div>
                  </div>
                ) : (
                  /* PREVIEW */
                  <div className="preview-wrap">
                    <div className="preview-img-col">
                      <img src={preview} alt="leaf" className="prev-img"/>
                      <button className="prev-remove" onClick={reset}>✕ Remove photo</button>
                    </div>
                    <div className="preview-meta-col">
                      <div className="prev-filename">{file.name}</div>
                      <div className="prev-filesize">{(file.size/1024).toFixed(1)} KB · Ready to analyze</div>

                      {!loading && !error && (
                        <button className="btn-green big" onClick={analyze}>🔬 Detect Disease</button>
                      )}

                      {loading && (
                        <div className="loader-box">
                          <div className="lbar-track"><motion.div className="lbar-fill"
                            initial={{width:"0%"}}
                            animate={{width:step===0?"15%":step===1?"50%":step===2?"80%":"97%"}}
                            transition={{duration:0.9,ease:"easeInOut"}}/></div>
                          <div className="lsteps">
                            {STEPS.map((s,i)=>(
                              <div key={i} className={`lstep ${step>i?"l-done":step===i?"l-active":""}`}>
                                <span className="lst-icon">{step>i?"✓":step===i?"◉":"○"}</span>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!loading && error && (
                        <div className="err-panel">
                          <div className="err-msg">{error}</div>
                          <button className="btn-green big" onClick={analyze}>Try Again</button>
                          <button className="btn-outline-sm" onClick={reset}>Upload Different Photo</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* ── RESULT ── */
              <motion.div key="result"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                transition={{duration:0.5}}>

                {/* Result Hero Card */}
                <div className="res-hero" style={{"--rc":RC[result.risk]}}>
                  <div className="res-left">
                    <div className="res-tag">AI Diagnosis Complete</div>
                    <div className="res-name">{result.emoji} {result.disease}</div>
                    <div className="res-risk-chip" style={{background:`${RC[result.risk]}18`,color:RC[result.risk],border:`1px solid ${RC[result.risk]}40`}}>
                      {result.risk==="none"?"✓ Healthy — No Disease Detected":`⚠ ${riskText(result.risk)} — Immediate Attention Needed`}
                    </div>
                    <div className="res-thumb-row">
                      <img src={preview} alt="" className="res-thumb"/>
                      <div className="res-meta">
                        {[["Detected",result.disease],["Confidence",`${result.confidence}%`],["Risk Level",riskText(result.risk)],["File",file.name]].map(([k,v])=>(
                          <div key={k} className="res-meta-row">
                            <span className="rk">{k}</span>
                            <span className="rv" style={k==="Risk Level"?{color:RC[result.risk],fontWeight:600}:{}}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="res-ring-col">
                    <svg viewBox="0 0 130 130" className="ring-svg">
                      <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9"/>
                      <motion.circle cx="65" cy="65" r="55" fill="none"
                        stroke={RC[result.risk]} strokeWidth="9" strokeLinecap="round"
                        strokeDasharray={`${2*Math.PI*55}`}
                        initial={{strokeDashoffset:`${2*Math.PI*55}`}}
                        animate={{strokeDashoffset:`${2*Math.PI*55*(1-result.confidence/100)}`}}
                        transition={{duration:1.8,ease:"easeOut"}}
                        transform="rotate(-90 65 65)"/>
                    </svg>
                    <div className="ring-inner">
                      <div className="ring-pct" style={{color:RC[result.risk]}}>{result.confidence}%</div>
                      <div className="ring-label">confidence</div>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="info-grid">
                  {[
                    {icon:"🧬",title:"Cause",      body:result.info.causes,     color:"#ef4444"},
                    {icon:"🔬",title:"Symptoms",   body:result.info.symptoms,   color:"#f97316"},
                    {icon:"🛡️",title:"Prevention", body:result.info.prevention, color:"#22c55e"},
                    {icon:"💊",title:"Treatment",  body:result.info.pesticide,  color:"#3b82f6", extra:result.info.price},
                  ].map(({icon,title,body,color,extra},i)=>(
                    <motion.div key={title} className="info-card"
                      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                      transition={{delay:i*0.09,duration:0.45}}>
                      <div className="ic-top">
                        <div className="ic-ico" style={{background:`${color}15`,color}}>{icon}</div>
                        <div className="ic-title" style={{color}}>{title}</div>
                      </div>
                      <p className="ic-body">{body}</p>
                      {extra && <div className="ic-price">💰 {extra}</div>}
                    </motion.div>
                  ))}
                </div>

                {/* Probability Bars */}
                <div className="probs-box">
                  <div className="probs-head">All Disease Probabilities</div>
                  {Object.entries(result.all_probabilities).sort((a,b)=>b[1]-a[1]).map(([name,pct],i)=>(
                    <div key={name} className={`prow ${name===result.disease?"prow-active":""}`}>
                      <span className="pname">{name}</span>
                      <div className="ptrack">
                        <motion.div className="pfill"
                          initial={{width:0}} animate={{width:`${Math.max(pct,0.3)}%`}}
                          transition={{duration:0.8,delay:i*0.04,ease:"easeOut"}}
                          style={{background:name===result.disease?RC[result.risk]:"rgba(255,255,255,0.1)"}}/>
                      </div>
                      <span className="pval">{pct}%</span>
                    </div>
                  ))}
                </div>

                <div className="res-actions">
                  <button className="btn-outline-lg" onClick={reset}>↩ Analyze Another Leaf</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── DISEASE LIBRARY ── */}
      <section className="section" id="diseases">
        <div className="sec-in">
          <div className="sec-tag">Disease Library</div>
          <h2 className="sec-h2">10 conditions we identify</h2>
          <p className="sec-p">Our model is trained on 16,000+ PlantVillage images to detect these tomato conditions.</p>
          <div className="disease-grid">
            {[
              {e:"🦠",n:"Bacterial Spot",        r:"High",     c:"#ef4444",d:"Brown water-soaked spots with yellow halos. Caused by Xanthomonas bacteria."},
              {e:"🟤",n:"Early Blight",           r:"Moderate", c:"#f97316",d:"Concentric ring spots on older leaves. Alternaria solani fungus."},
              {e:"🖤",n:"Late Blight",             r:"High",     c:"#ef4444",d:"Dark water-soaked patches. Can destroy entire crop in days."},
              {e:"🟡",n:"Leaf Mold",               r:"Low",      c:"#eab308",d:"Pale yellow spots above, olive mold below. High humidity fungus."},
              {e:"⚪",n:"Septoria Leaf Spot",      r:"Moderate", c:"#f97316",d:"White-centered spots with dark borders. Spreads by rain splash."},
              {e:"🕷️",n:"Spider Mites",            r:"Moderate", c:"#f97316",d:"Bronze leaf stippling, webbing underneath. Hot dry conditions."},
              {e:"🎯",n:"Target Spot",             r:"Moderate", c:"#f97316",d:"Circular target-ring pattern spots on leaves and stems."},
              {e:"🌀",n:"Yellow Leaf Curl Virus",  r:"High",     c:"#ef4444",d:"Upward leaf curl, yellowing edges. Spread by whiteflies."},
              {e:"🧩",n:"Mosaic Virus",            r:"High",     c:"#ef4444",d:"Mottled green-light mosaic pattern. Spreads by contact."},
              {e:"🟢",n:"Healthy",                 r:"None",     c:"#22c55e",d:"Deep green, uniform color. No disease detected."},
            ].map(({e,n,r,c,d})=>(
              <div key={n} className="dis-card">
                <div className="dis-emoji">{e}</div>
                <div className="dis-name">{n}</div>
                <div className="dis-desc">{d}</div>
                <div className="dis-risk" style={{color:c,background:`${c}12`,border:`1px solid ${c}30`}}>{r} Risk</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="trust-bar">
        <div className="trust-in">
          {[
            {i:"🤖",k:"Model",   v:"MobileNetV2 Transfer Learning"},
            {i:"🎯",k:"Accuracy",v:"89%+ Validated on Test Set"},
            {i:"🌾",k:"Dataset", v:"PlantVillage · 16,000+ Images"},
            {i:"🇮🇳",k:"Origin",  v:"Built in India for Indian Farmers"},
          ].map(({i,k,v})=>(
            <div key={k} className="trust-item">
              <span className="t-ico">{i}</span>
              <div><div className="t-k">{k}</div><div className="t-v">{v}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="foot-in">
          <div className="foot-brand">🌿 KrishiDrishti</div>
          <div className="foot-copy">© 2026 KrishiDrishti · Built for Indian Farmers 🇮🇳</div>
          <div className="foot-quote">"Strong Farmers Build a Strong Nation"</div>
        </div>
      </footer>
    </div>
  );
}
