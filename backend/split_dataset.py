import os, shutil, random

BASE = "D:\\KrishiDrishti\\backend\\dataset"
TRAIN_RATIO = 0.8

classes = [
    "bacterial_spot", "early_blight", "healthy", "late_blight",
    "leaf_mold", "mosaic_virus", "septoria_leaf_spot",
    "spider_mites", "target_spot", "yellow_leaf_curl"
]

for class_name in classes:
    test_path  = os.path.join(BASE, "test",  class_name)
    train_path = os.path.join(BASE, "train", class_name)

    images = [f for f in os.listdir(test_path)
              if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

    random.shuffle(images)
    split = int(len(images) * TRAIN_RATIO)

    train_imgs = images[:split]
    test_imgs  = images[split:]

    # Move 80% to train
    for img in train_imgs:
        shutil.move(
            os.path.join(test_path, img),
            os.path.join(train_path, img)
        )

    print(f"✅ {class_name:<25} → train: {len(train_imgs):>4}  |  test: {len(test_imgs):>4}")

print("\n🌿 Dataset split complete! Ready to train.")