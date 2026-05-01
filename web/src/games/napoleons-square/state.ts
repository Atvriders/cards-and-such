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
  numTableau: 12,
  numFoundations: 8,
  drawCount: 1,
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "same-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 4,
      faceUp: 4
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type NapoleonsSquareState = KlondikeFamilyState;
export type NapoleonsSquareAction = KlondikeFamilyAction;
export interface NapoleonsSquareSettings { _dummy?: undefined }

export function initialState(seed: number, _s: NapoleonsSquareSettings): NapoleonsSquareState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: NapoleonsSquareState, a: NapoleonsSquareAction): NapoleonsSquareState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: NapoleonsSquareState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
