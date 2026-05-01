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

export type QuiltPatState = KlondikeFamilyState;
export type QuiltPatAction = KlondikeFamilyAction;
export interface QuiltPatSettings { _dummy?: undefined }

export function initialState(seed: number, _s: QuiltPatSettings): QuiltPatState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: QuiltPatState, a: QuiltPatAction): QuiltPatState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: QuiltPatState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
