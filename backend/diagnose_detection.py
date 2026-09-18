"""
Diagnostic script: runs the fine-tuned model on a video and saves an annotated
output video with bounding boxes, track IDs, and the counting line drawn in --
so we can SEE exactly what's being detected vs. what's actually crossing the line.

Run from inside backend/.
"""
import cv2
from ultralytics import YOLO

VIDEO_PATH = "traffic_sample.mp4"  # known flowing-traffic highway clip from earlier testing
MODEL_PATH = "models/indian_vehicles.pt"
OUTPUT_PATH = "runs/diagnostic_output.mp4"
LINE_Y_RATIO = 0.65

VEHICLE_CLASSES = {"car", "motorcycle", "bus", "truck", "bicycle", "autorickshaw"}

model = YOLO(MODEL_PATH)

cap = cv2.VideoCapture(VIDEO_PATH)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS) or 25
cap.release()

line_y = int(height * LINE_Y_RATIO)

import os
os.makedirs("runs", exist_ok=True)
writer = cv2.VideoWriter(OUTPUT_PATH, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

detection_counts = {}  # class -> how many times it was ever detected across all frames

results_stream = model.track(
    source=VIDEO_PATH, tracker="bytetrack.yaml", device=0, persist=True, stream=True, conf=0.25,
)

for frame_result in results_stream:
    frame = frame_result.orig_img.copy()
    cv2.line(frame, (0, line_y), (width, line_y), (0, 255, 255), 2)

    if frame_result.boxes.id is not None:
        for box, track_id in zip(frame_result.boxes, frame_result.boxes.id):
            cls_name = model.names[int(box.cls)]
            conf = float(box.conf)
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            # Draw EVERY detection, vehicle or not, so we can see what the model
            # is actually seeing -- including low-confidence or filtered-out classes.
            color = (0, 255, 0) if cls_name in VEHICLE_CLASSES else (0, 0, 255)
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            cv2.putText(frame, f"{cls_name} {conf:.2f} ID{int(track_id)}", (int(x1), int(y1) - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            detection_counts[cls_name] = detection_counts.get(cls_name, 0) + 1

    writer.write(frame)

writer.release()

print("\nAll classes detected at least once, and how many total detections across all frames:")
for cls_name, count in sorted(detection_counts.items(), key=lambda x: -x[1]):
    tag = "(VEHICLE)" if cls_name in VEHICLE_CLASSES else "(filtered out)"
    print(f"  {cls_name}: {count} {tag}")

print(f"\nAnnotated video saved to: {OUTPUT_PATH}")
print("Green boxes = counted vehicle classes. Red boxes = detected but filtered out (non-vehicle).")