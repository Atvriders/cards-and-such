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
  numTableau: 7,
  numFoundations: 8,
  drawCount: 7,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "same-color",
  emptyPolicy: "kings",
  columns: [
    {
      total: 1,
      faceUp: 1
    },
    {
      total: 2,
      faceUp: 1
    },
    {
      total: 3,
      faceUp: 1
    },
    {
      total: 4,
      faceUp: 1
    },
    {
      total: 5,
      faceUp: 1
    },
    {
      total: 6,
      faceUp: 1
    },
    {
      total: 7,
      faceUp: 1
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type AgnesSorelState = KlondikeFamilyState;
export type AgnesSorelAction = KlondikeFamilyAction;
export interface AgnesSorelSettings { _dummy?: undefined }

export function initialState(seed: number, _s: AgnesSorelSettings): AgnesSorelState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: AgnesSorelState, a: AgnesSorelAction): AgnesSorelState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: AgnesSorelState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
