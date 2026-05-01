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
      total: 4,
      faceUp: 1
    },
    {
      total: 4,
      faceUp: 1
    },
    {
      total: 4,
      faceUp: 1
    },
    {
      total: 7,
      faceUp: 7
    },
    {
      total: 7,
      faceUp: 7
    },
    {
      total: 7,
      faceUp: 7
    },
    {
      total: 7,
      faceUp: 7
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type WaspPatState = KlondikeFamilyState;
export type WaspPatAction = KlondikeFamilyAction;
export interface WaspPatSettings { _dummy?: undefined }

export function initialState(seed: number, _s: WaspPatSettings): WaspPatState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: WaspPatState, a: WaspPatAction): WaspPatState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: WaspPatState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
