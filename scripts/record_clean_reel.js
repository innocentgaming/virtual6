const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRAMES_DIR = path.resolve(__dirname, '../reel_clean_frames');
const OUTPUT_VIDEO = path.resolve(__dirname, '../BreatheSmart_AI_Instagram_Reel.mp4');
const FFMPEG_PATH = 'C:\\Users\\adiya\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';
const AUDIO_PATH = path.resolve(__dirname, 'reel_clean_full_audio.aac');

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
  console.log('[Reel Director] Preparing clean frames directory...');
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  console.log('[Reel Director] Launching Chrome in 1080x1920 (9:16 vertical)...');
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

  console.log('[Reel Director] Loading http://localhost:5000...');
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // ==========================================
  // SCENE 1: 0:00 - 0:07 (7s) | Cinematic Winter Smog Hook
  // Atmospheric footage of city covered in winter smog, traffic lights through dense haze.
  // STRICTLY ZERO TEXT OVERLAYS OR SUBTITLES.
  // ==========================================
  console.log('[Reel Director] Scene 1 (0:00 - 0:07): Atmospheric Winter Smog Ambiance (Pure Visual, No Text)...');
  await page.evaluate(() => {
    const smogOverlay = document.createElement('div');
    smogOverlay.id = 'cinematic-smog-layer';
    smogOverlay.style.position = 'fixed';
    smogOverlay.style.inset = '0';
    smogOverlay.style.zIndex = '9999';
    smogOverlay.style.background = 'radial-gradient(ellipse at 50% 65%, #334155 0%, #1e293b 40%, #0f172a 75%, #020617 100%)';
    smogOverlay.style.overflow = 'hidden';

    // Cinematic hazy street lamp glows & vehicle light trails through dense winter fog
    smogOverlay.innerHTML = `
      <div style="position: absolute; inset: 0; opacity: 0.55; background: repeating-linear-gradient(0deg, rgba(203, 213, 225, 0.04) 0px, rgba(203, 213, 225, 0.04) 2px, transparent 2px, transparent 6px);"></div>
      <!-- Distant city skyline silhouettes hidden in heavy smog -->
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent);">
        <div style="position: absolute; bottom: 180px; left: 10%; width: 120px; height: 420px; background: rgba(30, 41, 59, 0.7); filter: blur(3px); border-radius: 6px;"></div>
        <div style="position: absolute; bottom: 180px; left: 26%; width: 180px; height: 560px; background: rgba(30, 41, 59, 0.85); filter: blur(4px); border-radius: 8px;"></div>
        <div style="position: absolute; bottom: 180px; left: 48%; width: 140px; height: 480px; background: rgba(30, 41, 59, 0.75); filter: blur(3px); border-radius: 6px;"></div>
        <div style="position: absolute; bottom: 180px; left: 66%; width: 220px; height: 620px; background: rgba(30, 41, 59, 0.9); filter: blur(5px); border-radius: 8px;"></div>
        <div style="position: absolute; bottom: 180px; left: 88%; width: 100px; height: 380px; background: rgba(30, 41, 59, 0.65); filter: blur(3px); border-radius: 6px;"></div>
      </div>
      <!-- Traffic amber and red taillights dispersed in heavy particulate haze -->
      <div style="position: absolute; bottom: 220px; left: 18%; width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle, rgba(239, 68, 68, 0.85) 0%, rgba(239, 68, 68, 0) 70%); filter: blur(14px);"></div>
      <div style="position: absolute; bottom: 215px; left: 32%; width: 95px; height: 95px; border-radius: 50%; background: radial-gradient(circle, rgba(245, 158, 11, 0.9) 0%, rgba(245, 158, 11, 0) 70%); filter: blur(16px);"></div>
      <div style="position: absolute; bottom: 230px; left: 58%; width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0) 70%); filter: blur(15px);"></div>
      <div style="position: absolute; bottom: 225px; left: 74%; width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle, rgba(245, 158, 11, 0.85) 0%, rgba(245, 158, 11, 0) 70%); filter: blur(18px);"></div>
      <!-- Dense particulate smog wash -->
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(148, 163, 184, 0.22) 0%, rgba(100, 116, 139, 0.35) 50%, rgba(15, 23, 42, 0.7) 100%); mix-blend-mode: overlay;"></div>
    `;
    document.body.appendChild(smogOverlay);
  });

  await capture(page, 32, 60); // 0 to 7s visual

  // ==========================================
  // SCENE 2: 0:07 - 0:15 (8s) | Website Introduction
  // Smooth camera dissolve into the actual BreatheSmart AI website interface.
  // Demonstrating the navbar, brand shield logo, and live baseline indicators.
  // ==========================================
  console.log('[Reel Director] Scene 2 (0:07 - 0:15): Smooth Dissolve into BreatheSmart AI UI...');
  await page.evaluate(() => {
    const layer = document.getElementById('cinematic-smog-layer');
    if (layer) {
      layer.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      layer.style.opacity = '0';
      setTimeout(() => layer.remove(), 1200);
    }
  });

  await capture(page, 20, 60);

  // Smooth cinematic pan across top navigation and status
  await smoothScroll(page, 100, 6, 35);
  await capture(page, 18, 60);

  // ==========================================
  // SCENE 3: 0:15 - 0:27 (12s) | Live AQI Dashboard & Multi-Pollutants
  // Actual interactions:
  // - City selection (Delhi NCR)
  // - Live refresh button click
  // - Large centerpiece animated AQI circular gauge
  // - Close-up on PM2.5 & PM10 cards
  // - NO2, O3, CO, SO2 indicators & Thermal Inversion warning
  // ==========================================
  console.log('[Reel Director] Scene 3 (0:15 - 0:27): Live Dashboard, Centerpiece Gauge & Pollutants...');
  
  // Select city
  await page.evaluate(() => {
    const sel = document.querySelector('#city-select') || document.querySelector('select');
    if (sel) {
      sel.value = 'Delhi NCR';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(400);
  await capture(page, 12, 60);

  // Refresh live data
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Refresh Air Quality Data"]') || document.querySelector('button[title*="Refresh"]');
    if (btn) btn.click();
  });
  await sleep(400);
  await capture(page, 15, 60);

  // Smooth camera zoom / pan to Large Centerpiece Circular Gauge
  await smoothScroll(page, 260, 8, 35);
  await capture(page, 22, 60);

  // Pan to PM2.5, PM10 & Multi-Pollutant Grid
  await smoothScroll(page, 520, 8, 35);
  await capture(page, 22, 60);

  // Pan to Thermal Inversion Warning banner & meteorological indicators
  await smoothScroll(page, 780, 6, 35);
  await capture(page, 20, 60);

  // ==========================================
  // SCENE 4: 0:27 - 0:40 (13s) | Smart Features (Routine, IAQ & DIY Purifier)
  // Actual UI demonstration:
  // 1. Routine Planner tab & Family persona toggle
  // 2. Indoor Air Quality Simulator with interactive CADR slider
  // 3. DIY Corsi-Rosenthal Purifier blueprint
  // ==========================================
  console.log('[Reel Director] Scene 4 (0:27 - 0:40): Routine Planner, IAQ Simulator & DIY Guide...');
  await smoothScroll(page, 0, 6, 30);

  // 1. Switch to Routine Planner Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], nav button'));
    const t = tabs.find(b => b.textContent.includes('Planner') || b.textContent.includes('Routine'));
    if (t) t.click();
  });
  await sleep(600);
  await capture(page, 15, 60);

  // Toggle Family persona mode
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Family'));
    if (b) b.click();
  });
  await sleep(400);
  await smoothScroll(page, 440, 6, 35);
  await capture(page, 20, 60);

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

  // Adjust CADR slider in IAQ Simulator to show dynamic decay physics
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="range"]');
    if (inputs[0]) {
      inputs[0].value = '85';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(400);
  await capture(page, 16, 60);

  // Scroll to DIY Corsi-Rosenthal Air Purifier blueprint
  await smoothScroll(page, 950, 8, 35);
  await capture(page, 20, 60);

  // ==========================================
  // SCENE 5: 0:40 - 0:52 (12s) | AI Copilot & Community Experience
  // Actual UI demonstration:
  // 1. AI Copilot: Click real air-quality question & show streaming AI recommendations
  // 2. Community: View citizen reports & active hazards
  // ==========================================
  console.log('[Reel Director] Scene 5 (0:40 - 0:52): AI Copilot Consultation & Community Section...');
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

  // Pan down to show genuine Gemini AI medical safety triage & bulleted protocols
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

  // Filter Community Reports (Open Burning & Smoke)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Open Burning') || btn.textContent.includes('Vehicular'));
    if (b) b.click();
  });
  await sleep(400);
  await smoothScroll(page, 200, 6, 35);
  await capture(page, 18, 60);

  // ==========================================
  // SCENE 6: 0:52 - 1:00 (8s) | Cinematic Closing Montage & Logo Reveal
  // Rapid elegant montage returning to the website homepage with the clean logo,
  // verified standards, and pristine UI.
  // STRICTLY ZERO ADDED CAPTIONS OR TEXT OVERLAYS.
  // ==========================================
  console.log('[Reel Director] Scene 6 (0:52 - 1:00): Cinematic Closing on Website Homepage & Logo...');
  await smoothScroll(page, 0, 6, 30);

  // Return to Dashboard Overview
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], nav button'));
    const t = tabs.find(b => b.textContent.includes('Dashboard') || b.textContent.includes('Overview'));
    if (t) t.click();
  });
  await sleep(500);

  // Smooth zoom to executive centerpiece header and logo
  await smoothScroll(page, 140, 6, 35);
  await capture(page, 16, 60);

  // Hold clean high-definition view of the homepage brand centerpiece
  await smoothScroll(page, 40, 4, 30);
  await capture(page, 24, 60);

  console.log(`[Reel Director] Total clean frames captured: ${frameIndex}`);
  await browser.close();

  // ==========================================
  // FFMPEG COMPOSITING (PURE VIDEO + AUDIO, NO SUBTITLES FILTER)
  // ==========================================
  console.log('[Reel Director] Encoding 1080x1920 vertical Reel (Zero Captions / Zero Text Overlays)...');
  
  const targetDuration = 60.0;
  const calculatedFramerate = (frameIndex / targetDuration).toFixed(4);
  console.log(`[Reel Director] Frame rate calculated for exact 60.0s: ${calculatedFramerate} fps`);

  const ffmpegCmd = [
    `"${FFMPEG_PATH}"`,
    `-y`,
    `-framerate ${calculatedFramerate}`,
    `-i "${path.join(FRAMES_DIR, 'frame_%05d.png')}"`,
    `-i "${AUDIO_PATH}"`,
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

  console.log('[Reel Director] Running FFmpeg rendering...');
  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`[Reel Director] SUCCESS! Clean Reel generated at: ${OUTPUT_VIDEO}`);

  // Clean up temporary frame buffer
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('[Reel Director] Frame buffer removed cleanly.');
}

main().catch(err => {
  console.error('[Reel Director Fatal Error]:', err);
  process.exit(1);
});
