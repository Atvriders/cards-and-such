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
  copies: 1,
  firingSquad: true
};

export type AcesUpFiringSquadState = AcesUpFamilyState;
export type AcesUpFiringSquadAction = AcesUpFamilyAction;
export interface AcesUpFiringSquadSettings { _dummy?: undefined }

export function initialState(seed: number, _s: AcesUpFiringSquadSettings): AcesUpFiringSquadState {
  void _s;
  return makeAcesUpFamilyState(seed, cfg);
}

export function reducer(s: AcesUpFiringSquadState, a: AcesUpFiringSquadAction): AcesUpFiringSquadState {
  return reduceAcesUpFamily(s, a, cfg);
}

export function isTerminal(s: AcesUpFiringSquadState): { score: number } | null {
  return isAcesUpFamilyTerminal(s, cfg);
}
