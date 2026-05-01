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
  redealsAllowed: 0,
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

export type CarltonSoliState = KlondikeFamilyState;
export type CarltonSoliAction = KlondikeFamilyAction;
export interface CarltonSoliSettings { _dummy?: undefined }

export function initialState(seed: number, _s: CarltonSoliSettings): CarltonSoliState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: CarltonSoliState, a: CarltonSoliAction): CarltonSoliState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: CarltonSoliState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
