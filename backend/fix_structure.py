import os, shutil

BASE = "D:\\KrishiDrishti\\backend\\dataset"

for split in ["train", "test"]:
    split_path = os.path.join(BASE, split)
    if not os.path.exists(split_path):
        print(f"⚠ Skipping {split} — folder not found")
        continue

    for class_name in os.listdir(split_path):
        class_path = os.path.join(split_path, class_name)
        if not os.path.isdir(class_path):
            continue

        for subfolder in os.listdir(class_path):
            subfolder_path = os.path.join(class_path, subfolder)
            if not os.path.isdir(subfolder_path):
                continue

            images = [f for f in os.listdir(subfolder_path)
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

            for img in images:
                src  = os.path.join(subfolder_path, img)
                dest = os.path.join(class_path, img)
                shutil.move(src, dest)

            os.rmdir(subfolder_path)
            print(f"✅ {split}/{class_name} — moved {len(images)} images")

print("\n🌿 Structure fixed! Ready to train.")