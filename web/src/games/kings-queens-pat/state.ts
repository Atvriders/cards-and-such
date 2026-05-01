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

export type KingsQueensPatState = KlondikeFamilyState;
export type KingsQueensPatAction = KlondikeFamilyAction;
export interface KingsQueensPatSettings { _dummy?: undefined }

export function initialState(seed: number, _s: KingsQueensPatSettings): KingsQueensPatState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: KingsQueensPatState, a: KingsQueensPatAction): KingsQueensPatState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: KingsQueensPatState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
