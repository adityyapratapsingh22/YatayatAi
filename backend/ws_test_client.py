import asyncio
import json
import websockets

VIDEO_ID = "traffic_sample.mp4"  # must match the filename you upload in step 2 below
WS_URL = f"ws://localhost:8000/ws/analytics/{VIDEO_ID}"


async def listen():
    async with websockets.connect(WS_URL) as ws:
        print(f"Connected to {WS_URL}\n")
        async for message in ws:
            data = json.loads(message)
            if "error" in data:
                print("Error:", data["error"])
                break
            print(
                f"frame {data['frame_index']:>4} | "
                f"active: {data['active_vehicles']:>2} | "
                f"avg: {data['avg_active_vehicles']:>5} | "
                f"density: {data['density_level']:<8} | "
                f"total crossed: {data['total_crossed']:>2} | "
                f"{data['counts_by_class']}"
            )


if __name__ == "__main__":
    asyncio.run(listen())
