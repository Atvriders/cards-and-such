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
  numTableau: 4,
  numFoundations: 8,
  drawCount: 1,
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
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
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type DuchessLuynesState = KlondikeFamilyState;
export type DuchessLuynesAction = KlondikeFamilyAction;
export interface DuchessLuynesSettings { _dummy?: undefined }

export function initialState(seed: number, _s: DuchessLuynesSettings): DuchessLuynesState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: DuchessLuynesState, a: DuchessLuynesAction): DuchessLuynesState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: DuchessLuynesState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
