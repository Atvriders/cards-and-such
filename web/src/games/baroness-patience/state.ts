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
  numTableau: 5,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "any-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 1,
      faceUp: 1
    },
    {
      total: 1,
      faceUp: 1
    },
    {
      total: 1,
      faceUp: 1
    },
    {
      total: 1,
      faceUp: 1
    },
    {
      total: 1,
      faceUp: 1
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type BaronessPatienceState = KlondikeFamilyState;
export type BaronessPatienceAction = KlondikeFamilyAction;
export interface BaronessPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: BaronessPatienceSettings): BaronessPatienceState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: BaronessPatienceState, a: BaronessPatienceAction): BaronessPatienceState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: BaronessPatienceState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
