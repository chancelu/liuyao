/**
 * Play a short, crisp metallic coin collision.
 * Uses Web Audio API, no external files.
 */
export function playCoinSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.22, now);
    master.connect(ctx.destination);

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

    function noiseBurst(startTime: number, duration: number, volume: number) {
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const source = ctx.createBufferSource();
      const bandpass = ctx.createBiquadFilter();
      const highpass = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      source.buffer = buffer;
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(5200, startTime);
      bandpass.Q.setValueAtTime(1.6, startTime);

      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(2600, startTime);

      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      source.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(master);

      source.start(startTime);
      source.stop(startTime + duration);
    }

    // Main impact: short, bright, metallic. Avoid the old "叮铃铃" tail.
    noiseBurst(now, 0.028, 0.16);
    partial('triangle', 4100, now, 0.001, 0.09, 0.19, 0, 3650);
    partial('square', 6100, now + 0.001, 0.001, 0.055, 0.06, 4, 5600);
    partial('triangle', 2550, now + 0.002, 0.001, 0.12, 0.05, -3, 2300);

    // Tiny secondary contact, like one coin lightly tapping after impact.
    const second = now + 0.045;
    noiseBurst(second, 0.018, 0.05);
    partial('triangle', 3600, second, 0.001, 0.05, 0.08, 2, 3300);
    partial('triangle', 2200, second + 0.001, 0.001, 0.07, 0.025, -2, 2050);

    setTimeout(() => ctx.close(), 500);
  } catch {
    // Audio not available, silently skip
  }
}
