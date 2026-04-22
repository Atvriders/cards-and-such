import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarpetState, CarpetAction, CarpetSettings } from "./state.js";
import { canBuildFoundation, FOUNDATION_IDS, CELL_IDS, GRID_IDS } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import "./Carpet.css";
import type { Pile as PileType } from "../../engines/tableau/types.js";

export function Carpet({
  state,
  dispatch,
  onGameOver,
}: GameProps<CarpetState, CarpetSettings>): JSX.Element {

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  const wastePile: PileType = {
    id: "waste",
    kind: "waste",
    cards: state.waste.length > 0 ? [state.waste[state.waste.length - 1]!] : [],
    faceUpCount: 1,
  };

  const stockPile: PileType = {
    id: "stock",
    kind: "stock",
    cards: state.stock.map(() => ({ id: "back", suit: "♠" as const, rank: 1 as const })),
    faceUpCount: 0,
  };

  /** Try to play a card (from grid, cell, or waste) to the best foundation. */
  const tryPlayToFoundation = useCallback((fromPile: string) => {
    let card = null;
    if (fromPile === "waste") {
      card = state.waste[state.waste.length - 1];
    } else {
      const fp = getPile(fromPile);
      card = fp?.cards[fp.cards.length - 1];
    }
    if (!card) return;

    for (const fid of FOUNDATION_IDS) {
      const foundation = getPile(fid);
      if (foundation && canBuildFoundation(foundation, card)) {
        dispatch({ type: "play-to-foundation", fromPile, toPile: fid } as CarpetAction);
        return;
      }
    }
    // Try to park in an empty cell
    for (const cid of CELL_IDS) {
      const cell = getPile(cid);
      if (cell && cell.cards.length === 0) {
        dispatch({ type: "play-to-cell", fromPile, toPile: cid } as CarpetAction);
        return;
      }
    }
  }, [state, dispatch]);

  const tryCellToFoundation = useCallback((cellId: string) => {
    const cell = getPile(cellId);
    if (!cell || cell.cards.length === 0) return;
    const card = cell.cards[0]!;
    for (const fid of FOUNDATION_IDS) {
      const foundation = getPile(fid);
      if (foundation && canBuildFoundation(foundation, card)) {
        dispatch({ type: "play-cell-to-foundation", fromCell: cellId, toPile: fid } as CarpetAction);
        return;
      }
    }
  }, [state, dispatch]);

  return (
    <div className="carpet">
      <div className="carpet-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="carpet-top-row">
        <div>
          <div className="carpet-section-label">Stock / Waste</div>
          <div className="carpet-stock-area">
            <div
              className="pile-wrapper"
              onClick={() => dispatch({ type: "draw" } as CarpetAction)}
            >
              <Pile pile={stockPile} />
            </div>
            <div
              className="pile-wrapper"
              onClick={() => tryPlayToFoundation("waste")}
            >
              <Pile pile={wastePile} />
            </div>
          </div>
        </div>

        <div>
          <div className="carpet-section-label">Foundations</div>
          <div className="carpet-foundations">
            {FOUNDATION_IDS.map((fid) => (
              <div key={fid} className="pile-wrapper">
                <Pile pile={getPile(fid)} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="carpet-section-label">Free Cells</div>
          <div className="carpet-cells">
            {CELL_IDS.map((cid) => (
              <div
                key={cid}
                className="pile-wrapper"
                onClick={() => tryCellToFoundation(cid)}
              >
                <Pile pile={getPile(cid)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="carpet-section-label">Carpet (5×4 grid)</div>
      <div className="carpet-grid">
        {GRID_IDS.map((gid) => (
          <div
            key={gid}
            className="pile-wrapper"
            onClick={() => tryPlayToFoundation(gid)}
          >
            <Pile pile={getPile(gid)} />
          </div>
        ))}
      </div>
    </div>
  );
}
