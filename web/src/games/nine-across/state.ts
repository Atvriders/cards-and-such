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
  numTableau: 9,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type NineAcrossState = KlondikeFamilyState;
export type NineAcrossAction = KlondikeFamilyAction;
export interface NineAcrossSettings { _dummy?: undefined }

export function initialState(seed: number, _s: NineAcrossSettings): NineAcrossState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: NineAcrossState, a: NineAcrossAction): NineAcrossState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: NineAcrossState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
