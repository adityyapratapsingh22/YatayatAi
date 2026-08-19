from ultralytics import YOLO

model = YOLO("yolov8n.pt")

results = model.predict(
    source="https://ultralytics.com/images/bus.jpg",
    save=True,
    device=0,  # forces GPU (device 0 = your RTX 3050)
)

first_frame = results[0]
print(f"Detected {len(first_frame.boxes)} objects")
for box in first_frame.boxes:
    cls_name = model.names[int(box.cls)]
    conf = float(box.conf)
    print(f"  {cls_name}: {conf:.2f}")

print("Saved annotated output to the 'runs/detect/predict' folder.")