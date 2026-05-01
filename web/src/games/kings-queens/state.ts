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
  copies: 2,
  numTableau: 8,
  numFoundations: 8,
  drawCount: 1,
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type KingsQueensState = KlondikeFamilyState;
export type KingsQueensAction = KlondikeFamilyAction;
export interface KingsQueensSettings { _dummy?: undefined }

export function initialState(seed: number, _s: KingsQueensSettings): KingsQueensState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: KingsQueensState, a: KingsQueensAction): KingsQueensState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: KingsQueensState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
