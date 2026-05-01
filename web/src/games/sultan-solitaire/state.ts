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

export type SultanSolitaireState = KlondikeFamilyState;
export type SultanSolitaireAction = KlondikeFamilyAction;
export interface SultanSolitaireSettings { _dummy?: undefined }

export function initialState(seed: number, _s: SultanSolitaireSettings): SultanSolitaireState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: SultanSolitaireState, a: SultanSolitaireAction): SultanSolitaireState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: SultanSolitaireState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
