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

# Load model once at startup
model = tf.keras.models.load_model("krishidrishti_model.keras")

CLASS_NAMES = [
    "Bacterial Spot",
    "Early Blight", 
    "Late Blight",
    "Leaf Mold",
    "Septoria Leaf Spot",
    "Spider Mites",
    "Target Spot",
    "Tomato Yellow Leaf Curl Virus",
    "Tomato Mosaic Virus",
    "Healthy"
]

def is_leaf_image(img: Image.Image) -> bool:
    """Check if image contains a leaf based on green color analysis"""
    img_rgb = img.convert("RGB").resize((100, 100))
    pixels = np.array(img_rgb)
    
    r, g, b = pixels[:,:,0], pixels[:,:,1], pixels[:,:,2]
    
    # Green dominant pixels (leaf-like)
    green_mask = (g > r) & (g > b) & (g > 40)
    green_ratio = np.sum(green_mask) / (100 * 100)
    
    # Yellow/brown pixels (diseased leaf)
    yellow_mask = (r > 100) & (g > 80) & (b < 100) & (np.abs(r.astype(int) - g.astype(int)) < 80)
    yellow_ratio = np.sum(yellow_mask) / (100 * 100)
    
    # Accept if enough green or yellow-brown (diseased) pixels
    leaf_ratio = green_ratio + (yellow_ratio * 0.5)
    return leaf_ratio > 0.10  # at least 10% leaf-like pixels

@app.get("/")
def health():
    return {
        "status": "ok",
        "message": "KrishiDrishti AI — 10 Class Tomato Disease Detector 🌿",
        "classes": 10
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")
    
    contents = await file.read()
    
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image. Please try again.")
    
    # ✅ CHECK 1: Is it a leaf?
    if not is_leaf_image(img):
        raise HTTPException(
            status_code=422,
            detail="NOT_A_LEAF: Please upload a clear photo of a tomato leaf."
        )
    
    # Preprocess for model
    img_resized = img.resize((224, 224))
    img_array = np.array(img_resized) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Run prediction
    predictions = model.predict(img_array)[0]
    max_confidence = float(np.max(predictions))
    predicted_index = int(np.argmax(predictions))
    
    # ✅ CHECK 2: Is confidence high enough?
    if max_confidence < 0.65:
        raise HTTPException(
            status_code=422,
            detail="LOW_CONFIDENCE: Image not clear enough. Please upload a close-up photo of a tomato leaf."
        )
    
    return {
        "class": CLASS_NAMES[predicted_index],
        "confidence": round(max_confidence * 100, 2),
        "all_predictions": {
            CLASS_NAMES[i]: round(float(predictions[i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }
    }