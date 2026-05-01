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
  drawCount: 3,
  redealsAllowed: 2,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type ChineseKlondikeState = KlondikeFamilyState;
export type ChineseKlondikeAction = KlondikeFamilyAction;
export interface ChineseKlondikeSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ChineseKlondikeSettings): ChineseKlondikeState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: ChineseKlondikeState, a: ChineseKlondikeAction): ChineseKlondikeState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: ChineseKlondikeState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
