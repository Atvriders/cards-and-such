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
  numTableau: 7,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 1,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any"
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type HopscotchSolitaireState = KlondikeFamilyState;
export type HopscotchSolitaireAction = KlondikeFamilyAction;
export interface HopscotchSolitaireSettings { _dummy?: undefined }

export function initialState(seed: number, _s: HopscotchSolitaireSettings): HopscotchSolitaireState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: HopscotchSolitaireState, a: HopscotchSolitaireAction): HopscotchSolitaireState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: HopscotchSolitaireState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
