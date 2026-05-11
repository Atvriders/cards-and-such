import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PalaceState, PalaceSettings } from "./state.js";
import { seatName, isTerminal, activeZone, canPlay } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Game.css";

export function PalaceGame({ state, dispatch, onGameOver }: GameProps<PalaceState, PalaceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  useEffect(() => { setSelected([]); }, [state.turn]);

  const isPlayerTurn = state.turn === 0 && !state.winner;
  const player = state.players[0]!;
  const zone = activeZone(player);
  const source = zone === "hand" ? player.hand : zone === "tableUp" ? player.tableUp : player.tableDown;
  const topOfPile = state.discardPile[state.discardPile.length - 1];

  function toggleCard(id: string): void {
    if (!isPlayerTurn) return;
    const card = source.find(c => c.id === id)!;
    if (!selected.includes(id)) {
      // Only allow same rank as already selected
      if (selected.length > 0) {
        const firstCard = source.find(c => c.id === selected[0]!)!;
        if (firstCard.rank !== card.rank) { setSelected([id]); return; }
      }
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter(s => s !== id));
    }
  }

  function handlePlay(): void {
    if (selected.length === 0) return;
    dispatch({ type: "playCards", cardIds: selected });
    setSelected([]);
  }

  function handlePickUp(): void {
    dispatch({ type: "pickUpPile" });
    setSelected([]);
  }

  const playableCount = source.filter(c => canPlay(c, state.discardPile)).length;

  return (
    <div className="palace">
      <div className="palace-title">Palace</div>

      <div className="pal-opponents">
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => {
          const pl = state.players[seat]!;
          const oz = activeZone(pl);
          return (
            <div key={seat} className="pal-opponent">
              <div className="pal-opp-name">{seatName(seat)}</div>
              <div style={{ fontSize: "0.8rem" }}>Hand: {pl.hand.length} | Up: {pl.tableUp.length} | Down: {pl.tableDown.length}</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Zone: {oz}</div>
            </div>
          );
        })}
      </div>

      <div className="pal-pile">
        <span className="pal-pile-label">Discard:</span>
        {topOfPile ? <Card card={topOfPile} /> : <span style={{ opacity: 0.5 }}>Empty</span>}
        {topOfPile && <span className="pal-pile-count">({state.discardPile.length} cards, top: {rankLabel(topOfPile.rank)})</span>}
        <span className="pal-pile-label"> | Draw: {state.drawPile.length}</span>
      </div>

      <div className="pal-log">{state.log}</div>

      <div className="pal-zone">
        <div className="pal-zone-label">
          {zone === "hand" ? `Your hand (${player.hand.length} cards)` :
           zone === "tableUp" ? `Your table-up cards (${player.tableUp.length})` :
           `Your face-down cards (${player.tableDown.length}) — blind!`}
        </div>
        <div className="pal-cards">
          {source.map(c => (
            <button
              key={c.id}
              data-testid={`hint-target-palace-${c.id}`}
              className={`pal-card-btn${selected.includes(c.id) ? " selected" : ""}`}
              disabled={!isPlayerTurn}
              onClick={() => toggleCard(c.id)}
              aria-label={zone === "tableDown" ? "Face-down card" : `${c.suit}${rankLabel(c.rank)}`}
            >
              {zone === "tableDown" ? <Card faceDown={true} /> : <Card card={c} faceDown={false} />}
            </button>
          ))}
        </div>
      </div>

      {player.tableUp.length > 0 && zone === "hand" && (
        <div className="pal-zone">
          <div className="pal-zone-label">Your table-up cards</div>
          <div className="pal-cards">
            {player.tableUp.map(c => <Card key={c.id} card={c} />)}
          </div>
        </div>
      )}

      {isPlayerTurn && (
        <div className="pal-actions">
          <button className="pal-btn" disabled={selected.length === 0} onClick={handlePlay}>
            Play selected ({selected.length})
          </button>
          {playableCount === 0 && state.discardPile.length > 0 && (
            <button data-testid="hint-target-palace-pickup" className="pal-btn danger" onClick={handlePickUp}>
              Pick up pile ({state.discardPile.length})
            </button>
          )}
          {state.discardPile.length > 0 && playableCount > 0 && (
            <button data-testid="hint-target-palace-pickup" className="pal-btn danger" onClick={handlePickUp}>
              Pick up pile
            </button>
          )}
        </div>
      )}

      {!isPlayerTurn && !state.winner && (
        <div style={{ opacity: 0.7, fontStyle: "italic" }}>Waiting for {seatName(state.turn)}…</div>
      )}

      {state.winner !== null && (
        <div className="pal-game-over">
          {state.winner === 0 ? "You win!" : `${seatName(state.winner)} wins!`}
        </div>
      )}
    </div>
  );
}
