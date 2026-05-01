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
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type GargantuaState = KlondikeFamilyState;
export type GargantuaAction = KlondikeFamilyAction;
export interface GargantuaSettings { _dummy?: undefined }

export function initialState(seed: number, _s: GargantuaSettings): GargantuaState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: GargantuaState, a: GargantuaAction): GargantuaState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: GargantuaState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
