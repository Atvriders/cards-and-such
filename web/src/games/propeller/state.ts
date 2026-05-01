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
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type PropellerState = KlondikeFamilyState;
export type PropellerAction = KlondikeFamilyAction;
export interface PropellerSettings { _dummy?: undefined }

export function initialState(seed: number, _s: PropellerSettings): PropellerState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: PropellerState, a: PropellerAction): PropellerState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: PropellerState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
