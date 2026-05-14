import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  ThroughTheAgesFullState,
  ThroughTheAgesFullAction,
  ThroughTheAgesFullSettings,
  Card,
  PlayerState,
} from "./state.js";
import {
  isTerminal,
  ageLabel,
  productionTotals,
} from "./state.js";
import "./Game.css";

function isMilCard(c: Card): boolean {
  return c.kind === "mil-bonus" || c.kind === "mil-aggression";
}

function kindLabel(c: Card): string {
  switch (c.kind) {
    case "civ-building": return "Building";
    case "civ-leader": return "Leader";
    case "civ-wonder": return "Wonder";
    case "mil-bonus": return "Mil Bonus";
    case "mil-aggression": return "Aggression";
    default: return c.kind;
  }
}

function CardView({
  card,
  idx,
  affordable,
  onClick,
}: {
  card: Card;
  idx: number;
  affordable: boolean;
  onClick: () => void;
}): JSX.Element {
  const classes = ["tta-card", `tta-card--${card.kind}`];
  if (!affordable) classes.push("tta-card--unaffordable");
  return (
    <button
      type="button"
      className={classes.join(" ")}
      data-testid={`tta-card-${idx}`}
      onClick={onClick}
      title={`${card.name} (${ageLabel(card.age)}) — ${kindLabel(card)}. Costs ${card.civilCost} action${card.stoneCost > 0 ? ` + ${card.stoneCost} stone` : ""}.`}
      disabled={!affordable}
    >
      <div className="tta-card__head">
        <span className="tta-card__age">{ageLabel(card.age)}</span>
        <span className="tta-card__kind">{kindLabel(card)}</span>
      </div>
      <div className="tta-card__name">{card.name}</div>
      <div className="tta-card__stats">
        <span title="Civil/Military action cost">⏱{card.civilCost}</span>
        {card.stoneCost > 0 ? <span title="Stone cost">🪨{card.stoneCost}</span> : null}
        {card.produces ? (
          <span title={`Produces ${card.produces}`}>
            +{card.productionAmount}{card.produces === "food" ? "🍞" : card.produces === "stone" ? "🪨" : card.produces === "science" ? "🔬" : "⚔️"}
          </span>
        ) : null}
        {card.strengthBonus > 0 ? <span title="Strength bonus">+{card.strengthBonus}⚔️</span> : null}
        {card.cultureOnPlay > 0 ? <span title="Culture on play">+{card.cultureOnPlay}🏛</span> : null}
        {card.recurringCulture > 0 ? <span title="Recurring culture per turn">+{card.recurringCulture}🏛/tn</span> : null}
        {card.happiness > 0 ? <span title="Happiness">+{card.happiness}😊</span> : null}
      </div>
    </button>
  );
}

function TableauStrip({ player }: { player: PlayerState }): JSX.Element {
  const counts: Record<string, number> = {};
  for (const c of player.tableau) counts[c.kind] = (counts[c.kind] ?? 0) + 1;
  const order: Array<{ k: Card["kind"]; lbl: string }> = [
    { k: "civ-building", lbl: "Bld" },
    { k: "civ-leader", lbl: "Ldr" },
    { k: "civ-wonder", lbl: "Wnd" },
    { k: "mil-bonus", lbl: "Bns" },
    { k: "mil-aggression", lbl: "Agg" },
  ];
  return (
    <div className="tta-tableau" data-testid={`tta-tableau-${player.seat}`}>
      {order.map(({ k, lbl }) => (
        <span key={k} className={`tta-pip tta-pip--${k}`} title={`${lbl}: ${counts[k] ?? 0}`}>
          {lbl} {counts[k] ?? 0}
        </span>
      ))}
    </div>
  );
}

function OpponentBox({ player }: { player: PlayerState }): JSX.Element {
  const prod = productionTotals(player);
  return (
    <div className="tta-opp" data-testid={`tta-opp-${player.seat}`}>
      <div className="tta-opp__header">
        <span className="tta-opp__name">{player.name}</span>
        <span className="tta-opp__culture" title="Culture (VP)">{player.culture}🏛</span>
      </div>
      <div className="tta-opp__meta">
        <span title="Strength">{player.strength}⚔️</span>
        <span title="Workers">{player.workers}👥</span>
        <span title="Food prod">🍞{prod.food}</span>
        <span title="Stone prod">🪨{prod.stone}</span>
        <span title="Science prod">🔬{prod.science}</span>
      </div>
      <TableauStrip player={player} />
    </div>
  );
}

export function ThroughTheAgesFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ThroughTheAgesFullState, ThroughTheAgesFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Auto-progress end-of-age phase after a short delay so the human can read.
  useEffect(() => {
    if (state.phase === "end-of-age") {
      const t = window.setTimeout(() => {
        dispatch({ type: "resolveAge" } satisfies ThroughTheAgesFullAction);
      }, 1000);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [state.phase, dispatch]);

  const human = state.players[0];
  const opponents = state.players.slice(1);
  const isHumanTurn = state.phase === "turn" && state.turn === 0;

  function handleTakeCard(idx: number) {
    if (!isHumanTurn) return;
    dispatch({ type: "takeCard", cardIdx: idx } satisfies ThroughTheAgesFullAction);
  }

  function handleLevyCivil() {
    dispatch({ type: "levyCivil" } satisfies ThroughTheAgesFullAction);
  }

  function handleLevyMilitary() {
    dispatch({ type: "levyMilitary" } satisfies ThroughTheAgesFullAction);
  }

  function handleEndTurn() {
    dispatch({ type: "endTurn" } satisfies ThroughTheAgesFullAction);
  }

  function cardAffordableForHuman(c: Card): boolean {
    if (!human || !isHumanTurn) return false;
    const tokens = isMilCard(c) ? human.militaryTokens : human.civilTokens;
    if (c.civilCost > tokens) return false;
    if (c.stoneCost > human.stone) return false;
    return true;
  }

  const humanProd = human ? productionTotals(human) : { food: 0, stone: 0, science: 0, strength: 0 };

  function renderHeader() {
    return (
      <div className="game-info tta-header">
        <span className="game-badge" data-testid="tta-age">
          Age {ageLabel(state.age)} · Round {state.round + 1}
        </span>
        <span className="game-badge tta-badge-phase pulse" data-testid="tta-phase">
          {state.phase === "turn" ? `${state.players[state.turn]?.name ?? "?"} to act` : state.phase}
        </span>
        {human ? (
          <span className="game-badge" data-testid="tta-human-summary">
            You: {human.culture}🏛 · {human.strength}⚔️ · {human.civilTokens}/{human.militaryTokens} tokens
          </span>
        ) : null}
      </div>
    );
  }

  function renderCardRow() {
    return (
      <div className="tta-row">
        <h4>Card Row</h4>
        <div className="tta-row__cards">
          {state.cardRow.map((c, i) => (
            <CardView
              key={c.id + "-" + i}
              card={c}
              idx={i}
              affordable={cardAffordableForHuman(c)}
              onClick={() => handleTakeCard(i)}
            />
          ))}
          {state.cardRow.length === 0 ? <div className="tta-empty">Card row exhausted — awaiting age transition.</div> : null}
        </div>
      </div>
    );
  }

  function renderHumanPanel() {
    if (!human) return null;
    return (
      <div className="tta-me">
        <div className="tta-me__header">
          <strong>{human.name}</strong>
          <span>Civ {human.civilTokens} / Mil {human.militaryTokens}</span>
          <span>{human.culture}🏛 · {human.strength}⚔️</span>
        </div>
        <div className="tta-me__resources">
          <span title="Food (consumed by workers)">🍞 {human.food} (+{humanProd.food})</span>
          <span title="Stone (spent on builds)">🪨 {human.stone} (+{humanProd.stone})</span>
          <span title="Science (accumulates → VP)">🔬 {human.science} (+{humanProd.science})</span>
          <span title="Workers / population reserve">👥 {human.workers} (+{human.popReserve} reserve)</span>
          <span title="Happiness rating">😊 {human.happiness}</span>
        </div>
        <TableauStrip player={human} />
        {isHumanTurn ? (
          <div className="tta-actions">
            <button
              type="button"
              className="tta-actbtn"
              onClick={handleLevyCivil}
              disabled={human.civilTokens < 1 || human.popReserve < 1 || human.food < 1}
              title="Spend 1 civil token + 1 food to draw a worker from the population reserve."
              data-testid="tta-levy-civil"
            >
              Levy Worker (1 civil + 1 food)
            </button>
            <button
              type="button"
              className="tta-actbtn"
              onClick={handleLevyMilitary}
              disabled={human.militaryTokens < 1 || human.workers < 1}
              title="Spend 1 military token + 1 worker to gain +1 strength."
              data-testid="tta-levy-mil"
            >
              Levy Unit (1 military + 1 worker)
            </button>
            <button
              type="button"
              className="game-button game-button--primary"
              onClick={handleEndTurn}
              title="Pass play to the next civilisation."
              data-testid="tta-end-turn"
            >
              End Turn
            </button>
          </div>
        ) : (
          <div className="tta-actions">
            <button
              type="button"
              className="game-button game-button--secondary"
              onClick={handleEndTurn}
              disabled={state.phase !== "turn"}
              title="Advance — CPUs will act automatically."
              data-testid="tta-end-turn"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderLog() {
    return (
      <div className="tta-log" data-testid="tta-log" aria-live="polite">
        {state.log.slice(-8).map((line, i) => (
          <div key={i} className="tta-log__line">{line}</div>
        ))}
      </div>
    );
  }

  function renderScoring() {
    if (state.phase !== "scoring" && state.phase !== "done") return null;
    return (
      <div className="tta-final bounce-in" data-testid="tta-final">
        <h3>Final Scores</h3>
        <table>
          <thead>
            <tr><th>Player</th><th>Culture</th><th>Strength</th><th>VP</th></tr>
          </thead>
          <tbody>
            {state.players.map((p) => (
              <tr key={p.seat} className={p.seat === 0 ? "tta-final__me" : undefined}>
                <td>{p.name}</td>
                <td>{p.culture}🏛</td>
                <td>{p.strength}⚔️</td>
                <td>{state.finalScore[p.seat] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderResolveAge() {
    if (state.phase !== "end-of-age") return null;
    return (
      <button
        type="button"
        className="game-button game-button--secondary tta-resolve-age"
        onClick={() => dispatch({ type: "resolveAge" } satisfies ThroughTheAgesFullAction)}
        title="Resolve end-of-age military scoring and start the next age."
        data-testid="tta-resolve-age"
      >
        Resolve Age {ageLabel(state.age)}
      </button>
    );
  }

  return (
    <div className="game-shell tta-shell fade-in">
      {renderHeader()}
      <div className="tta-opps">
        {opponents.map((p) => <OpponentBox key={p.seat} player={p} />)}
      </div>
      {state.phase === "turn" ? renderCardRow() : null}
      {renderHumanPanel()}
      {renderResolveAge()}
      {renderLog()}
      {renderScoring()}
    </div>
  );
}
