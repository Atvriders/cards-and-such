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

export type HarpPatienceState = KlondikeFamilyState;
export type HarpPatienceAction = KlondikeFamilyAction;
export interface HarpPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: HarpPatienceSettings): HarpPatienceState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: HarpPatienceState, a: HarpPatienceAction): HarpPatienceState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: HarpPatienceState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
