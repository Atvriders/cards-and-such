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
  numTableau: 7,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
  stackKind: "any-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 1,
      faceUp: 1
    },
    {
      total: 6,
      faceUp: 5
    },
    {
      total: 7,
      faceUp: 5
    },
    {
      total: 8,
      faceUp: 5
    },
    {
      total: 9,
      faceUp: 5
    },
    {
      total: 10,
      faceUp: 5
    },
    {
      total: 11,
      faceUp: 5
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type MoosehideState = KlondikeFamilyState;
export type MoosehideAction = KlondikeFamilyAction;
export interface MoosehideSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MoosehideSettings): MoosehideState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MoosehideState, a: MoosehideAction): MoosehideState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MoosehideState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
