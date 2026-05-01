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
  numTableau: 16,
  numFoundations: 8,
  drawCount: 1,
  redealsAllowed: 3,
  hasStock: false,
  hasWaste: false,
  stackKind: "same-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 6,
      faceUp: 6
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type CrescentSolitaireState = KlondikeFamilyState;
export type CrescentSolitaireAction = KlondikeFamilyAction;
export interface CrescentSolitaireSettings { _dummy?: undefined }

export function initialState(seed: number, _s: CrescentSolitaireSettings): CrescentSolitaireState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: CrescentSolitaireState, a: CrescentSolitaireAction): CrescentSolitaireState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: CrescentSolitaireState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
