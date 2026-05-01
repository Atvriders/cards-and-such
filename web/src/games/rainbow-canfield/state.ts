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
  stackKind: "any-suit",
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

export type RainbowCanfieldState = KlondikeFamilyState;
export type RainbowCanfieldAction = KlondikeFamilyAction;
export interface RainbowCanfieldSettings { _dummy?: undefined }

export function initialState(seed: number, _s: RainbowCanfieldSettings): RainbowCanfieldState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: RainbowCanfieldState, a: RainbowCanfieldAction): RainbowCanfieldState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: RainbowCanfieldState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
