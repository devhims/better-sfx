// The public format of https://sfx.video2ctx.dev/catalog.json.
// The build writes it, the website reads it, and sfx.mjs reads it on
// users' machines, so a change here is a change for every agent.

/** One sound in catalog.json. */
export interface CatalogEntry {
  /** Stable id, used in file names and page URLs: sounds/<id>.wav, sound/<id>/ */
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  /** 'synth' is made in code with Web Audio; 'seed-audio' is a generated recording. */
  source: 'synth' | 'seed-audio';
  /** Matching-set sounds only: the set (glass, wood, soft, retro, mechanical) and the action. */
  set?: string;
  action?: string;
  /** Seed Audio sounds only: the prompt that generated the recording. */
  prompt?: string;
  /** Length in seconds. */
  duration: number;
  /** 48 peak levels from 0 to 1, for drawing the waveform. */
  peaks: number[];
  /** Paths relative to catalog.json. */
  files: { wav: string; m4a: string };
  /** Standalone code sounds only: the recipe's source. */
  code?: string;
}
