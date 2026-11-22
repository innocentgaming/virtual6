import asyncio
import edge_tts
import os
import subprocess

VOICE = "en-US-BrianNeural"

SEGMENTS = [
    {
        "id": "reel_scene1",
        "text": "Every breath matters. But do you really know what you're breathing?",
        "start": 0.0,
        "end": 7.0,
        "rate": "+4%"
    },
    {
        "id": "reel_scene2",
        "text": "Introducing BreatheSmart AI, an intelligent platform designed to help you understand the air around you.",
        "start": 7.0,
        "end": 15.0,
        "rate": "+5%"
    },
    {
        "id": "reel_scene3",
        "text": "Explore air quality readings, monitor important pollutants, and understand environmental conditions through one powerful dashboard.",
        "start": 15.0,
        "end": 27.0,
        "rate": "+4%"
    },
    {
        "id": "reel_scene4",
        "text": "Plan smarter daily routines, explore indoor air quality, and discover practical clean-air solutions.",
        "start": 27.0,
        "end": 39.0,
        "rate": "+4%"
    },
    {
        "id": "reel_scene5",
        "text": "Get conversational AI assistance and explore a community built around clean-air awareness.",
        "start": 39.0,
        "end": 51.0,
        "rate": "+4%"
    },
    {
        "id": "reel_scene6",
        "text": "Understand the air. Make smarter choices. Protect your health. This is BreatheSmart AI.",
        "start": 51.0,
        "end": 60.0,
        "rate": "+4%"
    }
]

FFMPEG = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"

async def generate():
    out_dir = os.path.join(os.path.dirname(__file__), "reel_audio")
    os.makedirs(out_dir, exist_ok=True)
    
    for seg in SEGMENTS:
        mp3_path = os.path.join(out_dir, f"{seg['id']}.mp3")
        success = False
        for attempt in range(5):
            try:
                comm = edge_tts.Communicate(seg["text"], VOICE, rate=seg["rate"])
                await comm.save(mp3_path)
                success = True
                break
            except Exception as e:
                print(f"[{seg['id']}] Attempt {attempt+1} failed: {e}. Retrying in 1s...")
                await asyncio.sleep(1.0)
        
        if not success:
            raise RuntimeError(f"Failed to generate {seg['id']}")

        # probe duration
        res = subprocess.run([
            FFMPEG, "-i", mp3_path, "-hide_banner"
        ], stderr=subprocess.PIPE, text=True)
        for line in res.stderr.split("\n"):
            if "Duration:" in line:
                dur = line.split("Duration:")[1].split(",")[0].strip()
                print(f"[{seg['id']}] Target: {seg['start']}s -> {seg['end']}s ({seg['end']-seg['start']}s) | Actual: {dur}")
        await asyncio.sleep(0.3)

if __name__ == "__main__":
    asyncio.run(generate())
