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
  numTableau: 9,
  numFoundations: 8,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type UskPatienceState = KlondikeFamilyState;
export type UskPatienceAction = KlondikeFamilyAction;
export interface UskPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: UskPatienceSettings): UskPatienceState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: UskPatienceState, a: UskPatienceAction): UskPatienceState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: UskPatienceState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
