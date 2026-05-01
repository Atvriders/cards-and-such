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
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "same-suit",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type ToadHoleState = KlondikeFamilyState;
export type ToadHoleAction = KlondikeFamilyAction;
export interface ToadHoleSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ToadHoleSettings): ToadHoleState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: ToadHoleState, a: ToadHoleAction): ToadHoleState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: ToadHoleState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
