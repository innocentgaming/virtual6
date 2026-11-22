const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRAMES_DIR = path.resolve(__dirname, '../reel_frames');
const OUTPUT_VIDEO = path.resolve(__dirname, '../breathesmart_reel.mp4');
const FFMPEG_PATH = 'C:\\Users\\adiya\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';
const AUDIO_PATH = path.resolve(__dirname, 'reel_full_audio.aac');
const SUBTITLES_PATH = 'scripts/reel_subtitles.srt';

let frameIndex = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture(page, count = 1, delay = 50) {
  for (let i = 0; i < count; i++) {
    frameIndex++;
    const frameNumber = String(frameIndex).padStart(5, '0');
    const filename = path.join(FRAMES_DIR, `frame_${frameNumber}.png`);
    await page.screenshot({ path: filename, type: 'png' });
    if (delay > 0) await sleep(delay);
  }
}

async function smoothScroll(page, targetY, steps = 8, stepDelay = 35) {
  const currentY = await page.evaluate(() => window.scrollY);
  const diff = (targetY - currentY) / steps;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), currentY + diff * i);
    await capture(page, 1, stepDelay);
  }
}

async function main() {
  console.log('[Reel Recorder] Initializing vertical frame directory...');
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  console.log('[Reel Recorder] Launching Chrome (1080x1920 9:16 vertical)...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1080, height: 1920 },
    args: [
      '--window-size=1080,1920',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  console.log('[Reel Recorder] Navigating to http://localhost:5000...');
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // ==========================================
  // SCENE 1: 0:00 - 0:07 (7s) | Polluted City, Traffic & Smog Hook
  // Voiceover: "Every breath matters. But do you really know what you're breathing?"
  // On-screen text: "WHAT'S IN YOUR AIR?"
  // ==========================================
  console.log('[Reel Recorder] Scene 1 (0:00 - 0:07): What\'s in your air hook...');
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'reel-scene1-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.background = 'radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.96) 0%, rgba(15, 23, 42, 0.99) 70%, rgba(2, 6, 23, 1) 100%)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'Inter, -apple-system, sans-serif';
    overlay.style.color = '#FFFFFF';
    overlay.style.padding = '48px';
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 900px; animation: fadeIn 0.8s ease;">
        <div style="display: inline-flex; align-items: center; gap: 12px; padding: 12px 28px; border-radius: 9999px; background: rgba(239, 68, 68, 0.15); border: 2px solid rgba(239, 68, 68, 0.5); color: #FCA5A5; font-size: 20px; font-weight: 800; margin-bottom: 36px; letter-spacing: 0.15em; box-shadow: 0 0 30px rgba(239, 68, 68, 0.25);">
          ⚠️ URBAN SMOG CRISIS ALERT
        </div>
        <h1 style="font-size: 80px; font-weight: 900; letter-spacing: -0.04em; margin: 0 0 28px 0; line-height: 1.1; background: linear-gradient(135deg, #FFFFFF 0%, #F87171 50%, #EF4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          WHAT'S IN YOUR AIR?
        </h1>
        <p style="font-size: 32px; color: #CBD5E1; font-weight: 600; line-height: 1.45; max-width: 820px; margin: 0 auto 48px auto;">
          Every breath matters.<br/>
          <span style="color: #94A3B8; font-size: 26px;">Millions breathe hazardous particulate matter without knowing the real health toll.</span>
        </p>

        <!-- Ambient Smog Telemetry Indicator -->
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
          <div style="padding: 20px 32px; border-radius: 24px; background: rgba(15, 23, 42, 0.8); border: 1.5px solid rgba(239, 68, 68, 0.4); text-align: center;">
            <div style="font-size: 16px; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Peak PM2.5 Telemetry</div>
            <div style="font-size: 44px; font-weight: 900; color: #EF4444; font-family: monospace; margin: 4px 0;">342 µg/m³</div>
            <div style="font-size: 14px; color: #FCA5A5; font-weight: 700;">68x WHO Safety Threshold</div>
          </div>
          <div style="padding: 20px 32px; border-radius: 24px; background: rgba(15, 23, 42, 0.8); border: 1.5px solid rgba(245, 158, 11, 0.4); text-align: center;">
            <div style="font-size: 16px; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Thermal Inversion</div>
            <div style="font-size: 44px; font-weight: 900; color: #F59E0B; font-family: monospace; margin: 4px 0;">ACTIVE</div>
            <div style="font-size: 14px; color: #FCD34D; font-weight: 700;">Pollution Trapped at Ground</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  });

  await capture(page, 32, 60); // 0 to 7s visual

  // ==========================================
  // SCENE 2: 0:07 - 0:15 (8s) | Cinematic Reveal of BreatheSmart AI
  // Voiceover: "Introducing BreatheSmart AI, an intelligent platform designed to help you understand the air around you."
  // On-screen text: "BREATHE SMART AI"
  // ==========================================
  console.log('[Reel Recorder] Scene 2 (0:07 - 0:15): BreatheSmart AI Reveal...');
  await page.evaluate(() => {
    const s1 = document.getElementById('reel-scene1-overlay');
    if (s1) {
      s1.style.transition = 'opacity 0.6s ease';
      s1.style.opacity = '0';
      setTimeout(() => s1.remove(), 600);
    }

    const s2 = document.createElement('div');
    s2.id = 'reel-scene2-overlay';
    s2.style.position = 'fixed';
    s2.style.top = '120px';
    s2.style.left = '50%';
    s2.style.transform = 'translateX(-50%)';
    s2.style.zIndex = '9998';
    s2.style.background = 'rgba(15, 23, 42, 0.92)';
    s2.style.backdropFilter = 'blur(16px)';
    s2.style.border = '2px solid rgba(16, 185, 129, 0.6)';
    s2.style.borderRadius = '32px';
    s2.style.padding = '24px 44px';
    s2.style.display = 'flex';
    s2.style.alignItems = 'center';
    s2.style.gap = '20px';
    s2.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.3)';
    s2.innerHTML = `
      <div style="width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.4);">
        🛡️
      </div>
      <div>
        <div style="font-size: 38px; font-weight: 900; letter-spacing: -0.02em; color: #FFFFFF; font-family: Inter, sans-serif;">
          BREATHE SMART AI
        </div>
        <div style="font-size: 16px; font-weight: 700; color: #34D399; letter-spacing: 0.1em; text-transform: uppercase;">
          Precision Urban Environmental Intelligence
        </div>
      </div>
    `;
    document.body.appendChild(s2);
  });

  await capture(page, 15, 60);

  // Smooth scroll to reveal dashboard header and top controls
  await smoothScroll(page, 120, 6, 35);
  await capture(page, 20, 60);

  // Fade out Scene 2 banner smoothly
  await page.evaluate(() => {
    const s2 = document.getElementById('reel-scene2-overlay');
    if (s2) {
      s2.style.transition = 'opacity 0.4s ease';
      s2.style.opacity = '0';
      setTimeout(() => s2.remove(), 400);
    }
  });
  await sleep(400);

  // ==========================================
  // SCENE 3: 0:15 - 0:27 (12s) | Real Dashboard Recording
  // Voiceover: "Explore air quality readings, monitor important pollutants, and understand environmental conditions through one powerful dashboard."
  // Actions: City selection, live AQI gauge, PM2.5/PM10, Pollutant indicators, Thermal Inversion Alert
  // ==========================================
  console.log('[Reel Recorder] Scene 3 (0:15 - 0:27): Live Dashboard, Pollutants & Inversion Alert...');
  
  // Select Delhi NCR from dropdown
  await page.evaluate(() => {
    const sel = document.querySelector('#city-select') || document.querySelector('select');
    if (sel) {
      sel.value = 'Delhi NCR';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(400);
  await capture(page, 12, 60);

  // Click refresh button to demonstrate live polling
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Refresh Air Quality Data"]') || document.querySelector('button[title*="Refresh"]');
    if (btn) btn.click();
  });
  await sleep(400);
  await capture(page, 15, 60);

  // Pan down to Centerpiece Gauge (Current AQI)
  await smoothScroll(page, 240, 8, 35);
  await capture(page, 22, 60);

  // Pan down to Multi-Pollutant Grid (PM2.5, PM10, NO2, O3, CO, SO2)
  await smoothScroll(page, 520, 8, 35);
  await capture(page, 24, 60);

  // Pan down to Thermal Inversion Warning banner
  await smoothScroll(page, 760, 6, 35);
  await capture(page, 20, 60);

  // ==========================================
  // SCENE 4: 0:27 - 0:39 (12s) | Routine Planner, IAQ Simulator & DIY Purifier
  // Voiceover: "Plan smarter daily routines, explore indoor air quality, and discover practical clean-air solutions."
  // Actions: Switch to Routine Planner, then IAQ Simulator with slider, then Corsi-Rosenthal DIY box
  // ==========================================
  console.log('[Reel Recorder] Scene 4 (0:27 - 0:39): Routine Planner, IAQ Simulator & DIY Guide...');
  await smoothScroll(page, 0, 6, 30);

  // 1. Switch to Routine Planner Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], nav button'));
    const t = tabs.find(b => b.textContent.includes('Planner') || b.textContent.includes('Routine'));
    if (t) t.click();
  });
  await sleep(600);
  await capture(page, 15, 60);

  // Toggle Family Persona Mode
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Family'));
    if (b) b.click();
  });
  await sleep(400);
  await smoothScroll(page, 450, 6, 35);
  await capture(page, 18, 60);

  // 2. Switch to Indoor Air Tab
  await smoothScroll(page, 0, 6, 30);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], nav button'));
    const t = tabs.find(b => b.textContent.includes('Indoor') || b.textContent.includes('IAQ'));
    if (t) t.click();
  });
  await sleep(600);
  await smoothScroll(page, 340, 6, 35);
  await capture(page, 15, 60);

  // Adjust CADR slider in IAQ Simulator
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="range"]');
    if (inputs[0]) {
      inputs[0].value = '85';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(400);
  await capture(page, 15, 60);

  // Pan to Corsi-Rosenthal DIY Purifier Blueprint
  await smoothScroll(page, 950, 8, 35);
  await capture(page, 20, 60);

  // ==========================================
  // SCENE 5: 0:39 - 0:51 (12s) | AI Copilot & Community Section
  // Voiceover: "Get conversational AI assistance and explore a community built around clean-air awareness."
  // Actions: Click AI Copilot tab, trigger prompt, show AI answer, switch to Community tab
  // ==========================================
  console.log('[Reel Recorder] Scene 5 (0:39 - 0:51): AI Copilot & Community Hub...');
  await smoothScroll(page, 0, 6, 30);

  // Switch to AI Assistant Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], nav button'));
    const t = tabs.find(b => b.textContent.includes('AI') || b.textContent.includes('Copilot'));
    if (t) t.click();
  });
  await sleep(700);
  await capture(page, 14, 60);

  // Click pre-set question: "How to protect an asthmatic 6-year-old in smog?"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('asthmatic 6-year-old') || btn.textContent.includes('asthmatic'));
    if (b) b.click();
  });
  await sleep(1400);
  await capture(page, 18, 60);

  // Pan down to AI response & clinical recommendations
  await smoothScroll(page, 380, 6, 35);
  await capture(page, 20, 60);

  // Switch to Community Tab
  await smoothScroll(page, 0, 6, 30);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], nav button'));
    const t = tabs.find(b => b.textContent.includes('Community'));
    if (t) t.click();
  });
  await sleep(600);
  await capture(page, 16, 60);

  // Filter Community Reports (e.g. Open Burning)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Open Burning') || btn.textContent.includes('Vehicular'));
    if (b) b.click();
  });
  await sleep(400);
  await smoothScroll(page, 200, 6, 35);
  await capture(page, 18, 60);

  // ==========================================
  // SCENE 6: 0:51 - 1:00 (9s) | Fast Montage & Premium Logo Reveal
  // Voiceover: "Understand the air. Make smarter choices. Protect your health. This is BreatheSmart AI."
  // On-screen text: "BREATHE SMART. LIVE SMART." & "Explore BreatheSmart AI"
  // ==========================================
  console.log('[Reel Recorder] Scene 6 (0:51 - 1:00): Fast Montage & Final Logo Card...');
  
  // Quick return to Dashboard overview
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], nav button'));
    const t = tabs.find(b => b.textContent.includes('Dashboard') || b.textContent.includes('Overview'));
    if (t) t.click();
  });
  await sleep(400);
  await smoothScroll(page, 120, 4, 30);
  await capture(page, 12, 60);

  // Final Cinematic Logo Card (Vertical 9:16 optimized)
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'reel-closing-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.background = 'radial-gradient(circle at 50% 45%, rgba(15, 23, 42, 0.98) 0%, rgba(3, 7, 18, 1) 100%)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'Inter, -apple-system, sans-serif';
    overlay.style.color = '#FFFFFF';
    overlay.style.padding = '48px';
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 920px; animation: fadeIn 0.8s ease;">
        <div style="width: 130px; height: 130px; border-radius: 40px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 36px auto; box-shadow: 0 20px 50px rgba(5, 150, 105, 0.6); font-size: 72px;">
          🛡️
        </div>

        <div style="display: inline-flex; align-items: center; gap: 10px; padding: 10px 24px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); border: 1.5px solid rgba(16, 185, 129, 0.5); color: #34D399; font-size: 18px; font-weight: 800; margin-bottom: 24px; letter-spacing: 0.15em;">
          PRECISION ENVIRONMENTAL INTELLIGENCE
        </div>

        <h1 style="font-size: 76px; font-weight: 900; letter-spacing: -0.04em; margin: 0 0 16px 0; background: linear-gradient(135deg, #FFFFFF 0%, #34D399 50%, #10B981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1;">
          BREATHE SMART.<br/>LIVE SMART.
        </h1>

        <p style="font-size: 32px; font-weight: 700; color: #E2E8F0; margin: 0 0 36px 0; letter-spacing: -0.02em;">
          Explore BreatheSmart AI
        </p>

        <p style="font-size: 22px; color: #94A3B8; line-height: 1.6; max-width: 780px; margin: 0 auto 48px auto;">
          Understand the air. Make smarter choices. Protect your health.<br/>
          Real-time telemetry, Gemini AI copilot & scientific routines.
        </p>

        <!-- Live Website & Repo Links -->
        <div style="display: flex; flex-direction: column; gap: 16px; align-items: center;">
          <div style="display: inline-flex; align-items: center; gap: 12px; padding: 16px 36px; border-radius: 20px; background: rgba(16, 185, 129, 0.18); border: 2px solid rgba(16, 185, 129, 0.6); color: #34D399; font-size: 24px; font-weight: 800; font-family: monospace; letter-spacing: 0.05em; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25);">
            🌐 breathesmart-ai.onrender.com
          </div>
          <div style="font-size: 18px; color: #64748B; font-weight: 600;">
            github.com/innocentgaming/virtual6
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  });

  await capture(page, 35, 60); // Hold final reveal

  console.log(`[Reel Recorder] Total vertical frames captured: ${frameIndex}`);
  await browser.close();

  // ==========================================
  // FFMPEG VERTICAL COMPOSITING (9:16)
  // ==========================================
  console.log('[Reel Recorder] Encoding 1080x1920 vertical Reel with master audio & animated subtitles...');
  
  const targetDuration = 60.0;
  const calculatedFramerate = (frameIndex / targetDuration).toFixed(4);
  console.log(`[Reel Recorder] Framerate to achieve exactly 60.0s: ${calculatedFramerate} fps`);

  const escapedSubtitles = SUBTITLES_PATH.replace(/\\/g, '/');
  
  const ffmpegCmd = [
    `"${FFMPEG_PATH}"`,
    `-y`,
    `-framerate ${calculatedFramerate}`,
    `-i "${path.join(FRAMES_DIR, 'frame_%05d.png')}"`,
    `-i "${AUDIO_PATH}"`,
    `-filter_complex "[0:v]subtitles='${escapedSubtitles}':force_style='FontName=Inter,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H90000000,BorderStyle=4,Outline=1,Shadow=0,MarginV=140'[v]"`,
    `-map "[v]"`,
    `-map 1:a`,
    `-c:v libx264`,
    `-r 30`,
    `-pix_fmt yuv420p`,
    `-preset fast`,
    `-b:v 280k`,
    `-maxrate 350k`,
    `-bufsize 650k`,
    `-c:a copy`,
    `-t 60`,
    `"${OUTPUT_VIDEO}"`
  ].join(' ');

  console.log('[Reel Recorder] Executing FFmpeg command...');
  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`[Reel Recorder] SUCCESS! Vertical Reel generated at: ${OUTPUT_VIDEO}`);

  // Cleanup temporary frames
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('[Reel Recorder] Temporary frames removed cleanly.');
}

main().catch(err => {
  console.error('[Reel Recorder Fatal Error]:', err);
  process.exit(1);
});
