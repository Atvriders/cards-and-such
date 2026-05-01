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

export type CarltonPatienceState = KlondikeFamilyState;
export type CarltonPatienceAction = KlondikeFamilyAction;
export interface CarltonPatienceSettings { _dummy?: undefined }

export function initialState(seed: number, _s: CarltonPatienceSettings): CarltonPatienceState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: CarltonPatienceState, a: CarltonPatienceAction): CarltonPatienceState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: CarltonPatienceState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
