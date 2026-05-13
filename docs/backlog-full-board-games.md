# Backlog: Full-Rulebook Classic Board Games

This file tracks the "full" / kitchen-table editions of well-known board games that the registry is missing. The registry already holds ~4,500 entries, but most household classics appear only as mini / quick-play / quiz variants (e.g. `monopoly-mini`, `risk-mini`, `clue-mini`); this list captures the long-form rulebook editions that take a real evening to finish. To claim an entry, open a PR that scaffolds the proposed folder at `web/src/games/<id>/` and tick the row in this table by replacing the id with a strikethrough link to the PR. Entries are grouped by category and sorted S → XL within each group so it doubles as a "next pick" guide for an idle weekend.

## Board

| Proposed id | Display title | Players | Already-in-registry | Complexity | Pitch |
|-------------|---------------|---------|---------------------|------------|-------|
| `connect-four-full` | Connect Four (Tournament) | 2 (MP: Y) | `connect-4`, `connect-four-mini`, `connect-four-popout`, `connect-four-3d` — base exists, but full needs perfect-play AI + difficulty tiers | S | Drop discs to align four; play vs. a solved-game AI that scales from "lets you win" to unbeatable. |
| `chutes-and-ladders-long` | Chutes & Ladders (Long Edition) | 2–6 (MP: Y) | `chutes-ladders-kids`, `chutes-and-ladders-classic`, `snakes-and-ladders` — long edition uses the 10×10 + bonus-track board with stacking pawns | S | The full nostalgia trip — extended board, 4 pawns per player, and pile-up rules at chute heads. |
| `mouse-trap-full` | Mouse Trap (Full Build) | 2–4 (MP: Y) | none (`mouse-mash` is unrelated) | M | Build the Rube Goldberg trap one part at a time, then race to crank the crane onto your opponent's mouse. |
| `operation-full` | Operation (Full Specialist) | 2–4 (MP: Y) | `operation-game` (single-extraction toy) — full edition adds specialist cards, fee scoring, and timed buzzer | M | The full Cavity-Sam round with 12 ailments, doctor cards, and the dreaded buzzer for each twitch. |
| `battleship-full` | Battleship (Full Salvo + Advanced) | 2 (MP: Y) | `battleship`, `battleship-solitaire`, `battleship-solo` — full adds salvo mode, planes, and missions | M | Full salvo rules with sonar pings, fighter jets, and 5-ship advanced fleet vs. a hunting AI. |
| `othello-full-tournament` | Othello (Full Tournament) | 2 (MP: Y) | `reversi`, `reversi-timed`, `anti-othello`, `reversi-random-start`, `grand-othello-mini` — full adds WOC tournament timing + opening book | M | The polished tournament edition with named openings, byo-yomi clocks, and Edax-strength AI. |
| `checkers-full-tournament` | Checkers (Full Tournament) | 2 (MP: Y) | `checkers`, `pool-checkers`, `dice-checkers`, plus 8 regional variants — full adds 3-move ballot openings + draw rules | M | American Checkers Federation rules: 3-move opening ballot, 40-move draw rule, full clock. |
| `chinese-checkers-full` | Chinese Checkers (Full 6-Player) | 2–6 (MP: Y) | `chinese-checkers`, `chinese-checkers-2p` — full adds 6-color star, hop chains, jump-only variant toggle | M | Hop your 10 pegs across the star into the opposite point — chain jumps, six players, classic format. |
| `sorry-full` | Sorry! (Full) | 2–4 (MP: Y) | `sorry`, `sorry-classic`, `sorry-sliders` — full adds 11-back, 7-split, slide chains, and partners mode | M | The complete card-driven race with slide chains, swap cards, and 2v2 partners mode. |
| `aggravation-full` | Aggravation (Full 6-Player) | 2–6 (MP: Y) | `aggravation` (exists, but needs partner play + super shortcut) | M | The cross-board marble race with the center "super shortcut" and 2v2 partner scoring. |
| `backgammon-full-match` | Backgammon (Full Match w/ Doubling Cube) | 2 (MP: Y) | `backgammon-standard-race`, `blast-point-backgammon`, `dueling-dice-backgammon`, `hyper-backgammon` — full adds doubling cube, Crawford, match equity | M | Match play to 7 with doubling cube, Crawford rule, and an XG-trained bot for resignation hints. |
| `mancala-full-kalah` | Mancala (Full Kalah, Match Play) | 2 (MP: Y) | `mancala`, `kalah`, `ayo-mancala` — full extends to match play with empty-capture rule + 6-stone open | S | The classic 6-pit Kalah with empty-side capture, "free turn on home," and best-of-9 match scoring. |
| `chess-full-clock` | Chess (Full FIDE w/ Clock) | 2 (MP: Y) | `chess` plus 40+ variants — full adds FIDE clock controls, draw offers, resignations, PGN export | L | Tournament-grade FIDE chess: time controls (rapid/blitz/classical), draw offers, PGN history, Stockfish ladder. |
| `clue-full` | Clue / Cluedo (Full) | 3–6 (MP: Y) | `clue-mini`, `clue-master-detective`, `clue-suspect` — full is the 6-suspect 9-room deduction loop | L | The full mansion: 6 suspects, 6 weapons, 9 rooms, secret passages, and a logbook autocompleter. |
| `monopoly-full` | Monopoly (Full Rulebook) | 2–8 (MP: Y) | `monopoly-mini`, `dice-monopoly`, `monopoly-deal-mini` — full adds auctions, trades, mortgages, houses | L | The complete Hasbro rules: auctions for unbought properties, trading, mortgages, 4-houses-then-hotel. |
| `the-game-of-life-full` | The Game of Life (Full) | 2–6 (MP: Y) | `game-of-life-classic`, `game-of-life-race`, `startup-life-mini`, `game-of-life-conway`, `life-1d` — full adds career/college branch + insurance + retirement scoring | L | Career or college? Marriage, kids, lawsuits, retirement — the full Milton Bradley spinner ride. |
| `scrabble-full` | Scrabble (Full Tournament) | 2–4 (MP: Y) | none | L | The full TWL/SOWPODS-backed game with bingos, challenges, blanks, and a Quackle-tier AI. |
| `stratego-full` | Stratego (Full Classic) | 2 (MP: Y) | none | L | The full 40-piece hidden-information army battle, bombs, spies, and a flag to capture. |
| `risk-full` | Risk (Full World Domination) | 2–6 (MP: Y) | `risk-mini` (3-territory toy) — full has 42 territories, mission cards, fortify phase | XL | World conquest with continent bonuses, card sets, fortification, and the classic dice attack/defend stack. |
| `catan-full` | Catan (Settlers, Full) | 3–4 (MP: Y) | `imperial-settlers-rw` (unrelated theme) — no Settlers of Catan | XL | Build settlements, trade sheep for wheat, longest road + largest army, robber on every 7. |
| `catan-cities-knights` | Catan: Cities & Knights | 3–4 (MP: Y) | none | XL | The full expansion atop Catan-full: barbarian invasions, knights, commodity trade, metropolises. |
| `ticket-to-ride-full` | Ticket to Ride (Full USA) | 2–5 (MP: Y) | none | L | Claim train routes across the USA, complete secret destinations, longest-route bonus. |
| `carcassonne-full` | Carcassonne (Full Base + Standard Scoring) | 2–5 (MP: Y) | `carcassonne-base` + 13 expansions — full ratifies endgame field scoring + farmer majority | L | The base tile-laying game with full meeple/farmer rules and proper endgame field majority scoring. |
| `pandemic-full` | Pandemic (Full Base + Roles) | 2–4 (MP: Y) | `pandemic-base` + 7 variants — full needs all 7 roles, epidemic ladder, full event deck | L | Coop disease-fighting with full role kit (Medic, Scientist, Dispatcher…), epidemic intensity ladder, cure race. |
| `power-grid-full` | Power Grid (Full) | 2–6 (MP: Y) | `power-grid-card` (deckbuilder spinoff) — no full board | XL | Auction power plants, buy coal/oil/uranium/garbage at fluctuating prices, light the most cities at game end. |
| `terra-mystica-full` | Terra Mystica | 2–5 (MP: Y) | none | XL | 14 fantasy factions terraform the map, build temples, advance cult tracks — heavy euro engine-builder. |
| `puerto-rico-full` | Puerto Rico | 3–5 (MP: Y) | none | XL | The role-selection classic: plantation, craftsman, captain — ship goods and build the strongest island. |
| `agricola-full` | Agricola (Full Farm) | 1–5 (MP: Y) | `agricola-card-only`, `agricola-creatures` — full adds worker placement board + harvest phases | XL | Full worker-placement: feed family, plough fields, fence pastures, breed animals across 14 rounds. |
| `caverna-full` | Caverna: The Cave Farmers | 1–7 (MP: Y) | `caverna-cave-vs-cave` (2p mini) — full is the 7-player dwarf farm | XL | Dwarves mine a cave + farm a field: weapons, expeditions, sheep, rubies — Agricola's roomier cousin. |
| `through-the-ages-full` | Through the Ages: A New Story of Civilization | 2–4 (MP: Y) | none | XL | Civ-in-a-box: tech tree, military, wonders, leaders — three ages of card-drafted civilization building. |
| `brass-birmingham-full` | Brass: Birmingham | 2–4 (MP: Y) | `brass-canals`, `brass-lancashire` — Birmingham is the modern rebuild with beer + breweries | XL | Industrial-revolution network-build: canals → rails, breweries fuel beer-gated sales, two-era scoring. |
| `acquire-full` | Acquire (Full) | 2–6 (MP: Y) | `acquire-hotels` (basic) — full adds stock majority bonuses, mergers, end-trigger rules | L | Sid Sackson's classic: build hotel chains, hold majority stock, profit from mergers. |

## Cards

| Proposed id | Display title | Players | Already-in-registry | Complexity | Pitch |
|-------------|---------------|---------|---------------------|------------|-------|
| `uno-full` | UNO (Full Rulebook) | 2–10 (MP: Y) | `uno-stacko`, `uno-flip-quiz`, `uno-attack-quiz` — full adds 500-point scoring across rounds | S | The complete 500-point match: stacking house-rule toggle, wild draw-four challenge, full action deck. |
| `skip-bo-full` | Skip-Bo (Full) | 2–6 (MP: Y) | none | S | Stockpile racing with build piles 1–12 — first to empty the stockpile across a 5-hand match wins. |
| `phase-10-full` | Phase 10 (Full) | 2–6 (MP: Y) | none | S | Complete all 10 phases (sets, runs, color) over a long card-game evening; skip cards punish leaders. |
| `sequence-full` | Sequence (Full) | 2–12 (MP: Y) | `sequence-six`, `sequences-dice` — full is the original 100-square board with team play | S | Card-driven 5-in-a-row on a 10×10 board of card faces, with one-eyed-jack removes and two-eyed-jack wilds. |
| `sushi-go-party-full` | Sushi Go Party! | 2–8 (MP: Y) | `sushi-go-conveyor` (mini conveyor toy) — full is the Party drafting menu | M | Pick-and-pass sushi drafting with the full Party menu — choose 8 cards per game from 22 types. |
| `splendor-full` | Splendor (Full Base) | 2–4 (MP: Y) | `splendor-gems`, `splendor-marvel`, `splendor-dune`, `splendor-cities`, `splendor-trade-routes`, `splendor-merchant` — full adds noble tile bidding + 15-point race | M | Buy gem mines that buy bigger gem mines — race to 15 prestige with attendant nobles. |
| `bohnanza-full` | Bohnanza (Full) | 2–7 (MP: Y) | none | M | Trade bean cards (and never reorder your hand) to plant fields and earn taler — full 22-bean deck. |
| `dominion-full` | Dominion (Full Base Set) | 2–4 (MP: Y) | `dominion-deck` (toy), `dominion-intrigue`, `dominion-seaside`, `dominion-prosperity`, `dominion-adventures` — full is the 25-kingdom-card base set with proper random setup | L | The original deckbuilder: 10-kingdom-card random setups from the 25-card base, victory-card endgame trigger. |
| `7-wonders-full` | 7 Wonders (Full Base) | 3–7 (MP: Y) | `seven-wonders-draft` plus 7 expansion shells — no full base | L | Three-age card drafting with neighbors, science sets, military combat, wonder build phases. |
| `codenames-full` | Codenames (Full) | 4–8+ (MP: Y) | `codenames-lite`, `codenames-pictures`, `codenames-xxl` — full adds spymaster timer + duet drift + full 400-word deck | M | Spymaster-led 5×5 word-grid guessing with bystander/assassin penalties; full rules incl. duet & timer. |
| `dixit-full` | Dixit (Full) | 3–6 (MP: Y) | `dixit-quiz`, `dixit-clue` — full is the storyteller voting game with 84-card base deck | M | Storyteller hints a card with a phrase; players bluff with theirs; vote and score. Full base deck included. |
| `pictionary-full` | Pictionary (Full) | 4–10+ (MP: Y) | `pictionary-prompter`, `pictionary-mania-quiz`, `pictionary-card-game-quiz`, `pictionary-man-quiz`, `pictionary-base-quiz` — full is the board+timer team game | M | Team drawing race across the board: persons, objects, actions, difficult, all-play — full timer and dice. |
| `trivial-pursuit-full` | Trivial Pursuit (Full Genus) | 2–6 (MP: Y) | 8 trivial-pursuit-*-quiz packs — full is the wedge-collection board game | L | The wheel-spinning, wedge-collecting full board with the 6-color category pie and central hub showdown. |
| `wingspan-full` | Wingspan (Full Base) | 1–5 (MP: Y) | `wingspan-aviary`, `wingspan-dice-game`, `wingspan-dice-roll`, plus Asia/Oceania/Europe expansion shells, `wingspan-nesting`, `wingspan-asia-flock` — no full base | L | The bird-engine-builder: feed, lay eggs, draw cards across forest/grassland/wetland habitats. |
| `azul-full` | Azul (Full Base) | 2–4 (MP: Y) | `azul-base`, `azul-summer-pavilion`, `azul-sintra`, `azul-queens-garden`, `azul-stained-glass` — confirm `azul-base` ships full row-tiling + penalty rules | M | Draft tiles from factories, complete rows on your palace wall, watch for the broken-tile penalty. |
| `king-of-tokyo-full` | King of Tokyo | 2–6 (MP: Y) | none | M | Yahtzee-style dice combat: roll claws, hearts, energy, smash, score VP, and rule Tokyo as a monster. |
| `yahtzee-full-match` | Yahtzee (Full Scorecard Match) | 1–10 (MP: Y) | `yahtzee`, `yahtzee-mini`, `mini-yahtzee`, `triple-yahtzee`, `battle-yahtzee`, `jumbo-yahtzee`, `yahtzee-boss-dice`, `yahtzee-free-for-all`, `open-face-yahtzee` — full is best-of-3 scorecard match with all 13 categories | S | Roll the official 13-category scorecard with upper-section bonus and Yahtzee chips; best-of-3 match. |
| `quirkle-full` | Qwirkle (Full) | 2–4 (MP: Y) | none | S | Tile-laying with 6 colors × 6 shapes — match a row by color OR shape; bonus for completing a 6-tile line. |
| `rummikub-full` | Rummikub (Full) | 2–4 (MP: Y) | none | M | Tile-rummy on the table: groups and runs, manipulate the public tableau, joker tiles, end-of-hand minus scoring. |

## Dice

| Proposed id | Display title | Players | Already-in-registry | Complexity | Pitch |
|-------------|---------------|---------|---------------------|------------|-------|
| `trouble-full` | Trouble (Full 4-Pawn) | 2–4 (MP: Y) | `trouble-mini` (1-pawn toy) — full is 4-pawn pop-o-matic race | S | Pop the dome to roll, race 4 pawns home, send opponents back with the satisfying "bump." |
| `parcheesi-full` | Parcheesi (Full) | 2–4 (MP: Y) | `parcheesi-team-race` — full adds doubles bonus + blockades + safe spaces | M | The full Indian cross-and-circle race: blockade with doublets, bonus rolls for sending opponents home. |
| `ludo-full` | Ludo (Full) | 2–4 (MP: Y) | `ludo-quick-play`, `ludo-mini-race` — full requires 6-to-enter + capture-bonus + 4-pawn race | S | The international classic: roll a 6 to leave home, race 4 pawns around the cross, capture for a bonus roll. |
| `qwixx-full` | Qwixx (Full Scoresheet) | 2–5 (MP: Y) | none | S | Tactical dice-cross-off scoresheet game with locked rows, penalty boxes, and 6-color number tracks. |
| `farkle-full` | Farkle (Full 10,000) | 2–10 (MP: Y) | none | S | Push-your-luck dice: bank sets or roll the leftovers — first to 10,000 wins. Full hot-dice rules. |
| `boggle-full` | Boggle (Full) | 1–8+ (MP: Y) | none | S | Shake the 16 lettered cubes, find adjacent-letter words in 3 minutes — full Big Boggle 5×5 toggle. |
| `liars-dice-full` | Liar's Dice / Perudo (Full) | 2–6 (MP: Y) | none | M | Bid escalating dice totals across a hidden cup, call "liar," eliminate dice — full Perudo rules with palifico. |

## Solitaire

| Proposed id | Display title | Players | Already-in-registry | Complexity | Pitch |
|-------------|---------------|---------|---------------------|------------|-------|
| `mahjong-solitaire-full` | Mahjong Solitaire (Full Turtle) | 1 (MP: N) | none | S | The full 144-tile Turtle layout with shuffle/undo/hint counters and 13-layout campaign. |
| `pandemic-solo-full` | Pandemic (Full Solo, 4-Role) | 1 (MP: N) | `pandemic-*` family — full solo is the rulebook 4-character solo variant | L | Pilot 4 roles solo through the full epidemic ladder — cure all 4 diseases before outbreak limit. |

## Arcade

| Proposed id | Display title | Players | Already-in-registry | Complexity | Pitch |
|-------------|---------------|---------|---------------------|------------|-------|
| `crokinole-full` | Crokinole (Full) | 2–4 (MP: Y) | none | M | Flick discs at the 20-hole center past peg defenders — full 8-round match with team play. |
| `carrom-full` | Carrom (Full) | 2–4 (MP: Y) | none | M | South-Asian flicking classic: pocket black/white carrom-men, queen rule, full set-based scoring. |

---

## Tier summary

- **S (≤200 LOC, no AI)**: connect-four-full, chutes-and-ladders-long, mancala-full-kalah, uno-full, skip-bo-full, phase-10-full, sequence-full, yahtzee-full-match, quirkle-full, trouble-full, ludo-full, qwixx-full, farkle-full, boggle-full, mahjong-solitaire-full — **15 entries**
- **M (200–600 LOC, simple AI)**: mouse-trap-full, operation-full, battleship-full, othello-full-tournament, checkers-full-tournament, chinese-checkers-full, sorry-full, aggravation-full, backgammon-full-match, sushi-go-party-full, splendor-full, bohnanza-full, codenames-full, dixit-full, pictionary-full, azul-full, king-of-tokyo-full, rummikub-full, parcheesi-full, liars-dice-full, crokinole-full, carrom-full — **22 entries**
- **L (multi-phase turn structure)**: chess-full-clock, clue-full, monopoly-full, the-game-of-life-full, scrabble-full, stratego-full, ticket-to-ride-full, carcassonne-full, pandemic-full, acquire-full, dominion-full, 7-wonders-full, trivial-pursuit-full, wingspan-full, pandemic-solo-full — **15 entries**
- **XL (full AI player, trade negotiation, large rule surface)**: risk-full, catan-full, catan-cities-knights, power-grid-full, terra-mystica-full, puerto-rico-full, agricola-full, caverna-full, through-the-ages-full, brass-birmingham-full — **10 entries**

**Total: 62 entries.**
