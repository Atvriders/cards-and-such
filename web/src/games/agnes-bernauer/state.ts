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
  numTableau: 7,
  numFoundations: 8,
  drawCount: 7,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "same-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type AgnesBernauerState = KlondikeFamilyState;
export type AgnesBernauerAction = KlondikeFamilyAction;
export interface AgnesBernauerSettings { _dummy?: undefined }

export function initialState(seed: number, _s: AgnesBernauerSettings): AgnesBernauerState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: AgnesBernauerState, a: AgnesBernauerAction): AgnesBernauerState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: AgnesBernauerState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
