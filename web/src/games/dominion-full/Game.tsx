import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  DominionFullState,
  DominionFullAction,
  DominionFullSettings,
  PlayerState,
} from "./state.js";
import {
  isTerminal,
  cardById,
  playerScore,
} from "./state.js";
import "./Game.css";

const CPU_STEP_MS = 600;

export function DominionFullGame({ state, dispatch, onGameOver }:
  GameProps<DominionFullState, DominionFullSettings>): JSX.Element {

  // One-shot game-over guard
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // CPU auto-step driver: when it's a CPU's turn, send "cpuStep" repeatedly.
  const current = state.players[state.current];
  const isCpuTurn = current?.isCpu === true && state.phase !== "done";
  useEffect(() => {
    if (!isCpuTurn) return;
    const id = window.setTimeout(() => {
      dispatch({ type: "cpuStep" } as DominionFullAction);
    }, CPU_STEP_MS);
    return () => window.clearTimeout(id);
  }, [isCpuTurn, state, dispatch]);

  if (state.phase === "done") {
    return renderGameOver(state);
  }

  const you = state.players[0]!;
  const youTurn = state.current === 0 && !current?.isCpu;

  return (
    <div className="dfull-wrap fade-in">
      <header className="dfull-header">
        <div className="dfull-turn">
          Turn of <strong>{current?.id ?? "?"}</strong> &middot; phase{" "}
          <span className="dfull-phase">{state.phase}</span>
        </div>
        <div className="dfull-counts pulse">
          <span title="Provinces remaining in supply">P:{state.supply.province}</span>
          <span title="Duchies remaining">D:{state.supply.duchy}</span>
          <span title="Curses remaining">C:{state.supply.curse}</span>
        </div>
      </header>

      <section className="dfull-players">
        {state.players.map((p, i) => (
          <div
            key={p.id}
            className={`dfull-player ${i === state.current ? "active" : ""} ${p.isCpu ? "cpu" : "you"}`}
          >
            <div className="dfull-pname">{p.isCpu ? `CPU ${p.id.slice(-1)}` : "You"}</div>
            <div className="dfull-pline">
              Deck {p.deck.length} &middot; Discard {p.discard.length} &middot; Hand {p.hand.length}
            </div>
            <div className="dfull-pline">
              Score <strong>{playerScore(p)}</strong>
            </div>
            {i === state.current && (
              <div className="dfull-pline meta">
                Actions {p.actions} &middot; Buys {p.buys} &middot; Coin {p.coin}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="dfull-supply">
        <div className="dfull-section-label">Supply</div>
        <div className="dfull-supply-grid">
          {renderSupplyCards(state, you, youTurn, dispatch)}
        </div>
      </section>

      <section className="dfull-hand">
        <div className="dfull-section-label">
          Your Hand {youTurn ? `(${you.hand.length})` : "(waiting...)"}
        </div>
        <div className="dfull-hand-row">
          {you.hand.map((id, i) => {
            const c = cardById(id);
            const isAction = c.kind === "action";
            const canPlay = youTurn && state.phase === "action" && isAction && you.actions > 0 && !state.workshopPending;
            return (
              <button
                key={`${id}-${i}`}
                className={`dfull-card ${c.kind} ${canPlay ? "" : "disabled"}`}
                disabled={!canPlay}
                onClick={() => dispatch({ type: "playAction", cardId: id } as DominionFullAction)}
                title={`${c.name} — cost ${c.cost}${describeCard(c)}`}
              >
                <div className="dfull-cname">{c.name}</div>
                <div className="dfull-cstat">{statLine(c)}</div>
                <div className="dfull-ccost">{c.cost}c</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="dfull-controls">
        {state.workshopPending && youTurn && renderWorkshopPrompt(state, dispatch)}
        {!state.workshopPending && youTurn && state.phase === "action" && (
          <>
            <button
              className="dfull-btn"
              data-testid="hint-target-dominion-full-action"
              onClick={() => dispatch({ type: "endActionPhase" } as DominionFullAction)}
              title="Skip actions and proceed to your buy phase"
            >
              End Action Phase
            </button>
            <button
              className="dfull-btn primary"
              data-testid="hint-target-dominion-full-treasure"
              onClick={() => dispatch({ type: "playAllTreasures" } as DominionFullAction)}
              title="Play every treasure card in your hand"
            >
              Play All Treasures
            </button>
          </>
        )}
        {!state.workshopPending && youTurn && state.phase === "buy" && (
          <>
            <button
              className="dfull-btn"
              data-testid="hint-target-dominion-full-treasure"
              onClick={() => dispatch({ type: "playAllTreasures" } as DominionFullAction)}
              title="Play any remaining treasures in your hand"
            >
              Play Treasures
            </button>
            <button
              className="dfull-btn"
              data-testid="hint-target-dominion-full-endturn"
              onClick={() => dispatch({ type: "endBuyPhase" } as DominionFullAction)}
              title="End your turn (cleanup and draw 5)"
            >
              End Turn
            </button>
          </>
        )}
      </section>

      <section className="dfull-log">
        <div className="dfull-section-label">Log</div>
        <ul>
          {state.log.slice(-6).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function renderSupplyCards(
  state: DominionFullState,
  you: PlayerState,
  youTurn: boolean,
  dispatch: (a: unknown) => void,
): JSX.Element[] {
  const order = [
    "copper", "silver", "gold",
    "estate", "duchy", "province", "curse",
    ...state.kingdom,
  ];
  return order.map((id) => {
    const c = cardById(id);
    const count = state.supply[id] ?? 0;
    const canBuy =
      youTurn &&
      state.phase === "buy" &&
      !state.workshopPending &&
      you.buys > 0 &&
      you.coin >= c.cost &&
      count > 0;
    return (
      <button
        key={id}
        className={`dfull-supply-card ${c.kind} ${canBuy ? "buyable" : "disabled"}`}
        disabled={!canBuy}
        onClick={() => dispatch({ type: "buy", cardId: id } as DominionFullAction)}
        title={`${c.name} — cost ${c.cost}${describeCard(c)} — ${count} left`}
      >
        <div className="dfull-cname">{c.name}</div>
        <div className="dfull-cstat">{statLine(c)}</div>
        <div className="dfull-supply-foot">
          <span className="dfull-ccost">{c.cost}c</span>
          <span className="dfull-supply-count">x{count}</span>
        </div>
      </button>
    );
  });
}

function renderWorkshopPrompt(
  state: DominionFullState,
  dispatch: (a: unknown) => void,
): JSX.Element {
  const gainables = [
    "silver", "estate", "cellar", "moat", "village", "workshop", "smithy",
  ].filter(id => (state.supply[id] ?? 0) > 0 && cardById(id).cost <= 4);
  return (
    <div className="dfull-workshop">
      <div className="dfull-section-label">Workshop: gain a card costing up to 4</div>
      <div className="dfull-workshop-row">
        {gainables.map(id => {
          const c = cardById(id);
          return (
            <button
              key={id}
              className={`dfull-card ${c.kind}`}
              onClick={() => dispatch({ type: "workshopGain", cardId: id } as DominionFullAction)}
              title={`Gain a ${c.name} (cost ${c.cost})`}
            >
              <div className="dfull-cname">{c.name}</div>
              <div className="dfull-ccost">{c.cost}c</div>
            </button>
          );
        })}
        <button
          className="dfull-btn"
          onClick={() => dispatch({ type: "workshopSkip" } as DominionFullAction)}
          title="Skip the Workshop gain"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function renderGameOver(state: DominionFullState): JSX.Element {
  const scores = state.players.map(p => ({ id: p.id, isCpu: p.isCpu, score: playerScore(p) }));
  const winner = scores.reduce((a, b) => b.score > a.score ? b : a, scores[0]!);
  const youWin = !winner.isCpu;
  return (
    <div className="dfull-wrap fade-in">
      <div className="dfull-done bounce-in">
        <h2>{youWin ? "Victory!" : "The CPU outpaced you."}</h2>
        <div className="dfull-scoreboard">
          {scores.map(s => (
            <div key={s.id} className={`dfull-score-row ${s.isCpu ? "cpu" : "you"} ${s.id === winner.id ? "winner" : ""}`}>
              <span>{s.isCpu ? `CPU ${s.id.slice(-1)}` : "You"}</span>
              <strong>{s.score} VP</strong>
            </div>
          ))}
        </div>
        <div className="dfull-final pulse">
          {youWin ? `+${Math.max(0, playerScore(state.players[0]!)) * 10} pts` : "0 pts"}
        </div>
      </div>
    </div>
  );
}

function statLine(c: ReturnType<typeof cardById>): string {
  if (c.kind === "treasure") return `+${c.coin}c`;
  if (c.kind === "victory") return `+${c.vp}VP`;
  if (c.kind === "curse") return `${c.vp}VP`;
  // action
  const bits: string[] = [];
  if (c.plusCards) bits.push(`+${c.plusCards} card${c.plusCards === 1 ? "" : "s"}`);
  if (c.plusActions) bits.push(`+${c.plusActions} action${c.plusActions === 1 ? "" : "s"}`);
  if (c.plusBuys) bits.push(`+${c.plusBuys} buy${c.plusBuys === 1 ? "" : "s"}`);
  if (c.plusCoin) bits.push(`+${c.plusCoin}c`);
  if (c.special === "workshop") bits.push("gain <=4");
  return bits.join(" ") || "action";
}

function describeCard(c: ReturnType<typeof cardById>): string {
  const s = statLine(c);
  return s ? ` (${s})` : "";
}
