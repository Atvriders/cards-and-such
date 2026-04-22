import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SultanState, SultanAction, SultanSettings } from "./state.js";
import { canBuildOnFoundation, SULTAN_ID } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import "./SultanOfTurkey.css";

const FOUNDATION_IDS = ["f1","f2","f3","f4","f5"];
const RESERVE_IDS = ["r1","r2","r3","r4"];

export function SultanOfTurkey({
  state,
  dispatch,
  onGameOver,
}: GameProps<SultanState, SultanSettings>): JSX.Element {

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  const handleWasteClick = useCallback(() => {
    if (state.waste.length === 0) return;
    const topCard = state.waste[state.waste.length - 1]!;
    // Try foundations first
    for (const fid of FOUNDATION_IDS) {
      if (fid === SULTAN_ID) continue;
      const fp = getPile(fid);
      if (fp && canBuildOnFoundation(fp, topCard)) {
        dispatch({ type: "play-waste", toPile: fid } as SultanAction);
        return;
      }
    }
    // Then reserve
    for (const rid of RESERVE_IDS) {
      const rp = getPile(rid);
      if (rp && rp.cards.length === 0) {
        dispatch({ type: "play-waste", toPile: rid } as SultanAction);
        return;
      }
    }
  }, [state, dispatch]);

  const handleReserveClick = useCallback((rid: string) => {
    const rp = getPile(rid);
    if (!rp || rp.cards.length === 0) return;
    const topCard = rp.cards[rp.cards.length - 1]!;
    for (const fid of FOUNDATION_IDS) {
      if (fid === SULTAN_ID) continue;
      const fp = getPile(fid);
      if (fp && canBuildOnFoundation(fp, topCard)) {
        dispatch({ type: "play-reserve", fromPile: rid, toPile: fid } as SultanAction);
        return;
      }
    }
  }, [state, dispatch]);

  if (state.won) onGameOver(state.score);

  const wastePile: import("../../engines/tableau/types.js").Pile = {
    id: "waste",
    kind: "waste",
    cards: state.waste.length > 0 ? [state.waste[state.waste.length - 1]!] : [],
    faceUpCount: 1,
  };

  const stockPile: import("../../engines/tableau/types.js").Pile = {
    id: "stock",
    kind: "stock",
    cards: state.stock.map(() => ({ id: "back", suit: "♠" as const, rank: 1 as const })),
    faceUpCount: 0,
  };

  return (
    <div className="sultan">
      <div className="sultan-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="sultan-main">
        <div className="sultan-stock-area">
          <div className="sultan-label">Stock / Waste</div>
          <div className="sultan-waste-area">
            <div
              className="pile-wrapper"
              onClick={() => dispatch({ type: "draw" } as SultanAction)}
              style={{ cursor: "pointer" }}
            >
              <Pile pile={stockPile} />
            </div>
            <div
              className="pile-wrapper"
              onClick={handleWasteClick}
              style={{ cursor: "pointer" }}
            >
              <Pile pile={wastePile} />
            </div>
          </div>
          <div className="sultan-label">Reserve</div>
          <div className="sultan-reserve">
            {RESERVE_IDS.map((rid) => (
              <div
                key={rid}
                className="pile-wrapper"
                onClick={() => handleReserveClick(rid)}
                style={{ cursor: "pointer" }}
              >
                <Pile pile={getPile(rid)} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sultan-label">Foundations (build K→A→2→…→Q)</div>
          <div className="sultan-foundations">
            {FOUNDATION_IDS.map((fid) => (
              <div key={fid} className="pile-wrapper" title={fid === SULTAN_ID ? "Sultan (fixed)" : undefined}>
                <Pile pile={getPile(fid)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
