from collections import defaultdict, Counter, deque
import os
import cv2
from ultralytics import YOLO

SOURCE_VIDEO = "traffic_sample.mp4"
OUTPUT_VIDEO = "runs/density/density_output.mp4"
LINE_Y_RATIO = 0.65
MIN_FRAMES_BEFORE_COUNT = 5

# --- Phase 5 additions ---
SMOOTHING_WINDOW_SECONDS = 2   # average active-vehicle count over this many seconds
LIGHT_THRESHOLD = 5            # 0-5 active vehicles  -> light
MODERATE_THRESHOLD = 12        # 6-12 active vehicles -> moderate, 13+ -> heavy
# These thresholds are placeholders -- tune them once you see real numbers from your footage.

DENSITY_COLORS = {
    "Light": (0, 200, 0),
    "Moderate": (0, 165, 255),
    "Heavy": (0, 0, 255),
}

# Only count actual vehicle classes -- the same set used by pipeline.py.
# Without this filter, pedestrians, signs, etc. inflate the active-vehicle
# count and produce incorrect density readings.
VEHICLE_CLASSES = {"car", "motorcycle", "bus", "truck", "autorickshaw"}

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(SOURCE_VIDEO)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS) or 25
cap.release()

line_y = int(height * LINE_Y_RATIO)
smoothing_window_frames = max(1, int(fps * SMOOTHING_WINDOW_SECONDS))

os.makedirs("runs/density", exist_ok=True)
writer = cv2.VideoWriter(
    OUTPUT_VIDEO, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height)
)

# Counting state (same as Phase 4)
track_class_votes = defaultdict(list)
track_frame_count = defaultdict(int)
prev_side = {}
already_counted = set()
counts_by_class = Counter()
total_count = 0

# --- Phase 5 additions ---
active_count_history = deque(maxlen=smoothing_window_frames)


def classify_density(avg_active_count):
    if avg_active_count <= LIGHT_THRESHOLD:
        return "Light"
    elif avg_active_count <= MODERATE_THRESHOLD:
        return "Moderate"
    else:
        return "Heavy"


results_stream = model.track(
    source=SOURCE_VIDEO, tracker="bytetrack.yaml", device=0, persist=True, stream=True,
)

for frame_result in results_stream:
    frame = frame_result.orig_img.copy()

    active_this_frame = 0

    if frame_result.boxes.id is not None:
        for box, track_id in zip(frame_result.boxes, frame_result.boxes.id):

            cls_name = model.names[int(box.cls)]
            if cls_name not in VEHICLE_CLASSES:
                continue  # skip pedestrians, signs, etc. -- same filter as pipeline.py

            active_this_frame += 1
            tid = int(track_id)
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            cy = (y1 + y2) / 2

            track_class_votes[tid].append(cls_name)
            track_frame_count[tid] += 1
            current_side = "above" if cy < line_y else "below"

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


    # --- Phase 5: update rolling average and classify density ---
    active_count_history.append(active_this_frame)
    avg_active = sum(active_count_history) / len(active_count_history)
    density_level = classify_density(avg_active)
    density_color = DENSITY_COLORS[density_level]

    # Draw counting line + totals (Phase 4 overlay)
    cv2.line(frame, (0, line_y), (width, line_y), (0, 255, 255), 2)
    cv2.putText(frame, f"Total crossed: {total_count}", (20, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    # Draw density overlay (Phase 5 addition)
    cv2.putText(frame, f"Active vehicles (avg): {avg_active:.1f}", (20, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, density_color, 2)
    cv2.putText(frame, f"Density: {density_level}", (20, 90),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, density_color, 2)

    writer.write(frame)

writer.release()

print("\nFinal crossing counts:")
for cls_name, cnt in counts_by_class.most_common():
    print(f"  {cls_name}: {cnt}")
print(f"Total crossed: {total_count}")
print(f"\nFinal density reading: {density_level} (avg {avg_active:.1f} active vehicles)")
print(f"Annotated output saved to: {OUTPUT_VIDEO}")
