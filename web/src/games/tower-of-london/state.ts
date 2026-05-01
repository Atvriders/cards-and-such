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
  numTableau: 8,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "any-suit",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type TowerOfLondonState = KlondikeFamilyState;
export type TowerOfLondonAction = KlondikeFamilyAction;
export interface TowerOfLondonSettings { _dummy?: undefined }

export function initialState(seed: number, _s: TowerOfLondonSettings): TowerOfLondonState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: TowerOfLondonState, a: TowerOfLondonAction): TowerOfLondonState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: TowerOfLondonState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
