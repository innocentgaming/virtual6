import asyncio
import os
import subprocess
import edge_tts

VOICE = "en-IN-PrabhatNeural"
OUTPUT_DIR = os.path.abspath("scripts/audio_segments")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SCRIPTS = [
    {
        "id": "scene1",
        "start": 0,
        "duration": 20,
        "text": "Every day, millions of people breathe polluted air without knowing how it affects their health. Air quality information is often confusing, scattered, and difficult to act upon. That's why we built BreatheSmart AI."
    },
    {
        "id": "scene2",
        "start": 20,
        "duration": 20,
        "text": "Introducing BreatheSmart AI, an intelligent winter smog and urban clean-air navigator designed to make air quality information easier to understand and everyday decisions smarter."
    },
    {
        "id": "scene3",
        "start": 40,
        "duration": 35,
        "text": "The dashboard brings important air quality information together in one place. Users can explore available air quality readings, including PM2.5 and PM10, along with other pollutant and environmental indicators. Instead of looking at raw numbers alone, the dashboard helps users understand what the readings mean."
    },
    {
        "id": "scene4",
        "start": 75,
        "duration": 25,
        "text": "Knowing the air quality is only the first step. BreatheSmart AI also helps users make smarter daily decisions through its routine planning experience, helping them consider air conditions when planning outdoor activities."
    },
    {
        "id": "scene5",
        "start": 100,
        "duration": 20,
        "text": "The indoor air quality simulator helps users explore how different conditions can influence indoor air quality. It makes the concept of cleaner indoor environments easier to understand."
    },
    {
        "id": "scene6",
        "start": 120,
        "duration": 20,
        "text": "We also encourage practical action through our DIY air purifier guide, which introduces an accessible approach to improving indoor air filtration."
    },
    {
        "id": "scene7",
        "start": 140,
        "duration": 20,
        "text": "The AI assistant makes air-quality information more accessible through conversational interaction. The community section adds another layer by bringing people together around awareness and cleaner-air initiatives."
    },
    {
        "id": "scene8",
        "start": 160,
        "duration": 20,
        "text": "BreatheSmart AI is more than an air quality dashboard. It's a step towards informed decisions, healthier routines, and cleaner indoor environments. Understand your air. Make smarter choices. Breathe better. BreatheSmart AI."
    }
]

async def generate_speech():
    for item in SCRIPTS:
        file_path = os.path.join(OUTPUT_DIR, f"{item['id']}.mp3")
        print(f"Generating voiceover for {item['id']}...")
        communicate = edge_tts.Communicate(item["text"], VOICE, rate="-2%")
        await communicate.save(file_path)
        print(f"Saved {file_path}")

if __name__ == "__main__":
    asyncio.run(generate_speech())
