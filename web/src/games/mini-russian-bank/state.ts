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
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type MiniRussianBankState = KlondikeFamilyState;
export type MiniRussianBankAction = KlondikeFamilyAction;
export interface MiniRussianBankSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniRussianBankSettings): MiniRussianBankState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MiniRussianBankState, a: MiniRussianBankAction): MiniRussianBankState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MiniRussianBankState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
