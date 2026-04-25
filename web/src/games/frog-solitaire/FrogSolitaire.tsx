import { useCallback } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrogSolitaireState, FrogSolitaireAction } from "./state.js";
import "./FrogSolitaire.css";

const RL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function CardFace({ suit, rank, onClick }: { suit: string; rank: number; onClick?: () => void }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div className={`frog-card ${red ? "red" : "black"}`} onClick={onClick}>
      <span>{RL[rank]}</span><span>{suit}</span>
    </div>
  );
}
function EmptySlot({ label }: { label: string }) {
  return <div className="frog-card frog-empty">{label}</div>;
}

export function FrogSolitaire({
  state,
  dispatch,
  onGameOver,
}: GameProps<FrogSolitaireState, {}>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : undefined;
  const reserveTop = state.reserve.length > 0 ? state.reserve[state.reserve.length - 1] : undefined;

  const handleWasteClick = useCallback(() => {
    if (!wasteTop) return;
    for (let fi = 0; fi < 8; fi++) {
      const f = state.foundations[fi]!;
      if (f.length === 0 ? wasteTop.rank === 1 : (f[f.length - 1]!.rank as number) + 1 === (wasteTop.rank as number)) {
        dispatch({ type: "move-waste-to-foundation", foundIndex: fi } as FrogSolitaireAction);
        return;
      }
    }
  }, [wasteTop, state.foundations, dispatch]);

  const handleReserveClick = useCallback(() => {
    if (!reserveTop) return;
    for (let fi = 0; fi < 8; fi++) {
      const f = state.foundations[fi]!;
      if (f.length === 0 ? reserveTop.rank === 1 : (f[f.length - 1]!.rank as number) + 1 === (reserveTop.rank as number)) {
        dispatch({ type: "move-reserve-to-foundation", foundIndex: fi } as FrogSolitaireAction);
        return;
      }
    }
  }, [reserveTop, state.foundations, dispatch]);

  const handleDraw = useCallback(() => {
    dispatch({ type: "draw" } as FrogSolitaireAction);
  }, [dispatch]);

  return (
    <div className="frog-solitaire">
      <div className="frog-info">
        <span>Score: {state.score}/104</span>
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="frog-foundations">
        {state.foundations.map((f: Card[], fi: number) => {
          const tc = f[f.length - 1];
          return tc ? (
            <CardFace key={fi} suit={tc.suit} rank={tc.rank} />
          ) : (
            <EmptySlot key={fi} label="A" />
          );
        })}
      </div>

      <div className="frog-play-area">
        <div className="frog-section">
          <div className="frog-label">Reserve ({state.reserve.length})</div>
          {reserveTop ? (
            <CardFace suit={reserveTop.suit} rank={reserveTop.rank} onClick={handleReserveClick} />
          ) : (
            <EmptySlot label="—" />
          )}
        </div>

        <div className="frog-section">
          <div className="frog-label">Stock</div>
          <div className="frog-stock" onClick={handleDraw}>
            {state.stock.length > 0 ? (
              <div className="frog-card frog-back">🐸</div>
            ) : (
              <EmptySlot label="—" />
            )}
          </div>
        </div>

        <div className="frog-section">
          <div className="frog-label">Waste</div>
          {wasteTop ? (
            <CardFace suit={wasteTop.suit} rank={wasteTop.rank} onClick={handleWasteClick} />
          ) : (
            <EmptySlot label="—" />
          )}
        </div>
      </div>
    </div>
  );
}
