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

export type SelectiveCanfieldState = KlondikeFamilyState;
export type SelectiveCanfieldAction = KlondikeFamilyAction;
export interface SelectiveCanfieldSettings { _dummy?: undefined }

export function initialState(seed: number, _s: SelectiveCanfieldSettings): SelectiveCanfieldState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: SelectiveCanfieldState, a: SelectiveCanfieldAction): SelectiveCanfieldState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: SelectiveCanfieldState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
