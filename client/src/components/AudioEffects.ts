/**
 * Tactile Web Audio API sound synthesizer for precision industrial UI feedback.
 * Zero external audio files required, ultra-low latency, respects user preference.
 */

let audioCtx: AudioContext | null = null;
let isSoundEnabled = false;

export const toggleSound = (): boolean => {
  isSoundEnabled = !isSoundEnabled;
  if (isSoundEnabled && !audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      isSoundEnabled = false;
    }
  }
  return isSoundEnabled;
};

export const getSoundEnabled = (): boolean => isSoundEnabled;

export const playTactileClick = (frequency = 800, duration = 0.02) => {
  if (!isSoundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Graceful fallback if audio context suspended
  }
};

export const playPurifierWhoosh = () => {
  if (!isSoundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch {
    // Ignore
  }
};
