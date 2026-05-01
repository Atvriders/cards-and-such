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
  numTableau: 9,
  numFoundations: 8,
  drawCount: 1,
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "same-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 5,
      faceUp: 5
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type NapoleonsShoulderState = KlondikeFamilyState;
export type NapoleonsShoulderAction = KlondikeFamilyAction;
export interface NapoleonsShoulderSettings { _dummy?: undefined }

export function initialState(seed: number, _s: NapoleonsShoulderSettings): NapoleonsShoulderState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: NapoleonsShoulderState, a: NapoleonsShoulderAction): NapoleonsShoulderState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: NapoleonsShoulderState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
