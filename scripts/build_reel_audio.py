import subprocess
import os

FFMPEG = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"
AUDIO_DIR = os.path.abspath("scripts/reel_audio")
VOICEOVER_OUTPUT = os.path.abspath("scripts/reel_voiceover.wav")
BG_OUTPUT = os.path.abspath("scripts/reel_bg.wav")
FINAL_OUTPUT = os.path.abspath("scripts/reel_full_audio.aac")

def build():
    # 6 Scenes matching exactly the prompt structure:
    # Scene 1: 0–7s (start at 0.5s = 500ms)
    # Scene 2: 7–15s (start at 7.2s = 7200ms)
    # Scene 3: 15–27s (start at 15.2s = 15200ms)
    # Scene 4: 27–39s (start at 27.2s = 27200ms)
    # Scene 5: 39–51s (start at 39.2s = 39200ms)
    # Scene 6: 51–60s (start at 51.2s = 51200ms)
    
    seg_files = [f"reel_scene{i}.mp3" for i in range(1, 7)]
    delays = [500, 7200, 15200, 27200, 39200, 51200]
    
    inputs = []
    for f in seg_files:
        inputs.extend(["-i", os.path.join(AUDIO_DIR, f)])
        
    filter_parts = []
    for i, d in enumerate(delays):
        filter_parts.append(f"[{i}:a]adelay={d}|{d}[a{i}];")
        
    mix_inputs = "".join(f"[a{i}]" for i in range(6))
    filter_graph = "".join(filter_parts) + f"{mix_inputs}amix=inputs=6:normalize=0,apad=whole_dur=60[out]"
    
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
    
    # Synthesize cinematic tech background music track (60s)
    print("[Reel Audio] Synthesizing cinematic background music track...")
    cmd_bg = [
        FFMPEG, "-y",
        "-f", "lavfi", "-i", "sine=frequency=164.81:duration=60",
        "-f", "lavfi", "-i", "sine=frequency=246.94:duration=60",
        "-f", "lavfi", "-i", "sine=frequency=329.63:duration=60",
        "-f", "lavfi", "-i", "sine=frequency=493.88:duration=60",
        "-filter_complex",
        "[0:a]volume=0.3[b0];"
        "[1:a]volume=0.25[b1];"
        "[2:a]volume=0.2[b2];"
        "[3:a]volume=0.15[b3];"
        "[b0][b1][b2][b3]amix=inputs=4:normalize=0,volume=0.07,afade=t=in:st=0:d=1.5,afade=t=out:st=57:d=3[bg]",
        "-map", "[bg]",
        "-t", "60",
        BG_OUTPUT
    ]
    subprocess.run(cmd_bg, check=True)
    
    # Master mix voiceover + subtle background music into AAC (60.00s)
    print("[Reel Audio] Mastering mixed audio track...")
    cmd_master = [
        FFMPEG, "-y",
        "-i", VOICEOVER_OUTPUT,
        "-i", BG_OUTPUT,
        "-filter_complex",
        "[0:a]volume=1.05[v];"
        "[1:a]volume=0.20[bg];"
        "[v][bg]amix=inputs=2:normalize=0[m]",
        "-map", "[m]",
        "-c:a", "aac",
        "-b:a", "96k",
        "-t", "60",
        FINAL_OUTPUT
    ]
    subprocess.run(cmd_master, check=True)
    print(f"[Reel Audio] SUCCESS! Master mixed audio created at: {FINAL_OUTPUT}")
    
    # Clean up intermediate uncompressed files
    if os.path.exists(VOICEOVER_OUTPUT):
        os.remove(VOICEOVER_OUTPUT)
    if os.path.exists(BG_OUTPUT):
        os.remove(BG_OUTPUT)
    print("[Reel Audio] Cleaned up temporary WAV files.")

if __name__ == "__main__":
    build()
