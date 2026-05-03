# Hint Coverage Audit

_Generated: 2026-05-02_

Audit of `hint:` field presence in `web/src/games/*/index.ts`. A game is
considered "hint-wired" if the literal substring `hint:` appears anywhere
in its `index.ts` (covers both `hint:` definitions and `hint:` invocations).

## Summary

- **Total games:** 4505
- **With hint:** 4268
- **Without hint:** 237
- **Coverage:** 94.7%

## By Category

| Category | With Hint | Total | Coverage | Unwired |
| --- | ---: | ---: | ---: | ---: |
| solitaire | 452 | 452 | 100.0% | 0 |
| cards | 976 | 976 | 100.0% | 0 |
| dice | 452 | 474 | 95.4% | 22 |
| board | 1878 | 2093 | 89.7% | 215 |
| arcade | 510 | 510 | 100.0% | 0 |
| **TOTAL** | **4268** | **4505** | **94.7%** | **237** |

## Unwired Game IDs by Category

Games below have no `hint:` substring in their `index.ts`.

### solitaire (0 unwired / 452 total — 100.0% coverage)

_All games in this category have hints wired._

### cards (0 unwired / 976 total — 100.0% coverage)

_All games in this category have hints wired._

### dice (22 unwired / 474 total — 95.4% coverage)

- `battle-yahtzee`
- `dice-frenzy-mini`
- `dice-frenzy-tall`
- `dice-tournament`
- `dice-tower-mini`
- `dice-trade-route`
- `dice-village`
- `generala-doble`
- `generala-servida`
- `jumbo-yahtzee`
- `kniffel`
- `maxi-yatzy`
- `mini-cee-lo`
- `one-deck-dungeon-mini`
- `roll-for-galaxy-mini`
- `roll-player-character`
- `seasons-elemental`
- `ship-captain-crew-fool`
- `tiny-epic-galaxies-mini`
- `triple-yahtzee`
- `video-keno`
- `yatzy-scand`

### board (215 unwired / 2093 total — 89.7% coverage)

- `agon`
- `alquerque`
- `anagram-pair`
- `animal-shogi`
- `arctic-survival`
- `ard-ri`
- `armenian-draughts`
- `asteroids-like`
- `atari-go`
- `ayo-mancala`
- `babylonia-tiles`
- `bagh-chal`
- `balloon-pop`
- `bantumi-game`
- `bao`
- `battleship-solo`
- `binary-puzzle`
- `blokus-trigon-mini`
- `bouncer`
- `brandub`
- `brandubh`
- `brazilian-draughts`
- `breakthrough`
- `chain-reaction`
- `chinese-checkers`
- `chomp-game`
- `classic-maze`
- `climb-jumper`
- `clobber`
- `color-lines`
- `colored-tile-maze`
- `columns`
- `congkak-game`
- `connect-four-classic-cl`
- `connect-four-mini`
- `connect-lights`
- `connect-pipes-pro`
- `daldos`
- `dama-turkish`
- `dameo`
- `dobble-camping`
- `dobble-european`
- `dobble-kids`
- `dont-break-ice`
- `dot-grid-puzzle`
- `dot-to-dot`
- `dots-capture`
- `dr-mario-like`
- `draftosaurus-mini`
- `drop7-like`
- `dvonn-lite`
- `eight-queens-mini`
- `falling-catcher`
- `fifteen`
- `five-field-kono`
- `five-in-a-row`
- `flood-it`
- `flowfree-clone`
- `fog-maze`
- `food-truck-tycoon`
- `fox-and-geese`
- `frisian-draughts`
- `frog-catcher`
- `galaxies-puzzle`
- `gear-puzzle`
- `gomoku-mini`
- `gomoku-pro`
- `gomoku-tactic`
- `gonnect-game`
- `grand-othello-mini`
- `gravity-lander`
- `gravity-maze`
- `halma`
- `hare-and-hounds`
- `havannah`
- `hex-match-3`
- `hidato`
- `hnefatafl`
- `homophone-match`
- `ice-slide-maze`
- `indian-summer-mini`
- `infinite-tic-tac-toe`
- `ingenious-hex-mini`
- `international-draughts`
- `italian-draughts`
- `janggi`
- `key-maze`
- `kharbaga`
- `klotski`
- `kyodai`
- `kyoto-shogi`
- `lasca-stack`
- `light-switch-puzzle`
- `lights-out-3d`
- `lights-out-mini`
- `lines-of-action`
- `loa-small`
- `logic-gates-sim`
- `losing-checkers`
- `magic-square-3`
- `magpie-tafl`
- `mahjong-solitaire-dragon`
- `makruk`
- `match-3`
- `match-three-saga`
- `math-challenge`
- `maze-chase`
- `memory-match`
- `mine-delver`
- `mini-shogi`
- `mini-xiangqi`
- `minichess-4x4`
- `minichess-6x6`
- `minishogi-5x5`
- `mirror-maze`
- `misere-tic-tac-toe`
- `missile-command-like`
- `mu-torere`
- `nim-game`
- `nonogram`
- `nonogram-3x3`
- `nonogram-5x5`
- `notakto-mini`
- `numeric-tic-tac-toe`
- `numlinks`
- `nurikabe`
- `operation-game`
- `order-and-chaos`
- `pairs-themed`
- `pallanguzhi`
- `parking-puzzle`
- `pentalath`
- `pente-capture`
- `pentomino-puzzle`
- `picaria`
- `ponnuki`
- `pool-checkers`
- `puyo-pop-like`
- `pylos-pyramid`
- `quick-tick`
- `racing-kings`
- `religions-quiz`
- `renju-game`
- `rotate-match`
- `roulette`
- `rush-hour`
- `russian-draughts`
- `same-game`
- `seega`
- `shatranj-arabic`
- `shisen-sho`
- `shogi`
- `sim-edges`
- `sittuyin`
- `six-mens-morris`
- `slide-puzzle-3x3`
- `slither`
- `slitherlink`
- `sokoban`
- `space-invaders-like`
- `spanish-draughts`
- `spot-it`
- `spot-it-50-plus`
- `spot-it-classic`
- `spot-it-dino`
- `spot-it-harry-potter`
- `spot-it-jr`
- `spot-it-splash`
- `spring-meadow-mini`
- `star-battle`
- `sternhalma-game`
- `story-builder`
- `sudoku`
- `sungka`
- `surakarta`
- `synonym-match`
- `tablan`
- `tablut`
- `target-practice`
- `tawlbwrdd`
- `teleport-maze`
- `three-mens-morris`
- `tic-tac-toe`
- `tic-tac-toe-3-in-row`
- `tic-tac-toe-3x3-classic`
- `tic-tac-toe-4x4`
- `tic-tac-toe-4x4-cl`
- `tic-tac-toe-blitz`
- `tic-tac-toe-corners-win`
- `tic-tac-toe-large`
- `tic-tac-toe-toroidal`
- `tictactoe-3d`
- `tigris-euphrates-mini`
- `tile-match-rush`
- `toguz-korgool`
- `treasure-hunt`
- `triangle-match`
- `tube-color`
- `tumbling-blocks`
- `turkish-draughts`
- `twelve-mens-morris`
- `ukiyo-tile`
- `ultimate-tic-tac-mini`
- `ultimate-tic-tac-toe`
- `unruly`
- `verdant-houseplant`
- `wild-tic-mini`
- `wild-tic-tac-toe`
- `wire-connect`
- `wolf-and-sheep`
- `wythoffs-game`
- `xiangqi`
- `y-game`
- `yavalath`
- `zamma`

### arcade (0 unwired / 510 total — 100.0% coverage)

_All games in this category have hints wired._

---

_Audit method: literal `hint:` substring match on each `index.ts`. Category derived from the first `category: "..."` declaration in the file._
