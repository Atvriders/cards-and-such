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

export type WaspState = KlondikeFamilyState;
export type WaspAction = KlondikeFamilyAction;
export interface WaspSettings { _dummy?: undefined }

export function initialState(seed: number, _s: WaspSettings): WaspState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: WaspState, a: WaspAction): WaspState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: WaspState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
