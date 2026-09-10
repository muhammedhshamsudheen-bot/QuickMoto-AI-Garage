/**
 * Web Audio API Synthesizer for Mechanical Workshop Sound Effects
 * Zero external audio assets required; runs reliably offline in all modern browsers.
 */

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleSound(forceState) {
  if (typeof forceState === "boolean") {
    soundEnabled = forceState;
  } else {
    soundEnabled = !soundEnabled;
  }
  return soundEnabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

/**
 * Clean subtle metallic click
 */
export function playClickSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.debug("Audio click error", e);
  }
}

/**
 * Mechanical ratchet / wrench torque sound
 */
export function playWrenchSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.04, 0.08, 0.12].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(600 + idx * 120, t + offset);
      osc.frequency.exponentialRampToValueAtTime(200, t + offset + 0.025);
      gain.gain.setValueAtTime(0.06, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.035);
    });
  } catch (e) {
    console.debug("Audio wrench error", e);
  }
}

/**
 * Pleasant success chime for diagnosis / estimate complete
 */
export function playSuccessChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, t + idx * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.35);
    });
  } catch (e) {
    console.debug("Audio chime error", e);
  }
}

/**
 * Urgent pulsating radar ping for Emergency SOS
 */
export function playSosPulse() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.linearRampToValueAtTime(440, t + 0.25);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  } catch (e) {
    console.debug("Audio SOS error", e);
  }
}
