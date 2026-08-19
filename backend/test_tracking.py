from collections import defaultdict, Counter
from ultralytics import YOLO

model = YOLO("yolov8n.pt")

results = model.track(
    source="traffic_sample.mp4",
    tracker="bytetrack.yaml",
    save=True,
    device=0,
    persist=True,
)


id_class_votes = defaultdict(list)

for frame_result in results:
    if frame_result.boxes.id is None:
        continue
    for box, track_id in zip(frame_result.boxes, frame_result.boxes.id):
        cls_name = model.names[int(box.cls)]
        tid = int(track_id)
        id_class_votes[tid].append(cls_name)


MIN_FRAMES = 15

final_class_of_id = {}
for tid, votes in id_class_votes.items():
    if len(votes) < MIN_FRAMES:
        continue  # drop short-lived / noisy tracks
    most_common_class, _ = Counter(votes).most_common(1)[0]
    final_class_of_id[tid] = most_common_class


counts_by_class = Counter(final_class_of_id.values())

dropped = len(id_class_votes) - len(final_class_of_id)
print(f"\nDropped {dropped} short-lived track(s) with fewer than {MIN_FRAMES} frames.")

print("\nUnique vehicles tracked (majority-vote class per ID, filtered):")
for cls_name, count in counts_by_class.most_common():
    print(f"  {cls_name}: {count}")
print(f"\nTotal unique tracked objects: {len(final_class_of_id)}")

# Flag IDs whose classification flickered a lot -- useful to see how noisy tracking is
# Only look at tracks that survived the MIN_FRAMES filter; dropped ones are noted separately.
print("\nIDs with inconsistent classification (for reference):")
for tid, votes in id_class_votes.items():
    if tid not in final_class_of_id:
        continue  # filtered out as too short-lived
    unique_votes = set(votes)
    if len(unique_votes) > 1:
        print(f"  Track {tid}: saw as {dict(Counter(votes))} -> resolved to '{final_class_of_id[tid]}'")

print("\nAnnotated video with track IDs saved to 'runs/detect/track'.")