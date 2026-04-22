import { buildTiles, isFree, hasMatchingPair, isTerminal as baseTerm, TILE_FACES } from "../mahjong-solitaire-turtle/state.js";
import { PYRAMID_LAYOUT } from "../mahjong-solitaire-turtle/layouts.js";
import type { MahjongSolitaireState, MahjongAction } from "../mahjong-solitaire-turtle/state.js";

export type { MahjongSolitaireState, MahjongAction };
export { isFree, TILE_FACES };

export function initialState(seed: number): MahjongSolitaireState {
  const tiles = buildTiles(PYRAMID_LAYOUT, seed);
  return {
    tiles,
    selectedId: null,
    removed: 0,
    total: PYRAMID_LAYOUT.length,
    gameOver: false,
    won: false,
    moves: 0,
  };
}

export function reducer(state: MahjongSolitaireState, action: MahjongAction): MahjongSolitaireState {
  if (state.won || state.gameOver) return state;

  switch (action.type) {
    case "select": {
      const clickedTile = state.tiles.find((t) => t.id === action.id);
      if (!clickedTile || clickedTile.removed) return state;
      if (!isFree(clickedTile, state.tiles)) return state;

      if (state.selectedId === action.id) {
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: false } : t)),
          selectedId: null,
        };
      }

      if (state.selectedId === null) {
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: true } : t)),
          selectedId: action.id,
        };
      }

      const firstTile = state.tiles.find((t) => t.id === state.selectedId)!;
      if (firstTile.face === clickedTile.face) {
        const newTiles = state.tiles.map((t) =>
          t.id === firstTile.id || t.id === clickedTile.id
            ? { ...t, removed: true, selected: false }
            : t,
        );
        const newRemoved = state.removed + 2;
        const won = newRemoved === state.total;
        return {
          ...state,
          tiles: newTiles,
          selectedId: null,
          removed: newRemoved,
          won,
          moves: state.moves + 1,
          gameOver: won ? false : !hasMatchingPair(newTiles),
        };
      } else {
        return {
          ...state,
          tiles: state.tiles.map((t) => {
            if (t.id === firstTile.id) return { ...t, selected: false };
            if (t.id === action.id) return { ...t, selected: true };
            return t;
          }),
          selectedId: action.id,
        };
      }
    }

    case "check-dead": {
      if (!hasMatchingPair(state.tiles)) return { ...state, gameOver: true };
      return state;
    }

    default:
      return state;
  }
}

export { baseTerm as isTerminal };
