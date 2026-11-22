const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRAMES_DIR = path.resolve(__dirname, '../demo_frames');
const OUTPUT_VIDEO = path.resolve(__dirname, '../breathesmart_demo.mp4');
const FFMPEG_PATH = 'C:\\Users\\adiya\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';
const AUDIO_PATH = path.resolve(__dirname, 'full_audio.aac');
const SUBTITLES_PATH = path.resolve(__dirname, 'subtitles.srt');

let frameIndex = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture(page, count = 1, delay = 60) {
  for (let i = 0; i < count; i++) {
    frameIndex++;
    const frameNumber = String(frameIndex).padStart(5, '0');
    const filename = path.join(FRAMES_DIR, `frame_${frameNumber}.png`);
    await page.screenshot({ path: filename, type: 'png' });
    if (delay > 0) await sleep(delay);
  }
}

async function smoothScroll(page, targetY, steps = 8, stepDelay = 50) {
  const currentY = await page.evaluate(() => window.scrollY);
  const diff = (targetY - currentY) / steps;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), currentY + diff * i);
    await capture(page, 1, stepDelay);
  }
}

async function main() {
  console.log('[Recorder] Initializing frame directory...');
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  console.log('[Recorder] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 },
    args: [
      '--window-size=1920,1080',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('[Recorder] Navigating to http://localhost:5000...');
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // ==========================================
  // SCENE 1: 0:00 - 0:20 | Opening - The Problem
  // ==========================================
  console.log('[Recorder] Scene 1 (0:00 - 0:20): Opening Problem & Title...');
  // Inject Title Card Overlay for the opening problem scene
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'cinematic-title-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.background = 'radial-gradient(circle at center, rgba(15, 23, 42, 0.94) 0%, rgba(7, 10, 15, 0.98) 100%)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'Inter, sans-serif';
    overlay.style.color = '#FFFFFF';
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 800px; padding: 40px; animation: fadeIn 1s ease;">
        <div style="display: inline-flex; align-items: center; gap: 10px; padding: 6px 16px; border-radius: 9999px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #FCA5A5; font-size: 13px; font-weight: 700; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.1em;">
          <span>🚨 Meteorological Stagnation • Severe Winter Smog</span>
        </div>
        <h1 style="font-size: 58px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 16px 0; background: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          BreatheSmart AI
        </h1>
        <p style="font-size: 26px; font-weight: 500; color: #38BDF8; margin: 0 0 28px 0; letter-spacing: -0.01em;">
          Understand the air. Protect your health.
        </p>
        <p style="font-size: 17px; color: #94A3B8; line-height: 1.6; max-width: 650px; margin: 0 auto;">
          Every day, millions of people breathe polluted air without knowing how it affects their health. Air quality information is often confusing, scattered, and difficult to act upon.
        </p>
      </div>
    `;
    document.body.appendChild(overlay);
  });

  await capture(page, 45, 100); // 45 frames ~ 4.5s title display

  // Fade out title card to reveal underlying real interface
  await page.evaluate(() => {
    const overlay = document.getElementById('cinematic-title-overlay');
    if (overlay) overlay.style.transition = 'opacity 1s ease';
    if (overlay) overlay.style.opacity = '0';
  });
  await sleep(1000);
  await page.evaluate(() => {
    const overlay = document.getElementById('cinematic-title-overlay');
    if (overlay) overlay.remove();
  });

  // Reveal Atmospheric Canvas & Particle Smog Simulation
  console.log('[Recorder] Revealing live atmospheric simulation...');
  await capture(page, 55, 80);

  // Click on canvas to demonstrate clean CADR filtration pulse
  const canvasEl = await page.$('canvas');
  if (canvasEl) {
    const box = await canvasEl.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
      await capture(page, 30, 80);
    }
  }

  // ==========================================
  // SCENE 2: 0:20 - 0:40 | Introducing the Website
  // ==========================================
  console.log('[Recorder] Scene 2 (0:20 - 0:40): Introducing the Website & Navigation...');
  await smoothScroll(page, 0, 6, 40);
  await capture(page, 30, 80);

  // Highlight navigation bar tabs
  await page.evaluate(() => {
    const nav = document.querySelector('nav[role="tablist"]');
    if (nav) {
      nav.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.6)';
      nav.style.borderRadius = '12px';
    }
  });
  await capture(page, 25, 80);

  await page.evaluate(() => {
    const nav = document.querySelector('nav[role="tablist"]');
    if (nav) nav.style.boxShadow = 'none';
  });
  await capture(page, 35, 80);

  // ==========================================
  // SCENE 3: 0:40 - 1:15 | Live AQI Dashboard
  // ==========================================
  console.log('[Recorder] Scene 3 (0:40 - 1:15): Live AQI Dashboard & Telemetry...');
  // Select Delhi NCR in dropdown
  await page.select('#city-select', 'Delhi NCR');
  await sleep(800);
  await capture(page, 30, 80);

  // Click Refresh button
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Refresh Air Quality Data"]');
    if (btn) btn.click();
  });
  await sleep(600);
  await capture(page, 25, 80);

  // Zoom onto Centerpiece Gauge
  await smoothScroll(page, 150, 8, 50);
  await capture(page, 40, 80);

  // Pan to Inversion Banner & Metric Cards
  await smoothScroll(page, 380, 8, 50);
  await capture(page, 45, 80);

  // Scroll to 24-hr Diurnal Trend Chart
  await smoothScroll(page, 720, 10, 50);
  await capture(page, 35, 80);

  // Hover over the trend chart points to trigger floating tooltips
  await page.evaluate(() => {
    const rects = document.querySelectorAll('svg rect.cursor-pointer');
    if (rects.length > 6) {
      rects[6].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
  });
  await sleep(400);
  await capture(page, 25, 80);

  await page.evaluate(() => {
    const rects = document.querySelectorAll('svg rect.cursor-pointer');
    if (rects.length > 12) {
      rects[12].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
  });
  await sleep(400);
  await capture(page, 30, 80);

  // Scroll to Health Recommendations Section
  await smoothScroll(page, 1150, 8, 50);
  await capture(page, 40, 80);

  // ==========================================
  // SCENE 4: 1:15 - 1:40 | Smart Routine Planner
  // ==========================================
  console.log('[Recorder] Scene 4 (1:15 - 1:40): Smart Routine Planner & Commute Shield...');
  await smoothScroll(page, 0, 8, 40);

  // Click Routine Planner tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Planner') || b.textContent.includes('Routine'));
    if (t) t.click();
  });
  await sleep(800);
  await capture(page, 35, 80);

  // Click Student Persona
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Student'));
    if (b) b.click();
  });
  await sleep(500);
  await capture(page, 25, 80);

  // Click Family with Children Persona
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Family'));
    if (b) b.click();
  });
  await sleep(600);
  await capture(page, 30, 80);

  // Scroll down to Inhaled Dose Avoidance Math & Berkeley Earth Cigarette Avoidance
  await smoothScroll(page, 480, 8, 50);
  await capture(page, 45, 80);

  // Scroll down to 24-hr schedule comparison
  await smoothScroll(page, 950, 8, 50);
  await capture(page, 40, 80);

  // ==========================================
  // SCENE 5: 1:40 - 2:00 | Indoor Air Quality Simulator
  // ==========================================
  console.log('[Recorder] Scene 5 (1:40 - 2:00): Indoor Air Quality Simulator...');
  await smoothScroll(page, 0, 8, 40);

  // Click Indoor Air Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Indoor') || b.textContent.includes('IAQ'));
    if (t) t.click();
  });
  await sleep(800);
  await capture(page, 35, 80);

  // Adjust sliders on IAQ Simulator
  await smoothScroll(page, 320, 8, 50);
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="range"]');
    if (inputs[0]) {
      inputs[0].value = '80';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(500);
  await capture(page, 30, 80);

  // Toggle purifier mode to High
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.toLowerCase().includes('high') || btn.textContent.toLowerCase().includes('turbo'));
    if (b) b.click();
  });
  await sleep(600);
  await capture(page, 45, 80);

  // ==========================================
  // SCENE 6: 2:00 - 2:20 | DIY Air Purifier Guide
  // ==========================================
  console.log('[Recorder] Scene 6 (2:00 - 2:20): DIY Air Purifier Customizer & Blueprint...');
  await smoothScroll(page, 750, 8, 50);
  await capture(page, 30, 80);

  // Click 24" Fan size in Parametric Customizer
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('24"'));
    if (b) b.click();
  });
  await sleep(500);
  await capture(page, 25, 80);

  // Click 2" Pleat
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('2" Pleat'));
    if (b) b.click();
  });
  await sleep(500);
  await capture(page, 25, 80);

  // Scroll to Exploded 3D Corsi-Rosenthal Blueprint
  await smoothScroll(page, 1300, 8, 50);
  await capture(page, 30, 80);

  // Click Layer 02
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Layer 02'));
    if (b) b.click();
  });
  await sleep(500);
  await capture(page, 25, 80);

  // Click Layer 03 (Cardboard Shroud)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Layer 03'));
    if (b) b.click();
  });
  await sleep(500);
  await capture(page, 30, 80);

  // ==========================================
  // SCENE 7: 2:20 - 2:40 | AI Assistant and Community
  // ==========================================
  console.log('[Recorder] Scene 7 (2:20 - 2:40): AI Assistant & Community Action Hub...');
  await smoothScroll(page, 0, 8, 40);

  // Click AI Copilot tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('AI') || b.textContent.includes('Copilot'));
    if (t) t.click();
  });
  await sleep(800);
  await capture(page, 30, 80);

  // Click preset question: "How to protect an asthmatic 6-year-old in smog?"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('asthmatic 6-year-old') || btn.textContent.includes('asthmatic'));
    if (b) b.click();
  });
  await sleep(1500);
  await capture(page, 40, 80);

  // Switch to Community Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Community'));
    if (t) t.click();
  });
  await sleep(800);
  await capture(page, 30, 80);

  // Filter by Open Burning
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Open Burning'));
    if (b) b.click();
  });
  await sleep(500);
  await capture(page, 30, 80);

  // ==========================================
  // SCENE 8: 2:40 - 3:00 | Closing & Call to Action
  // ==========================================
  console.log('[Recorder] Scene 8 (2:40 - 3:00): Closing Montage & Final Screen...');
  // Quick return to Dashboard overview
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Dashboard') || b.textContent.includes('Overview'));
    if (t) t.click();
  });
  await sleep(600);
  await capture(page, 35, 80);

  // Display Cinematic Closing Screen Overlay
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'cinematic-closing-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.background = 'radial-gradient(circle at center, rgba(15, 23, 42, 0.96) 0%, rgba(7, 10, 15, 0.99) 100%)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'Inter, sans-serif';
    overlay.style.color = '#FFFFFF';
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 850px; padding: 40px; animation: fadeIn 1s ease;">
        <div style="width: 72px; height: 72px; border-radius: 20px; background: #059669; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.4); font-size: 36px;">
          🛡️
        </div>
        <h1 style="font-size: 64px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 16px 0; background: linear-gradient(135deg, #FFFFFF 0%, #10B981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          BreatheSmart AI
        </h1>
        <p style="font-size: 26px; font-weight: 600; color: #E2E8F0; margin: 0 0 20px 0; letter-spacing: -0.01em;">
          Understand the Air. Protect Your Health.
        </p>
        <p style="font-size: 18px; color: #94A3B8; line-height: 1.6; max-width: 700px; margin: 0 auto 36px auto;">
          BreatheSmart AI is more than an air quality dashboard. It's a step towards informed decisions, healthier routines, and cleaner indoor environments.
        </p>
        <div style="display: inline-flex; align-items: center; gap: 12px; padding: 12px 28px; border-radius: 16px; background: rgba(16, 185, 129, 0.15); border: 1.5px solid rgba(16, 185, 129, 0.5); color: #34D399; font-size: 18px; font-weight: 700; font-family: monospace; letter-spacing: 0.05em;">
          🌐 Explore: breathesmart-ai.onrender.com
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  });

  await capture(page, 75, 100); // 75 frames ~ 7.5s hold on final screen

  console.log(`[Recorder] Total frames captured: ${frameIndex}`);
  await browser.close();

  // ==========================================
  // FFMPEG COMPOSITING
  // ==========================================
  console.log('[Recorder] Encoding video with master audio and subtitles...');
  
  // Calculate exact input framerate so total video duration matches 180.00 seconds exactly
  const targetDuration = 180.0;
  const calculatedFramerate = (frameIndex / targetDuration).toFixed(4);
  console.log(`[Recorder] Input framerate to achieve exactly 180.0s: ${calculatedFramerate} fps`);

  // Use relative path with forward slashes for FFmpeg Windows subtitle filter
  const escapedSubtitles = 'scripts/subtitles.srt';
  
  const ffmpegCmd = [
    `"${FFMPEG_PATH}"`,
    `-y`,
    `-framerate ${calculatedFramerate}`,
    `-i "${path.join(FRAMES_DIR, 'frame_%05d.png')}"`,
    `-i "${AUDIO_PATH}"`,
    `-filter_complex "[0:v]subtitles='${escapedSubtitles}':force_style='FontName=Inter,FontSize=15,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H80000000,BorderStyle=4,Outline=1,Shadow=0,MarginV=35'[v]"`,
    `-map "[v]"`,
    `-map 1:a`,
    `-c:v libx264`,
    `-r 30`,
    `-pix_fmt yuv420p`,
    `-preset fast`,
    `-b:v 260k`,
    `-maxrate 320k`,
    `-bufsize 600k`,
    `-c:a copy`,
    `-t 180`,
    `"${OUTPUT_VIDEO}"`
  ].join(' ');

  console.log('[Recorder] Executing FFmpeg command...');
  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`[Recorder] SUCCESS! Video generated at: ${OUTPUT_VIDEO}`);

  // Cleanup temporary frames
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('[Recorder] Temporary frames removed cleanly.');
}

main().catch(err => {
  console.error('[Recorder Fatal Error]:', err);
  process.exit(1);
});
