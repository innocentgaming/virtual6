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

  // --- SCENE 1: Real-time AQI Microclimate & Thermal Inversion Dashboard ---
  console.log('[Recorder] Scene 1: Capturing AQI & Inversion Radar...');
  await capture(page, 18, 90); // 1.5s initial view

  // Scroll down to view the 6 pollutant cards & vulnerability checklist
  await smoothScroll(page, 450, 12, 70);
  await capture(page, 15, 80);

  await smoothScroll(page, 750, 10, 70);
  await capture(page, 15, 80);

  // Scroll back to top
  await smoothScroll(page, 0, 10, 60);
  await capture(page, 8, 80);

  // Switch city to London
  console.log('[Recorder] Scene 1b: City switcher demo...');
  await page.select('#city-select', 'London');
  await sleep(800);
  await capture(page, 12, 90);

  // Switch back to Delhi NCR
  await page.select('#city-select', 'Delhi NCR');
  await sleep(800);
  await capture(page, 10, 90);

  // --- SCENE 2: Problem-to-Feature Traceability Matrix Modal ---
  console.log('[Recorder] Scene 2: Traceability Matrix Modal...');
  const traceabilityBtn = await page.$('button[title*="Traceability"]');
  if (traceabilityBtn) {
    await traceabilityBtn.click();
    await sleep(400);
    await capture(page, 15, 80);

    // Scroll inside traceability modal
    await page.evaluate(() => {
      const modalScroll = document.querySelector('[role="dialog"] .overflow-y-auto');
      if (modalScroll) modalScroll.scrollTop = 280;
    });
    await capture(page, 12, 80);

    // Close modal
    const closeBtn = await page.$('[role="dialog"] button[aria-label*="Close"]');
    if (closeBtn) await closeBtn.click();
    await sleep(300);
  }

  // --- SCENE 3: Low-Emission Daily Routine Planner ---
  console.log('[Recorder] Scene 3: Routine Planner & Persona Switcher...');
  const tabs = await page.$$('nav button[role="tab"]');
  if (tabs[1]) {
    await tabs[1].click(); // Routine tab
    await sleep(600);
    await capture(page, 15, 80);

    // Click Student persona
    const studentBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Student'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    await sleep(500);
    await capture(page, 10, 80);

    // Click Professional persona
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Professional'));
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

    // Scroll to see Inhaled Dose Math (-83%) & Berkeley Earth Cigarette Avoidance
    await smoothScroll(page, 480, 10, 70);
    await capture(page, 16, 90);

    // Scroll down to 24-hr schedule comparison
    await smoothScroll(page, 950, 12, 70);
    await capture(page, 20, 90);

    // Scroll back to top
    await smoothScroll(page, 0, 10, 60);
  }

  // --- SCENE 4: IAQ Simulator & DIY Corsi-Rosenthal Blueprint ---
  console.log('[Recorder] Scene 4: IAQ Simulator & DIY Purifier...');
  const updatedTabs = await page.$$('nav button[role="tab"]');
  if (updatedTabs[2]) {
    await updatedTabs[2].click(); // IAQ tab
    await sleep(600);
    await capture(page, 15, 80);

    // Toggle Accessible Table View
    const tableToggleBtn = await page.$('button[title*="Accessible"]');
    if (tableToggleBtn) {
      await tableToggleBtn.click();
      await sleep(300);
      await capture(page, 14, 80);
      // Toggle back to visual chart
      const chartToggleBtn = await page.$('button[title*="Visual"]');
      if (chartToggleBtn) await chartToggleBtn.click();
      await sleep(200);
    }

    // Switch to DIY Corsi-Rosenthal Blueprint sub-tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Corsi-Rosenthal'));
      if (btn) btn.click();
    });
    await sleep(500);
    await capture(page, 18, 90);

    // Scroll to see materials & 5 assembly steps
    await smoothScroll(page, 300, 8, 70);
    await capture(page, 15, 80);
    await smoothScroll(page, 0, 8, 60);
  }

  // --- SCENE 5: Dual-Engine GenAI Smog Copilot ---
  console.log('[Recorder] Scene 5: GenAI Smog Copilot Chat...');
  const chatTab = (await page.$$('nav button[role="tab"]'))[3];
  if (chatTab) {
    await chatTab.click(); // Chat tab
    await sleep(600);
    await capture(page, 14, 80);

    // Click suggested prompt for asthmatic child
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('asthmatic 6-year-old'));
      if (btn) btn.click();
    });

    // Wait for AI response to render
    await sleep(1400);
    await capture(page, 20, 80);

    // Scroll down inside chat
    await page.evaluate(() => {
      const chatContainer = document.querySelector('.overflow-y-auto');
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    });
    await capture(page, 12, 80);
  }

  // --- SCENE 6: Community Smog Defense & Clean Alternatives ---
  console.log('[Recorder] Scene 6: Community Action & Clean Transition Matrix...');
  const commTab = (await page.$$('nav button[role="tab"]'))[4];
  if (commTab) {
    await commTab.click(); // Community tab
    await sleep(600);
    await capture(page, 14, 80);

    // Upvote a report
    const upvoteBtn = await page.$('button[title*="Upvote"]');
    if (upvoteBtn) {
      await upvoteBtn.click();
      await sleep(300);
      await capture(page, 8, 80);
    }

    // Scroll down to view Sustainable Clean Alternatives Matrix
    await smoothScroll(page, 550, 10, 70);
    await capture(page, 18, 90);

    await smoothScroll(page, 0, 8, 60);
  }

  // --- SCENE 7: User Authentication, Security & Privacy Center ---
  console.log('[Recorder] Scene 7: Auth & Privacy Center Modal...');
  const authBtn = await page.$('button[title*="Account"]');
  if (authBtn) {
    await authBtn.click();
    await sleep(400);
    await capture(page, 15, 80);

    const closeAuthBtn = await page.$('[role="dialog"] button[aria-label*="Close"]');
    if (closeAuthBtn) await closeAuthBtn.click();
    await sleep(300);
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

  // Cleanup temporary frames directory to keep disk clean
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('[Recorder] Cleaned up temporary frame images.');
}

main().catch(err => {
  console.error('[Recorder Error]:', err);
  process.exit(1);
});
