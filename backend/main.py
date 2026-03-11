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

def is_leaf_image(img: Image.Image) -> bool:
    img_rgb = img.convert("RGB").resize((150, 150))
    pixels = np.array(img_rgb)
    r = pixels[:,:,0].astype(float)
    g = pixels[:,:,1].astype(float)
    b = pixels[:,:,2].astype(float)

    # Must have enough green pixels (real leaf color)
    green_mask = (g > r + 10) & (g > b + 10) & (g > 50)
    green_ratio = np.sum(green_mask) / (150 * 150)

    # Diseased leaf: yellowish-brown tones
    yellow_mask = (r > 120) & (g > 100) & (b < 80) & (g > b + 20)
    yellow_ratio = np.sum(yellow_mask) / (150 * 150)

    # Brown/dark-green diseased areas
    brown_mask = (r > 80) & (g > 60) & (b < 60) & (r > b + 20)
    brown_ratio = np.sum(brown_mask) / (150 * 150)

    # Reject if image is mostly dark (screenshots, black backgrounds)
    brightness = (r + g + b) / 3
    dark_ratio = np.sum(brightness < 40) / (150 * 150)
    if dark_ratio > 0.5:
        return False

    # Reject if image is mostly artificial colors (blue, purple, white UI)
    blue_dominant = (b > r + 20) & (b > g + 10)
    blue_ratio = np.sum(blue_dominant) / (150 * 150)
    if blue_ratio > 0.25:
        return False

    # Reject grayscale-like images (screenshots, documents)
    color_variance = np.mean(np.std(pixels, axis=2))
    if color_variance < 15:
        return False

    leaf_score = green_ratio + (yellow_ratio * 0.6) + (brown_ratio * 0.4)
    return leaf_score > 0.15

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

    # Check 1: Is it a leaf?
    if not is_leaf_image(img):
        raise HTTPException(status_code=422, detail="NOT_A_LEAF: Please upload a real tomato leaf photo.")

    # Preprocess
    img_array = np.expand_dims(np.array(img.resize((224, 224))) / 255.0, axis=0)
    predictions = model.predict(img_array)[0]
    max_conf = float(np.max(predictions))
    pred_idx = int(np.argmax(predictions))

    # Check 2: Is confidence high enough?
    if max_conf < 0.75:
        raise HTTPException(status_code=422, detail="LOW_CONFIDENCE: Image not clear enough. Use a close-up leaf photo.")

    return {
        "class": CLASS_NAMES[pred_idx],
        "confidence": round(max_conf * 100, 2),
        "all_predictions": {CLASS_NAMES[i]: round(float(predictions[i]) * 100, 2) for i in range(len(CLASS_NAMES))}
    }