from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np, io

app = FastAPI(title="KrishiDrishti AI API")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"]
)

model = load_model("krishidrishti_model.keras")

# Exact order from your training output
CLASSES = [
    "bacterial_spot",    # 0
    "early_blight",      # 1
    "healthy",           # 2
    "late_blight",       # 3
    "leaf_mold",         # 4
    "mosaic_virus",      # 5
    "septoria_leaf_spot",# 6
    "spider_mites",      # 7
    "target_spot",       # 8
    "yellow_leaf_curl",  # 9
]

INFO = {
    "bacterial_spot": {
        "display": "Bacterial Spot",
        "risk": "high",
        "emoji": "🦠",
        "causes": "Caused by Xanthomonas bacteria. Spreads through rain splash, wind, and infected seeds.",
        "symptoms": "Small water-soaked spots turning brown-black with yellow halos. Leaves may drop early.",
        "prevention": "Use certified disease-free seeds. Avoid overhead irrigation. Remove infected debris.",
        "pesticide": "Copper Oxychloride 50 WP — mix 3g per litre. Spray every 7–10 days.",
        "price": "₹350 – ₹500 per kg"
    },
    "early_blight": {
        "display": "Early Blight",
        "risk": "moderate",
        "emoji": "🟤",
        "causes": "Fungal infection by Alternaria solani. Spreads through infected soil and water splashing.",
        "symptoms": "Dark brown circular spots with concentric rings and yellow halo on older leaves.",
        "prevention": "Remove infected leaves. Rotate crops every season. Avoid wetting leaves when watering.",
        "pesticide": "Mancozeb 75 WP — mix 2g per litre. Spray every 7 days especially after rain.",
        "price": "₹450 – ₹600 per kg"
    },
    "healthy": {
        "display": "Healthy Plant",
        "risk": "none",
        "emoji": "🟢",
        "causes": "No disease detected. Your tomato plant is in great health.",
        "symptoms": "Deep uniform green leaves, firm stems, no spots or yellowing — all healthy signs.",
        "prevention": "Monitor every 3–4 days. Maintain good spacing, drainage, and balanced fertilisation.",
        "pesticide": "No treatment needed. Continue your current care routine.",
        "price": "No cost needed"
    },
    "late_blight": {
        "display": "Late Blight",
        "risk": "high",
        "emoji": "🖤",
        "causes": "Phytophthora infestans — extremely aggressive. Can destroy entire crop within days.",
        "symptoms": "Large dark water-soaked patches spreading fast. White fuzzy growth under leaves.",
        "prevention": "Act IMMEDIATELY. Remove and burn all infected plants. Stop irrigation for 2–3 days.",
        "pesticide": "Metalaxyl + Mancozeb (Ridomil Gold MZ) — spray every 5 days during outbreak.",
        "price": "₹800 – ₹1,200 per kg"
    },
    "leaf_mold": {
        "display": "Leaf Mold",
        "risk": "low",
        "emoji": "🟡",
        "causes": "Passalora fulva fungus. Thrives in high humidity and poor air circulation.",
        "symptoms": "Yellow patches on upper leaf. Olive-green fuzzy coating on the underside.",
        "prevention": "Prune for better airflow. Water at base only. Reduce plant density if overcrowded.",
        "pesticide": "Chlorothalonil 75 WP — spray leaf undersides thoroughly. Repeat every 10 days.",
        "price": "₹500 – ₹700 per kg"
    },
    "mosaic_virus": {
        "display": "Tomato Mosaic Virus",
        "risk": "high",
        "emoji": "🧩",
        "causes": "ToMV virus spreads through contact, infected tools, and handling. No chemical cure.",
        "symptoms": "Mottled light and dark green mosaic pattern on leaves. Leaves curl and distort.",
        "prevention": "Disinfect tools with bleach. Wash hands before handling. Remove infected plants.",
        "pesticide": "No chemical cure. Control aphids with Imidacloprid to stop virus spreading.",
        "price": "₹500 – ₹800 per litre (aphid control)"
    },
    "septoria_leaf_spot": {
        "display": "Septoria Leaf Spot",
        "risk": "moderate",
        "emoji": "⚪",
        "causes": "Septoria lycopersici fungus. Spreads through water splash and infected plant debris.",
        "symptoms": "Small circular spots with white/grey centres and dark brown borders on lower leaves.",
        "prevention": "Remove lower infected leaves. Mulch soil to prevent water splash. Rotate crops.",
        "pesticide": "Mancozeb or Chlorothalonil — spray every 7–10 days from first sign of disease.",
        "price": "₹400 – ₹600 per kg"
    },
    "spider_mites": {
        "display": "Spider Mites (Two-Spotted)",
        "risk": "moderate",
        "emoji": "🕷️",
        "causes": "Tetranychus urticae mites thrive in hot dry conditions. Spread through wind and tools.",
        "symptoms": "Fine yellow stippling on leaves. Tiny webbing on undersides. Leaves turn bronze.",
        "prevention": "Keep plants well watered. Spray water under leaves regularly. Avoid dusty conditions.",
        "pesticide": "Abamectin 1.8 EC — spray underside of leaves thoroughly. Rotate miticides.",
        "price": "₹600 – ₹900 per 100ml"
    },
    "target_spot": {
        "display": "Target Spot",
        "risk": "moderate",
        "emoji": "🎯",
        "causes": "Corynespora cassiicola fungus. Favoured by warm temperatures and high humidity.",
        "symptoms": "Circular brown spots with concentric ring pattern on leaves and stems.",
        "prevention": "Improve air circulation. Remove infected leaves. Avoid over-fertilising with nitrogen.",
        "pesticide": "Azoxystrobin + Difenoconazole (Amistar Top) — spray every 14 days preventively.",
        "price": "₹900 – ₹1,400 per litre"
    },
    "yellow_leaf_curl": {
        "display": "Yellow Leaf Curl Virus",
        "risk": "high",
        "emoji": "🌀",
        "causes": "TYLCV virus transmitted by whiteflies. No cure once plant is infected.",
        "symptoms": "Leaves curl upward and turn yellow. Stunted growth. Severely reduced fruit production.",
        "prevention": "Use yellow sticky traps for whiteflies. Use virus-resistant varieties. Remove infected plants.",
        "pesticide": "Imidacloprid 17.8 SL — controls whitefly vector. Spray every 7 days.",
        "price": "₹500 – ₹800 per litre"
    }
}

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "KrishiDrishti AI — 10 Class Tomato Disease Detector 🌿",
        "classes": len(CLASSES)
    }

@app.get("/classes")
def get_classes():
    return {"total": len(CLASSES), "classes": CLASSES}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB").resize((224, 224))
    arr = np.expand_dims(np.array(img) / 255.0, axis=0)

    preds  = model.predict(arr)[0]
    idx    = int(np.argmax(preds))
    key    = CLASSES[idx]
    info   = INFO[key]

    all_probs = {
        INFO[CLASSES[i]]["display"]: round(float(preds[i]) * 100, 2)
        for i in range(len(CLASSES))
    }

    return {
        "disease":           info["display"],
        "disease_key":       key,
        "emoji":             info["emoji"],
        "confidence":        round(float(preds[idx]) * 100, 2),
        "risk":              info["risk"],
        "all_probabilities": all_probs,
        "info": {
            "causes":     info["causes"],
            "symptoms":   info["symptoms"],
            "prevention": info["prevention"],
            "pesticide":  info["pesticide"],
            "price":      info["price"]
        }
    }