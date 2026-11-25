import subprocess
import os

FFMPEG = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"
AUDIO_DIR = os.path.abspath("scripts/reel_audio_clean")
VOICEOVER_OUTPUT = os.path.abspath("scripts/reel_clean_voiceover.wav")
BG_OUTPUT = os.path.abspath("scripts/reel_clean_bg.wav")
FINAL_OUTPUT = os.path.abspath("scripts/reel_clean_full_audio.aac")

def build():
    seg_files = [f"reel_clean_scene{i}.mp3" for i in range(1, 7)]
    # Target start times in ms
    delays = [600, 7500, 15500, 27500, 40500, 52500]
    # Speed factors to fit each clip comfortably within its scene window without overlap
    tempos = [1.42, 1.30, 1.19, 1.05, 1.02, 1.38]
    
    inputs = []
    for f in seg_files:
        inputs.extend(["-i", os.path.join(AUDIO_DIR, f)])
        
    filter_parts = []
    for i, (d, t) in enumerate(zip(delays, tempos)):
        filter_parts.append(f"[{i}:a]atempo={t},adelay={d}|{d}[a{i}];")
        
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
    print("[Reel Audio] Assembling synchronized voiceover track...")
    subprocess.run(cmd_voice, check=True)
    
    # Soft futuristic cinematic technology music (60s)
    print("[Reel Audio] Synthesizing soft futuristic tech background music...")
    cmd_bg = [
        FFMPEG, "-y",
        "-f", "lavfi", "-i", "sine=frequency=146.83:duration=60", # D3 root
        "-f", "lavfi", "-i", "sine=frequency=220.00:duration=60", # A3 fifth
        "-f", "lavfi", "-i", "sine=frequency=293.66:duration=60", # D4 octave
        "-f", "lavfi", "-i", "sine=frequency=440.00:duration=60", # A4 upper
        "-filter_complex",
        "[0:a]volume=0.28[b0];"
        "[1:a]volume=0.22[b1];"
        "[2:a]volume=0.18[b2];"
        "[3:a]volume=0.12[b3];"
        "[b0][b1][b2][b3]amix=inputs=4:normalize=0,volume=0.065,afade=t=in:st=0:d=2.0,afade=t=out:st=57:d=3.0[bg]",
        "-map", "[bg]",
        "-t", "60",
        BG_OUTPUT
    ]
    subprocess.run(cmd_bg, check=True)
    
    # Master mix: clear prominent voiceover + subtle ambient music
    print("[Reel Audio] Mastering mixed audio track...")
    cmd_master = [
        FFMPEG, "-y",
        "-i", VOICEOVER_OUTPUT,
        "-i", BG_OUTPUT,
        "-filter_complex",
        "[0:a]volume=1.12[v];"
        "[1:a]volume=0.18[bg];"
        "[v][bg]amix=inputs=2:normalize=0[m]",
        "-map", "[m]",
        "-c:a", "aac",
        "-b:a", "96k",
        "-t", "60",
        FINAL_OUTPUT
    ]
    subprocess.run(cmd_master, check=True)
    print(f"[Reel Audio] Master mixed audio successfully generated: {FINAL_OUTPUT}")
    
    if os.path.exists(VOICEOVER_OUTPUT):
        os.remove(VOICEOVER_OUTPUT)
    if os.path.exists(BG_OUTPUT):
        os.remove(BG_OUTPUT)

if __name__ == "__main__":
    build()
