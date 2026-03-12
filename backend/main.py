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

# MobileNetV2 pretrained on ImageNet — used to verify it's a plant/leaf
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=True,
    weights="imagenet"
)

# ImageNet indices that relate to plants, leaves, vegetables, nature
PLANT_CLASSES = set([
    *range(937, 985),   # fruits and vegetables
    *range(985, 1000),  # flowers and plants
    301, 303, 304,      # outdoor/nature scenes
    890, 891, 892,      # pepper, strawberry, artichoke
])

CLASS_NAMES = [
    "Bacterial Spot", "Early Blight", "Late Blight", "Leaf Mold",
    "Septoria Leaf Spot", "Spider Mites", "Target Spot",
    "Tomato Yellow Leaf Curl Virus", "Tomato Mosaic Virus", "Healthy"
]

DISEASE_INFO = {
    "Bacterial Spot": {
        "emoji": "🦠", "risk": "high",
        "causes": "Caused by Xanthomonas bacteria. Spreads through rain, wind, and infected seeds.",
        "symptoms": "Small, dark brown spots with yellow halos on leaves, stems, and fruits.",
        "prevention": "Use certified disease-free seeds. Avoid overhead irrigation. Rotate crops every season.",
        "pesticide": "Copper Oxychloride 50% WP (Blitox) — 3g per litre of water",
        "price": "₹320–₹450 per kg"
    },
    "Early Blight": {
        "emoji": "🟤", "risk": "moderate",
        "causes": "Alternaria solani fungus. Favoured by warm, humid conditions and poor nutrition.",
        "symptoms": "Concentric ring 'target' spots on older/lower leaves. Yellowing around spots.",
        "prevention": "Remove infected leaves. Apply mulch. Ensure adequate potassium in soil.",
        "pesticide": "Mancozeb 75% WP (Indofil M-45) — 2.5g per litre of water",
        "price": "₹180–₹260 per kg"
    },
    "Late Blight": {
        "emoji": "🖤", "risk": "high",
        "causes": "Phytophthora infestans oomycete. Spreads rapidly in cool, wet weather.",
        "symptoms": "Large dark-green to brown-black patches. White mould on leaf undersides.",
        "prevention": "Avoid evening watering. Destroy infected plants immediately. Use resistant varieties.",
        "pesticide": "Cymoxanil + Mancozeb (Curzate M8) — 3g per litre of water",
        "price": "₹550–₹700 per kg"
    },
    "Leaf Mold": {
        "emoji": "🟡", "risk": "low",
        "causes": "Passalora fulva fungus. Thrives in high humidity (>85%) and poor ventilation.",
        "symptoms": "Pale green/yellow patches on upper leaf surface. Olive-brown fuzzy mould below.",
        "prevention": "Improve greenhouse ventilation. Reduce humidity. Space plants adequately.",
        "pesticide": "Chlorothalonil 75% WP (Kavach) — 2g per litre of water",
        "price": "₹400–₹520 per kg"
    },
    "Septoria Leaf Spot": {
        "emoji": "⚪", "risk": "moderate",
        "causes": "Septoria lycopersici fungus. Spreads via water splash from soil to leaves.",
        "symptoms": "Numerous small circular spots with white/grey centres and dark borders.",
        "prevention": "Mulch soil to prevent splash. Remove lower leaves. Avoid wetting foliage.",
        "pesticide": "Iprodione 50% WP (Rovral) — 2g per litre of water",
        "price": "₹600–₹800 per kg"
    },
    "Spider Mites": {
        "emoji": "🕷️", "risk": "moderate",
        "causes": "Tetranychus urticae mite. Worsens in hot, dry, dusty conditions.",
        "symptoms": "Tiny yellow/bronze stippling on leaves. Fine webbing on undersides.",
        "prevention": "Maintain adequate soil moisture. Avoid dusty conditions. Introduce predatory mites.",
        "pesticide": "Abamectin 1.8% EC (Vertimec) — 1ml per litre of water",
        "price": "₹900–₹1200 per litre"
    },
    "Target Spot": {
        "emoji": "🎯", "risk": "moderate",
        "causes": "Corynespora cassiicola fungus. Spreads in warm humid conditions.",
        "symptoms": "Circular spots with concentric rings on leaves, stems and fruits.",
        "prevention": "Crop rotation. Remove plant debris. Improve air circulation.",
        "pesticide": "Azoxystrobin 23% SC (Amistar) — 1ml per litre of water",
        "price": "₹1800–₹2200 per litre"
    },
    "Tomato Yellow Leaf Curl Virus": {
        "emoji": "🌀", "risk": "high",
        "causes": "TYLCV virus spread by whitefly (Bemisia tabaci). No cure once infected.",
        "symptoms": "Severe leaf curling and yellowing. Stunted growth. Reduced fruit set.",
        "prevention": "Control whiteflies with yellow sticky traps. Use virus-resistant varieties.",
        "pesticide": "Imidacloprid 17.8% SL (Confidor) — 0.5ml per litre for whitefly control",
        "price": "₹700–₹900 per litre"
    },
    "Tomato Mosaic Virus": {
        "emoji": "🧩", "risk": "high",
        "causes": "ToMV virus spread by contact, tools, and infected transplants.",
        "symptoms": "Mottled green-yellow mosaic pattern. Distorted, fern-like leaves.",
        "prevention": "Disinfect tools with bleach. Wash hands before handling. Remove infected plants.",
        "pesticide": "No direct cure. Spray Potassium Silicate — 2g per litre to boost immunity",
        "price": "₹300–₹450 per kg"
    },
    "Healthy": {
        "emoji": "🟢", "risk": "none",
        "causes": "No disease detected. Your plant is healthy!",
        "symptoms": "Deep green, firm leaves with no spots, curling, or discoloration.",
        "prevention": "Continue regular watering, balanced NPK fertilizer, and weekly inspection.",
        "pesticide": "Preventive spray: Neem oil 5ml + 1ml soap per litre of water",
        "price": "₹150–₹200 per litre (Neem oil)"
    }
}

def preprocess(img: Image.Image, size=(224, 224)):
    img = img.convert("RGB").resize(size)
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)

def is_plant_leaf(img: Image.Image) -> bool:
    # --- Step 1: Color analysis ---
    small = img.convert("RGB").resize((100, 100))
    px = np.array(small).astype(float)
    r, g, b = px[:,:,0], px[:,:,1], px[:,:,2]

    green_px  = np.sum((g > r) & (g > b) & (g > 25)) / 10000
    yellow_px = np.sum((r > 100) & (g > 80) & (b < 100)) / 10000
    brown_px  = np.sum((r > 60) & (g > 35) & (b < 55) & (r > g)) / 10000
    color_score = green_px + yellow_px * 0.5 + brown_px * 0.4

    # Hard block: too much blue = UI/screenshot
    blue_px = np.sum((b > r + 25) & (b > g + 15)) / 10000
    if blue_px > 0.40:
        return False

    # Hard block: too gray = document/screenshot
    gray_var = np.mean(np.std(px, axis=2))
    if gray_var < 8:
        return False

    # Strong color match — accept immediately
    if color_score > 0.12:
        return True

    # --- Step 2: MobileNetV2 ImageNet check for borderline images ---
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(
        np.array(img.convert("RGB").resize((224, 224))).astype(float)
    )
    preds = base_model.predict(np.expand_dims(arr, axis=0), verbose=0)[0]
    top10_idx = np.argsort(preds)[-10:]
    plant_conf = sum(float(preds[i]) for i in top10_idx if i in PLANT_CLASSES)

    if plant_conf > 0.05:
        return True

    # Weak color signal — still give benefit of doubt
    return color_score > 0.05

@app.get("/")
def health():
    return {
        "status": "ok",
        "message": "KrishiDrishti AI — 10 Class Tomato Disease Detector 🌿",
        "classes": 10
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image. Please try again.")

    # Check 1: Is it a plant leaf?
    if not is_plant_leaf(img):
        raise HTTPException(
            status_code=422,
            detail="NOT_A_LEAF: Please upload a real tomato leaf photo. Random images are not supported."
        )

    # Check 2: Run disease prediction
    img_array = preprocess(img)
    predictions = model.predict(img_array, verbose=0)[0]
    max_conf = float(np.max(predictions))
    pred_idx = int(np.argmax(predictions))
    disease_name = CLASS_NAMES[pred_idx]

    # Check 3: Confidence threshold
    if max_conf < 0.60:
        raise HTTPException(
            status_code=422,
            detail="LOW_CONFIDENCE: Image not clear enough. Please use a close-up photo of the leaf in good lighting."
        )

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
