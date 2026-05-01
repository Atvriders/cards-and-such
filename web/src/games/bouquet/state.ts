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
  stackKind: "alt-color",
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

export type BouquetState = KlondikeFamilyState;
export type BouquetAction = KlondikeFamilyAction;
export interface BouquetSettings { _dummy?: undefined }

export function initialState(seed: number, _s: BouquetSettings): BouquetState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: BouquetState, a: BouquetAction): BouquetState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: BouquetState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
