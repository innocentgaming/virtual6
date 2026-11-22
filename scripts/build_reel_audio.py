import subprocess
import os

FFMPEG = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"
AUDIO_DIR = os.path.abspath("scripts/reel_audio")
VOICEOVER_OUTPUT = os.path.abspath("scripts/reel_voiceover.wav")
BG_OUTPUT = os.path.abspath("scripts/reel_bg.wav")
FINAL_OUTPUT = os.path.abspath("scripts/reel_full_audio.aac")

def build():
    # 1. Delay and concatenate voiceover segments into a single 60s stream
    # Segment 1: 0.0s (0ms)
    # Segment 2: 5.0s (5000ms)
    # Segment 3: 15.0s (15000ms)
    # Segment 4: 25.0s (25000ms)
    # Segment 5: 35.0s (35000ms)
    # Segment 6: 45.0s (45000ms)
    # Segment 7: 53.0s (53000ms)
    
    seg_files = [f"reel_scene{i}.mp3" for i in range(1, 8)]
    delays = [0, 5000, 15000, 25000, 35000, 45000, 53000]
    
    inputs = []
    for f in seg_files:
        inputs.extend(["-i", os.path.join(AUDIO_DIR, f)])
        
    filter_parts = []
    for i, d in enumerate(delays):
        filter_parts.append(f"[{i}:a]adelay={d}|{d}[a{i}];")
        
    mix_inputs = "".join(f"[a{i}]" for i in range(7))
    filter_graph = "".join(filter_parts) + f"{mix_inputs}amix=inputs=7:normalize=0,apad=whole_dur=60[out]"
    
    cmd_voice = [
        FFMPEG, "-y",
        *inputs,
        "-filter_complex", filter_graph,
        "-map", "[out]",
        "-t", "60",
        VOICEOVER_OUTPUT
    ]
    print("[Reel Audio] Building aligned voiceover track...")
    subprocess.run(cmd_voice, check=True)
    
    # 2. Synthesize modern upbeat tech background music track (60s)
    print("[Reel Audio] Synthesizing background music track...")
    cmd_bg = [
        FFMPEG, "-y",
        "-f", "lavfi", "-i", "sine=frequency=174:duration=60",
        "-f", "lavfi", "-i", "sine=frequency=261.63:duration=60",
        "-f", "lavfi", "-i", "sine=frequency=349.23:duration=60",
        "-f", "lavfi", "-i", "sine=frequency=523.25:duration=60",
        "-filter_complex",
        "[0:a]volume=0.3[b0];"
        "[1:a]volume=0.25[b1];"
        "[2:a]volume=0.2[b2];"
        "[3:a]volume=0.15[b3];"
        "[b0][b1][b2][b3]amix=inputs=4:normalize=0,volume=0.08,afade=t=in:st=0:d=1,afade=t=out:st=58:d=2[bg]",
        "-map", "[bg]",
        "-t", "60",
        BG_OUTPUT
    ]
    subprocess.run(cmd_bg, check=True)
    
    # 3. Master mix voiceover + background music into AAC (60.00s)
    print("[Reel Audio] Mastering mixed audio track...")
    cmd_master = [
        FFMPEG, "-y",
        "-i", VOICEOVER_OUTPUT,
        "-i", BG_OUTPUT,
        "-filter_complex",
        "[0:a]volume=1.05[v];"
        "[1:a]volume=0.22[bg];"
        "[v][bg]amix=inputs=2:normalize=0[m]",
        "-map", "[m]",
        "-c:a", "aac",
        "-b:a", "96k",
        "-t", "60",
        FINAL_OUTPUT
    ]
    subprocess.run(cmd_master, check=True)
    print(f"[Reel Audio] SUCCESS! Master mixed audio created at: {FINAL_OUTPUT}")
    
    # Clean up large intermediate WAV files immediately
    if os.path.exists(VOICEOVER_OUTPUT):
        os.remove(VOICEOVER_OUTPUT)
    if os.path.exists(BG_OUTPUT):
        os.remove(BG_OUTPUT)
    print("[Reel Audio] Cleaned up temporary uncompressed WAV files.")

if __name__ == "__main__":
    build()
