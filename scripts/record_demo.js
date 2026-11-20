const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRAMES_DIR = path.resolve(__dirname, '../temp_frames');
const OUTPUT_VIDEO = path.resolve(__dirname, '../breathesmart_demo.mp4');
const FFMPEG_PATH = 'C:\\Users\\adiya\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';

let frameIndex = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture(page, count = 1, delay = 80) {
  for (let i = 0; i < count; i++) {
    frameIndex++;
    const frameNumber = String(frameIndex).padStart(5, '0');
    const filename = path.join(FRAMES_DIR, `frame_${frameNumber}.png`);
    await page.screenshot({ path: filename, type: 'png' });
    if (delay > 0) await sleep(delay);
  }
}

async function smoothScroll(page, targetY, steps = 10, stepDelay = 60) {
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

  console.log('[Recorder] Launching headless Chrome browser...');
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

  // --- SCENE 1: Atmospheric Particle Simulator & Clean Pulse ---
  console.log('[Recorder] Scene 1: Capturing Atmospheric Canvas & Clean Pulse...');
  await capture(page, 15, 80);

  // Click on the atmospheric canvas to deploy CADR pulse
  const canvasEl = await page.$('canvas');
  if (canvasEl) {
    const box = await canvasEl.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.55);
      await sleep(200);
      await capture(page, 12, 70);
      await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.45);
      await sleep(200);
      await capture(page, 10, 70);
    }
  }

  // --- SCENE 2: Meteorological Inversion Column & Lung Deposition ---
  console.log('[Recorder] Scene 2: Inversion Column & Lung Deposition Model...');
  await smoothScroll(page, 550, 10, 70);
  await capture(page, 15, 80);

  // Click Midday solar window on Inversion Column
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Midday'));
    if (btn) btn.click();
  });
  await sleep(500);
  await capture(page, 12, 80);

  // Click Night phase
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Night'));
    if (btn) btn.click();
  });
  await sleep(500);
  await capture(page, 12, 80);

  // Scroll down to Lung Deposition Visualizer
  await smoothScroll(page, 1150, 10, 70);
  await capture(page, 15, 80);

  // Click Outdoor Running in Lung Model
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Outdoor Running'));
    if (btn) btn.click();
  });
  await sleep(500);
  await capture(page, 14, 80);

  // Scroll back to top
  await smoothScroll(page, 0, 12, 50);
  await capture(page, 8, 80);

  // --- SCENE 3: Low-Emission Daily Routine Planner ---
  console.log('[Recorder] Scene 3: Routine Planner & Persona Switcher...');
  const tabs = await page.$$('nav button[role="tab"]');
  if (tabs[1]) {
    await tabs[1].click(); // Routine tab
    await sleep(600);
    await capture(page, 15, 80);

    // Click Student persona
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Student'));
      if (btn) btn.click();
    });
    await sleep(500);
    await capture(page, 10, 80);

    // Click Family persona
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Family'));
      if (btn) btn.click();
    });
    await sleep(500);
    await capture(page, 12, 80);

    // Scroll to see Inhaled Dose Math (-83%) & Cigarette Avoidance
    await smoothScroll(page, 450, 10, 70);
    await capture(page, 16, 80);

    // Scroll down to 24-hr schedule comparison
    await smoothScroll(page, 850, 10, 70);
    await capture(page, 16, 80);

    await smoothScroll(page, 0, 10, 50);
  }

  // --- SCENE 4: IAQ Simulator & DIY Corsi-Rosenthal Blueprint ---
  console.log('[Recorder] Scene 4: IAQ Differential Solver & Exploded Blueprint...');
  const updatedTabs = await page.$$('nav button[role="tab"]');
  if (updatedTabs[2]) {
    await updatedTabs[2].click(); // IAQ tab
    await sleep(600);
    await capture(page, 15, 80);

    // Switch to DIY Corsi-Rosenthal Blueprint sub-tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('DIY $35 Filter'));
      if (btn) btn.click();
    });
    await sleep(600);
    await capture(page, 15, 80);

    // Click Layer 02 (MERV 13 Filters)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Layer 02'));
      if (btn) btn.click();
    });
    await sleep(400);
    await capture(page, 12, 80);

    // Click Layer 03 (Cardboard Shroud)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Layer 03'));
      if (btn) btn.click();
    });
    await sleep(400);
    await capture(page, 12, 80);

    // Change fan speed to High
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim().toLowerCase() === 'high');
      if (btn) btn.click();
    });
    await sleep(400);
    await capture(page, 12, 80);
  }

  // --- SCENE 5: GenAI Smog Copilot ---
  console.log('[Recorder] Scene 5: GenAI Smog Copilot Chat...');
  const chatTab = (await page.$$('nav button[role="tab"]'))[3];
  if (chatTab) {
    await chatTab.click(); // Chat tab
    await sleep(600);
    await capture(page, 14, 80);

    // Click preset prompt for asthmatic child
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('asthmatic 6-year-old'));
      if (btn) btn.click();
    });

    await sleep(1400);
    await capture(page, 20, 80);
  }

  // --- SCENE 6: Community Smog Defense ---
  console.log('[Recorder] Scene 6: Community Defense Hub...');
  const commTab = (await page.$$('nav button[role="tab"]'))[4];
  if (commTab) {
    await commTab.click(); // Community tab
    await sleep(600);
    await capture(page, 14, 80);

    // Filter by Open Burning
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Open Burning'));
      if (btn) btn.click();
    });
    await sleep(400);
    await capture(page, 12, 80);
  }

  // Final overview frame
  await capture(page, 10, 80);

  console.log(`[Recorder] Total frames captured: ${frameIndex}`);
  await browser.close();

  // --- FFMPEG VIDEO COMPILATION ---
  console.log('[Recorder] Compiling frames into high-definition MP4 using FFmpeg...');
  const ffmpegCmd = `"${FFMPEG_PATH}" -y -framerate 12 -i "${path.join(FRAMES_DIR, 'frame_%05d.png')}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 "${OUTPUT_VIDEO}"`;
  
  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`[Recorder] Success! MP4 Video generated at: ${OUTPUT_VIDEO}`);

  // Cleanup temporary frames directory
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('[Recorder] Cleaned up temporary frame images.');
}

main().catch(err => {
  console.error('[Recorder Error]:', err);
  process.exit(1);
});
