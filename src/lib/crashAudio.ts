// Synthesized Web Audio API sound effects & ambient loop for crash rooms

let audioCtx: AudioContext | null = null;
let musicInterval: number | null = null;
let musicStep = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  volume = 0.08,
  delaySec = 0
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const start = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + durationSec + 0.02);
}

export function playCrashSfx(
  event: 'bet' | 'launch' | 'cashout' | 'crash',
  enabled: boolean
) {
  if (!enabled) return;
  try {
    if (event === 'bet') {
      playTone(520, 0.08, 'triangle', 0.07, 0);
      playTone(760, 0.09, 'triangle', 0.06, 0.05);
    } else if (event === 'launch') {
      playTone(330, 0.14, 'sine', 0.06, 0);
      playTone(440, 0.16, 'sine', 0.06, 0.08);
    } else if (event === 'cashout') {
      playTone(587.33, 0.11, 'triangle', 0.09, 0);
      playTone(783.99, 0.12, 'triangle', 0.09, 0.08);
      playTone(1046.5, 0.22, 'sine', 0.1, 0.16);
    } else if (event === 'crash') {
      playTone(190, 0.18, 'sawtooth', 0.07, 0);
      playTone(110, 0.28, 'sawtooth', 0.08, 0.1);
    }
  } catch {
    // Ignore audio context restriction errors
  }
}

const AMBIENT_NOTES = [220, 261.63, 329.63, 392.0, 329.63, 293.66];

export function setCrashMusicEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  if (!enabled) {
    if (musicInterval !== null) {
      window.clearInterval(musicInterval);
      musicInterval = null;
    }
    return;
  }

  if (musicInterval !== null) return;
  try {
    getAudioContext();
    musicInterval = window.setInterval(() => {
      const note = AMBIENT_NOTES[musicStep % AMBIENT_NOTES.length];
      musicStep += 1;
      playTone(note, 0.55, 'sine', 0.025, 0);
    }, 680);
  } catch {
    // Ignore audio errors
  }
}
