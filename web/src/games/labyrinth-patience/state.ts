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
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type LabyrinthPatienceState = KlondikeFamilyState;
export type LabyrinthPatienceAction = KlondikeFamilyAction;
export interface LabyrinthPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: LabyrinthPatienceSettings): LabyrinthPatienceState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: LabyrinthPatienceState, a: LabyrinthPatienceAction): LabyrinthPatienceState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: LabyrinthPatienceState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
