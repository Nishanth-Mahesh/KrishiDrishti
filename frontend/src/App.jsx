import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Leaf, AlertTriangle, CheckCircle,
  RotateCcw, ChevronDown, Shield, Eye
} from "lucide-react";
import "./App.css";

const BACKEND = "https://krishidrishti-6ich.onrender.com";

const RISK_COLOR = {
  none: "#22c55e",
  low: "#eab308",
  moderate: "#f97316",
  high: "#ef4444",
};

const DISEASE_INFO = {
  "Bacterial Spot": { risk:"high", emoji:"🦠", causes:"Xanthomonas bacteria spread through rain splash, wind, and infected seeds.", symptoms:"Small water-soaked dark spots with yellow halos. Leaves drop early.", prevention:"Use certified disease-free seeds. Avoid overhead irrigation. Remove infected debris.", pesticide:"Copper Oxychloride 50 WP — mix 3g per litre. Spray every 7–10 days.", price:"₹350 – ₹500 per kg" },
  "Early Blight": { risk:"moderate", emoji:"🟤", causes:"Alternaria solani fungus. Spreads through infected soil and water splash.", symptoms:"Dark brown circular spots with concentric rings and yellow halo on older leaves.", prevention:"Remove infected leaves. Rotate crops. Avoid wetting leaves when watering.", pesticide:"Mancozeb 75 WP — mix 2g per litre. Spray every 7 days after rain.", price:"₹450 – ₹600 per kg" },
  "Late Blight": { risk:"high", emoji:"🖤", causes:"Phytophthora infestans — extremely aggressive. Destroys entire crop in days.", symptoms:"Large dark water-soaked patches spreading fast. White fuzzy growth under leaves.", prevention:"Act IMMEDIATELY. Remove and burn infected plants. Stop irrigation 2–3 days.", pesticide:"Metalaxyl + Mancozeb (Ridomil Gold MZ) — spray every 5 days.", price:"₹800 – ₹1,200 per kg" },
  "Leaf Mold": { risk:"low", emoji:"🟡", causes:"Passalora fulva fungus. Thrives in high humidity and poor air circulation.", symptoms:"Yellow patches on upper leaf. Olive-green fuzzy coating on underside.", prevention:"Prune for airflow. Water at base only. Reduce plant density.", pesticide:"Chlorothalonil 75 WP — spray leaf undersides. Repeat every 10 days.", price:"₹500 – ₹700 per kg" },
  "Septoria Leaf Spot": { risk:"moderate", emoji:"⚪", causes:"Septoria lycopersici fungus. Spreads through water splash and plant debris.", symptoms:"Small circular spots with white centres and dark borders on lower leaves.", prevention:"Remove lower leaves. Mulch soil to prevent water splash. Rotate crops.", pesticide:"Mancozeb or Chlorothalonil — spray every 7–10 days from first sign.", price:"₹400 – ₹600 per kg" },
  "Spider Mites": { risk:"moderate", emoji:"🕷️", causes:"Tetranychus urticae mites thrive in hot dry conditions.", symptoms:"Fine yellow stippling on leaves. Tiny webbing on undersides. Leaves turn bronze.", prevention:"Keep plants watered. Spray water under leaves. Avoid dusty conditions.", pesticide:"Abamectin 1.8 EC — spray leaf undersides thoroughly. Rotate miticides.", price:"₹600 – ₹900 per 100ml" },
  "Target Spot": { risk:"moderate", emoji:"🎯", causes:"Corynespora cassiicola fungus. Warm temperature and high humidity.", symptoms:"Circular brown spots with concentric ring pattern on leaves and stems.", prevention:"Improve air circulation. Remove infected leaves. Avoid excess nitrogen.", pesticide:"Azoxystrobin + Difenoconazole (Amistar Top) — spray every 14 days.", price:"₹900 – ₹1,400 per litre" },
  "Tomato Yellow Leaf Curl Virus": { risk:"high", emoji:"🌀", causes:"TYLCV virus transmitted by whiteflies. No cure once infected.", symptoms:"Leaves curl upward and yellow. Stunted growth. Severely reduced fruit.", prevention:"Use yellow sticky traps. Use virus-resistant varieties. Remove infected plants.", pesticide:"Imidacloprid 17.8 SL — controls whitefly vector. Spray every 7 days.", price:"₹500 – ₹800 per litre" },
  "Tomato Mosaic Virus": { risk:"high", emoji:"🧩", causes:"ToMV virus spreads through contact, infected tools, and handling.", symptoms:"Mottled light and dark green mosaic pattern. Leaves curl and distort.", prevention:"Disinfect tools with bleach. Wash hands before handling. Remove infected plants.", pesticide:"No chemical cure. Control aphids with Imidacloprid to stop spread.", price:"₹500 – ₹800 per litre (aphid control)" },
  "Healthy": { risk:"none", emoji:"🟢", causes:"No disease detected. Your tomato plant is in great health.", symptoms:"Deep uniform green leaves, firm stems, no spots or yellowing.", prevention:"Monitor every 3–4 days. Maintain good spacing, drainage, and fertilisation.", pesticide:"No treatment needed. Continue your current care routine.", price:"No cost needed" },
};

const TIPS = [
  "🌱 Early detection saves your harvest — check leaves every 3 days",
  "💧 Water tomato plants at the base — never wet the leaves",
  "🦟 Yellow sticky traps prevent whitefly and Yellow Leaf Curl Virus",
  "🌿 Rotate crops each season to break fungal disease cycles",
  "☀️ Morning is the best time to spray pesticides",
  "🧤 Always wear gloves and mask when applying pesticides",
  "🔬 Late Blight spreads fast in cool wet weather — act within 24 hours",
  "🌾 Certified seeds reduce Bacterial Spot risk by 80%",
  "✂️ Prune lower leaves to improve airflow and prevent Leaf Mold",
  "🕷️ Check leaf undersides weekly for Spider Mites and whiteflies",
];

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (!loading) { setLoadStep(0); return; }
    const t = [600,1400,2400].map((ms,i) => setTimeout(() => setLoadStep(i+1), ms));
    return () => t.forEach(clearTimeout);
  }, [loading]);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axios.post(`${BACKEND}/predict`, fd);
      const data = res.data;
      const name = data.disease || data.class || "Healthy";
      const info = DISEASE_INFO[name] || DISEASE_INFO["Healthy"];
      setResult({
        disease: name,
        confidence: data.confidence,
        risk: info.risk,
        emoji: info.emoji,
        info: { causes: info.causes, symptoms: info.symptoms, prevention: info.prevention, pesticide: info.pesticide, price: info.price },
        all_probabilities: data.all_probabilities || data.all_predictions || {},
      });
    } catch (err) {
      const d = err?.response?.data?.detail || "";
      if (d.includes("NOT_A_LEAF")) setError("🍃 Not a tomato leaf! Please upload a real tomato leaf photo.");
      else if (d.includes("LOW_CONFIDENCE")) setError("📸 Image not clear enough. Try a close-up in good lighting.");
      else if (err?.code === "ERR_NETWORK") setError("⏳ Backend waking up — wait 30 seconds and try again.");
      else setError("⚠️ Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const rc = result ? (RISK_COLOR[result.risk] || "#22c55e") : "#22c55e";

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
      </div>

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-inner">
          {[...TIPS,...TIPS].map((t,i) => <span key={i} className="ticker-item">{t}</span>)}
        </div>
      </div>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-icon"><Leaf size={16} strokeWidth={2.5}/></div>
          <div className="nav-text">
            <span className="nav-name">KrishiDrishti</span>
            <span className="nav-sub">कृषि दृष्टि</span>
          </div>
        </div>
        <div className="nav-badge">🇮🇳 Made for Indian Farmers</div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <motion.div className="hero-content"
          initial={{opacity:0,y:40}} animate={{opacity:1,y:0}}
          transition={{duration:0.85,ease:[0.16,1,0.3,1]}}>
          <div className="hero-pill">
            <span className="pill-dot"/>
            AI · MobileNetV2 · 10 Disease Classes · 89% Accuracy
          </div>
          <h1 className="hero-title">
            Protect Your Crop<br/>
            <em className="hero-em">Before It's Too Late</em>
          </h1>
          <p className="hero-desc">
            Upload a tomato leaf photo. Our AI identifies disease in seconds
            and gives you the exact pesticide, dosage, and cost in INR.
          </p>
          <button className="hero-cta"
            onClick={() => document.getElementById("upload-section")?.scrollIntoView({behavior:"smooth"})}>
            Start Free Diagnosis <ChevronDown size={16}/>
          </button>
          <div className="hero-stats">
            {[["89%+","Accuracy"],["10","Diseases"],["16K+","Images"],["Free","Always"]].map(([n,l]) => (
              <div key={l} className="stat-item">
                <span className="stat-num">{n}</span>
                <span className="stat-lbl">{l}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="hero-visual" aria-hidden="true">
          <div className="leaf-orb">
            <div className="leaf-glow"/>
            <Leaf size={88} strokeWidth={1} className="leaf-svg"/>
            <div className="ring r1"/><div className="ring r2"/><div className="ring r3"/>
          </div>
        </div>
      </section>

      {/* Upload / Result */}
      <section className="main-section" id="upload-section">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="upload" className="upload-card"
              initial={{opacity:0,y:28}} animate={{opacity:1,y:0}}
              exit={{opacity:0,y:-16}} transition={{duration:0.5}}>
              <div className="card-header">
                <div className="card-icon"><Upload size={18}/></div>
                <div>
                  <h2 className="card-title">Upload Leaf Photo</h2>
                  <p className="card-subtitle">Take a clear, well-lit photo of a single tomato leaf</p>
                </div>
              </div>
              <input ref={inputRef} type="file" accept="image/*"
                onChange={e => handleFile(e.target.files[0])} hidden/>
              {!preview ? (
                <div className="drop-zone"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={e => {e.preventDefault(); e.currentTarget.classList.add("drag-over");}}
                  onDragLeave={e => e.currentTarget.classList.remove("drag-over")}
                  onDrop={e => {e.preventDefault(); e.currentTarget.classList.remove("drag-over"); handleFile(e.dataTransfer.files[0]);}}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key==="Enter" && inputRef.current?.click()}>
                  <div className="drop-icon"><Leaf size={36} strokeWidth={1}/></div>
                  <p className="drop-title">Drop leaf photo here</p>
                  <p className="drop-hint">or tap to browse · JPG, PNG · Max 10MB</p>
                </div>
              ) : (
                <div className="preview-wrap">
                  <img src={preview} alt="Uploaded leaf" className="preview-img"/>
                  <div className="preview-info">
                    <p className="preview-name">{file.name}</p>
                    <p className="preview-size">{(file.size/1024).toFixed(1)} KB · Ready</p>
                    {!loading && <>
                      <button className="btn-analyze" onClick={analyze}>🔬 Detect Disease</button>
                      <button className="btn-ghost" onClick={reset}>Change Photo</button>
                    </>}
                    {loading && (
                      <div className="loader-wrap">
                        <div className="loader-ring"/>
                        <div className="loader-steps">
                          {["Reading image","Running AI model","Building report"].map((s,i) => (
                            <div key={i} className={`lstep${loadStep>i?" done":loadStep===i?" active":""}`}>
                              <span className="lstep-dot"/><span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="error-box">
                        <AlertTriangle size={14}/><span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="result"
              initial={{opacity:0,y:28}} animate={{opacity:1,y:0}}
              exit={{opacity:0}} transition={{duration:0.55}}>
              {/* Diagnosis banner */}
              <div className="dx-banner" style={{"--rc":rc,"--rc-glow":rc+"20"}}>
                <div className="dx-left">
                  <p className="dx-eyebrow">AI Diagnosis Complete</p>
                  <h2 className="dx-disease">{result.emoji} {result.disease}</h2>
                  <div className="dx-badge">
                    {result.risk==="none" ? <><CheckCircle size={13}/> Healthy — No Disease Found</>
                     : result.risk==="high" ? <><AlertTriangle size={13}/> High Risk — Act Immediately</>
                     : result.risk==="moderate" ? <><AlertTriangle size={13}/> Moderate — Act This Week</>
                     : <><AlertTriangle size={13}/> Low Risk — Monitor Closely</>}
                  </div>
                </div>
                <div className="dx-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
                    <motion.circle cx="50" cy="50" r="42" fill="none"
                      stroke={rc} strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*42}`}
                      initial={{strokeDashoffset:`${2*Math.PI*42}`}}
                      animate={{strokeDashoffset:`${2*Math.PI*42*(1-result.confidence/100)}`}}
                      transition={{duration:1.8,ease:"easeOut"}}
                      transform="rotate(-90 50 50)"/>
                  </svg>
                  <div className="dx-ring-inner">
                    <span className="dx-pct">{result.confidence}%</span>
                    <span className="dx-pct-lbl">confidence</span>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="meta-strip">
                <img src={preview} alt="analyzed" className="meta-thumb"/>
                {[["Disease",result.disease],["Confidence",result.confidence+"%"],["Risk",result.risk==="none"?"None":result.risk]].map(([k,v]) => (
                  <div key={k} className="meta-chip">
                    <span className="meta-key">{k}</span>
                    <span className="meta-val" style={k==="Risk"?{color:rc,textTransform:"capitalize"}:{}}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Info cards */}
              <div className="info-grid">
                {[
                  {icon:"🧬",label:"Cause",key:"causes",color:"#ef4444"},
                  {icon:"🔬",label:"Symptoms",key:"symptoms",color:"#f97316"},
                  {icon:"🛡️",label:"Prevention",key:"prevention",color:"#22c55e"},
                  {icon:"💊",label:"Treatment & Pesticide",key:"pesticide",color:"#3b82f6",extra:"💰 "+result.info.price},
                ].map(({icon,label,key,color,extra},i) => (
                  <motion.div key={key} className="info-card" style={{"--accent":color}}
                    initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
                    transition={{delay:i*0.09,duration:0.45}}>
                    <div className="info-icon-wrap" style={{background:color+"15",color}}>{icon}</div>
                    <p className="info-label">{label}</p>
                    <p className="info-text">{result.info[key]}</p>
                    {extra && <span className="info-price">{extra}</span>}
                  </motion.div>
                ))}
              </div>

              {/* Probabilities */}
              {Object.keys(result.all_probabilities).length > 0 && (
                <div className="probs-card">
                  <p className="probs-title">All Disease Probabilities</p>
                  {Object.entries(result.all_probabilities).sort((a,b)=>b[1]-a[1]).map(([name,pct],i) => (
                    <div key={name} className={"prob-row"+(name===result.disease?" prob-top":"")}>
                      <span className="prob-name">{name}</span>
                      <div className="prob-track">
                        <motion.div className="prob-fill"
                          initial={{width:0}} animate={{width:Math.max(Number(pct),0.3)+"%"}}
                          transition={{duration:0.8,delay:i*0.04,ease:"easeOut"}}
                          style={{background:name===result.disease?rc:"rgba(255,255,255,0.1)"}}/>
                      </div>
                      <span className="prob-val">{pct}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="result-footer">
                <button className="btn-reset" onClick={reset}>
                  <RotateCcw size={14}/> Analyze Another Leaf
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Library */}
      <section className="library">
        <span className="section-tag">Disease Library</span>
        <h2 className="section-title">10 Diseases We Detect</h2>
        <p className="section-desc">Know what you're dealing with before you upload.</p>
        <div className="lib-grid">
          {[
            {e:"🦠",n:"Bacterial Spot",r:"High",c:"#ef4444",d:"Brown spots with yellow halos. Spreads via rain."},
            {e:"🟤",n:"Early Blight",r:"Moderate",c:"#f97316",d:"Ring spots on older leaves. Alternaria fungus."},
            {e:"🖤",n:"Late Blight",r:"High",c:"#ef4444",d:"Rapid dark patches. Destroys crop in days."},
            {e:"🟡",n:"Leaf Mold",r:"Low",c:"#eab308",d:"Yellow above, fuzzy below. High humidity."},
            {e:"⚪",n:"Septoria Leaf Spot",r:"Moderate",c:"#f97316",d:"White-centred spots. Water splash spreads it."},
            {e:"🕷️",n:"Spider Mites",r:"Moderate",c:"#f97316",d:"Bronze stippling and webbing. Hot conditions."},
            {e:"🎯",n:"Target Spot",r:"Moderate",c:"#f97316",d:"Concentric ring spots on leaves and stems."},
            {e:"🌀",n:"Yellow Leaf Curl",r:"High",c:"#ef4444",d:"Leaves curl yellow. Whitefly spread. No cure."},
            {e:"🧩",n:"Mosaic Virus",r:"High",c:"#ef4444",d:"Mottled mosaic pattern. Spreads by contact."},
            {e:"🟢",n:"Healthy",r:"None",c:"#22c55e",d:"Deep green uniform leaves. No disease signs."},
          ].map(({e,n,r,c,d}) => (
            <div key={n} className="lib-card">
              <span className="lib-em">{e}</span>
              <p className="lib-name">{n}</p>
              <p className="lib-desc-text">{d}</p>
              <span className="lib-risk" style={{color:c,borderColor:c+"33",background:c+"11"}}>{r} Risk</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <div className="trust-strip">
        {[
          {icon:"🤖",k:"AI Model",v:"MobileNetV2 Transfer Learning"},
          {icon:"🎯",k:"Accuracy",v:"89%+ Validated"},
          {icon:"🌾",k:"Dataset",v:"PlantVillage 16,000+ Images"},
          {icon:"🇮🇳",k:"Origin",v:"Built in India"},
        ].map(({icon,k,v}) => (
          <div key={k} className="trust-item">
            <div className="trust-icon">{icon}</div>
            <div><p className="trust-key">{k}</p><p className="trust-val">{v}</p></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <p className="footer-brand">KrishiDrishti</p>
            <p className="footer-copy">©2026 KrishiDrishti India Pvt. Ltd · All rights reserved</p>
          </div>
          <p className="footer-quote">"Strong Farmers Build a Strong Nation 🇮🇳"</p>
        </div>
      </footer>
    </div>
  );
}
