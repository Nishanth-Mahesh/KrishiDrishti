import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import matplotlib.pyplot as plt

IMG_SIZE  = (224, 224)
BATCH     = 32
NUM_CLASS = 10

# ── Data Generators ───────────────────────────────────────────────
train_gen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    zoom_range=0.25,
    horizontal_flip=True,
    shear_range=0.2,
    brightness_range=[0.75, 1.25],
    width_shift_range=0.1,
    height_shift_range=0.1,
    fill_mode='nearest'
)
val_gen = ImageDataGenerator(rescale=1./255)

train_data = train_gen.flow_from_directory(
    'dataset/train',
    target_size=IMG_SIZE,
    batch_size=BATCH,
    class_mode='categorical'
)
val_data = val_gen.flow_from_directory(
    'dataset/test',
    target_size=IMG_SIZE,
    batch_size=BATCH,
    class_mode='categorical'
)

print("\n📌 Class indices (SAVE THIS OUTPUT!):")
print(train_data.class_indices)

# ── Build Model ───────────────────────────────────────────────────
base = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)
base.trainable = False

model = models.Sequential([
    base,
    layers.GlobalAveragePooling2D(),
    layers.Dense(512, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASS, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# ── Phase 1: Train Head ───────────────────────────────────────────
print("\n🌿 Phase 1 — Training classifier head...")
h1 = model.fit(
    train_data,
    validation_data=val_data,
    epochs=12,
    callbacks=[
        EarlyStopping(monitor='val_accuracy', patience=4, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, verbose=1)
    ]
)

# ── Phase 2: Fine-tune ────────────────────────────────────────────
print("\n🔧 Phase 2 — Fine-tuning top layers...")
base.trainable = True
for layer in base.layers[:-40]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

h2 = model.fit(
    train_data,
    validation_data=val_data,
    epochs=15,
    callbacks=[
        EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True),
        ModelCheckpoint(
            'krishidrishti_model.keras',
            save_best_only=True,
            monitor='val_accuracy',
            verbose=1
        ),
        ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=3, verbose=1)
    ]
)

# ── Save & Plot ───────────────────────────────────────────────────
model.save('krishidrishti_model.keras')
print("\n✅ Model saved → krishidrishti_model.keras")

acc   = h1.history['accuracy']     + h2.history['accuracy']
val   = h1.history['val_accuracy'] + h2.history['val_accuracy']
loss  = h1.history['loss']         + h2.history['loss']
vloss = h1.history['val_loss']     + h2.history['val_loss']
cut   = len(h1.history['accuracy'])

plt.figure(figsize=(12, 5))
for i, (y1, y2, title) in enumerate([
    (acc, val, 'Accuracy'),
    (loss, vloss, 'Loss')
]):
    plt.subplot(1, 2, i+1)
    plt.plot(y1, label='Train')
    plt.plot(y2, label='Validation')
    plt.axvline(x=cut-1, color='gray', linestyle='--', label='Fine-tune start')
    plt.title(title)
    plt.legend()
    plt.xlabel('Epoch')

plt.tight_layout()
plt.savefig('training_results.png')
print("📊 Graph saved → training_results.png")

best_val = max(val)
print(f"\n🎯 Best Validation Accuracy: {best_val*100:.2f}%")
print("\n📌 Final Class indices:")
print(train_data.class_indices)