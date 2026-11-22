/**
 * Tactile Web Audio API sound synthesizer for precision industrial UI feedback
 * and ambient indoor clean-air soundscapes (Brown Noise for indoor smog isolation calm).
 * Zero external audio files required, ultra-low latency, respects user preference.
 */

let audioCtx: AudioContext | null = null;
let isSoundEnabled = false;
let ambientSource: AudioNode | null = null;
let isAmbientPlaying = false;

function getContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const toggleSound = (): boolean => {
  isSoundEnabled = !isSoundEnabled;
  if (isSoundEnabled) {
    getContext();
  }
  return isSoundEnabled;
};

export const getSoundEnabled = (): boolean => isSoundEnabled;

export const playTactileClick = (frequency = 800, duration = 0.02) => {
  if (!isSoundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback
  }
};

export const playPurifierWhoosh = () => {
  if (!isSoundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Ignore
  }
};

/**
 * Procedural Brown Noise generator for indoor calm and masking air purifier hum
 */
export const toggleAmbientSoundscape = (): boolean => {
  const ctx = getContext();
  if (!ctx) return false;

  if (isAmbientPlaying) {
    if (ambientSource) {
      try {
        (ambientSource as AudioBufferSourceNode).stop();
        ambientSource.disconnect();
      } catch {}
      ambientSource = null;
    }
    isAmbientPlaying = false;
    return false;
  }

  try {
    // Generate 4 seconds of brown noise buffer and loop it
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 2.5; // Gain scaling
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Gentle low-pass filter to simulate gentle indoor airflow
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.035, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    ambientSource = whiteNoise;
    isAmbientPlaying = true;
    return true;
  } catch {
    isAmbientPlaying = false;
    return false;
  }
};

export const getAmbientPlaying = (): boolean => isAmbientPlaying;
