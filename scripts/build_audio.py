import os
import subprocess

FFMPEG = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"

SEGMENTS = [
    ("scripts/audio_segments/scene1.mp3", 0.5),
    ("scripts/audio_segments/scene2.mp3", 20.8),
    ("scripts/audio_segments/scene3.mp3", 41.0),
    ("scripts/audio_segments/scene4.mp3", 76.0),
    ("scripts/audio_segments/scene5.mp3", 101.0),
    ("scripts/audio_segments/scene6.mp3", 121.0),
    ("scripts/audio_segments/scene7.mp3", 141.0),
    ("scripts/audio_segments/scene8.mp3", 160.2),
]

OUTPUT_VOICE = "scripts/voiceover_full.wav"
OUTPUT_BGM = "scripts/bg_music.wav"
FINAL_AUDIO = "scripts/full_audio.aac"

def build_bgm():
    # Generate warm futuristic ambient pad track using sine inputs and filter_complex
    cmd = [
        FFMPEG, "-y",
        "-f", "lavfi", "-i", "sine=frequency=130.81:duration=180",
        "-f", "lavfi", "-i", "sine=frequency=196.00:duration=180",
        "-f", "lavfi", "-i", "sine=frequency=261.63:duration=180",
        "-f", "lavfi", "-i", "sine=frequency=329.63:duration=180",
        "-filter_complex", 
        "[0:a][1:a][2:a][3:a]amix=inputs=4:normalize=0,lowpass=f=450,volume=0.035,apad=whole_dur=180[bg]",
        "-map", "[bg]",
        "-t", "180",
        OUTPUT_BGM
    ]
    print("Generating background music track...")
    subprocess.check_call(cmd)
    print("Background music generated.")

def mix_audio():
    cmd = [
        FFMPEG, "-y",
        "-i", OUTPUT_VOICE,
        "-i", OUTPUT_BGM,
        "-filter_complex", 
        "[0:a]volume=1.0[v];[1:a]volume=0.25[m];[v][m]amix=inputs=2:normalize=0[aout]",
        "-map", "[aout]",
        "-c:a", "aac",
        "-b:a", "128k",
        "-t", "180",
        FINAL_AUDIO
    ]
    print("Mixing final master audio track...")
    subprocess.check_call(cmd)
    print("Master audio ready:", FINAL_AUDIO)

if __name__ == "__main__":
    build_bgm()
    mix_audio()
