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
  numTableau: 8,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type ChessboardState = KlondikeFamilyState;
export type ChessboardAction = KlondikeFamilyAction;
export interface ChessboardSettings { _dummy?: undefined }

export function initialState(seed: number, _s: ChessboardSettings): ChessboardState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: ChessboardState, a: ChessboardAction): ChessboardState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: ChessboardState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
