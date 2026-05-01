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
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
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
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type QuadrupleAllianceState = KlondikeFamilyState;
export type QuadrupleAllianceAction = KlondikeFamilyAction;
export interface QuadrupleAllianceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: QuadrupleAllianceSettings): QuadrupleAllianceState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: QuadrupleAllianceState, a: QuadrupleAllianceAction): QuadrupleAllianceState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: QuadrupleAllianceState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
