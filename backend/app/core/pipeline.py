from collections import defaultdict, Counter, deque
import cv2
from ultralytics import YOLO

_model = None

# YOLO's default COCO weights detect 80 object classes total -- not just vehicles.
# Without this filter, pedestrians, stop signs, traffic lights, etc. get tracked and
# counted right alongside actual vehicles, silently inflating every count.
VEHICLE_CLASSES = {"car", "motorcycle", "bus", "truck", "autorickshaw", "bicycle"}

# Path to the fine-tuned weights, trained on Indian traffic (IDD Detection subset).
# Falls back to stock YOLOv8s weights if the fine-tuned file isn't present yet.
# Use yolov8s (small) as fallback -- better accuracy baseline than nano.
FINETUNED_WEIGHTS = "models/indian_vehicles.pt"
FALLBACK_WEIGHTS = "yolov8s.pt"



def get_model():
    global _model
    if _model is None:
        import os
        if os.path.exists(FINETUNED_WEIGHTS):
            _model = YOLO(FINETUNED_WEIGHTS)
        else:
            print(f"WARNING: fine-tuned weights not found at '{FINETUNED_WEIGHTS}', "
                  f"falling back to stock '{FALLBACK_WEIGHTS}'.")
            _model = YOLO(FALLBACK_WEIGHTS)
    return _model


def run_pipeline(
    video_path,
    line_y_ratio: float = 0.65,
    min_frames_before_count: int = 2,
    smoothing_window_seconds: float = 2,
    light_threshold: float = 5,
    moderate_threshold: float = 12,
    confidence: float = 0.15,
    device: int = 0,
):
    """
    Runs detection + tracking + line-crossing counting + density estimation on a video,
    yielding one analytics dict per processed frame.

    confidence: YOLO's detection confidence threshold (0.0-1.0). Lower values detect more
    objects (higher recall) at the cost of more false positives; higher values are stricter.
    Default is 0.15 (lower than Ultralytics' 0.25 default) to improve recall on partially
    occluded or distant vehicles. The min_frames_before_count guard absorbs the extra noise.
    """
    model = get_model()

    cap = cv2.VideoCapture(video_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    cap.release()

    line_y = int(height * line_y_ratio)
    smoothing_window_frames = max(1, int(fps * smoothing_window_seconds))

    track_class_votes = defaultdict(list)
    track_frame_count = defaultdict(int)
    track_first_side = {}
    prev_side = {}
    already_counted = set()
    counts_by_class = Counter()
    total_count = 0
    active_count_history = deque(maxlen=smoothing_window_frames)

    def classify_density(avg_active_count):
        if avg_active_count <= light_threshold:
            return "Light"
        elif avg_active_count <= moderate_threshold:
            return "Moderate"
        else:
            return "Heavy"

    results_stream = model.track(
        source=video_path,
        tracker="bytetrack.yaml",
        device=device,
        persist=True,
        stream=True,
        conf=confidence,
    )

    frame_index = 0
    for frame_result in results_stream:
        frame_index += 1
        active_this_frame = 0

        if frame_result.boxes.id is not None:
            for box, track_id in zip(frame_result.boxes, frame_result.boxes.id):
                cls_name = model.names[int(box.cls)]
                if cls_name not in VEHICLE_CLASSES:
                    continue  # skip pedestrians, stop signs, and everything else non-vehicle

                active_this_frame += 1
                tid = int(track_id)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cy = (y1 + y2) / 2

                track_class_votes[tid].append(cls_name)
                track_frame_count[tid] += 1
                current_side = "above" if cy < line_y else "below"

                if tid not in track_first_side:
                    track_first_side[tid] = current_side

                # Crossed if it flipped from previous frame OR is on the opposite side from where first detected
                crossed = (
                    (tid in prev_side and prev_side[tid] != current_side)
                    or (current_side != track_first_side[tid])
                )
                stable_enough = track_frame_count[tid] >= min_frames_before_count

                if crossed and stable_enough and tid not in already_counted:
                    majority_class, _ = Counter(track_class_votes[tid]).most_common(1)[0]
                    counts_by_class[majority_class] += 1
                    total_count += 1
                    already_counted.add(tid)

                prev_side[tid] = current_side

        active_count_history.append(active_this_frame)
        avg_active = sum(active_count_history) / len(active_count_history)
        density_level = classify_density(avg_active)

        yield {
            "frame_index": frame_index,
            "active_vehicles": active_this_frame,
            "avg_active_vehicles": round(avg_active, 2),
            "density_level": density_level,
            "total_crossed": total_count,
            "counts_by_class": dict(counts_by_class),
        }