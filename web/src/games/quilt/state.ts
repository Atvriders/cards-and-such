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

export type QuiltState = KlondikeFamilyState;
export type QuiltAction = KlondikeFamilyAction;
export interface QuiltSettings { _dummy?: undefined }

export function initialState(seed: number, _s: QuiltSettings): QuiltState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: QuiltState, a: QuiltAction): QuiltState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: QuiltState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
