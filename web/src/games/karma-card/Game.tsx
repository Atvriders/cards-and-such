import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KarmaState, KarmaSettings } from "./state.js";
import { seatName, isTerminal, canPlay, activeZone, rankLabel } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function KarmaGame({ state, dispatch, onGameOver }: GameProps<KarmaState, KarmaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedPlay, setSelectedPlay] = useState<string[]>([]);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  useEffect(() => { setSelectedPlay([]); }, [state.turn, state.phase]);

  const isPlayerTurn = state.turn === 0 && !state.winner;
  const player = state.players[0]!;
  const zone = state.phase === "playing" ? activeZone(player) : "hand";
  const pile = state.discardPile;
  const topOfPile = pile[pile.length - 1];

  function handleSwap(): void {
    if (!selectedHand || !selectedTable) return;
    dispatch({ type: "swapCard", handId: selectedHand, tableId: selectedTable });
    setSelectedHand(null); setSelectedTable(null);
  }

  function togglePlay(id: string, source: readonly { id: string; rank: number }[]): void {
    const card = source.find(c => c.id === id)!;
    if (selectedPlay.includes(id)) {
      setSelectedPlay(selectedPlay.filter(s => s !== id));
    } else {
      if (selectedPlay.length > 0) {
        const first = source.find(c => c.id === selectedPlay[0]!)!;
        if (first.rank !== card.rank) { setSelectedPlay([id]); return; }
      }
      setSelectedPlay([...selectedPlay, id]);
    }
  }

  return (
    <div className="karma-card">
      <div className="karma-title">Karma</div>

      <div className="karma-opponents">
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => {
          const pl = state.players[seat]!;
          return (
            <div key={seat} className="karma-opponent">
              <div className="karma-opp-name">{seatName(seat)}</div>
              <div style={{ fontSize: "0.8rem" }}>H:{pl.hand.length} U:{pl.tableUp.length} D:{pl.tableDown.length}</div>
            </div>
          );
        })}
      </div>

      <div className="karma-pile">
        <span className="karma-pile-label">Discard:</span>
        {topOfPile ? <Card card={topOfPile} /> : <span style={{ opacity: 0.5 }}>Empty</span>}
        {topOfPile && <span className="karma-pile-label">({pile.length} cards, top: {rankLabel(topOfPile.rank)})</span>}
        <span className="karma-pile-label">| Draw: {state.drawPile.length}</span>
      </div>

      <div className="karma-log">{state.log}</div>

      {state.phase === "swap" && (
        <>
          <div className="karma-zone">
            <div className="karma-zone-label">Hand (click to select for swap)</div>
            <div className="karma-cards">
              {player.hand.map(c => (
                <button key={c.id} className={`karma-card-btn${selectedHand === c.id ? " selected" : ""}`}
                  onClick={() => setSelectedHand(selectedHand === c.id ? null : c.id)}>
                  <Card card={c} />
                </button>
              ))}
            </div>
          </div>
          <div className="karma-zone">
            <div className="karma-zone-label">Table-Up (click to select for swap)</div>
            <div className="karma-cards">
              {player.tableUp.map(c => (
                <button key={c.id} className={`karma-card-btn${selectedTable === c.id ? " selected" : ""}`}
                  onClick={() => setSelectedTable(selectedTable === c.id ? null : c.id)}>
                  <Card card={c} />
                </button>
              ))}
            </div>
          </div>
          <div className="karma-swap-hint">Select one hand card + one table card, then Swap. Confirm when done.</div>
          <div className="karma-actions">
            <button className="karma-btn" disabled={!selectedHand || !selectedTable} onClick={handleSwap}>Swap</button>
            <button className="karma-btn secondary" onClick={() => dispatch({ type: "confirmSwap" })}>Confirm &amp; Start</button>
          </div>
        </>
      )}

      {state.phase === "playing" && (
        <>
          <div className="karma-zone">
            <div className="karma-zone-label">
              {zone === "hand" ? `Hand (${player.hand.length})` : zone === "tableUp" ? `Table-Up (${player.tableUp.length})` : `Table-Down blind (${player.tableDown.length})`}
            </div>
            <div className="karma-cards">
              {(zone === "hand" ? player.hand : zone === "tableUp" ? player.tableUp : player.tableDown).map(c => (
                <button key={c.id}
                  className={`karma-card-btn${selectedPlay.includes(c.id) ? " selected" : ""}`}
                  disabled={!isPlayerTurn}
                  onClick={() => togglePlay(c.id, zone === "hand" ? player.hand : zone === "tableUp" ? player.tableUp : player.tableDown)}
                  aria-label={zone === "tableDown" ? "Face-down" : `${c.suit}${rankLabel(c.rank)}`}
                >
                  <Card card={zone === "tableDown" ? undefined : c} faceDown={zone === "tableDown"} />
                </button>
              ))}
            </div>
          </div>

          {isPlayerTurn && (
            <div className="karma-actions">
              <button className="karma-btn" disabled={selectedPlay.length === 0} onClick={() => { dispatch({ type: "playCards", cardIds: selectedPlay }); setSelectedPlay([]); }}>
                Play ({selectedPlay.length})
              </button>
              {pile.length > 0 && (
                <button className="karma-btn danger" onClick={() => { dispatch({ type: "pickUpPile" }); setSelectedPlay([]); }}>
                  Pick up pile ({pile.length})
                </button>
              )}
            </div>
          )}
        </>
      )}

      {!isPlayerTurn && !state.winner && state.phase === "playing" && (
        <div style={{ opacity: 0.7, fontStyle: "italic" }}>Waiting for {seatName(state.turn)}…</div>
      )}

      {state.winner !== null && (
        <div className="karma-game-over">
          {state.winner === 0 ? "You win!" : `${seatName(state.winner)} wins!`}
        </div>
      )}
    </div>
  );
}
