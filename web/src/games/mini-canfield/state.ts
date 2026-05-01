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
  drawCount: 3,
  redealsAllowed: -1,
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
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type MiniCanfieldState = KlondikeFamilyState;
export type MiniCanfieldAction = KlondikeFamilyAction;
export interface MiniCanfieldSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniCanfieldSettings): MiniCanfieldState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MiniCanfieldState, a: MiniCanfieldAction): MiniCanfieldState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MiniCanfieldState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
