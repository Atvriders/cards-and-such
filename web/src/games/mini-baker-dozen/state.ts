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
  numTableau: 13,
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
    },
    {
      total: 4,
      faceUp: 4
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type MiniBakerDozenState = KlondikeFamilyState;
export type MiniBakerDozenAction = KlondikeFamilyAction;
export interface MiniBakerDozenSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniBakerDozenSettings): MiniBakerDozenState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MiniBakerDozenState, a: MiniBakerDozenAction): MiniBakerDozenState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MiniBakerDozenState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
