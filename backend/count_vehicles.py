from collections import defaultdict, Counter
import cv2
from ultralytics import YOLO

SOURCE_VIDEO = "traffic_sample.mp4"
OUTPUT_VIDEO = "runs/count/counted_output.mp4"
LINE_Y_RATIO = 0.65        # counting line at 65% down the frame -- adjust after first look
MIN_FRAMES_BEFORE_COUNT = 5  # a track must exist this many frames before it's allowed to count

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(SOURCE_VIDEO)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS) or 25
cap.release()

line_y = int(height * LINE_Y_RATIO)

import os
os.makedirs("runs/count", exist_ok=True)
writer = cv2.VideoWriter(
    OUTPUT_VIDEO, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height)
)

# Per-track state
track_class_votes = defaultdict(list)   # tid -> list of class names seen so far
track_frame_count = defaultdict(int)    # tid -> how many frames this track has existed
prev_side = {}                          # tid -> 'above' or 'below' the line, last frame
already_counted = set()                 # tid -> counted once, never count again

counts_by_class = Counter()
total_count = 0

# stream=True gives a frame-by-frame generator instead of loading everything into memory
results_stream = model.track(
    source=SOURCE_VIDEO,
    tracker="bytetrack.yaml",
    device=0,
    persist=True,
    stream=True,
)

for frame_result in results_stream:
    frame = frame_result.orig_img.copy()

    # Draw the counting line and running totals every frame
    cv2.line(frame, (0, line_y), (width, line_y), (0, 255, 255), 2)
    y_offset = 30
    cv2.putText(frame, f"Total: {total_count}", (20, y_offset),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    for i, (cls_name, cnt) in enumerate(counts_by_class.most_common(), start=1):
        cv2.putText(frame, f"{cls_name}: {cnt}", (20, y_offset + i * 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

    if frame_result.boxes.id is not None:
        for box, track_id in zip(frame_result.boxes, frame_result.boxes.id):
            tid = int(track_id)
            cls_name = model.names[int(box.cls)]
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            cy = (y1 + y2) / 2  # vertical center of the box

            track_class_votes[tid].append(cls_name)
            track_frame_count[tid] += 1

            current_side = "above" if cy < line_y else "below"

            # Draw box + ID for visual verification
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (255, 100, 0), 2)
            cv2.putText(frame, f"ID {tid}", (int(x1), int(y1) - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 100, 0), 2)

            if tid in prev_side:
                crossed = prev_side[tid] != current_side
                stable_enough = track_frame_count[tid] >= MIN_FRAMES_BEFORE_COUNT
                if crossed and stable_enough and tid not in already_counted:
                    majority_class, _ = Counter(track_class_votes[tid]).most_common(1)[0]
                    counts_by_class[majority_class] += 1
                    total_count += 1
                    already_counted.add(tid)

            prev_side[tid] = current_side

    writer.write(frame)

writer.release()

print("\nFinal counts (vehicles that crossed the line):")
for cls_name, cnt in counts_by_class.most_common():
    print(f"  {cls_name}: {cnt}")
print(f"\nTotal crossed: {total_count}")
print(f"Annotated output saved to: {OUTPUT_VIDEO}")
