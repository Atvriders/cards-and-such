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

export type LadyOfTheManorState = KlondikeFamilyState;
export type LadyOfTheManorAction = KlondikeFamilyAction;
export interface LadyOfTheManorSettings { _dummy?: undefined }

export function initialState(seed: number, _s: LadyOfTheManorSettings): LadyOfTheManorState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: LadyOfTheManorState, a: LadyOfTheManorAction): LadyOfTheManorState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: LadyOfTheManorState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
