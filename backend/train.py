import os
import shutil
from ultralytics import YOLO

# ---------------------------------------------------------------------------
# Model choice: YOLOv8s (small) instead of YOLOv8n (nano).
# "small" has ~11M params vs. nano's ~3M, giving a meaningful accuracy boost
# (~10 mAP points) with only modest extra compute on an RTX 3050.
# Ultralytics will auto-download yolov8s.pt on first run if not present.
# ---------------------------------------------------------------------------
BASE_WEIGHTS = "yolov8s.pt"
RUN_NAME     = "idd_vehicle_finetune_v2"
OUTPUT_WEIGHTS = "models/indian_vehicles.pt"   # where pipeline.py looks for the model


def main():
    # Start from COCO-pretrained weights for transfer learning.
    model = YOLO(BASE_WEIGHTS)

    results = model.train(
        data="training_data/yolo_dataset/data.yaml",
        epochs=100,         # was 50 -- mAP was still rising at epoch 50, needs more room
        imgsz=640,
        batch=8,            # fits in 4 GB VRAM; lower to 4 if you hit OOM, or use batch=-1
                            # to let Ultralytics auto-pick the largest safe batch size
        device=0,           # GPU 0 (RTX 3050)
        patience=20,        # was 10 -- give the model more room before early-stopping
        workers=2,          # keeps RAM/CPU pressure low alongside GPU load
        project="runs/detect",
        name=RUN_NAME,
        amp=True,           # automatic mixed precision -- reduces VRAM usage significantly
    )

    best_weights = os.path.join("runs", "detect", RUN_NAME, "weights", "best.pt")
    print(f"\nTraining complete. Best weights at: {best_weights}")

    # Run validation to get real mAP numbers on the held-out val split
    metrics = model.val()
    print(f"\nValidation mAP50-95: {metrics.box.map:.3f}")
    print(f"Validation mAP50:    {metrics.box.map50:.3f}")

    # Auto-deploy: copy best.pt → models/indian_vehicles.pt so the backend
    # picks it up immediately without any manual file-copying step.
    os.makedirs("models", exist_ok=True)
    shutil.copy(best_weights, OUTPUT_WEIGHTS)
    print(f"\n✅ Best weights deployed to: {OUTPUT_WEIGHTS}")
    print("Restart the backend (uvicorn) to start using the new model.")


if __name__ == "__main__":
    main()
