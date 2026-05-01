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
  numTableau: 4,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
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
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type FlorentineSoliState = KlondikeFamilyState;
export type FlorentineSoliAction = KlondikeFamilyAction;
export interface FlorentineSoliSettings { _dummy?: undefined }

export function initialState(seed: number, _s: FlorentineSoliSettings): FlorentineSoliState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: FlorentineSoliState, a: FlorentineSoliAction): FlorentineSoliState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: FlorentineSoliState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
