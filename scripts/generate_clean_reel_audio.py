import asyncio
import edge_tts
import os
import subprocess

# Professional, natural, confident male English voice
VOICE = "en-IN-PrabhatNeural"
ALT_VOICE = "en-US-BrianNeural"

SEGMENTS = [
    {
        "id": "reel_clean_scene1",
        "text": "Every day, millions of people breathe polluted air. But how much do we really know about the air surrounding us?",
        "start": 0.0,
        "end": 7.0,
        "rate": "+4%"
    },
    {
        "id": "reel_clean_scene2",
        "text": "Introducing BreatheSmart AI, an intelligent clean-air navigator designed to make understanding air quality simpler and smarter.",
        "start": 7.0,
        "end": 15.0,
        "rate": "+5%"
    },
    {
        "id": "reel_clean_scene3",
        "text": "Explore air quality information, monitor important pollutants like PM2.5 and PM10, and understand environmental conditions through one intelligent dashboard.",
        "start": 15.0,
        "end": 27.0,
        "rate": "+4%"
    },
    {
        "id": "reel_clean_scene4",
        "text": "Plan smarter daily routines, explore indoor air quality through interactive simulations, and discover practical approaches to improving your indoor environment.",
        "start": 27.0,
        "end": 40.0,
        "rate": "+4%"
    },
    {
        "id": "reel_clean_scene5",
        "text": "With its integrated AI assistant and community experience, BreatheSmart AI makes environmental awareness more accessible and interactive.",
        "start": 40.0,
        "end": 52.0,
        "rate": "+4%"
    },
    {
        "id": "reel_clean_scene6",
        "text": "Understand the air. Make smarter choices. Protect your health. This is BreatheSmart AI.",
        "start": 52.0,
        "end": 60.0,
        "rate": "+4%"
    }
]

FFMPEG = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"

async def generate():
    out_dir = os.path.join(os.path.dirname(__file__), "reel_audio_clean")
    os.makedirs(out_dir, exist_ok=True)
    
    for seg in SEGMENTS:
        mp3_path = os.path.join(out_dir, f"{seg['id']}.mp3")
        success = False
        
        for voice_choice in [VOICE, ALT_VOICE]:
            for attempt in range(3):
                try:
                    comm = edge_tts.Communicate(seg["text"], voice_choice, rate=seg["rate"])
                    await comm.save(mp3_path)
                    success = True
                    break
                except Exception as e:
                    print(f"[{seg['id']}] Voice {voice_choice} attempt {attempt+1} failed: {e}")
                    await asyncio.sleep(1.0)
            if success:
                break
                
        if not success:
            raise RuntimeError(f"Failed to generate {seg['id']}")

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
