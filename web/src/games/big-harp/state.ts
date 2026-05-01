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

export type BigHarpState = KlondikeFamilyState;
export type BigHarpAction = KlondikeFamilyAction;
export interface BigHarpSettings { _dummy?: undefined }

export function initialState(seed: number, _s: BigHarpSettings): BigHarpState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: BigHarpState, a: BigHarpAction): BigHarpState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: BigHarpState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
