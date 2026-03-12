from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import io
import tensorflow as tf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("krishidrishti_model.keras")

CLASS_NAMES = [
    "Bacterial Spot", "Early Blight", "Late Blight", "Leaf Mold",
    "Septoria Leaf Spot", "Spider Mites", "Target Spot",
    "Tomato Yellow Leaf Curl Virus", "Tomato Mosaic Virus", "Healthy"
]

DISEASE_INFO = {
    "Bacterial Spot": {
        "emoji": "🦠",
        "risk": "high",
        "causes": "Caused by Xanthomonas bacteria. Spreads through infected seeds, rain splash, and contaminated tools.",
        "symptoms": "Small, brown water-soaked spots with yellow halos on leaves. Spots may merge and cause leaf drop.",
        "prevention": "Use certified disease-free seeds. Avoid overhead irrigation. Rotate crops every season.",
        "pesticide": "Copper Oxychloride 50% WP (Blitox) — 3g per litre of water. Spray every 7 days.",
        "price": "₹320 per kg (Blitox 50 WP)"
    },
    "Early Blight": {
        "emoji": "🟤",
        "risk": "moderate",
        "causes": "Caused by Alternaria solani fungus. Thrives in warm, humid conditions with heavy dew.",
        "symptoms": "Dark brown concentric ring spots (target-board pattern) on older/lower leaves first.",
        "prevention": "Remove infected leaves immediately. Improve air circulation. Avoid wetting foliage.",
        "pesticide": "Mancozeb 75% WP (Dithane M-45) — 2.5g per litre. Spray every 10 days.",
        "price": "₹280 per kg (Dithane M-45)"
    },
    "Late Blight": {
        "emoji": "🖤",
        "risk": "high",
        "causes": "Caused by Phytophthora infestans. Spreads rapidly in cool, wet weather. Can destroy crop in days.",
        "symptoms": "Large dark brown/black water-soaked patches on leaves. White mold visible on underside.",
        "prevention": "Avoid overhead watering. Destroy infected plants immediately. Plant resistant varieties.",
        "pesticide": "Cymoxanil + Mancozeb (Curzate M8) — 2.5g per litre. Spray every 5-7 days.",
        "price": "₹650 per kg (Curzate M8)"
    },
    "Leaf Mold": {
        "emoji": "🟡",
        "risk": "low",
        "causes": "Caused by Passalora fulva fungus. Develops in high humidity (above 85%) and poor ventilation.",
        "symptoms": "Pale yellow spots on upper leaf surface. Olive-green to brown fuzzy mold on underside.",
        "prevention": "Improve greenhouse ventilation. Reduce humidity. Avoid overhead irrigation.",
        "pesticide": "Chlorothalonil 75% WP (Kavach) — 2g per litre of water. Spray every 10 days.",
        "price": "₹400 per kg (Kavach 75 WP)"
    },
    "Septoria Leaf Spot": {
        "emoji": "⚪",
        "risk": "moderate",
        "causes": "Caused by Septoria lycopersici fungus. Spreads by rain splash and infected crop debris.",
        "symptoms": "Small circular spots with white/gray centers and dark brown borders. Black dots inside spots.",
        "prevention": "Mulch around plants. Remove lower infected leaves. Practice crop rotation.",
        "pesticide": "Mancozeb + Carbendazim (Saaf) — 2g per litre of water. Spray every 7-10 days.",
        "price": "₹350 per 500g (Saaf Fungicide)"
    },
    "Spider Mites": {
        "emoji": "🕷️",
        "risk": "moderate",
        "causes": "Caused by Tetranychus urticae mites. Thrives in hot, dry, dusty conditions.",
        "symptoms": "Fine bronze/yellow stippling on leaves. Webbing visible on underside. Leaves turn brown and dry.",
        "prevention": "Maintain adequate soil moisture. Avoid dusty conditions. Introduce predatory mites.",
        "pesticide": "Abamectin 1.9% EC (Vertimec) — 0.5ml per litre of water. Spray underside of leaves.",
        "price": "₹900 per 100ml (Vertimec)"
    },
    "Target Spot": {
        "emoji": "🎯",
        "risk": "moderate",
        "causes": "Caused by Corynespora cassiicola fungus. Favored by warm temperatures and high humidity.",
        "symptoms": "Brown circular spots with concentric rings (target pattern) on leaves, stems, and fruits.",
        "prevention": "Improve air circulation. Avoid wet foliage. Remove and destroy infected plant debris.",
        "pesticide": "Azoxystrobin 23% SC (Amistar) — 1ml per litre of water. Spray every 10-14 days.",
        "price": "₹1800 per 250ml (Amistar)"
    },
    "Tomato Yellow Leaf Curl Virus": {
        "emoji": "🌀",
        "risk": "high",
        "causes": "Viral disease spread by whitefly (Bemisia tabaci). No cure once infected.",
        "symptoms": "Leaves curl upward, turn yellow at edges. Stunted plant growth. Flowers may drop.",
        "prevention": "Control whiteflies with yellow sticky traps. Use reflective mulch. Remove infected plants.",
        "pesticide": "Imidacloprid 17.8% SL (Confidor) — 0.5ml per litre. Spray for whitefly control only.",
        "price": "₹650 per 100ml (Confidor)"
    },
    "Tomato Mosaic Virus": {
        "emoji": "🧩",
        "risk": "high",
        "causes": "Caused by Tomato Mosaic Virus (ToMV). Spreads through contact, infected tools, and seeds.",
        "symptoms": "Mottled light/dark green mosaic pattern on leaves. Leaves may curl and become distorted.",
        "prevention": "Wash hands before handling plants. Sterilize tools. Remove and burn infected plants.",
        "pesticide": "No direct cure. Spray Neem Oil 1500 ppm — 3ml per litre to reduce insect vectors.",
        "price": "₹250 per litre (Neem Oil)"
    },
    "Healthy": {
        "emoji": "🟢",
        "risk": "none",
        "causes": "No disease detected. Your plant appears healthy.",
        "symptoms": "Deep green leaves with no spots, discoloration, or abnormalities.",
        "prevention": "Continue regular watering, fertilization, and field monitoring every week.",
        "pesticide": "No treatment needed. Preventive spray: Neem Oil 3ml per litre every 15 days.",
        "price": "₹250 per litre (Neem Oil — preventive)"
    }
}

def is_leaf_image(img: Image.Image) -> bool:
    img_rgb = img.convert("RGB").resize((150, 150))
    pixels = np.array(img_rgb)
    r = pixels[:,:,0].astype(float)
    g = pixels[:,:,1].astype(float)
    b = pixels[:,:,2].astype(float)

    green_mask = (g > r) & (g > b) & (g > 30)
    green_ratio = np.sum(green_mask) / (150 * 150)

    yellow_mask = (r > 100) & (g > 80) & (b < 100)
    yellow_ratio = np.sum(yellow_mask) / (150 * 150)

    brown_mask = (r > 60) & (g > 40) & (b < 60) & (r > g)
    brown_ratio = np.sum(brown_mask) / (150 * 150)

    blue_dominant = (b > r + 30) & (b > g + 20)
    blue_ratio = np.sum(blue_dominant) / (150 * 150)
    if blue_ratio > 0.35:
        return False

    color_variance = np.mean(np.std(pixels, axis=2))
    if color_variance < 10:
        return False

    leaf_score = green_ratio + (yellow_ratio * 0.5) + (brown_ratio * 0.4)
    return leaf_score > 0.08

@app.get("/")
def health():
    return {"status": "ok", "message": "KrishiDrishti AI — 10 Class Tomato Disease Detector 🌿", "classes": 10}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image.")

    if not is_leaf_image(img):
        raise HTTPException(status_code=422, detail="NOT_A_LEAF: Please upload a real tomato leaf photo.")

    img_array = np.expand_dims(np.array(img.resize((224, 224))) / 255.0, axis=0)
    predictions = model.predict(img_array)[0]
    max_conf = float(np.max(predictions))
    pred_idx = int(np.argmax(predictions))

    if max_conf < 0.70:
        raise HTTPException(status_code=422, detail="LOW_CONFIDENCE: Image not clear enough. Use a close-up leaf photo.")

    disease_name = CLASS_NAMES[pred_idx]
    info = DISEASE_INFO[disease_name]

    return {
        "disease": disease_name,
        "emoji": info["emoji"],
        "risk": info["risk"],
        "confidence": round(max_conf * 100, 2),
        "info": {
            "causes": info["causes"],
            "symptoms": info["symptoms"],
            "prevention": info["prevention"],
            "pesticide": info["pesticide"],
            "price": info["price"]
        },
        "all_probabilities": {
            CLASS_NAMES[i]: round(float(predictions[i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }
    }
