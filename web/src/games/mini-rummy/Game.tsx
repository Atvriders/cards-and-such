import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniRummyState, MiniRummyAction, MiniRummySettings } from "./state.js";
import { isTerminal, bestMelds, deadwoodPoints } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function MiniRummyGame({ state, dispatch, onGameOver }: GameProps<MiniRummyState, MiniRummySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  // CPU turn auto-trigger
  useEffect(() => {
    if (state.phase === "cpuTurn") {
      const id = setTimeout(() => dispatch({ type: "cpuPlay" } as MiniRummyAction), 700);
      return () => clearTimeout(id);
    }
  }, [state.phase, dispatch]);

  const { melds: pMelds, deadwood: pDead } = bestMelds(state.player);
  const meldedIds = new Set(pMelds.flat().map((c) => c.id));

  const topDiscard = state.discard[state.discard.length - 1];
  const canDiscard = state.phase === "discard" && state.selectedId !== "";
  const canKnock = state.phase === "discard" && deadwoodPoints(pDead) <= 5;

  return (
    <div className="rummy-mini-wrap">
      <div className="rummy-mini-hud">
        <div className="rummy-mini-stat">Phase <b>{state.phase}</b></div>
        <div className="rummy-mini-stat">Deck <b>{state.deck.length}</b></div>
        <div className="rummy-mini-stat">Deadwood <b>{deadwoodPoints(pDead)}</b></div>
      </div>

      <div className="rummy-mini-cpu">
        <div className="rummy-mini-label">CPU ({state.cpu.length} cards)</div>
        <div className="rummy-mini-row">
          {state.cpu.map((_, i) => <div key={i} className="rummy-mini-card-tight"><Card faceDown /></div>)}
        </div>
      </div>

      <div className="rummy-mini-center">
        <div className="rummy-mini-pile" onClick={() => state.phase === "draw" && state.turn === "player" && dispatch({ type: "drawDeck" } as MiniRummyAction)}>
          <div className="rummy-mini-pile-label">Stock</div>
          {state.deck.length > 0 ? <Card faceDown /> : <div className="rummy-mini-slot" />}
          <div className="rummy-mini-pile-count">{state.deck.length}</div>
        </div>
        <div className="rummy-mini-pile" onClick={() => state.phase === "draw" && state.turn === "player" && dispatch({ type: "drawDiscard" } as MiniRummyAction)}>
          <div className="rummy-mini-pile-label">Discard</div>
          {topDiscard ? <Card card={topDiscard} /> : <div className="rummy-mini-slot" />}
          <div className="rummy-mini-pile-count">{state.discard.length}</div>
        </div>
      </div>

      <div className="rummy-mini-you">
        <div className="rummy-mini-label">You — {state.player.length} cards · {pMelds.length} meld{pMelds.length === 1 ? "" : "s"}</div>
        <div className="rummy-mini-hand">
          {state.player.map((c) => {
            const isSelected = state.selectedId === c.id;
            const isMelded = meldedIds.has(c.id);
            return (
              <div
                key={c.id}
                className={`rummy-mini-card-slot ${isSelected ? "selected" : ""} ${isMelded ? "melded" : ""}`}
                onClick={() => dispatch({ type: "select", id: c.id } as MiniRummyAction)}
              >
                <Card card={c} />
              </div>
            );
          })}
        </div>
        <div className="rummy-mini-actions">
          {state.phase === "draw" && state.turn === "player" && (
            <>
              <button className="rummy-mini-btn primary" onClick={() => dispatch({ type: "drawDeck" } as MiniRummyAction)}>Draw deck</button>
              <button className="rummy-mini-btn alt" disabled={!topDiscard} onClick={() => dispatch({ type: "drawDiscard" } as MiniRummyAction)}>Take discard</button>
            </>
          )}
          {state.phase === "discard" && (
            <>
              <button className="rummy-mini-btn primary" disabled={!canDiscard} onClick={() => dispatch({ type: "discard" } as MiniRummyAction)}>Discard selected</button>
              <button className="rummy-mini-btn warn" disabled={!canKnock} onClick={() => dispatch({ type: "knock" } as MiniRummyAction)}>Knock!</button>
            </>
          )}
          {state.phase === "cpuTurn" && <div className="rummy-mini-thinking">CPU thinking…</div>}
        </div>
      </div>

      {state.phase === "done" && (
        <div className={`rummy-mini-done ${state.winner}`}>
          <h2>{state.winner === "player" ? "You won!" : "CPU wins"}</h2>
        </div>
      )}

      <div className="rummy-mini-log">
        {state.log.slice(-5).map((l, i) => <div key={i} className="rummy-mini-log-line">{l}</div>)}
      </div>
    </div>
  );
}
