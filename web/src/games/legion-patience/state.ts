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
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type LegionPatienceState = KlondikeFamilyState;
export type LegionPatienceAction = KlondikeFamilyAction;
export interface LegionPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: LegionPatienceSettings): LegionPatienceState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: LegionPatienceState, a: LegionPatienceAction): LegionPatienceState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: LegionPatienceState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
