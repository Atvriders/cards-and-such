import { useCallback } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArchwayState, ArchwayAction } from "./state.js";
import "./Archway.css";

const RANK_LABELS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function CardFace({ suit, rank }: { suit: string; rank: number }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div className={`archway-card ${red ? "red" : "black"}`}>
      <span className="archway-card-rank">{RANK_LABELS[rank]}</span>
      <span className="archway-card-suit">{suit}</span>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return <div className="archway-card archway-empty">{label}</div>;
}

export function Archway({
  state,
  dispatch,
  onGameOver,
}: GameProps<ArchwayState, {}>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const handleFanClick = useCallback(
    (fanIndex: number) => {
      const fan = state.fans[fanIndex];
      if (!fan || fan.length === 0) return;
      const card = fan[fan.length - 1]!;
      // Try ascending foundations 0-3 first, then descending 4-7
      for (let fi = 0; fi < 8; fi++) {
        const asc = fi < 4;
        const found = state.foundations[fi]!;
        if (found.length === 0) {
          if (asc && card.rank === 1) {
            dispatch({ type: "move-fan", fanIndex, toPile: `f${fi}` } as ArchwayAction);
            return;
          }
          if (!asc && card.rank === 13) {
            dispatch({ type: "move-fan", fanIndex, toPile: `f${fi}` } as ArchwayAction);
            return;
          }
        } else {
          const top = found[found.length - 1]!;
          if (asc && top.suit === card.suit && (top.rank as number) + 1 === (card.rank as number)) {
            dispatch({ type: "move-fan", fanIndex, toPile: `f${fi}` } as ArchwayAction);
            return;
          }
          if (!asc && top.suit === card.suit && (top.rank as number) - 1 === (card.rank as number)) {
            dispatch({ type: "move-fan", fanIndex, toPile: `f${fi}` } as ArchwayAction);
            return;
          }
        }
      }
    },
    [state.fans, state.foundations, dispatch],
  );

  const handleDraw = useCallback(() => {
    dispatch({ type: "draw" } as ArchwayAction);
  }, [dispatch]);

  const topCard = (pile: Card[]) =>
    pile.length > 0 ? pile[pile.length - 1]! : null;

  return (
    <div className="archway">
      <div className="archway-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="archway-foundations">
        <div className="archway-found-group">
          <span className="archway-label">A→K</span>
          {(state.foundations.slice(0, 4) as Card[][]).map((f: Card[], i: number) => {
            const tc = topCard(f);
            return tc ? (
              <CardFace key={i} suit={tc.suit} rank={tc.rank} />
            ) : (
              <EmptySlot key={i} label="A" />
            );
          })}
        </div>
        <div className="archway-found-group">
          <span className="archway-label">K→A</span>
          {(state.foundations.slice(4) as Card[][]).map((f: Card[], i: number) => {
            const tc = topCard(f);
            return tc ? (
              <CardFace key={i} suit={tc.suit} rank={tc.rank} />
            ) : (
              <EmptySlot key={i} label="K" />
            );
          })}
        </div>
      </div>

      <div className="archway-fans">
        {state.fans.map((fan: Card[], fi: number) => (
          <div key={fi} className="archway-fan" onClick={() => handleFanClick(fi)} title={`Fan ${fi + 1}`}>
            {fan.length === 0 ? (
              <EmptySlot label="" />
            ) : (
              fan.map((c: Card, ci: number) => (
                <div
                  key={c.id}
                  className="archway-fan-card-wrapper"
                  style={{ zIndex: ci }}
                >
                  <CardFace suit={c.suit} rank={c.rank} />
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      <button className="archway-draw-btn" onClick={handleDraw} disabled={state.stock.length === 0}>
        Draw ({state.stock.length})
      </button>
    </div>
  );
}
