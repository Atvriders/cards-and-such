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

export type SuperiorCanfieldState = KlondikeFamilyState;
export type SuperiorCanfieldAction = KlondikeFamilyAction;
export interface SuperiorCanfieldSettings { _dummy?: undefined }

export function initialState(seed: number, _s: SuperiorCanfieldSettings): SuperiorCanfieldState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: SuperiorCanfieldState, a: SuperiorCanfieldAction): SuperiorCanfieldState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: SuperiorCanfieldState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
