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
    {
      total: 1,
      faceUp: 1
    },
    {
      total: 2,
      faceUp: 2
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 4,
      faceUp: 4
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 7,
      faceUp: 7
    },
    {
      total: 8,
      faceUp: 8
    },
    {
      total: 9,
      faceUp: 9
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type KingAlbertPatState = KlondikeFamilyState;
export type KingAlbertPatAction = KlondikeFamilyAction;
export interface KingAlbertPatSettings { _dummy?: undefined }

export function initialState(seed: number, _s: KingAlbertPatSettings): KingAlbertPatState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: KingAlbertPatState, a: KingAlbertPatAction): KingAlbertPatState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: KingAlbertPatState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
