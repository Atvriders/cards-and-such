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
  numTableau: 9,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
  stackKind: "alt-color",
  emptyPolicy: "any",
  columns: [
    { total: 6, faceUp: 6 },
    { total: 6, faceUp: 6 },
    { total: 6, faceUp: 6 },
    { total: 6, faceUp: 6 },
    { total: 6, faceUp: 6 },
    { total: 6, faceUp: 6 },
    { total: 6, faceUp: 6 },
    { total: 5, faceUp: 5 },
    { total: 5, faceUp: 5 }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type RaglanPatienceState = KlondikeFamilyState;
export type RaglanPatienceAction = KlondikeFamilyAction;
export interface RaglanPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: RaglanPatienceSettings): RaglanPatienceState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: RaglanPatienceState, a: RaglanPatienceAction): RaglanPatienceState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: RaglanPatienceState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
