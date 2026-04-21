import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";
const RC = { none:"#22c55e", low:"#eab308", moderate:"#f97316", high:"#ef4444" };

const TICKS = [
  "🌿 Monitor your crop every 3 days for early disease signs",
  "💧 Water at the base — never wet the leaves",
  "🌡️ Late Blight spreads fast in cool wet weather — act within 24 hours",
  "🐛 Check leaf undersides weekly for Spider Mites",
  "🌱 Rotate crops every season to prevent soil-borne diseases",
  "☀️ Tomatoes need 6 to 8 hours of full sun daily",
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
  const [menu, setMenu] = useState(false);
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
      if (d.includes("NOT_A_LEAF")) setError("Please upload a real tomato leaf photo only.");
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
    result.risk==="none" ? ["Keep monitoring your crop every 3 to 4 days","Water at the base of plants, never on leaves","Apply Neem Oil spray every 15 days as prevention","Maintain spacing for good air circulation"] :
    result.risk==="high" ? ["Act immediately — do not delay treatment","Remove and burn all infected leaves today","Apply recommended pesticide within 24 hours","Do not compost infected material","Contact your local agriculture officer"] :
    ["Start treatment within 2 to 3 days","Prune infected leaves with clean scissors","Apply recommended fungicide now","Monitor remaining plants daily for spread"]
  ) : [];

  return (
    <div className="app">
      <div className="bg-glow g1" />
      <div className="bg-glow g2" />

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-tag">LIVE TIPS</div>
        <div className="ticker-clip">
          <div className="ticker-scroll">
            {[...TICKS, ...TICKS].map((t, i) => (
              <span key={i} className="tick-text">{t}<span className="tick-sep">·</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* NAV */}
      <header className="nav">
        <div className="nav-container">
          <a href="/" className="logo">
            <div className="logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 5 6.5 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6.5 12 2 12 2Z"/>
              </svg>
            </div>
            <span className="logo-text">KrishiDrishti</span>
            <span className="logo-badge">AI</span>
          </a>
          <nav className="nav-links">
            <a href="#how">How it works</a>
            <a href="#diagnose">Diagnose</a>
            <a href="#diseases">Diseases</a>
          </nav>
          <a href="#diagnose" className="nav-cta">Try Free →</a>
          <button className="ham-btn" onClick={() => setMenu(!menu)}>
            <span /><span /><span />
          </button>
        </div>
        {menu && (
          <div className="mob-nav">
            <a href="#how" onClick={() => setMenu(false)}>How it works</a>
            <a href="#diagnose" onClick={() => setMenu(false)}>Diagnose</a>
            <a href="#diseases" onClick={() => setMenu(false)}>Diseases</a>
            <a href="#diagnose" className="mob-cta" onClick={() => setMenu(false)}>Try Free →</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-left">
              <div className="hero-pill">
                <span className="pill-dot" />
                AI-Powered · Made in India 🇮🇳
              </div>
              <h1 className="hero-h1">
                Protect Your<br />
                <span className="hero-green">Tomato Crop</span><br />
                With AI
              </h1>
              <p className="hero-p">
                Upload a leaf photo. Get instant disease diagnosis, full treatment plan
                and pesticide prices in ₹ — built for Indian farmers.
              </p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => document.getElementById("diagnose").scrollIntoView({behavior:"smooth"})}>
                  Start Free Diagnosis →
                </button>
                <button className="btn-secondary" onClick={() => document.getElementById("diseases").scrollIntoView({behavior:"smooth"})}>
                  View Diseases
                </button>
              </div>
              <div className="hero-pills">
                {["✓ 89%+ Accuracy","✓ 10 Diseases","✓ Free Forever","✓ Works on Mobile"].map(t => (
                  <span key={t} className="h-pill">{t}</span>
                ))}
              </div>
            </div>
            <div className="hero-right">
              <div className="demo-card">
                <p className="demo-tag">LIVE DEMO</p>
                <div className="demo-disease">🟢 Healthy Leaf</div>
                <div className="demo-conf">
                  <div className="demo-ring">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="7"/>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="7"
                        strokeDasharray="264" strokeDashoffset="26" strokeLinecap="round"
                        transform="rotate(-90 50 50)"/>
                    </svg>
                    <div className="demo-ring-text">
                      <span className="demo-pct">90%</span>
                      <span className="demo-lbl">conf.</span>
                    </div>
                  </div>
                  <div className="demo-info">
                    <div className="demo-row"><span>Disease</span><strong>None</strong></div>
                    <div className="demo-row"><span>Risk</span><strong style={{color:"#22c55e"}}>Healthy</strong></div>
                    <div className="demo-row"><span>Action</span><strong>Monitor</strong></div>
                  </div>
                </div>
                <div className="demo-footer">Powered by MobileNetV2</div>
              </div>
              <div className="float-card fc1">
                <span>⚡</span><span>2–3 sec detection</span>
              </div>
              <div className="float-card fc2">
                <span>🌾</span><span>16,000+ trained images</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-strip">
            {[
              {n:"89%+",l:"Accuracy",i:"🎯"},
              {n:"10",l:"Diseases",i:"🔬"},
              {n:"16K+",l:"Images Trained",i:"🗂️"},
              {n:"< 3s",l:"Detection Speed",i:"⚡"},
              {n:"Free",l:"Always Free",i:"🎁"},
            ].map(({n,l,i}) => (
              <div key={l} className="stat-block">
                <span className="stat-icon">{i}</span>
                <div>
                  <div className="stat-num">{n}</div>
                  <div className="stat-lbl">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="container">
          <p className="sec-eyebrow">How it works</p>
          <h2 className="sec-title">Three steps to instant diagnosis</h2>
          <div className="how-grid">
            {[
              {n:"01",e:"📸",t:"Upload Photo",d:"Take a clear, well-lit close-up of a single tomato leaf and upload from your phone or computer."},
              {n:"02",e:"🤖",t:"AI Analyzes",d:"Our MobileNetV2 deep learning model checks for 10 disease patterns in just 2 to 3 seconds."},
              {n:"03",e:"💊",t:"Get Treatment",d:"Receive pesticide name, dosage instructions and Indian market prices immediately."},
            ].map(({n,e,t,d}) => (
              <div key={n} className="how-card">
                <div className="how-num">{n}</div>
                <div className="how-icon">{e}</div>
                <h3 className="how-title">{t}</h3>
                <p className="how-desc">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIAGNOSE */}
      <section className="section section-alt" id="diagnose">
        <div className="container">
          <p className="sec-eyebrow">Diagnosis Tool</p>
          <h2 className="sec-title">Upload your leaf photo</h2>
          <p className="sec-sub">Works best with close-up, well-lit photos of a single tomato leaf.</p>

          {!result ? (
            <div className="tool-box">
              <input ref={inputRef} type="file" accept="image/*"
                onChange={e => handleFile(e.target.files[0])} hidden/>
              {!preview ? (
                <div className={`dropzone ${drag?"dz-on":""}`}
                  onClick={() => inputRef.current.click()}
                  onDragOver={e=>{e.preventDefault();setDrag(true)}}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}>
                  <div className="dz-ico">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <path d="M24 6C24 6 12 13 12 22C12 28.6 17.4 34 24 35.5C30.6 34 36 28.6 36 22C36 13 24 6 24 6Z"
                        fill="#22c55e" opacity="0.12" stroke="#22c55e" strokeWidth="1.5"/>
                      <path d="M24 15V30M18 21L24 15L30 21" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="dz-title">Drop your tomato leaf photo here</h3>
                  <p className="dz-hint">or click to browse · JPG, PNG · Max 10MB</p>
                  <div className="dz-tips">
                    <span>📸 Natural daylight</span>
                    <span>🍃 Single leaf only</span>
                    <span>🔍 Close-up shot</span>
                  </div>
                </div>
              ) : (
                <div className="prev-layout">
                  <div className="prev-img-box">
                    <img src={preview} alt="leaf" className="prev-img"/>
                    <button className="prev-remove" onClick={reset}>✕ Remove</button>
                  </div>
                  <div className="prev-content">
                    <div className="prev-file">
                      <span className="prev-ico">🍃</span>
                      <div>
                        <p className="prev-name">{file.name}</p>
                        <p className="prev-size">{(file.size/1024).toFixed(1)} KB · Ready to analyze</p>
                      </div>
                    </div>
                    {!loading && !error && (
                      <button className="detect-btn" onClick={analyze}>🔬 Detect Disease</button>
                    )}
                    {loading && (
                      <div className="load-box">
                        <p className="load-title">Analyzing your leaf...</p>
                        <div className="load-bar-bg">
                          <div className="load-bar-fill" style={{width:step===0?"18%":step===1?"52%":step===2?"80%":"97%"}}/>
                        </div>
                        <div className="load-steps">
                          {STEPS.map((s,i) => (
                            <div key={i} className={`load-step ${step>i?"ls-done":step===i?"ls-on":""}`}>
                              <span>{step>i?"✓":step===i?"●":"○"}</span>
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!loading && error && (
                      <div className="err-box">
                        <div className="err-msg">⚠️ {error}</div>
                        <button className="detect-btn" onClick={analyze}>Try Again</button>
                        <button className="ghost-btn" onClick={reset}>Upload Different Photo</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="result-wrap">
              {/* Result Hero */}
              <div className="res-hero" style={{"--rc":RC[result.risk]}}>
                <div className="res-main">
                  <p className="res-tag">AI DIAGNOSIS COMPLETE</p>
                  <h2 className="res-disease">{result.emoji} {result.disease}</h2>
                  <div className="res-chip" style={{background:`${RC[result.risk]}12`,color:RC[result.risk],border:`1px solid ${RC[result.risk]}30`}}>
                    {result.risk==="none" ? "✓ Healthy — No Disease Detected" : `⚠ ${riskLabel(result.risk)} — Action Required`}
                  </div>
                  <div className="res-meta">
                    {[["Disease",result.disease],["Confidence",`${result.confidence}%`],["Risk",riskLabel(result.risk)]].map(([k,v]) => (
                      <div key={k} className="res-meta-item">
                        <span className="rmk">{k}</span>
                        <span className="rmv" style={k==="Risk"?{color:RC[result.risk]}:{}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="res-side">
                  <div className="res-ring">
                    <svg viewBox="0 0 130 130" width="130" height="130">
                      <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                      <circle cx="65" cy="65" r="56" fill="none"
                        stroke={RC[result.risk]} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2*Math.PI*56}`}
                        strokeDashoffset={`${2*Math.PI*56*(1-result.confidence/100)}`}
                        transform="rotate(-90 65 65)"
                        style={{transition:"stroke-dashoffset 1.5s ease"}}/>
                    </svg>
                    <div className="res-ring-inner">
                      <span className="res-pct" style={{color:RC[result.risk]}}>{result.confidence}%</span>
                      <span className="res-lbl">confidence</span>
                    </div>
                  </div>
                  <img src={preview} alt="" className="res-thumb"/>
                </div>
              </div>

              {/* Info Cards */}
              <div className="info-grid">
                {[
                  {ico:"🧬",title:"Cause",     body:result.info.causes,     color:"#ef4444"},
                  {ico:"🔬",title:"Symptoms",  body:result.info.symptoms,   color:"#f97316"},
                  {ico:"🛡️",title:"Prevention",body:result.info.prevention, color:"#22c55e"},
                  {ico:"💊",title:"Treatment", body:result.info.pesticide,  color:"#3b82f6", extra:result.info.price},
                ].map(({ico,title,body,color,extra}) => (
                  <div key={title} className="info-card">
                    <div className="ic-top">
                      <span className="ic-ico" style={{background:`${color}12`,color}}>{ico}</span>
                      <span className="ic-title" style={{color}}>{title}</span>
                    </div>
                    <p className="ic-body">{body}</p>
                    {extra && <div className="ic-price">💰 {extra}</div>}
                  </div>
                ))}
              </div>

              {/* Farmer Tips */}
              <div className="tips-panel">
                <h3 className="tips-title">🌾 Farmer Action Plan — {result.disease}</h3>
                <div className="tips-grid">
                  {tips.map((tip,i) => (
                    <div key={i} className="tip-card">
                      <span className="tip-num">{String(i+1).padStart(2,"0")}</span>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Probabilities */}
              <div className="probs-panel">
                <h3 className="probs-title">All Disease Probabilities</h3>
                {Object.entries(result.all_probabilities).sort((a,b)=>b[1]-a[1]).map(([name,pct],i) => (
                  <div key={name} className={`p-row ${name===result.disease?"p-active":""}`}>
                    <span className="p-name">{name}</span>
                    <div className="p-track">
                      <div className="p-fill" style={{
                        width:`${Math.max(pct,0.3)}%`,
                        background:name===result.disease?RC[result.risk]:"rgba(255,255,255,0.08)",
                        transition:"width 0.8s ease"
                      }}/>
                    </div>
                    <span className="p-val">{pct}%</span>
                  </div>
                ))}
              </div>

              <div className="res-footer">
                <button className="btn-secondary" onClick={reset}>↩ Analyze Another Leaf</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* DISEASE LIBRARY */}
      <section className="section" id="diseases">
        <div className="container">
          <p className="sec-eyebrow">Disease Library</p>
          <h2 className="sec-title">10 conditions we identify</h2>
          <p className="sec-sub">Trained on 16,000+ PlantVillage images with 89%+ accuracy.</p>
          <div className="disease-grid">
            {[
              {e:"🦠",n:"Bacterial Spot",      r:"High",    c:"#ef4444",d:"Brown spots with yellow halos. Xanthomonas bacteria."},
              {e:"🟤",n:"Early Blight",         r:"Moderate",c:"#f97316",d:"Ring spots on older leaves. Alternaria fungus."},
              {e:"🖤",n:"Late Blight",           r:"High",    c:"#ef4444",d:"Dark patches. Can destroy crop in days."},
              {e:"🟡",n:"Leaf Mold",             r:"Low",     c:"#eab308",d:"Pale yellow spots, olive mold below."},
              {e:"⚪",n:"Septoria Leaf Spot",    r:"Moderate",c:"#f97316",d:"White-centered spots. Rain splash spreads it."},
              {e:"🕷️",n:"Spider Mites",          r:"Moderate",c:"#f97316",d:"Bronze stippling and webbing under leaves."},
              {e:"🎯",n:"Target Spot",           r:"Moderate",c:"#f97316",d:"Target ring pattern on leaves and stems."},
              {e:"🌀",n:"Yellow Leaf Curl",      r:"High",    c:"#ef4444",d:"Curling yellow leaves. Spread by whiteflies."},
              {e:"🧩",n:"Mosaic Virus",          r:"High",    c:"#ef4444",d:"Mottled mosaic pattern. Spreads by contact."},
              {e:"🟢",n:"Healthy",               r:"None",    c:"#22c55e",d:"Deep green, uniform. No disease detected."},
            ].map(({e,n,r,c,d}) => (
              <div key={n} className="dis-card">
                <span className="dis-e">{e}</span>
                <h4 className="dis-n">{n}</h4>
                <p className="dis-d">{d}</p>
                <span className="dis-r" style={{color:c,background:`${c}10`,border:`1px solid ${c}25`}}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div className="trust-bar">
        <div className="container">
          <div className="trust-row">
            {[
              {i:"🤖",k:"Model",   v:"MobileNetV2 Transfer Learning"},
              {i:"🎯",k:"Accuracy",v:"89%+ Validated on Test Set"},
              {i:"🌾",k:"Dataset", v:"PlantVillage · 16,000+ Images"},
              {i:"🇮🇳",k:"Origin",  v:"Built in India for Farmers"},
            ].map(({i,k,v}) => (
              <div key={k} className="trust-item">
                <span className="t-ico">{i}</span>
                <div>
                  <div className="t-key">{k}</div>
                  <div className="t-val">{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="foot-wrap">
        <footer className="footer">
          <div className="foot-grid">
            <div className="foot-brand">
              <div className="logo" style={{marginBottom:"12px"}}>
                <div className="logo-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 5 6.5 5 13C5 17.4 8.1 21 12 22C15.9 21 19 17.4 19 13C19 6.5 12 2 12 2Z"/></svg></div>
                <span className="logo-text">KrishiDrishti</span>
              </div>
              <p>AI-powered disease detection for Indian farmers. Free forever.</p>
            </div>
            <div className="foot-nav">
              <p className="foot-nav-h">Navigation</p>
              <a href="#how">How it works</a>
              <a href="#diagnose">Diagnose</a>
              <a href="#diseases">Disease Library</a>
            </div>
            <div className="foot-nav">
              <p className="foot-nav-h">Technology</p>
              <span>MobileNetV2 AI</span>
              <span>FastAPI Backend</span>
              <span>React Frontend</span>
            </div>
            <div className="foot-end">
              <p className="foot-quote">"Strong Farmers,<br/>Strong Nation 🇮🇳"</p>
              <p className="foot-copy">© 2026 KrishiDrishti</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}