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
  numTableau: 17,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 3,
  hasStock: false,
  hasWaste: false,
  stackKind: "same-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 1,
      faceUp: 1
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type ThreeShufflesAndADrawState = KlondikeFamilyState;
export type ThreeShufflesAndADrawAction = KlondikeFamilyAction;
export interface ThreeShufflesAndADrawSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ThreeShufflesAndADrawSettings): ThreeShufflesAndADrawState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: ThreeShufflesAndADrawState, a: ThreeShufflesAndADrawAction): ThreeShufflesAndADrawState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: ThreeShufflesAndADrawState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
