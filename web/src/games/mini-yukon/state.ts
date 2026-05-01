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
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
  stackKind: "any-suit",
  emptyPolicy: "any",
  columns: [
    {
      total: 1,
      faceUp: 1
    },
    {
      total: 4,
      faceUp: 3
    },
    {
      total: 5,
      faceUp: 4
    },
    {
      total: 6,
      faceUp: 5
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type MiniYukonState = KlondikeFamilyState;
export type MiniYukonAction = KlondikeFamilyAction;
export interface MiniYukonSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniYukonSettings): MiniYukonState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MiniYukonState, a: MiniYukonAction): MiniYukonState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MiniYukonState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
