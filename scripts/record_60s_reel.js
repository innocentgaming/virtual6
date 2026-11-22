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

async function smoothScroll(page, targetY, steps = 8, stepDelay = 40) {
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

  console.log('[Reel Recorder] Launching Chrome (1080x1920 9:16)...');
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
  // SCENE 1: 0:00 - 0:05 | Hook & Kinetic Intro
  // ==========================================
  console.log('[Reel Recorder] Scene 1 (0:00 - 0:05): Hook & Cinematic Intro...');
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'reel-hook-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.background = 'radial-gradient(circle at center, rgba(15, 23, 42, 0.96) 0%, rgba(3, 7, 18, 0.99) 100%)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'Inter, sans-serif';
    overlay.style.color = '#FFFFFF';
    overlay.style.padding = '40px';
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 900px; animation: fadeIn 0.8s ease;">
        <div style="width: 100px; height: 100px; border-radius: 28px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px auto; box-shadow: 0 15px 35px rgba(5, 150, 105, 0.5); font-size: 52px;">
          🛡️
        </div>
        <div style="display: inline-flex; align-items: center; gap: 10px; padding: 10px 24px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); border: 1.5px solid rgba(16, 185, 129, 0.5); color: #34D399; font-size: 20px; font-weight: 800; margin-bottom: 28px; letter-spacing: 0.15em;">
          INTRODUCING BREATHE SMART AI
        </div>
        <h1 style="font-size: 64px; font-weight: 900; letter-spacing: -0.03em; margin: 0 0 24px 0; line-height: 1.15; background: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Understand the air you breathe.
        </h1>
        <p style="font-size: 26px; color: #38BDF8; font-weight: 600; line-height: 1.4; max-width: 800px; margin: 0 auto;">
          Winter Smog & Urban Clean-Air Navigator
        </p>
      </div>
    `;
    document.body.appendChild(overlay);
  });

  await capture(page, 25, 70); // Hold hook card

  // Fade out hook overlay to reveal app
  await page.evaluate(() => {
    const overlay = document.getElementById('reel-hook-overlay');
    if (overlay) overlay.style.transition = 'opacity 0.6s ease';
    if (overlay) overlay.style.opacity = '0';
  });
  await sleep(600);
  await page.evaluate(() => {
    const overlay = document.getElementById('reel-hook-overlay');
    if (overlay) overlay.remove();
  });

  await capture(page, 15, 60);

  // ==========================================
  // SCENE 2: 0:05 - 0:15 | Live AQI Dashboard
  // ==========================================
  console.log('[Reel Recorder] Scene 2 (0:05 - 0:15): Live AQI Dashboard & Indicators...');
  // Select Delhi NCR
  await page.select('#city-select', 'Delhi NCR');
  await sleep(400);
  await capture(page, 15, 60);

  // Trigger Refresh Data
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Refresh Air Quality Data"]');
    if (btn) btn.click();
  });
  await sleep(400);
  await capture(page, 20, 60);

  // Pan down to Centerpiece Gauge & Pollutants
  await smoothScroll(page, 200, 6, 40);
  await capture(page, 25, 60);

  // Pan to PM2.5, PM10 & Thermal Inversion Alert
  await smoothScroll(page, 450, 6, 40);
  await capture(page, 25, 60);

  // ==========================================
  // SCENE 3: 0:15 - 0:25 | Routine Planner
  // ==========================================
  console.log('[Reel Recorder] Scene 3 (0:15 - 0:25): Routine Planner & Persona Mode...');
  await smoothScroll(page, 0, 6, 30);

  // Switch to Routine Planner Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Planner') || b.textContent.includes('Routine'));
    if (t) t.click();
  });
  await sleep(700);
  await capture(page, 20, 60);

  // Toggle Family Persona
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Family'));
    if (b) b.click();
  });
  await sleep(500);
  await capture(page, 20, 60);

  // Scroll down to Inhaled Dose Avoidance Math & Schedule
  await smoothScroll(page, 550, 8, 40);
  await capture(page, 30, 60);

  // ==========================================
  // SCENE 4: 0:25 - 0:35 | IAQ Simulator
  // ==========================================
  console.log('[Reel Recorder] Scene 4 (0:25 - 0:35): Indoor Air Quality Simulator...');
  await smoothScroll(page, 0, 6, 30);

  // Switch to Indoor Air Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Indoor') || b.textContent.includes('IAQ'));
    if (t) t.click();
  });
  await sleep(700);
  await capture(page, 20, 60);

  // Scroll to Simulation Controls
  await smoothScroll(page, 380, 6, 40);
  // Adjust CADR slider
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="range"]');
    if (inputs[0]) {
      inputs[0].value = '85';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(400);
  await capture(page, 20, 60);

  // Toggle Turbo / High Purifier Mode
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.toLowerCase().includes('high') || btn.textContent.toLowerCase().includes('turbo'));
    if (b) b.click();
  });
  await sleep(500);
  await capture(page, 25, 60);

  // ==========================================
  // SCENE 5: 0:35 - 0:45 | AI Assistant
  // ==========================================
  console.log('[Reel Recorder] Scene 5 (0:35 - 0:45): AI Assistant Interaction...');
  await smoothScroll(page, 0, 6, 30);

  // Switch to AI Assistant Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('AI') || b.textContent.includes('Copilot'));
    if (t) t.click();
  });
  await sleep(700);
  await capture(page, 15, 60);

  // Click pre-set question: "How to protect an asthmatic 6-year-old in smog?"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('asthmatic 6-year-old') || btn.textContent.includes('asthmatic'));
    if (b) b.click();
  });
  await sleep(1500);
  await capture(page, 25, 60);

  // Scroll to read AI response & medical safety triage notice
  await smoothScroll(page, 350, 6, 40);
  await capture(page, 25, 60);

  // ==========================================
  // SCENE 6: 0:45 - 0:53 | DIY Purifier & Community
  // ==========================================
  console.log('[Reel Recorder] Scene 6 (0:45 - 0:53): DIY Purifier & Community Section...');
  // Quick switch to Indoor Air to show Corsi-Rosenthal Blueprint
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Indoor') || b.textContent.includes('IAQ'));
    if (t) t.click();
  });
  await sleep(500);
  await smoothScroll(page, 1100, 6, 30);
  await capture(page, 20, 60);

  // Switch to Community Tab
  await smoothScroll(page, 0, 6, 30);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Community'));
    if (t) t.click();
  });
  await sleep(600);
  await capture(page, 20, 60);

  // Filter Community Reports
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Open Burning'));
    if (b) b.click();
  });
  await sleep(400);
  await capture(page, 15, 60);

  // ==========================================
  // SCENE 7: 0:53 - 1:00 | Closing Showcase & Logo
  // ==========================================
  console.log('[Reel Recorder] Scene 7 (0:53 - 1:00): Fast Montage & Final Logo Screen...');
  // Quick return to Dashboard overview
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const t = tabs.find(b => b.textContent.includes('Dashboard') || b.textContent.includes('Overview'));
    if (t) t.click();
  });
  await sleep(400);
  await smoothScroll(page, 150, 4, 30);
  await capture(page, 15, 60);

  // Final Cinematic Logo Card (9:16 vertical optimized)
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'reel-closing-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.background = 'radial-gradient(circle at center, rgba(15, 23, 42, 0.98) 0%, rgba(3, 7, 18, 1) 100%)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'Inter, sans-serif';
    overlay.style.color = '#FFFFFF';
    overlay.style.padding = '50px';
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 900px; animation: fadeIn 0.8s ease;">
        <div style="width: 120px; height: 120px; border-radius: 36px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 36px auto; box-shadow: 0 20px 45px rgba(5, 150, 105, 0.6); font-size: 64px;">
          🛡️
        </div>
        <h1 style="font-size: 68px; font-weight: 900; letter-spacing: -0.03em; margin: 0 0 16px 0; background: linear-gradient(135deg, #FFFFFF 0%, #10B981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          BreatheSmart AI
        </h1>
        <p style="font-size: 32px; font-weight: 700; color: #F1F5F9; margin: 0 0 24px 0; letter-spacing: -0.01em;">
          Understand the Air.<br/>Protect Your Health.
        </p>
        <p style="font-size: 22px; color: #94A3B8; line-height: 1.5; max-width: 750px; margin: 0 auto 44px auto;">
          One platform. Smarter air awareness.<br/>Scientific daily planning & DIY clean-air tools.
        </p>
        <div style="display: inline-flex; align-items: center; gap: 14px; padding: 16px 36px; border-radius: 20px; background: rgba(16, 185, 129, 0.18); border: 2px solid rgba(16, 185, 129, 0.6); color: #34D399; font-size: 24px; font-weight: 800; font-family: monospace; letter-spacing: 0.05em; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25);">
          🌐 breathesmart-ai.onrender.com
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  });

  await capture(page, 35, 70); // Hold final screen

  console.log(`[Reel Recorder] Total vertical frames captured: ${frameIndex}`);
  await browser.close();

  // ==========================================
  // FFMPEG VERTICAL COMPOSITING (9:16)
  // ==========================================
  console.log('[Reel Recorder] Encoding 1080x1920 vertical Reel with master audio & subtitles...');
  
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
    `-filter_complex "[0:v]subtitles='${escapedSubtitles}':force_style='FontName=Inter,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H90000000,BorderStyle=4,Outline=1,Shadow=0,MarginV=140'[v]"`,
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
