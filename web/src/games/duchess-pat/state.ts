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
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any",
  columns: [
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    },
    {
      total: 3,
      faceUp: 3
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type DuchessPatState = KlondikeFamilyState;
export type DuchessPatAction = KlondikeFamilyAction;
export interface DuchessPatSettings { _dummy?: undefined }

export function initialState(seed: number, _s: DuchessPatSettings): DuchessPatState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: DuchessPatState, a: DuchessPatAction): DuchessPatState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: DuchessPatState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
