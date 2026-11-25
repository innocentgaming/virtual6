import subprocess
import os

FFMPEG = r"C:\Users\adiya\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"
AUDIO_DIR = os.path.abspath("scripts/reel_audio_animated")
VOICEOVER_WAV = os.path.abspath("scripts/reel_anim_voice.wav")
BG_WAV = os.path.abspath("scripts/reel_anim_bg.wav")
FINAL_AAC = os.path.abspath("scripts/reel_animated_full_audio.aac")

def build():
    seg_files = [f"anim_scene{i}.mp3" for i in range(1, 6)]
    # Exact millisecond offsets matching our 36.0s animated timeline
    delays = [200, 4600, 13800, 22800, 30800]

    inputs = []
    for f in seg_files:
        inputs.extend(["-i", os.path.join(AUDIO_DIR, f)])

    filter_parts = []
    for i, d in enumerate(delays):
        filter_parts.append(f"[{i}:a]adelay={d}|{d}[a{i}];")

    mix_inputs = "".join(f"[a{i}]" for i in range(5))
    filter_graph = "".join(filter_parts) + f"{mix_inputs}amix=inputs=5:normalize=0,apad=whole_dur=36[out]"

    subprocess.run([
        FFMPEG, "-y",
        *inputs,
        "-filter_complex", filter_graph,
        "-map", "[out]",
        "-t", "36",
        VOICEOVER_WAV
    ], check=True)

    # Futuristic warm ambient chord + subtle rhythmic tech pulse (36s)
    # Em9 / Amaj7 inspired harmonic pad with gentle LFO pulse
    subprocess.run([
        FFMPEG, "-y",
        "-f", "lavfi", "-i", "sine=frequency=110.00:duration=36",
        "-f", "lavfi", "-i", "sine=frequency=164.81:duration=36",
        "-f", "lavfi", "-i", "sine=frequency=220.00:duration=36",
        "-f", "lavfi", "-i", "sine=frequency=277.18:duration=36",
        "-f", "lavfi", "-i", "sine=frequency=329.63:duration=36",
        "-filter_complex",
        "[0:a]volume=0.28[b0];"
        "[1:a]volume=0.22[b1];"
        "[2:a]volume=0.18[b2];"
        "[3:a]volume=0.14[b3];"
        "[4:a]volume=0.10[b4];"
        "[b0][b1][b2][b3][b4]amix=inputs=5:normalize=0,"
        "tremolo=f=2.0:d=0.35,"
        "volume=0.075,"
        "afade=t=in:st=0:d=1.2,"
        "afade=t=out:st=33.5:d=2.5[bg]",
        "-map", "[bg]",
        "-t", "36",
        BG_WAV
    ], check=True)

    # Master mix: crisp prominent voiceover + subtle pulsing tech music
    subprocess.run([
        FFMPEG, "-y",
        "-i", VOICEOVER_WAV,
        "-i", BG_WAV,
        "-filter_complex",
        "[0:a]volume=1.18[v];"
        "[1:a]volume=0.24[bg];"
        "[v][bg]amix=inputs=2:normalize=0[m]",
        "-map", "[m]",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "44100",
        "-t", "36",
        FINAL_AAC
    ], check=True)

    print(f"[Animated Reel Audio] Successfully built: {FINAL_AAC}")
    for tmp in (VOICEOVER_WAV, BG_WAV):
        if os.path.exists(tmp):
            os.remove(tmp)

if __name__ == "__main__":
    build()
