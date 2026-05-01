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
  numTableau: 5,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
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
    },
    {
      total: 3,
      faceUp: 3
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type MiniEmperorState = KlondikeFamilyState;
export type MiniEmperorAction = KlondikeFamilyAction;
export interface MiniEmperorSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniEmperorSettings): MiniEmperorState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MiniEmperorState, a: MiniEmperorAction): MiniEmperorState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MiniEmperorState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
