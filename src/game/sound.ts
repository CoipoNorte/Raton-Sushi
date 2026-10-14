/**
 * ────────────────────────────────────────────────────────────────
 *  Raton Sushi · Sonido ASMR de sushi bar
 *  Todo se sintetiza con WebAudio en caliente: cero archivos de
 *  audio. Toc sobre madera, hilo de salsa (sizzle aburi), corte
 *  fino de cuchillo, arpegio pentatónico de éxito, fanfarria de
 *  récord, zumbido de error y tictac del cronómetro.
 * ────────────────────────────────────────────────────────────────
 */
import { storage } from "./storage";

type ToneOpts = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  at?: number; // retardo en segundos
  glideTo?: number;
};

type NoiseOpts = {
  dur: number;
  from: number; // frecuencia inicial del filtro
  to: number; // frecuencia final
  type?: BiquadFilterType;
  vol?: number;
  at?: number;
  q?: number;
};

class SushiSfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted: boolean = storage.getMuted();

  setMuted(m: boolean): void {
    this.muted = m;
  }
  isMuted(): boolean {
    return this.muted;
  }

  /** Llamar desde un gesto del usuario para desbloquear el audio. */
  unlock(): void {
    this.ensure();
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  private ready(): boolean {
    return !this.muted && this.ensure() !== null;
  }

  /** Tono corto con envolvente exponencial (redonda, sin clics). */
  private tone({ freq, dur, type = "sine", vol = 0.4, at = 0, glideTo }: ToneOpts): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, glideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  /** Ruido filtrado con barrido (sizzle, cuchillo, maracas). */
  private noise({ dur, from, to, type = "bandpass", vol = 0.3, at = 0, q = 1.2 }: NoiseOpts): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + at;
    const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.02, dur * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
  }

  /* ─── Efectos públicos ─────────────────────────────────────── */

  /** Clic de interfaz (pestañas, botones pequeños). */
  click(): void {
    if (!this.ready()) return;
    this.tone({ freq: 1250, dur: 0.05, type: "triangle", vol: 0.18 });
  }

  /** Toc seco sobre la tabla de madera (colocar ingrediente). */
  place(): void {
    if (!this.ready()) return;
    this.tone({ freq: 195, dur: 0.09, type: "sine", vol: 0.5, glideTo: 150 });
    this.noise({ dur: 0.05, from: 900, to: 300, type: "lowpass", vol: 0.22 });
  }

  /** Hilo de salsa cayendo: chisporroteo aburi cortito. */
  sizzle(): void {
    if (!this.ready()) return;
    this.noise({ dur: 0.42, from: 2600, to: 500, vol: 0.28, q: 0.9 });
    this.tone({ freq: 420, dur: 0.1, vol: 0.08, at: 0.05 });
  }

  /** Corte fino de cuchillo yanagiba (al servir). */
  cut(): void {
    if (!this.ready()) return;
    this.noise({ dur: 0.13, from: 4200, to: 700, type: "highpass", vol: 0.22, q: 0.8 });
    this.tone({ freq: 240, dur: 0.06, vol: 0.16, at: 0.1 });
  }

  /** Arpegio pentatónico ascendente; sube con la racha de combo. */
  success(streak: number): void {
    if (!this.ready()) return;
    const scale = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const start = Math.min(Math.max(0, streak - 1), 2);
    for (let i = 0; i < 4; i++) {
      this.tone({ freq: scale[start + i], dur: 0.16, type: "triangle", vol: 0.32, at: i * 0.075 });
    }
    this.tone({ freq: 1760, dur: 0.22, type: "sine", vol: 0.12, at: 0.3 });
  }

  /** Zumbido suave de error + golpecito de madera apagado. */
  fail(): void {
    if (!this.ready()) return;
    this.tone({ freq: 180, dur: 0.24, type: "sawtooth", vol: 0.14, glideTo: 105 });
    this.tone({ freq: 92, dur: 0.2, type: "sine", vol: 0.2, glideTo: 70 });
  }

  /** Tictac del cronómetro en los últimos segundos. */
  tick(): void {
    if (!this.ready()) return;
    this.tone({ freq: 940, dur: 0.045, type: "square", vol: 0.07 });
  }

  /** Fanfarria de nuevo récord histórico. */
  record(): void {
    if (!this.ready()) return;
    const hits = [523.25, 659.25, 783.99, 1046.5];
    hits.forEach((f, i) => {
      this.tone({ freq: f, dur: 0.34, type: "triangle", vol: 0.34, at: i * 0.14 });
      this.tone({ freq: f * 1.26, dur: 0.3, type: "sine", vol: 0.16, at: i * 0.14 });
      this.noise({ dur: 0.1, from: 6000, to: 3000, type: "highpass", vol: 0.1, at: i * 0.14 });
    });
    this.tone({ freq: 2093, dur: 0.5, type: "sine", vol: 0.14, at: 0.6 });
  }

  /** Cierre de jornada (fin de ronda sin récord). */
  closing(): void {
    if (!this.ready()) return;
    [659.25, 523.25, 440].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.22, type: "triangle", vol: 0.24, at: i * 0.16 });
    });
  }
}

/** Singleton compartido por todo el juego. */
export const sfx = new SushiSfx();
