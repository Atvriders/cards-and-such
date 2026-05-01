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
  numTableau: 6,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 0,
  hasStock: false,
  hasWaste: false,
  stackKind: "same-suit",
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

export type MiniSpider1suitState = KlondikeFamilyState;
export type MiniSpider1suitAction = KlondikeFamilyAction;
export interface MiniSpider1suitSettings { _dummy?: undefined }

export function initialState(seed: number, _s: MiniSpider1suitSettings): MiniSpider1suitState {
  void _s;
  return makeKlondikeFamilyState(seed, cfg);
}

export function reducer(s: MiniSpider1suitState, a: MiniSpider1suitAction): MiniSpider1suitState {
  return reduceKlondikeFamily(s, a, cfg, ruleset);
}

export function isTerminal(s: MiniSpider1suitState): { score: number } | null {
  return isKlondikeFamilyTerminal(s, cfg);
}
