from collections import defaultdict, Counter, deque
import cv2
from ultralytics import YOLO

_model = None


def get_model():
    global _model
    if _model is None:
        _model = YOLO("yolov8n.pt")
    return _model


def run_pipeline(
    video_path,
    line_y_ratio: float = 0.65,
    min_frames_before_count: int = 5,
    smoothing_window_seconds: float = 2,
    light_threshold: float = 5,
    moderate_threshold: float = 12,
    confidence: float = 0.25,
    device: int = 0,
):
    """
    Runs detection + tracking + line-crossing counting + density estimation on a video,
    yielding one analytics dict per processed frame.

    confidence: YOLO's detection confidence threshold (0.0-1.0). Lower values detect more
    objects (higher recall) at the cost of more false positives; higher values are stricter.
    Ultralytics' default is 0.25.
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
            active_this_frame = len(frame_result.boxes.id)
            for box, track_id in zip(frame_result.boxes, frame_result.boxes.id):
                tid = int(track_id)
                cls_name = model.names[int(box.cls)]
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cy = (y1 + y2) / 2

                track_class_votes[tid].append(cls_name)
                track_frame_count[tid] += 1
                current_side = "above" if cy < line_y else "below"

                if tid in prev_side:
                    crossed = prev_side[tid] != current_side
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
