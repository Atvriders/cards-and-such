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
  numTableau: 10,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
  stackKind: "alt-color",
  emptyPolicy: "any",
  columns: [
    {
      total: 10,
      faceUp: 10
    },
    {
      total: 9,
      faceUp: 9
    },
    {
      total: 8,
      faceUp: 8
    },
    {
      total: 7,
      faceUp: 7
    },
    {
      total: 6,
      faceUp: 6
    },
    {
      total: 5,
      faceUp: 5
    },
    {
      total: 4,
      faceUp: 4
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

export type SomersetState = KlondikeFamilyState;
export type SomersetAction = KlondikeFamilyAction;
export interface SomersetSettings { _dummy?: undefined }

export function initialState(seed: number, _s: SomersetSettings): SomersetState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: SomersetState, a: SomersetAction): SomersetState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: SomersetState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
