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
  numTableau: 7,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
  stackKind: "any-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 3,
      faceUp: 1
    },
    {
      total: 3,
      faceUp: 1
    },
    {
      total: 3,
      faceUp: 1
    },
    {
      total: 3,
      faceUp: 1
    },
    {
      total: 3,
      faceUp: 1
    },
    {
      total: 3,
      faceUp: 1
    },
    {
      total: 3,
      faceUp: 1
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type WillOWispState = KlondikeFamilyState;
export type WillOWispAction = KlondikeFamilyAction;
export interface WillOWispSettings { _dummy?: undefined }

export function initialState(seed: number, _s: WillOWispSettings): WillOWispState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: WillOWispState, a: WillOWispAction): WillOWispState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: WillOWispState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
