import {
  makeAcesUpFamilyState,
  reduceAcesUpFamily,
  isAcesUpFamilyTerminal,
  type AcesUpFamilyAction,
  type AcesUpFamilyConfig,
  type AcesUpFamilyState,
} from "../_shared/solitaire-family-engine.js";

export const cfg: AcesUpFamilyConfig = {
  drawCount: 4,
  copies: 1
};

export type IdiotsDelightState = AcesUpFamilyState;
export type IdiotsDelightAction = AcesUpFamilyAction;
export interface IdiotsDelightSettings { _dummy?: undefined }

export function initialState(seed: number, _s: IdiotsDelightSettings): IdiotsDelightState {
  void _s;
  return makeAcesUpFamilyState(seed, cfg);
}

export function reducer(s: IdiotsDelightState, a: IdiotsDelightAction): IdiotsDelightState {
  return reduceAcesUpFamily(s, a, cfg);
}

export function isTerminal(s: IdiotsDelightState): { score: number } | null {
  return isAcesUpFamilyTerminal(s, cfg);
}
