import { useCallback } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BabetteState, BabetteAction } from "./state.js";
import "./Babette.css";

const RANK_LABELS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function CardFace({ suit, rank, onClick }: { suit: string; rank: number; onClick?: () => void }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div className={`bab-card ${red ? "red" : "black"}`} onClick={onClick}>
      <span>{RANK_LABELS[rank]}</span>
      <span>{suit}</span>
    </div>
  );
}

function EmptyPile({ label, onClick }: { label: string; onClick?: () => void }) {
  return <div className="bab-card bab-empty" onClick={onClick}>{label}</div>;
}

export function Babette({
  state,
  dispatch,
  onGameOver,
}: GameProps<BabetteState, {}>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const currentHandCard = state.handIndex > 0 ? state.hand[state.handIndex - 1] : undefined;

  const handleColClick = useCallback(
    (colIndex: number) => {
      const col = state.columns[colIndex]!;
      if (col.length === 0) {
        // Try to place hand card on empty col
        if (currentHandCard) {
          dispatch({ type: "move-hand-to-col", colIndex } as BabetteAction);
        }
        return;
      }
      const card = col[col.length - 1]!;
      // Try foundation first
      for (let fi = 0; fi < 4; fi++) {
        const found = state.foundations[fi]!;
        if (found.length === 0 ? card.rank === 1 : (found[found.length - 1]!.suit === card.suit && (found[found.length - 1]!.rank as number) + 1 === (card.rank as number))) {
          dispatch({ type: "move-col-to-foundation", colIndex, foundIndex: fi } as BabetteAction);
          return;
        }
      }
    },
    [state, currentHandCard, dispatch],
  );

  const handleFoundClick = useCallback(
    (foundIndex: number) => {
      if (currentHandCard) {
        dispatch({ type: "move-hand-to-foundation", foundIndex } as BabetteAction);
      }
    },
    [currentHandCard, dispatch],
  );

  const handleDraw = useCallback(() => {
    dispatch({ type: "draw-hand" } as BabetteAction);
  }, [dispatch]);

  return (
    <div className="babette">
      <div className="bab-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className="bab-top">
        <div className="bab-foundations">
          {state.foundations.map((f: Card[], fi: number) => {
            const tc = f[f.length - 1];
            return tc ? (
              <CardFace key={fi} suit={tc.suit} rank={tc.rank} onClick={() => handleFoundClick(fi)} />
            ) : (
              <EmptyPile key={fi} label="A" onClick={() => handleFoundClick(fi)} />
            );
          })}
        </div>

        <div className="bab-hand-area">
          {currentHandCard ? (
            <CardFace suit={currentHandCard.suit} rank={currentHandCard.rank} />
          ) : (
            <EmptyPile label="—" />
          )}
          <button className="bab-draw-btn" onClick={handleDraw} disabled={state.handIndex >= state.hand.length}>
            Draw ({state.hand.length - state.handIndex})
          </button>
        </div>
      </div>

      <div className="bab-tableau">
        {state.columns.map((col: Card[], ci: number) => (
          <div key={ci} className="bab-col" onClick={() => handleColClick(ci)}>
            {col.length === 0 ? (
              <EmptyPile label="" />
            ) : (
              col.map((c: Card, idx: number) => (
                <div key={c.id} className="bab-col-card" style={{ top: idx * 18 }}>
                  <CardFace suit={c.suit} rank={c.rank} />
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
