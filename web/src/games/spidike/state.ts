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
  stackKind: "any-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 6,
      faceUp: 1
    },
    {
      total: 6,
      faceUp: 1
    },
    {
      total: 6,
      faceUp: 1
    },
    {
      total: 6,
      faceUp: 1
    },
    {
      total: 5,
      faceUp: 1
    },
    {
      total: 5,
      faceUp: 1
    },
    {
      total: 5,
      faceUp: 1
    },
    {
      total: 5,
      faceUp: 1
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type SpidikeState = KlondikeFamilyState;
export type SpidikeAction = KlondikeFamilyAction;
export interface SpidikeSettings { _dummy?: undefined }

export function initialState(seed: number, _s: SpidikeSettings): SpidikeState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: SpidikeState, a: SpidikeAction): SpidikeState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: SpidikeState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
