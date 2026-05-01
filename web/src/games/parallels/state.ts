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
  numTableau: 10,
  numFoundations: 8,
  drawCount: 1,
  redealsAllowed: 1,
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

export type ParallelsState = KlondikeFamilyState;
export type ParallelsAction = KlondikeFamilyAction;
export interface ParallelsSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ParallelsSettings): ParallelsState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: ParallelsState, a: ParallelsAction): ParallelsState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: ParallelsState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
