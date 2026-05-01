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
  hasStock: false,
  hasWaste: false,
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
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type LadyOfManorState = KlondikeFamilyState;
export type LadyOfManorAction = KlondikeFamilyAction;
export interface LadyOfManorSettings { _dummy?: undefined }

export function initialState(seed: number, _s: LadyOfManorSettings): LadyOfManorState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: LadyOfManorState, a: LadyOfManorAction): LadyOfManorState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: LadyOfManorState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
