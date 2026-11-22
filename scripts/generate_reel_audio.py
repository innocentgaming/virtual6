import asyncio
import edge_tts
import os
import subprocess

VOICE = "en-IN-PrabhatNeural"

SEGMENTS = [
    {
        "id": "reel_scene1",
        "text": "What if one platform could help you understand the air you breathe?",
        "start": 0.0,
        "end": 5.0,
        "rate": "+5%"
    },
    {
        "id": "reel_scene2",
        "text": "Explore air quality readings and understand important pollution indicators through one intelligent dashboard.",
        "start": 5.0,
        "end": 15.0,
        "rate": "+4%"
    },
    {
        "id": "reel_scene3",
        "text": "Make better daily decisions with an air-quality-aware routine planning experience.",
        "start": 15.0,
        "end": 25.0,
        "rate": "+4%"
    },
    {
        "id": "reel_scene4",
        "text": "Explore indoor air quality with an interactive simulator.",
        "start": 25.0,
        "end": 35.0,
        "rate": "+3%"
    },
    {
        "id": "reel_scene5",
        "text": "Ask questions and get conversational assistance from the integrated AI assistant.",
        "start": 35.0,
        "end": 45.0,
        "rate": "+4%"
    },
    {
        "id": "reel_scene6",
        "text": "Discover practical clean-air guidance and connect with a community focused on awareness.",
        "start": 45.0,
        "end": 53.0,
        "rate": "+5%"
    },
    {
        "id": "reel_scene7",
        "text": "One platform. Smarter air awareness. This is BreatheSmart AI. Explore it today!",
        "start": 53.0,
        "end": 60.0,
        "rate": "+35%"
    }
]

FFMPEG = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"

async def generate():
    out_dir = os.path.join(os.path.dirname(__file__), "reel_audio")
    os.makedirs(out_dir, exist_ok=True)
    
    for seg in SEGMENTS:
        mp3_path = os.path.join(out_dir, f"{seg['id']}.mp3")
        comm = edge_tts.Communicate(seg["text"], VOICE, rate=seg["rate"])
        await comm.save(mp3_path)
        
        # probe duration
        res = subprocess.run([
            FFMPEG, "-i", mp3_path, "-hide_banner"
        ], stderr=subprocess.PIPE, text=True)
        for line in res.stderr.split("\n"):
            if "Duration:" in line:
                dur = line.split("Duration:")[1].split(",")[0].strip()
                print(f"[{seg['id']}] Target: {seg['start']}s -> {seg['end']}s ({seg['end']-seg['start']}s) | Actual: {dur}")

if __name__ == "__main__":
    asyncio.run(generate())
