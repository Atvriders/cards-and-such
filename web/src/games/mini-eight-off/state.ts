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
  numTableau: 4,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
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
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type MiniEightOffState = KlondikeFamilyState;
export type MiniEightOffAction = KlondikeFamilyAction;
export interface MiniEightOffSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniEightOffSettings): MiniEightOffState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MiniEightOffState, a: MiniEightOffAction): MiniEightOffState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MiniEightOffState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
