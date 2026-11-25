const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRAMES_DIR = path.resolve(__dirname, '../reel_anim_frames');
const OUTPUT_VIDEO = path.resolve(__dirname, '../BreatheSmart_AI_Animated_Reel.mp4');
const FFMPEG_PATH = 'C:\\Users\\adiya\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';
const AUDIO_PATH = path.resolve(__dirname, 'reel_animated_full_audio.aac');

const FPS = 30;
const DURATION = 36;
const TOTAL_FRAMES = FPS * DURATION; // 1080 real distinct frames

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  console.log('[Animated Reel] Launching Chrome at 1080x1920...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1080, height: 1920 },
    args: [
      '--window-size=1080,1920',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  console.log('[Animated Reel] Loading http://localhost:5000/reel_stage.html...');
  await page.goto('http://localhost:5000/reel_stage.html', { waitUntil: 'networkidle2' });
  await sleep(2000); // Ensure iframe React app finishes initial data fetch

  // Track which one-shot DOM actions have been triggered
  const triggered = new Set();

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f / FPS;

    // Trigger real website interactions inside the same-origin iframe at exact moments
    if (t >= 5.4 && !triggered.has('city')) {
      triggered.add('city');
      await page.evaluate(() => {
        const doc = document.getElementById('app-frame').contentDocument;
        if (!doc) return;
        const sel = doc.querySelector('#city-select') || doc.querySelector('select');
        if (sel) {
          sel.value = 'Delhi NCR';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }

    if (t >= 7.6 && !triggered.has('refresh')) {
      triggered.add('refresh');
      await page.evaluate(() => {
        const doc = document.getElementById('app-frame').contentDocument;
        if (!doc) return;
        const btn = doc.querySelector('button[aria-label="Refresh Air Quality Data"]') || doc.querySelector('button[title*="Refresh"]');
        if (btn) btn.click();
      });
    }

    // Smooth dashboard scroll during Scene 2 (8.5s -> 12.5s)
    if (t >= 8.5 && t <= 12.5) {
      const u = (t - 8.5) / 4.0;
      const scrollY = Math.round(u * 480);
      await page.evaluate((y) => {
        const win = document.getElementById('app-frame').contentWindow;
        if (win) win.scrollTo(0, y);
      }, scrollY);
    }

    if (t >= 13.7 && !triggered.has('planner')) {
      triggered.add('planner');
      await page.evaluate(() => {
        const win = document.getElementById('app-frame').contentWindow;
        const doc = document.getElementById('app-frame').contentDocument;
        if (win) win.scrollTo(0, 0);
        if (!doc) return;
        const tabs = Array.from(doc.querySelectorAll('button[role="tab"], nav button'));
        const tab = tabs.find(b => b.textContent.includes('Planner') || b.textContent.includes('Routine'));
        if (tab) tab.click();
      });
    }

    if (t >= 15.4 && !triggered.has('family')) {
      triggered.add('family');
      await page.evaluate(() => {
        const doc = document.getElementById('app-frame').contentDocument;
        if (!doc) return;
        const btns = Array.from(doc.querySelectorAll('button'));
        const b = btns.find(btn => btn.textContent.includes('Family'));
        if (b) b.click();
      });
    }

    if (t >= 17.2 && !triggered.has('indoor')) {
      triggered.add('indoor');
      await page.evaluate(() => {
        const win = document.getElementById('app-frame').contentWindow;
        const doc = document.getElementById('app-frame').contentDocument;
        if (win) win.scrollTo(0, 0);
        if (!doc) return;
        const tabs = Array.from(doc.querySelectorAll('button[role="tab"], nav button'));
        const tab = tabs.find(b => b.textContent.includes('Indoor') || b.textContent.includes('IAQ'));
        if (tab) tab.click();
      });
    }

    // Smoothly drag CADR slider from 20 -> 90 (18.8s -> 21.0s)
    if (t >= 18.8 && t <= 21.2) {
      const u = Math.min(1, (t - 18.8) / 2.2);
      const val = Math.round(20 + u * 70);
      await page.evaluate((v) => {
        const win = document.getElementById('app-frame').contentWindow;
        const doc = document.getElementById('app-frame').contentDocument;
        if (win) win.scrollTo(0, 320);
        if (!doc) return;
        const slider = doc.querySelector('input[type="range"]');
        if (slider) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(slider, String(v));
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, val);
    }

    if (t >= 23.0 && !triggered.has('ai')) {
      triggered.add('ai');
      await page.evaluate(() => {
        const win = document.getElementById('app-frame').contentWindow;
        const doc = document.getElementById('app-frame').contentDocument;
        if (win) win.scrollTo(0, 0);
        if (!doc) return;
        const tabs = Array.from(doc.querySelectorAll('button[role="tab"], nav button'));
        const tab = tabs.find(b => b.textContent.includes('AI') || b.textContent.includes('Copilot'));
        if (tab) tab.click();
      });
    }

    if (t >= 24.6 && !triggered.has('prompt')) {
      triggered.add('prompt');
      await page.evaluate(() => {
        const doc = document.getElementById('app-frame').contentDocument;
        if (!doc) return;
        const btns = Array.from(doc.querySelectorAll('button'));
        const b = btns.find(btn => btn.textContent.includes('asthmatic'));
        if (b) b.click();
      });
    }

    // Smooth scroll down to read AI response
    if (t >= 26.0 && t <= 27.6) {
      const u = (t - 26.0) / 1.6;
      const scrollY = Math.round(u * 360);
      await page.evaluate((y) => {
        const win = document.getElementById('app-frame').contentWindow;
        if (win) win.scrollTo(0, y);
      }, scrollY);
    }

    if (t >= 28.0 && !triggered.has('community')) {
      triggered.add('community');
      await page.evaluate(() => {
        const win = document.getElementById('app-frame').contentWindow;
        const doc = document.getElementById('app-frame').contentDocument;
        if (win) win.scrollTo(0, 0);
        if (!doc) return;
        const tabs = Array.from(doc.querySelectorAll('button[role="tab"], nav button'));
        const tab = tabs.find(b => b.textContent.includes('Community'));
        if (tab) tab.click();
      });
    }

    if (t >= 30.8 && !triggered.has('outro_reset')) {
      triggered.add('outro_reset');
      await page.evaluate(() => {
        const win = document.getElementById('app-frame').contentWindow;
        const doc = document.getElementById('app-frame').contentDocument;
        if (win) win.scrollTo(0, 0);
        if (!doc) return;
        const tabs = Array.from(doc.querySelectorAll('button[role="tab"], nav button'));
        const tab = tabs.find(b => b.textContent.includes('Dashboard') || b.textContent.includes('Overview'));
        if (tab) tab.click();
      });
    }

    // Step deterministic animation to exact timestamp t
    await page.evaluate((timeSec) => {
      if (typeof window.renderAtTime === 'function') {
        window.renderAtTime(timeSec);
      }
    }, t);

    // Extra wait after clicking AI prompt so response renders
    if (Math.abs(t - 25.0) < 0.02) {
      await sleep(900);
    }

    const frameName = `frame_${String(f + 1).padStart(5, '0')}.jpg`;
    await page.screenshot({
      path: path.join(FRAMES_DIR, frameName),
      type: 'jpeg',
      quality: 92
    });

    if (f % 90 === 0) {
      console.log(`[Animated Reel] Rendered ${f}/${TOTAL_FRAMES} frames (${t.toFixed(1)}s / ${DURATION}s)...`);
    }
  }

  console.log(`[Animated Reel] All ${TOTAL_FRAMES} frames rendered! Closing Chrome...`);
  await browser.close();

  console.log('[Animated Reel] Encoding 30 FPS H.264 MP4 with FFmpeg...');
  const ffmpegCmd = [
    `"${FFMPEG_PATH}"`,
    `-y`,
    `-framerate ${FPS}`,
    `-i "${path.join(FRAMES_DIR, 'frame_%05d.jpg')}"`,
    `-i "${AUDIO_PATH}"`,
    `-c:v libx264`,
    `-pix_fmt yuv420p`,
    `-preset medium`,
    `-crf 22`,
    `-c:a copy`,
    `-movflags +faststart`,
    `-t ${DURATION}`,
    `"${OUTPUT_VIDEO}"`
  ].join(' ');

  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`[Animated Reel] SUCCESS! Video created at: ${OUTPUT_VIDEO}`);

  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}

main().catch(err => {
  console.error('[Animated Reel Error]:', err);
  process.exit(1);
});
