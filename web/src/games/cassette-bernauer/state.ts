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
  stackKind: "same-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type CassetteBernauerState = KlondikeFamilyState;
export type CassetteBernauerAction = KlondikeFamilyAction;
export interface CassetteBernauerSettings { _dummy?: undefined }

export function initialState(seed: number, _s: CassetteBernauerSettings): CassetteBernauerState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: CassetteBernauerState, a: CassetteBernauerAction): CassetteBernauerState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: CassetteBernauerState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
