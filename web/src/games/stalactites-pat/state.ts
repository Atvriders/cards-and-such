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
  numTableau: 8,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
  stackKind: "any-suit",
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
    },
    {
      total: 6,
      faceUp: 6
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type StalactitesPatState = KlondikeFamilyState;
export type StalactitesPatAction = KlondikeFamilyAction;
export interface StalactitesPatSettings { _dummy?: undefined }

export function initialState(seed: number, _s: StalactitesPatSettings): StalactitesPatState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: StalactitesPatState, a: StalactitesPatAction): StalactitesPatState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: StalactitesPatState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
