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
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "same-suit",
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

export type AmericanToadState = KlondikeFamilyState;
export type AmericanToadAction = KlondikeFamilyAction;
export interface AmericanToadSettings { _dummy?: undefined }

export function initialState(seed: number, _s: AmericanToadSettings): AmericanToadState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: AmericanToadState, a: AmericanToadAction): AmericanToadState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: AmericanToadState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
