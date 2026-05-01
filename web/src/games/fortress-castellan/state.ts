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
  numTableau: 10,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
  stackKind: "same-suit",
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

export type FortressCastellanState = KlondikeFamilyState;
export type FortressCastellanAction = KlondikeFamilyAction;
export interface FortressCastellanSettings { _dummy?: undefined }

export function initialState(seed: number, _s: FortressCastellanSettings): FortressCastellanState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: FortressCastellanState, a: FortressCastellanAction): FortressCastellanState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: FortressCastellanState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
