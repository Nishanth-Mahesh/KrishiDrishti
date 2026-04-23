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
        "emoji": "🦠", "risk": "high",
        "causes": "Caused by Xanthomonas bacteria. Spreads through infected seeds, rain splash, and contaminated tools in warm wet weather.",
        "symptoms": "Small brown water-soaked spots surrounded by yellow halos on leaves. Spots merge and cause leaf drop in severe cases.",
        "prevention": "Use certified disease-free seeds. Avoid overhead irrigation. Rotate crops every season. Remove infected debris.",
        "pesticide": "Copper Oxychloride 50% WP (Blitox) — 3g per litre of water. Spray every 7 days.",
        "price": "Rs 320 per kg (Blitox 50 WP)"
    },
    "Early Blight": {
        "emoji": "🟤", "risk": "moderate",
        "causes": "Caused by Alternaria solani fungus. Thrives in warm humid conditions with heavy dew and poor air circulation.",
        "symptoms": "Dark brown concentric ring spots forming a target board pattern on older lower leaves first. Leaves turn yellow.",
        "prevention": "Remove infected leaves immediately. Improve air circulation. Avoid wetting foliage. Stake plants properly.",
        "pesticide": "Mancozeb 75% WP (Dithane M-45) — 2.5g per litre. Spray every 10 days.",
        "price": "Rs 280 per kg (Dithane M-45)"
    },
    "Late Blight": {
        "emoji": "🖤", "risk": "high",
        "causes": "Caused by Phytophthora infestans. Spreads rapidly in cool wet weather. Most destructive tomato disease in India.",
        "symptoms": "Large dark greasy water-soaked patches on leaves that turn black. White mold visible on underside in humid conditions.",
        "prevention": "Avoid overhead watering. Destroy infected plants immediately. Plant resistant varieties. Improve drainage.",
        "pesticide": "Cymoxanil + Mancozeb (Curzate M8) — 2.5g per litre. Spray every 5 to 7 days.",
        "price": "Rs 650 per kg (Curzate M8)"
    },
    "Leaf Mold": {
        "emoji": "🟡", "risk": "low",
        "causes": "Caused by Passalora fulva fungus. Develops in high humidity above 85% and poor ventilation especially in greenhouses.",
        "symptoms": "Pale yellow spots on upper leaf surface. Olive green to brown fuzzy mold on the underside of leaves.",
        "prevention": "Improve ventilation. Reduce humidity. Avoid overhead irrigation. Remove and destroy infected leaves promptly.",
        "pesticide": "Chlorothalonil 75% WP (Kavach) — 2g per litre of water. Spray every 10 days.",
        "price": "Rs 400 per kg (Kavach 75 WP)"
    },
    "Septoria Leaf Spot": {
        "emoji": "⚪", "risk": "moderate",
        "causes": "Caused by Septoria lycopersici fungus. Spreads by rain splash and infected crop debris left in the field.",
        "symptoms": "Small circular spots with white or grey centers and dark brown borders. Tiny black specks visible inside spots.",
        "prevention": "Mulch around plants. Remove lower infected leaves. Practice crop rotation. Avoid working when plants are wet.",
        "pesticide": "Mancozeb + Carbendazim (Saaf) — 2g per litre of water. Spray every 7 to 10 days.",
        "price": "Rs 350 per 500g (Saaf Fungicide)"
    },
    "Spider Mites": {
        "emoji": "🕷️", "risk": "moderate",
        "causes": "Caused by Tetranychus urticae mites. Thrives in hot dry dusty conditions. Population explodes in drought stress.",
        "symptoms": "Fine yellow or bronze stippling on upper leaf surface. Webbing visible on underside. Leaves turn brown and dry.",
        "prevention": "Maintain adequate soil moisture. Avoid dusty conditions. Introduce natural predators. Avoid excess nitrogen.",
        "pesticide": "Abamectin 1.9% EC (Vertimec) — 0.5ml per litre of water. Spray underside of leaves thoroughly.",
        "price": "Rs 900 per 100ml (Vertimec)"
    },
    "Target Spot": {
        "emoji": "🎯", "risk": "moderate",
        "causes": "Caused by Corynespora cassiicola fungus. Favored by warm temperatures and high humidity with poor air circulation.",
        "symptoms": "Brown circular spots with distinct concentric target ring pattern on leaves stems and fruit. Spots may merge.",
        "prevention": "Improve air circulation between plants. Avoid wet foliage. Remove and destroy all infected plant debris.",
        "pesticide": "Azoxystrobin 23% SC (Amistar) — 1ml per litre of water. Spray every 10 to 14 days.",
        "price": "Rs 1800 per 250ml (Amistar)"
    },
    "Tomato Yellow Leaf Curl Virus": {
        "emoji": "🌀", "risk": "high",
        "causes": "Viral disease spread by whitefly (Bemisia tabaci). No chemical cure once infected. Prevention is the only option.",
        "symptoms": "Leaves curl upward and turn yellow at edges. Plant growth becomes stunted. Flowers drop. Fruit production stops.",
        "prevention": "Control whiteflies using yellow sticky traps. Use reflective mulch. Remove and burn infected plants immediately.",
        "pesticide": "Imidacloprid 17.8% SL (Confidor) — 0.5ml per litre. Spray for whitefly control only. Does not cure virus.",
        "price": "Rs 650 per 100ml (Confidor)"
    },
    "Tomato Mosaic Virus": {
        "emoji": "🧩", "risk": "high",
        "causes": "Caused by Tomato Mosaic Virus (ToMV). Spreads easily through contact, infected tools, hands and seeds.",
        "symptoms": "Mottled light and dark green mosaic pattern across leaves. Leaves may curl and distort. Fruit quality drops.",
        "prevention": "Wash hands before handling plants. Sterilize all tools with bleach. Remove and burn infected plants immediately.",
        "pesticide": "No direct cure available. Spray Neem Oil 1500 ppm at 3ml per litre to reduce insect vector population.",
        "price": "Rs 250 per litre (Neem Oil)"
    },
    "Healthy": {
        "emoji": "🟢", "risk": "none",
        "causes": "No disease detected. Your tomato plant appears completely healthy and growing normally.",
        "symptoms": "Deep uniform green color with no spots, discoloration, curling or abnormalities visible on the leaf surface.",
        "prevention": "Continue regular watering at base, weekly monitoring, balanced fertilization and proper plant spacing.",
        "pesticide": "No treatment needed. Apply Neem Oil 3ml per litre every 15 days as preventive protection.",
        "price": "Rs 250 per litre (Neem Oil preventive)"
    }
}

@app.get("/")
def health():
    return {"status": "ok", "message": "KrishiDrishti AI — 10 Class Tomato Disease Detector", "classes": 10}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image. Please try again.")

    img_array = np.expand_dims(np.array(img.resize((224, 224))) / 255.0, axis=0)
    predictions = model.predict(img_array)[0]
    max_conf = float(np.max(predictions))
    pred_idx = int(np.argmax(predictions))

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