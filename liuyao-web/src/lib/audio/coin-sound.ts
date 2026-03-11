/**
 * Play a pleasant metallic coin jingling sound — 叮铃铃
 * Uses Web Audio API, no external files.
 */
export function playCoinSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.25, now);
    master.connect(ctx.destination);

    // Helper: create a bell-like tone
    function bell(freq: number, startTime: number, duration: number, vol: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    // Three coin clinks in quick succession — 叮铃铃
    // First clink
    bell(4200, now, 0.4, 0.3);
    bell(6300, now, 0.25, 0.12);
    bell(2100, now, 0.5, 0.08);

    // Second clink (slightly delayed)
    bell(3800, now + 0.08, 0.35, 0.25);
    bell(5700, now + 0.08, 0.2, 0.1);

    // Third clink
    bell(4500, now + 0.18, 0.45, 0.2);
    bell(6800, now + 0.18, 0.3, 0.08);
    bell(2250, now + 0.18, 0.5, 0.06);

    // Gentle shimmer tail
    bell(3400, now + 0.3, 0.6, 0.06);
    bell(5100, now + 0.35, 0.5, 0.04);

    // Clean up
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Audio not available, silently skip
  }
}
