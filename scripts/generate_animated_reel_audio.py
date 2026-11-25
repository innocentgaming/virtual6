import asyncio
import edge_tts
import os
import subprocess

OUTPUT_DIR = os.path.abspath("scripts/reel_audio_animated")
os.makedirs(OUTPUT_DIR, exist_ok=True)

FFPROBE = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffprobe.exe"

SEGMENTS = [
    ("anim_scene1", "Pollution is invisible, until you measure it. Meet BreatheSmart AI."),
    ("anim_scene2", "Track hyper-local AQI, PM2.5, PM10, and thermal inversion alerts in real time through one intelligent dashboard."),
    ("anim_scene3", "Plan exposure-safe daily routines and simulate indoor air purification physics in seconds."),
    ("anim_scene4", "Get personalized clinical guidance from our Gemini AI Copilot and explore live community air reports."),
    ("anim_scene5", "Understand the air. Protect your health. Try BreatheSmart AI today.")
]

VOICES = ["en-US-BrianNeural", "en-US-AndrewNeural", "en-IN-PrabhatNeural"]

async def generate_clip(name: str, text: str):
    out_path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
    for voice in VOICES:
        try:
            communicate = edge_tts.Communicate(text, voice, rate="+6%")
            await communicate.save(out_path)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
                res = subprocess.run(
                    [FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_path],
                    capture_output=True, text=True
                )
                dur = res.stdout.strip()
                print(f"[{name}] voice={voice} | duration={dur}s")
                return
        except Exception as e:
            print(f"[{name}] voice={voice} failed: {e}")
    raise RuntimeError(f"Failed to generate audio for {name}")

async def main():
    for name, text in SEGMENTS:
        await generate_clip(name, text)

if __name__ == "__main__":
    asyncio.run(main())
