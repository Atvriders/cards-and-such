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
  numTableau: 8,
  numFoundations: 8,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: true,
  hasWaste: true,
  stackKind: "same-color",
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
    },
    {
      total: 1,
      faceUp: 1
    }
  ]
};
export const ruleset = makeKlondikeFamilyRuleset(cfg);

export type RoyalRendezvousState = KlondikeFamilyState;
export type RoyalRendezvousAction = KlondikeFamilyAction;
export interface RoyalRendezvousSettings { _dummy?: undefined }

export function initialState(seed: number, _s: RoyalRendezvousSettings): RoyalRendezvousState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: RoyalRendezvousState, a: RoyalRendezvousAction): RoyalRendezvousState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: RoyalRendezvousState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
