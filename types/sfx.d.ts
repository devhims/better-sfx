// Shared shapes for the build scripts. Type checking only: nothing here runs.
import type { createKit } from '../src/kit.mjs';

export type { CatalogEntry } from '../skills/better-sfx/scripts/catalog.js';

/** The toolkit every recipe draws with. */
export type Kit = ReturnType<typeof createKit>;
/** Note name to frequency, e.g. n('C5'). */
export type NoteFn = (name: string) => number;
/** Schedules a sound's nodes from time 0. */
export type Play = (k: Kit, n: NoteFn) => void;

export interface FilterOpts {
  type?: BiquadFilterType;
  /** Start frequency in Hz. */
  f: number;
  /** Frequency to glide to. */
  to?: number;
  glide?: number;
  q?: number;
  t?: number;
}

export interface ToneOpts {
  f: number;
  to?: number;
  glide?: number;
  t?: number;
  a?: number;
  hold?: number;
  d?: number;
  g?: number;
  type?: OscillatorType;
  send?: number;
  vib?: { rate: number; depth: number } | null;
  filter?: FilterOpts | null;
  detune?: number;
}

export interface NoiseOpts {
  t?: number;
  a?: number;
  hold?: number;
  d?: number;
  g?: number;
  filter?: FilterOpts;
  send?: number;
}

export type StrikeKind = 'marimba' | 'bell' | 'glass' | 'vibes' | 'wood';

export interface StrikeOpts {
  f: number;
  t?: number;
  d?: number;
  g?: number;
  kind?: StrikeKind;
  send?: number;
  a?: number;
  vib?: { rate: number; depth: number } | null;
}

export interface FmOpts {
  f: number;
  ratio?: number;
  index?: number;
  indexTo?: number;
  t?: number;
  a?: number;
  d?: number;
  g?: number;
  send?: number;
  type?: OscillatorType;
}

export interface SpaceOpts {
  decay?: number;
  mix?: number;
  tone?: number;
}

/** A sound defined in code. */
export interface SynthRecipe {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  source: 'synth';
  play: Play;
  set?: string;
  action?: string;
  /** Loudness offset in dB from the library's normal level. */
  levelDb?: number;
  /** Built from shared style code, so play.toString() alone would not run. */
  generated?: boolean;
}

/** A sound generated with Seed Audio, plus the cleanup settings chosen by ear. */
export interface SeedPrompt {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  source: 'seed-audio';
  /** 'single' keeps one hit; 'all' keeps the whole gesture. */
  mode: 'single' | 'all';
  prompt: string;
  /** Length cap in seconds. */
  maxS?: number;
  /** Keep gaps up to this many ms, for rhythmic sounds like knocks. */
  rhythmMs?: number;
  /** Let a struck sound ring out longer. */
  ring?: boolean;
  levelDb?: number;
  /** Start at most this many seconds before the loudest moment. */
  preRollS?: number;
}

/** A style in the matching sets: how a note, a tap and a rush of air sound. */
export interface SetStyle {
  label: string;
  voice: string;
  root: string;
  tags: string[];
  setup: (k: Kit) => void;
  note: (k: Kit, f: number, t: number, d: number, g: number) => void;
  tap: (k: Kit, t: number, g: number, p: number) => void;
  air: (k: Kit, t: number, up: boolean, dur: number, g: number) => void;
}

/** One of the ten app actions every set covers. */
export interface SetAction {
  name: string;
  tags: string[];
  desc: string;
  level: number;
  play: (s: SetStyle, k: Kit, root: number) => void;
}
