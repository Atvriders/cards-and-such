import {
  makeKlondikeFamilyRuleset,
  makeKlondikeFamilyState,
  reduceKlondikeFamily,
  isKlondikeFamilyTerminal,
  type KlondikeFamilyAction,
  type KlondikeFamilyConfig,
  type KlondikeFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: KlondikeFamilyConfig = {
  copies: 1,
  numTableau: 7,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type MethuselahState = KlondikeFamilyState;
export type MethuselahAction = KlondikeFamilyAction;
export interface MethuselahSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MethuselahSettings): MethuselahState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MethuselahState, a: MethuselahAction): MethuselahState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MethuselahState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
