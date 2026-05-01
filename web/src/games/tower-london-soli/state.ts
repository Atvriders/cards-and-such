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
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "any-suit",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type TowerLondonSoliState = KlondikeFamilyState;
export type TowerLondonSoliAction = KlondikeFamilyAction;
export interface TowerLondonSoliSettings { _dummy?: undefined }

export function initialState(seed: number, _s: TowerLondonSoliSettings): TowerLondonSoliState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: TowerLondonSoliState, a: TowerLondonSoliAction): TowerLondonSoliState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: TowerLondonSoliState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
