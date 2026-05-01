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
  numTableau: 6,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
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

export type StonewallState = KlondikeFamilyState;
export type StonewallAction = KlondikeFamilyAction;
export interface StonewallSettings { _dummy?: undefined }

export function initialState(seed: number, _s: StonewallSettings): StonewallState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: StonewallState, a: StonewallAction): StonewallState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: StonewallState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
