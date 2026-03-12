/**
 * Play ancient bronze coin collision sound (古铜钱碰撞声).
 *
 * Characteristics:
 * - Mid-frequency, not bright/glassy — more like old bronze
 * - Short, crisp attack with quick decay
 * - Three coins with slightly different pitches
 * - Subtle randomness so it doesn't sound robotic
 *
 * Uses Web Audio API, no external files.
 */
export function playCoinSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime + 0.01;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.28, now);
    master.connect(ctx.destination);

    /** Random deviation factor: e.g. jitter(0.05) → 0.95 ~ 1.05 */
    const jitter = (pct: number) => 1 + (Math.random() * 2 - 1) * pct;

    /**
     * Single oscillator partial with fast attack and exponential decay.
     */
    function partial(
      type: OscillatorType,
      freq: number,
      startTime: number,
      attack: number,
      decay: number,
      volume: number,
      detune = 0,
      sweepTo?: number,
    ) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      if (sweepTo) {
        osc.frequency.exponentialRampToValueAtTime(sweepTo, startTime + decay);
      }
      osc.detune.setValueAtTime(detune, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

      osc.connect(gain);
      gain.connect(master);
      osc.start(startTime);
      osc.stop(startTime + decay + 0.02);
    }

    /**
     * Very short noise burst to simulate metal-on-metal friction/impact.
     */
    function noiseBurst(startTime: number, duration: number, volume: number) {
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const source = ctx.createBufferSource();
      const bandpass = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      source.buffer = buffer;
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2800, startTime);
      bandpass.Q.setValueAtTime(1.2, startTime);

      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      source.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(master);

      source.start(startTime);
      source.stop(startTime + duration);
    }

    /**
     * Single ancient bronze coin hit.
     * Layers: impact noise + triangle body + sine sub-harmonic + square edge
     */
    function coinHit(time: number, baseFreq: number, vol: number) {
      const f = baseFreq * jitter(0.04);
      const v = vol * jitter(0.08);

      // Impact transient — short noise burst
      noiseBurst(time, 0.025 * jitter(0.15), v * 0.55);

      // Body — triangle wave, mid-frequency, the main "铮" tone
      partial('triangle', f, time, 0.002, 0.16 * jitter(0.1), v * 0.85, 0, f * 0.78);

      // Sub-harmonic — sine wave, gives thickness/weight
      partial('sine', f * 0.55, time + 0.001, 0.002, 0.12 * jitter(0.1), v * 0.45, 0, f * 0.42);

      // High edge — square wave, very quiet, adds metallic bite
      partial('square', f * 1.6, time, 0.001, 0.04 * jitter(0.15), v * 0.12, jitter(0.5) * 8, f * 1.3);
    }

    // Three coins colliding in quick succession, each with different pitch
    // Simulates tossing three bronze coins onto a surface
    coinHit(now, 1150, 0.22);                              // coin 1 — mid
    coinHit(now + 0.055 * jitter(0.12), 1340, 0.19);       // coin 2 — slightly higher
    coinHit(now + 0.115 * jitter(0.10), 960, 0.24);        // coin 3 — lower, heavier

    setTimeout(() => ctx.close(), 600);
  } catch {
    // Audio not available, silently skip
  }
}
