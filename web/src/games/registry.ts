import type { GamePlugin } from "../platform/game-plugin/types.js";
import { insectsQuizPlugin } from "./insects-quiz/index.js";
import { fishQuizPlugin } from "./fish-quiz/index.js";
import { mammalsQuizPlugin } from "./mammals-quiz/index.js";
import { reptilesQuizPlugin } from "./reptiles-quiz/index.js";
import { oceansQuizPlugin } from "./oceans-quiz/index.js";
import { desertsQuizPlugin } from "./deserts-quiz/index.js";
import { mountainsQuizPlugin } from "./mountains-quiz/index.js";
import { riversQuizPlugin } from "./rivers-quiz/index.js";
import { citiesQuizPlugin } from "./cities-quiz/index.js";
import { monumentsQuizPlugin } from "./monuments-quiz/index.js";
import { cardBidFlipPlugin } from "./card-bid-flip/index.js";
import { cardPyramidGrabPlugin } from "./card-pyramid-grab/index.js";
import { cardSnap3Plugin } from "./card-snap-3/index.js";
import { cardStackBetPlugin } from "./card-stack-bet/index.js";
import { cardSpinPickPlugin } from "./card-spin-pick/index.js";
import { diceCoinBetPlugin } from "./dice-coin-bet/index.js";
import { diceTarget25Plugin } from "./dice-target-25/index.js";
import { dicePyramidRollPlugin } from "./dice-pyramid-roll/index.js";
import { diceStreak9Plugin } from "./dice-streak-9/index.js";
import { diceBingoMiniPlugin } from "./dice-bingo-mini/index.js";
import { arrowHitPlugin } from "./arrow-hit/index.js";
import { balloonBurstPlugin } from "./balloon-burst/index.js";
import { fishingCastPlugin } from "./fishing-cast/index.js";
import { ladderClimbPlugin } from "./ladder-climb/index.js";
import { lavaLeapPlugin } from "./lava-leap/index.js";
import { molePopPlugin } from "./mole-pop/index.js";
import { ringerCoinPlugin } from "./ringer-coin/index.js";
import { snowballThrowPlugin } from "./snowball-throw/index.js";
import { sockTossPlugin } from "./sock-toss/index.js";
import { pickleJarPlugin } from "./pickle-jar/index.js";
import { additionSprintPlugin } from "./addition-sprint/index.js";
import { subtractionSprintPlugin } from "./subtraction-sprint/index.js";
import { algebraSolveXPlugin } from "./algebra-solve-x/index.js";
import { orderOfOpsPlugin } from "./order-of-ops/index.js";
import { primeFactorPlugin } from "./prime-factor/index.js";
import { exponentDrillPlugin } from "./exponent-drill/index.js";
import { romanNumeralsPlugin } from "./roman-numerals/index.js";
import { numberBondsPlugin } from "./number-bonds/index.js";
import { memoryPairsKidsPlugin } from "./memory-pairs-kids/index.js";
import { countingBearsPlugin } from "./counting-bears/index.js";
import { applePickingPlugin } from "./apple-picking/index.js";
import { farmyardMatchPlugin } from "./farmyard-match/index.js";
import { treasureHuntPlugin } from "./treasure-hunt/index.js";
import { rainbowSortPlugin } from "./rainbow-sort/index.js";
import { alphabetCatchPlugin } from "./alphabet-catch/index.js";
import { numberOrderPlugin } from "./number-order/index.js";
import { cannonShotPlugin } from "./cannon-shot/index.js";
import { archeryTargetPlugin } from "./archery-target/index.js";
import { dartThrowPlugin } from "./dart-throw/index.js";
import { axeThrowPlugin } from "./axe-throw/index.js";
import { pendulumDropPlugin } from "./pendulum-drop/index.js";
import { marbleDropPlugin } from "./marble-drop/index.js";
import { catapultCastlePlugin } from "./catapult-castle/index.js";
import { skeeBallPlugin } from "./skee-ball/index.js";
import { schafkopfPlugin } from "./schafkopf/index.js";
import { ohHellPlugin } from "./oh-hell/index.js";
import { bourrePlugin } from "./bourre/index.js";
import { fortyFivesPlugin } from "./forty-fives/index.js";
import { beziquePlugin } from "./bezique/index.js";
import { piquetPlugin } from "./piquet/index.js";
import { soloWhistPlugin } from "./solo-whist/index.js";
import { bostonPlugin } from "./boston/index.js";
import { galaxyFormationPlugin } from "./galaga-like/index.js";
import { tunnelDigPlugin } from "./dig-dug-like/index.js";
import { qJumpPlugin } from "./qbert-like/index.js";
import { barrelJumperPlugin } from "./donkey-kong-like/index.js";
import { skyJoustPlugin } from "./joust-like/index.js";
import { skyDefenderPlugin } from "./defender-like/index.js";
import { iceBlocksPlugin } from "./pengo-like/index.js";
import { lunarDescentPlugin } from "./lunar-lander-like/index.js";
import { dropDeadPlugin } from "./drop-dead/index.js";
import { mexicoDicePlugin } from "./mexico-dice/index.js";
import { zilchPlugin } from "./zilch/index.js";
import { twentySixPlugin } from "./twenty-six/index.js";
import { qwixxPlugin } from "./qwixx/index.js";
import { rollThroughAgesPlugin } from "./roll-through-ages/index.js";
import { macaoDicePlugin } from "./macao-dice/index.js";
import { helanGarPlugin } from "./helan-gar/index.js";
import { agonPlugin } from "./agon/index.js";
import { turkishDraughtsPlugin } from "./turkish-draughts/index.js";
import { armenianDraughtsPlugin } from "./armenian-draughts/index.js";
import { foxAndGeesePlugin } from "./fox-and-geese/index.js";
import { kharbagaPlugin } from "./kharbaga/index.js";
import { gomokuProPlugin } from "./gomoku-pro/index.js";
import { fiveFieldKonoPlugin } from "./five-field-kono/index.js";
import { baghChalPlugin } from "./bagh-chal/index.js";
import { farmManagerPlugin } from "./farm-manager/index.js";
import { stockTickerPlugin } from "./stock-ticker/index.js";
import { storehousePlugin } from "./storehouse/index.js";
import { milliganCellPlugin } from "./milligan-cell/index.js";
import { doubleFreeCellPlugin } from "./double-freecell/index.js";
import { westcliffEasyPlugin } from "./westcliff-easy/index.js";
import { numberMemoryPlugin } from "./number-memory/index.js";
import { colorSequencePlugin } from "./color-sequence/index.js";
import { imageMemoryPlugin } from "./image-memory/index.js";
import { dualNBackPlugin } from "./dual-n-back/index.js";
import { patternRecallPlugin } from "./pattern-recall/index.js";
import { quickCountingPlugin } from "./quick-counting/index.js";
import { oddShapeOutPlugin } from "./odd-shape-out/index.js";
import { faceRecognitionPlugin } from "./face-recognition/index.js";
import { texasHoldemPlugin } from "./texas-holdem/index.js";
import { omahaHoldemPlugin } from "./omaha-holdem/index.js";
import { sevenCardStudPlugin } from "./seven-card-stud/index.js";
import { fiveCardDrawPlugin } from "./five-card-draw/index.js";
import { razzPlugin } from "./razz/index.js";
import { badugiPlugin } from "./badugi/index.js";
import { chessPlugin } from "./chess/index.js";
import { suicideChessPlugin } from "./suicide-chess/index.js";
import { atomicChessPlugin } from "./atomic-chess/index.js";
import { chess960Plugin } from "./chess960/index.js";
import { racingKingsPlugin } from "./racing-kings/index.js";
import { hordeChessPlugin } from "./horde-chess/index.js";
import { threeCheckPlugin } from "./three-check/index.js";
import { crazyhousePlugin } from "./crazyhouse/index.js";
import { kingOfTheHillPlugin } from "./king-of-the-hill/index.js";
import { antichessPlugin } from "./antichess/index.js";
import { progressiveChessPlugin } from "./progressive-chess/index.js";
import { internationalDraughtsPlugin } from "./international-draughts/index.js";
import { chineseCheckersPlugin } from "./chinese-checkers/index.js";
import { halmaPlugin } from "./halma/index.js";
import { cameroonPlugin } from "./cameroon/index.js";
import { kismetPlugin } from "./kismet/index.js";
import { miaPlugin } from "./mia/index.js";
import { chicagoDicePlugin } from "./chicago-dice/index.js";
import { shutTheBoxPlugin } from "./shut-the-box/index.js";
import { dicePokerPlugin } from "./dice-poker/index.js";
import { accordionPlugin } from "./accordion/index.js";
import { beleagueredCastlePlugin } from "./beleaguered-castle/index.js";
import { streetsAndAlleysPlugin } from "./streets-and-alleys/index.js";
import { penguinPlugin } from "./penguin/index.js";
import { bakersGamePlugin } from "./bakers-game/index.js";
import { fortressSolitairePlugin } from "./fortress-solitaire/index.js";
import { seaHavenTowersPlugin } from "./sea-haven-towers/index.js";
import { canfieldStorehousePlugin } from "./canfield-storehouse/index.js";
import { cornersSolitairePlugin } from "./corners-solitaire/index.js";
import { kingAlbertPlugin } from "./king-albert/index.js";
import { napoleonAtSaintHelenaPlugin } from "./napoleon-at-saint-helena/index.js";
import { fourSeasonsPlugin } from "./four-seasons/index.js";
import { deucesSolitairePlugin } from "./deuces-solitaire/index.js";
import { westcliffPlugin } from "./westcliff/index.js";
import { kingsInTheCornerPlugin } from "./kings-in-the-corner/index.js";
import { acesUpPlugin } from "./aces-up/index.js";
import { yachtPlugin } from "./yacht/index.js";
import { balutPlugin } from "./balut/index.js";
import { generalaPlugin } from "./generala/index.js";
import { shipCaptainCrewPlugin } from "./ship-captain-crew/index.js";
import { buncoPlugin } from "./bunco/index.js";
import { tenThousandPlugin } from "./ten-thousand/index.js";
import { zombieDicePlugin } from "./zombie-dice/index.js";
import { canfieldPlugin } from "./canfield/index.js";
import { golfPlugin } from "./golf/index.js";
import { yukonPlugin } from "./yukon/index.js";
import { fortyThievesPlugin } from "./forty-thieves/index.js";
import { scorpionPlugin } from "./scorpion/index.js";
import { laBelleLuciePlugin } from "./la-belle-lucie/index.js";
import { clockPlugin } from "./clock/index.js";
import { monteCarloPlugin } from "./monte-carlo/index.js";
import { goFishPlugin } from "./go-fish/index.js";
import { warPlugin } from "./war/index.js";
import { pigPlugin } from "./pig/index.js";
import { klondikePlugin } from "./klondike/index.js";
import { freecellPlugin } from "./freecell/index.js";
import { yahtzeePlugin } from "./yahtzee/index.js";
import { farklePlugin } from "./farkle/index.js";
import { ticTacToePlugin } from "./tic-tac-toe/index.js";
import { checkersPlugin } from "./checkers/index.js";
import { blackjackPlugin } from "./blackjack/index.js";
import { videoPokerPlugin } from "./video-poker/index.js";
import { connect4Plugin } from "./connect-4/index.js";
import { unoLikePlugin } from "./uno-like/index.js";
import { spiderPlugin } from "./spider/index.js";
import { sudokuPlugin } from "./sudoku/index.js";
import { snakePlugin } from "./snake/index.js";
import { heartsPlugin } from "./hearts/index.js";
import { wordGuessPlugin } from "./word-guess/index.js";
import { minesweeperPlugin } from "./minesweeper/index.js";
import { twoFortyEightPlugin } from "./twenty-forty-eight/index.js";
import { memoryMatchPlugin } from "./memory-match/index.js";
import { crazyEightsPlugin } from "./crazy-eights/index.js";
import { pyramidPlugin } from "./pyramid/index.js";
import { triPeaksPlugin } from "./tri-peaks/index.js";
import { reversiPlugin } from "./reversi/index.js";
import { lightsOutPlugin } from "./lights-out/index.js";
import { fifteenPuzzlePlugin } from "./fifteen/index.js";
import { hangmanPlugin } from "./hangman/index.js";
import { liarsDicePlugin } from "./liars-dice/index.js";
import { breakoutPlugin } from "./breakout/index.js";
import { oldMaidPlugin } from "./old-maid/index.js";
import { snapPlugin } from "./snap/index.js";
import { slapjackPlugin } from "./slapjack/index.js";
import { presidentPlugin } from "./president/index.js";
import { bsPlugin } from "./bs/index.js";
import { egyptianRatscrewPlugin } from "./egyptian-ratscrew/index.js";
import { speedPlugin } from "./speed/index.js";
import { nineMensMorrisPlugin } from "./nine-mens-morris/index.js";
import { mancalaPlugin } from "./mancala/index.js";
import { mastermindPlugin } from "./mastermind/index.js";
import { gomokuPlugin } from "./gomoku/index.js";
import { dotsAndBoxesPlugin } from "./dots-and-boxes/index.js";
import { battleshipPlugin } from "./battleship/index.js";
import { nonogramPlugin } from "./nonogram/index.js";
import { wordSearchPlugin } from "./word-search/index.js";
import { wordLadderPlugin } from "./word-ladder/index.js";
import { anagramPlugin } from "./anagram/index.js";
import { make24Plugin } from "./make-24/index.js";
import { pegSolitairePlugin } from "./peg-solitaire/index.js";
import { pongPlugin } from "./pong/index.js";
import { tetrisPlugin } from "./tetris-like/index.js";
import { froggerPlugin } from "./frogger-like/index.js";
import { asteroidsPlugin } from "./asteroids-like/index.js";
import { spaceInvadersPlugin } from "./space-invaders-like/index.js";
import { baccaratPlugin } from "./baccarat/index.js";
import { roulettePlugin } from "./roulette/index.js";
import { crapsPlugin } from "./craps/index.js";
import { slotsPlugin } from "./slots/index.js";
import { caribbeanStudPlugin } from "./caribbean-stud/index.js";
import { whackAMolePlugin } from "./whack-a-mole/index.js";
import { plinkoPlugin } from "./plinko/index.js";
import { bubbleShooterPlugin } from "./bubble-shooter/index.js";
import { towerOfHanoiPlugin } from "./tower-of-hanoi/index.js";
import { reactionTimePlugin } from "./reaction-time/index.js";
import { simonPlugin } from "./simon/index.js";
import { ginRummyPlugin } from "./gin-rummy/index.js";
import { spadesPlugin } from "./spades/index.js";
import { euchrePlugin } from "./euchre/index.js";
import { rummy500Plugin } from "./rummy-500/index.js";
import { casinoPlugin } from "./casino/index.js";
import { fiveCrownsPlugin } from "./five-crowns/index.js";
import { highCardFlushPlugin } from "./high-card-flush/index.js";
import { sevensPlugin } from "./sevens/index.js";
import { bowlingPlugin } from "./bowling/index.js";
import { horseshoesPlugin } from "./horseshoes/index.js";
import { ticTacToe3DPlugin } from "./tictactoe-3d/index.js";
import { numberGuesserPlugin } from "./number-guesser/index.js";
import { bingoPlugin } from "./bingo/index.js";
import { coinFlipStreakPlugin } from "./coin-flip-streak/index.js";
import { spiderettePlugin } from "./spiderette/index.js";
import { eightOffPlugin } from "./eight-off/index.js";
import { missMilliganPlugin } from "./miss-milligan/index.js";
import { crescentPlugin } from "./crescent/index.js";
import { gatePlugin } from "./gate/index.js";
import { yukonCellsPlugin } from "./yukon-cells/index.js";
import { whiteheadPlugin } from "./whitehead/index.js";
import { slyFoxPlugin } from "./sly-fox/index.js";
import { hexPlugin } from "./hex/index.js";
import { abalonePlugin } from "./abalone/index.js";
import { santoriniPlugin } from "./santorini/index.js";
import { blokusDuoPlugin } from "./blokus-duo/index.js";
import { pentagoPlugin } from "./pentago/index.js";
import { amazonsPlugin } from "./amazons/index.js";
import { bullsAndCowsPlugin } from "./bulls-and-cows/index.js";
import { slitherlinkPlugin } from "./slitherlink/index.js";
import { nurikabePlugin } from "./nurikabe/index.js";
import { hidatoPlugin } from "./hidato/index.js";
import { futoshikiPlugin } from "./futoshiki/index.js";
import { cryptogramPlugin } from "./cryptogram/index.js";
import { kakuroPlugin } from "./kakuro/index.js";
import { kenkenPlugin } from "./kenken/index.js";
import { tentsPlugin } from "./tents/index.js";
import { skyscrapersPlugin } from "./skyscrapers/index.js";
import { hitoriPlugin } from "./hitori/index.js";
import { masyuPlugin } from "./masyu/index.js";
import { killerSudokuPlugin } from "./killer-sudoku/index.js";
import { rushHourPlugin } from "./rush-hour/index.js";
import { sokobanPlugin } from "./sokoban/index.js";
import { unrulyPlugin } from "./unruly/index.js";
import { starBattlePlugin } from "./star-battle/index.js";
import { missileCommandPlugin } from "./missile-command-like/index.js";
import { mazeChasePlugin } from "./maze-chase/index.js";
import { climbJumperPlugin } from "./climb-jumper/index.js";
import { gravityLanderPlugin } from "./gravity-lander/index.js";
import { endlessRunnerPlugin } from "./endless-runner/index.js";
import { bouncerPlugin } from "./bouncer/index.js";
import { bogglePlugin } from "./boggle/index.js";
import { acrophobiaPlugin } from "./acrophobia/index.js";
import { wordPokerPlugin } from "./word-poker/index.js";
import { crossCluesPlugin } from "./cross-clues/index.js";
import { codewordsPlugin } from "./codewords/index.js";
import { letterBoxedPlugin } from "./letter-boxed/index.js";
import { whistPlugin } from "./whist/index.js";
import { fiveHundredPlugin } from "./five-hundred/index.js";
import { pinochlePlugin } from "./pinochle/index.js";
import { sheepsheadPlugin } from "./sheepshead/index.js";
import { wizardPlugin } from "./wizard/index.js";
import { ninetyNinePlugin } from "./ninety-nine/index.js";
import { cantStopPlugin } from "./cant-stop/index.js";
import { perudoPlugin } from "./perudo/index.js";
import { dudoPlugin } from "./dudo/index.js";
import { kingdomsDicePlugin } from "./kingdoms-dice/index.js";
import { tenziPlugin } from "./tenzi/index.js";
import { beatThatPlugin } from "./beat-that/index.js";
import { parcheesiPlugin } from "./parcheesi/index.js";
import { ludoPlugin } from "./ludo/index.js";
import { sorryPlugin } from "./sorry/index.js";
import { troublePlugin } from "./trouble/index.js";
import { snakesAndLaddersPlugin } from "./snakes-and-ladders/index.js";
import { ratRacePlugin } from "./rat-race/index.js";
import { hnefataflPlugin } from "./hnefatafl/index.js";
import { fanoronaPlugin } from "./fanorona/index.js";
import { alquerquePlugin } from "./alquerque/index.js";
import { konanePlugin } from "./konane/index.js";
import { owarePlugin } from "./oware/index.js";
import { xiangqiPlugin } from "./xiangqi/index.js";
import { shogiPlugin } from "./shogi/index.js";
import { miniShogiPlugin } from "./mini-shogi/index.js";
import { makrukPlugin } from "./makruk/index.js";
import { sittuyinPlugin } from "./sittuyin/index.js";
import { janggiPlugin } from "./janggi/index.js";
import { baoPlugin } from "./bao/index.js";
import { sungkaPlugin } from "./sungka/index.js";
import { tablutPlugin } from "./tablut/index.js";
import { briscolaPlugin } from "./briscola/index.js";
import { scopaPlugin } from "./scopa/index.js";
import { tutePlugin } from "./tute/index.js";
import { conquianPlugin } from "./conquian/index.js";
import { setbackPlugin } from "./setback/index.js";
import { musPlugin } from "./mus/index.js";
import { dutchBlitzPlugin } from "./dutch-blitz/index.js";
import { nertzPlugin } from "./nertz/index.js";
import { ligrettoPlugin } from "./ligretto/index.js";
import { spitPlugin } from "./spit/index.js";
import { californiaSpeedPlugin } from "./california-speed/index.js";
import { kempsPlugin } from "./kemps/index.js";
import { hanabiPlugin } from "./hanabi/index.js";
import { theCrewPlugin } from "./the-crew/index.js";
import { justOnePlugin } from "./just-one/index.js";
import { codenamesLitePlugin } from "./codenames-lite/index.js";
import { spotItPlugin } from "./spot-it/index.js";
import { setGamePlugin } from "./set-game/index.js";
import { tangramPlugin } from "./tangram/index.js";
import { chainReactionPlugin } from "./chain-reaction/index.js";
import { match3Plugin } from "./match-3/index.js";
import { columnsPlugin } from "./columns/index.js";
import { drMarioPlugin } from "./dr-mario-like/index.js";
import { puyoPopPlugin } from "./puyo-pop-like/index.js";
import { drop7Plugin } from "./drop7-like/index.js";
import { sameGamePlugin } from "./same-game/index.js";
import { mahjongTurtlePlugin } from "./mahjong-solitaire-turtle/index.js";
import { mahjongDragonPlugin } from "./mahjong-solitaire-dragon/index.js";
import { mahjongPyramidPlugin } from "./mahjong-solitaire-pyramid/index.js";
import { shisenShoPlugin } from "./shisen-sho/index.js";
import { pairsThemedPlugin } from "./pairs-themed/index.js";
import { tileMatchRushPlugin } from "./tile-match-rush/index.js";
import { russianSolitairePlugin } from "./russian-solitaire/index.js";
import { bakersDozPlugin } from "./bakers-dozen/index.js";
import { sultanPlugin } from "./sultan-of-turkey/index.js";
import { grandfathersClockPlugin } from "./grandfathers-clock/index.js";
import { scorpionTailPlugin } from "./scorpion-tail/index.js";
import { carpetPlugin } from "./carpet/index.js";
import { cruelPlugin } from "./cruel/index.js";
import { fortyAndEightPlugin } from "./forty-and-eight/index.js";
import { diplomatPlugin } from "./diplomat/index.js";
import { congressPlugin } from "./congress/index.js";
import { simpleSimonPlugin } from "./simple-simon/index.js";
import { emperorPlugin } from "./emperor/index.js";
import { perseverancePlugin } from "./perseverance/index.js";
import { canisterPlugin } from "./canister/index.js";
import { paiGowPokerPlugin } from "./pai-gow-poker/index.js";
import { letItRidePlugin } from "./let-it-ride/index.js";
import { threeCardPokerPlugin } from "./three-card-poker/index.js";
import { redDogPlugin } from "./red-dog/index.js";
import { casinoWarPlugin } from "./casino-war/index.js";
import { sicBoPlugin } from "./sic-bo/index.js";
import { rockPaperScissorsPlugin } from "./rock-paper-scissors/index.js";
import { nimPlugin } from "./nim/index.js";
import { truelPlugin } from "./truel/index.js";
import { secretNumberPlugin } from "./secret-number/index.js";
import { primeClimbPlugin } from "./prime-climb/index.js";
import { rummikubPlugin } from "./rummikub/index.js";
import { quixoPlugin } from "./quixo/index.js";
import { quartoPlugin } from "./quarto/index.js";
import { akariPlugin } from "./akari/index.js";
import { yajilinPlugin } from "./yajilin/index.js";
import { shikakuPlugin } from "./shikaku/index.js";
import { heyawakePlugin } from "./heyawake/index.js";
import { cavePlugin } from "./cave/index.js";
import { fillominoPlugin } from "./fillomino/index.js";
import { aquariumPlugin } from "./aquarium/index.js";
import { tapaPlugin } from "./tapa/index.js";
import { skatPlugin } from "./skat/index.js";
import { klaverjasPlugin } from "./klaverjas/index.js";
import { doppelkopfPlugin } from "./doppelkopf/index.js";
import { belotePlugin } from "./belote/index.js";
import { tressettePlugin } from "./tressette/index.js";
import { schnapsenPlugin } from "./schnapsen/index.js";
import { mariagePlugin } from "./mariage/index.js";
import { preferansPlugin } from "./preferans/index.js";
import { choHanPlugin } from "./cho-han/index.js";
import { acesInThePotPlugin } from "./aces-in-the-pot/index.js";
import { safeKeeperPlugin } from "./safe-keeper/index.js";
import { underOver7Plugin } from "./under-over-7/index.js";
import { bossDicePlugin } from "./boss-dice/index.js";
import { fiveDiceShootoutPlugin } from "./five-dice-shootout/index.js";
import { centennialPlugin } from "./centennial/index.js";
import { gluckshausPlugin } from "./gluckshaus/index.js";
import { typingSpeedPlugin } from "./typing-speed/index.js";
import { targetPracticePlugin } from "./target-practice/index.js";
import { colorMatchPlugin } from "./color-match/index.js";
import { mathChallengePlugin } from "./math-challenge/index.js";
import { frogCatcherPlugin } from "./frog-catcher/index.js";
import { fallingCatcherPlugin } from "./falling-catcher/index.js";
import { duckShootPlugin } from "./duck-shoot/index.js";
import { stackerPlugin } from "./stacker/index.js";
import { handAndFootPlugin } from "./hand-and-foot/index.js";
import { canastaPlugin } from "./canasta/index.js";
import { sambaPlugin } from "./samba/index.js";
import { boliviaPlugin } from "./bolivia/index.js";
import { continentalRummyPlugin } from "./continental-rummy/index.js";
import { contractRummyPlugin } from "./contract-rummy/index.js";
import { fiveHundredRumPlugin } from "./five-hundred-rum/index.js";
import { kalookiPlugin } from "./kalooki/index.js";
import { breakthroughPlugin } from "./breakthrough/index.js";
import { clobberPlugin } from "./clobber/index.js";
import { linesOfActionPlugin } from "./lines-of-action/index.js";
import { go9x9Plugin } from "./go-9x9/index.js";
import { atariGoPlugin } from "./atari-go/index.js";
import { phutballPlugin } from "./phutball/index.js";
import { dvonnLitePlugin } from "./dvonn-lite/index.js";
import { dotsCapturePlugin } from "./dots-capture/index.js";
import { europeanPegSolitairePlugin } from "./european-peg-solitaire/index.js";
import { uncleWiggilyPlugin } from "./uncle-wiggily/index.js";
import { lotto90Plugin } from "./lotto-90/index.js";
import { klotskiPlugin } from "./klotski/index.js";
import { coinCounterPlugin } from "./coin-counter/index.js";
import { guessFlagPlugin } from "./guess-the-flag/index.js";
import { oddOneOutPlugin } from "./odd-one-out/index.js";
import { lightsOut3DPlugin } from "./lights-out-3d/index.js";
import { windmillPlugin } from "./windmill/index.js";
import { seaTowersPlugin } from "./sea-towers/index.js";
import { thumbAndPouchPlugin } from "./thumb-and-pouch/index.js";
import { flowerGardenPlugin } from "./flower-garden/index.js";
import { easthavenPlugin } from "./easthaven/index.js";
import { klondikeByThreesPlugin } from "./klondike-by-threes/index.js";
import { aceOfThePilePlugin } from "./ace-of-the-pile/index.js";
import { relaxedSpiderPlugin } from "./relaxed-spider/index.js";
import { spellingBeePlugin } from "./spelling-bee/index.js";
import { crosswordMiniPlugin } from "./crossword-mini/index.js";
import { textTwistPlugin } from "./text-twist/index.js";
import { acrosticPlugin } from "./acrostic/index.js";
import { bananagramsPlugin } from "./bananagrams/index.js";
import { quordlePlugin } from "./quordle/index.js";
import { wordChainPlugin } from "./word-chain/index.js";
import { wordConstructionPlugin } from "./word-construction/index.js";
import { logicGridPlugin } from "./logic-grid/index.js";
import { bridgesPlugin } from "./bridges/index.js";
import { dominoPlacementPlugin } from "./domino-placement/index.js";
import { kropkiPlugin } from "./kropki/index.js";
import { thermometerPlugin } from "./thermometer/index.js";
import { numberlinkPlugin } from "./numberlink/index.js";
import { kakurasuPlugin } from "./kakurasu/index.js";
import { laserMazePlugin } from "./laser-maze/index.js";
import { cuckooPlugin } from "./cuckoo/index.js";
import { germanWhistPlugin } from "./german-whist/index.js";
import { knockOutWhistPlugin } from "./knock-out-whist/index.js";
import { bastraPlugin } from "./bastra/index.js";
import { agramPlugin } from "./agram/index.js";
import { scatPlugin } from "./scat/index.js";
import { doubleDummyWhistPlugin } from "./double-dummy-whist/index.js";
import { twentyNinePlugin } from "./twenty-nine/index.js";
import { auldLangSynePlugin } from "./auld-lang-syne/index.js";
import { klondikeSuperSolverPlugin } from "./klondike-super-solver/index.js";
import { calculationPlugin } from "./calculation/index.js";
import { pokerSolitairePlugin } from "./poker-solitaire/index.js";
import { pyramidGolfPlugin } from "./pyramid-golf/index.js";
import { nestorPlugin } from "./nestor/index.js";
import { fortyEightOneDeckPlugin } from "./forty-eight-one-deck/index.js";
import { dozenPlugin } from "./dozen/index.js";
import { candyLandPlugin } from "./candy-land/index.js";
import { hiHoCherryOPlugin } from "./hi-ho-cherry-o/index.js";
import { dontBreakIcePlugin } from "./dont-break-ice/index.js";
import { popThePigPlugin } from "./pop-the-pig/index.js";
import { operationGamePlugin } from "./operation-game/index.js";
import { guessWhoPlugin } from "./guess-who/index.js";
import { chutesLaddersKidsPlugin } from "./chutes-ladders-kids/index.js";
import { connectLightsPlugin } from "./connect-lights/index.js";
import { rollASixPlugin } from "./roll-a-six/index.js";
import { highCardDrawPlugin } from "./high-card-draw/index.js";
import { pennyFlipPlugin } from "./penny-flip/index.js";
import { oddDicePlugin } from "./odd-dice/index.js";
import { mathBingoPlugin } from "./math-bingo/index.js";
import { balloonPopPlugin } from "./balloon-pop/index.js";
import { cardLineupPlugin } from "./card-lineup/index.js";
import { numberMazePlugin } from "./number-maze/index.js";
import { generalTriviaPlugin } from "./general-trivia/index.js";
import { twoTruthsLiePlugin } from "./two-truths-lie/index.js";
import { wouldYouRatherPlugin } from "./would-you-rather/index.js";
import { triviaTowerPlugin } from "./trivia-tower/index.js";
import { wordAssociationPlugin } from "./word-association/index.js";
import { rhymeTimePlugin } from "./rhyme-time/index.js";
import { charadesPlugin } from "./charades-prompter/index.js";
import { pictionaryPlugin } from "./pictionary-prompter/index.js";
import { flappyBirdPlugin } from "./flappy-bird-like/index.js";
import { doodleJumpPlugin } from "./doodle-jump-like/index.js";
import { helicopterPlugin } from "./helicopter-game/index.js";
import { wallJumperPlugin } from "./wall-jumper/index.js";
import { tapRunnerPlugin } from "./tap-runner/index.js";
import { meteorDodgerPlugin } from "./meteor-dodger/index.js";
import { paddleBallPlugin } from "./paddle-ball-juggle/index.js";
import { ringThrowerPlugin } from "./ring-thrower/index.js";
import { rikudoPlugin } from "./rikudo/index.js";
import { kingsAndKnightsPlugin } from "./kings-and-knights/index.js";
import { battleshipSolitairePlugin } from "./battleship-solitaire/index.js";
import { trainTracksPlugin } from "./train-tracks/index.js";
import { stitchesPlugin } from "./stitches/index.js";
import { rangePlugin } from "./range/index.js";
import { shakashakaPlugin } from "./shakashaka/index.js";
import { crossTheStreamsPlugin } from "./cross-the-streams/index.js";
import { lcrPlugin } from "./lcr/index.js";
import { snakesRacePlugin } from "./snakes-race/index.js";
import { rollRightPlugin } from "./roll-right/index.js";
import { diddlerPlugin } from "./diddler/index.js";
import { fifteensPlugin } from "./fifteens/index.js";
import { napoleonsTombPlugin } from "./napoleons-tomb/index.js";
import { quickTickPlugin } from "./quick-tick/index.js";
import { paperTossPlugin } from "./paper-toss/index.js";
import { brainiacPlugin } from "./brainiac/index.js";
import { narcoticPlugin } from "./narcotic/index.js";
import { bisleyPlugin } from "./bisley/index.js";
import { kingsPlugin } from "./kings/index.js";
import { gizaPlugin } from "./giza/index.js";
import { alhambraPlugin } from "./alhambra/index.js";
import { pouncePlugin } from "./pounce/index.js";
import { capriciesePlugin } from "./capricieuse/index.js";
import { bigTwoPlugin } from "./big-two/index.js";
import { tienLenPlugin } from "./tien-len/index.js";
import { daifugoPlugin } from "./daifugo/index.js";
import { tichuPlugin } from "./tichu/index.js";
import { lastCardPlugin } from "./last-card/index.js";
import { maoPlugin } from "./mao/index.js";
import { stopTheBusPlugin } from "./stop-the-bus/index.js";
import { zhengPlugin } from "./zheng-shangyou/index.js";
import { newmarketPlugin } from "./newmarket/index.js";
import { michiganPlugin } from "./michigan/index.js";
import { pusoyDosPlugin } from "./pusoy-dos/index.js";
import { nineCardBragPlugin } from "./nine-card-brag/index.js";
import { presidentsPlugin } from "./presidents/index.js";
import { rideTheBusPlugin } from "./ride-the-bus/index.js";
import { pokerSquares2PPlugin } from "./poker-squares-2p/index.js";
import { californiaJackPlugin } from "./california-jack/index.js";
import { wheelSpinPlugin } from "./wheel-spin/index.js";
import { priceGuessPlugin } from "./price-guess/index.js";
import { dealOrNoDealPlugin } from "./deal-or-no-deal/index.js";
import { jeopardyLikePlugin } from "./jeopardy-like/index.js";
import { familyFeudPlugin } from "./family-feud/index.js";
import { lightningRoundPlugin } from "./lightning-round/index.js";
import { millionairePlugin } from "./millionaire/index.js";
import { cashCabPlugin } from "./cash-cab/index.js";
import { timesTablesPlugin } from "./times-tables/index.js";
import { divisionDrillPlugin } from "./division-drill/index.js";
import { fractionMatcherPlugin } from "./fraction-matcher/index.js";
import { sequencePredictorPlugin } from "./sequence-predictor/index.js";
import { unitConverterQuizPlugin } from "./unit-converter-quiz/index.js";
import { percentCalculatorPlugin } from "./percent-calculator/index.js";
import { geographyQuizPlugin } from "./geography-quiz/index.js";
import { chemistryQuizPlugin } from "./chemistry-quiz/index.js";
import { blackjackSwitchPlugin } from "./blackjack-switch/index.js";
import { spanish21Plugin } from "./spanish-21/index.js";
import { pontoonPlugin } from "./pontoon/index.js";
import { videoKenoPlugin } from "./video-keno/index.js";
import { bonus6Plugin } from "./bonus-6/index.js";
import { anteUpBlackjackPlugin } from "./ante-up-blackjack/index.js";
import { casinoHoldemPlugin } from "./casino-holdem/index.js";
import { mississippiStudPlugin } from "./mississippi-stud/index.js";
import { surakartaPlugin } from "./surakarta/index.js";
import { yotePlugin } from "./yote/index.js";
import { muTorerePlugin } from "./mu-torere/index.js";
import { shobuPlugin } from "./shobu/index.js";
import { loaSmallPlugin } from "./loa-small/index.js";
import { tumbleweedPlugin } from "./tumbleweed/index.js";
import { pentalathPlugin } from "./pentalath/index.js";
import { slitherPlugin } from "./slither/index.js";
import { fortuneTellerPlugin } from "./fortune-teller/index.js";
import { magic8BallPlugin } from "./magic-8-ball/index.js";
import { coinCollectorPlugin } from "./coin-collector/index.js";
import { diceLadderPlugin } from "./dice-ladder/index.js";
import { leafBlowerPlugin } from "./leaf-blower/index.js";
import { puzzleBoxPlugin } from "./puzzle-box/index.js";
import { cardSpinnerPlugin } from "./card-spinner/index.js";
import { rollEmPlugin } from "./roll-em/index.js";
import { trucoPlugin } from "./truco/index.js";
import { escobaPlugin } from "./escoba/index.js";
import { chinchonPlugin } from "./chinchon/index.js";
import { durakPlugin } from "./durak/index.js";
import { trucoPaulistaPlugin } from "./truco-paulista/index.js";
import { tarneebPlugin } from "./tarneeb/index.js";
import { tonkPlugin } from "./tonk/index.js";
import { kachuufiPlugin } from "./kachuufi/index.js";
import { lemonadeStandPlugin } from "./lemonade-stand/index.js";
import { farmTycoonPlugin } from "./farm-tycoon/index.js";
import { stockMarketMiniPlugin } from "./stock-market-mini/index.js";
import { cityBuilderMicroPlugin } from "./city-builder-micro/index.js";
import { restaurantTycoonPlugin } from "./restaurant-tycoon/index.js";
import { coffeeShopPlugin } from "./coffee-shop/index.js";
import { hotelTycoonPlugin } from "./hotel-tycoon/index.js";
import { airlineSimPlugin } from "./airline-sim/index.js";
import { bakeryShopPlugin } from "./bakery-shop/index.js";
import { oilTycoonPlugin } from "./oil-tycoon/index.js";
import { factoryLinePlugin } from "./factory-line/index.js";
import { gameDevStudioPlugin } from "./game-dev-studio/index.js";
import { zooKeeperPlugin } from "./zoo-keeper/index.js";
import { islandSurvivalPlugin } from "./island-survival/index.js";
import { piratesBountyPlugin } from "./pirates-bounty/index.js";
import { spaceColonyPlugin } from "./space-colony/index.js";
import { pool8BallPlugin } from "./pool-8ball/index.js";
import { billiards9BallPlugin } from "./billiards-9ball/index.js";
import { shuffleboardPlugin } from "./shuffleboard/index.js";
import { miniGolfPlugin } from "./mini-golf/index.js";
import { golf18Plugin } from "./golf-18/index.js";
import { basketballFTPlugin } from "./basketball-free-throws/index.js";
import { fieldGoalPlugin } from "./field-goal-kicker/index.js";
import { tennisServePlugin } from "./tennis-serve/index.js";
import { nonogram5x5Plugin } from "./nonogram-5x5/index.js";
import { battleshipSoloPlugin } from "./battleship-solo/index.js";
import { lightSwitchPuzzlePlugin } from "./light-switch-puzzle/index.js";
import { numberChainPlugin } from "./number-chain/index.js";
import { pegSolitairePlusPlugin } from "./peg-solitaire-plus/index.js";
import { logicGatesSimPlugin } from "./logic-gates-sim/index.js";
import { cipherCrackPlugin } from "./cipher-crack/index.js";
import { binaryPuzzlePlugin } from "./binary-puzzle/index.js";
import { colorMatchDashPlugin } from "./color-match-dash/index.js";
import { rhythmTapPlugin } from "./rhythm-tap/index.js";
import { stackTowerPlugin } from "./stack-tower/index.js";
import { planeDodgePlugin } from "./plane-dodge/index.js";
import { laserDodgePlugin } from "./laser-dodge/index.js";
import { bubblePopChainPlugin } from "./bubble-pop-chain/index.js";
import { whackAVirusPlugin } from "./whack-a-virus/index.js";
import { tunnelRunnerPlugin } from "./tunnel-runner/index.js";
import { wordScramblePlugin } from "./word-scramble/index.js";
import { categoryQuizPlugin } from "./category-quiz/index.js";
import { missingLettersPlugin } from "./missing-letters/index.js";
import { synonymMatchPlugin } from "./synonym-match/index.js";
import { deucesWildPlugin } from "./deuces-wild/index.js";
import { doubleBonusPokerPlugin } from "./double-bonus-poker/index.js";
import { miniRoulettePlugin } from "./mini-roulette/index.js";
import { highLowCasinoPlugin } from "./high-low-casino/index.js";
import { casinoWarMultiPlugin } from "./casino-war-multi/index.js";
import { kenoMiniPlugin } from "./keno-mini/index.js";
import { fanTanPlugin } from "./fan-tan/index.js";
import { dragonTigerPlugin } from "./dragon-tiger/index.js";
import { floodItPlugin } from "./flood-it/index.js";
import { colorLinesPlugin } from "./color-lines/index.js";
import { dominosaPlugin } from "./dominosa/index.js";
import { kyodaiPlugin } from "./kyodai/index.js";
import { pipeManiaPlugin } from "./pipe-mania/index.js";
import { hexMatch3Plugin } from "./hex-match-3/index.js";
import { rotateMatchPlugin } from "./rotate-match/index.js";
import { triangleMatchPlugin } from "./triangle-match/index.js";
import { tradingPostPlugin } from "./trading-post/index.js";
import { resourceChainPlugin } from "./resource-chain/index.js";
import { dungeonDelvePlugin } from "./dungeon-delve/index.js";
import { kingdomBuilderPlugin } from "./kingdom-builder/index.js";
import { alchemyShopPlugin } from "./alchemy-shop/index.js";
import { spyHeistPlugin } from "./spy-heist/index.js";
import { towerDefenseMiniPlugin } from "./tower-defense-mini/index.js";
import { fishingVillagePlugin } from "./fishing-village/index.js";
import { beersQuizPlugin } from "./beers-quiz/index.js";
import { cardBidStreakPlugin } from "./card-bid-streak/index.js";
import { cardFlipStreakPlugin } from "./card-flip-streak/index.js";
import { cardHigh3Plugin } from "./card-high-3/index.js";
import { cardLow3Plugin } from "./card-low-3/index.js";
import { cardPickStreakPlugin } from "./card-pick-streak/index.js";
import { cidersQuizPlugin } from "./ciders-quiz/index.js";
import { cocktailsQuizPlugin } from "./cocktails-quiz/index.js";
import { danceStylesQuizPlugin } from "./dance-styles-quiz/index.js";
import { drinksTypesQuizPlugin } from "./drinks-types-quiz/index.js";
import { fashionErasQuizPlugin } from "./fashion-eras-quiz/index.js";
import { hairstylesQuizPlugin } from "./hairstyles-quiz/index.js";
import { philosopherViewsQuizPlugin } from "./philosopher-views-quiz/index.js";
import { religionsSymbolsQuizPlugin } from "./religions-symbols-quiz/index.js";
import { winesQuizPlugin } from "./wines-quiz/index.js";
import { arcticSurvivalPlugin } from "./arctic-survival/index.js";
import { jungleExplorerPlugin } from "./jungle-explorer/index.js";
import { rocketLaunchArcadePlugin } from "./rocket-launch-arcade/index.js";
import { dotToDotPlugin } from "./dot-to-dot/index.js";
import { letterPaintPlugin } from "./letter-paint/index.js";
import { infiniteTicTacToePlugin } from "./infinite-tic-tac-toe/index.js";
import { cardBingoProPlugin } from "./card-bingo-pro/index.js";
import { walkingTheDogPlugin } from "./walking-the-dog/index.js";
import { kitchenChaosPlugin } from "./kitchen-chaos/index.js";
import { baristaRushPlugin } from "./barista-rush/index.js";
import { antFarmPlugin } from "./ant-farm/index.js";
import { auctionGamePlugin } from "./auction-game/index.js";
import { pizzaRushPlugin } from "./pizza-rush/index.js";
import { stockDayTraderPlugin } from "./stock-day-trader/index.js";
import { codeBreakerPlugin } from "./code-breaker/index.js";
import { roundTheClockPlugin } from "./round-the-clock/index.js";
import { gridRoguePlugin } from "./grid-rogue/index.js";
import { cardCrawlerPlugin } from "./card-crawler/index.js";
import { diceDungeonPlugin } from "./dice-dungeon/index.js";
import { slayTheDeckPlugin } from "./slay-the-deck/index.js";
import { mineDelverPlugin } from "./mine-delver/index.js";
import { cursedCryptPlugin } from "./cursed-crypt/index.js";
import { dragonHuntPlugin } from "./dragon-hunt/index.js";
import { wizardTowerPlugin } from "./wizard-tower/index.js";
import { neverHaveIEverPlugin } from "./never-have-i-ever/index.js";
import { truthOrDarePlugin } from "./truth-or-dare/index.js";
import { mostLikelyToPlugin } from "./most-likely-to/index.js";
import { hotSeatPlugin } from "./hot-seat/index.js";
import { storyBuilderPlugin } from "./story-builder/index.js";
import { fiveSecondRulePlugin } from "./five-second-rule/index.js";
import { headsUpPlugin } from "./heads-up/index.js";
import { hotTakePlugin } from "./hot-take/index.js";
import { arrowSudokuPlugin } from "./arrow-sudoku/index.js";
import { mosaicPuzzlePlugin } from "./mosaic-puzzle/index.js";
import { nurimisakiPlugin } from "./nurimisaki/index.js";
import { castleWallPlugin } from "./castle-wall/index.js";
import { galaxiesPuzzlePlugin } from "./galaxies-puzzle/index.js";
import { corralPuzzlePlugin } from "./corral-puzzle/index.js";
import { countryRoadPlugin } from "./country-road/index.js";
import { pearlPuzzlePlugin } from "./pearl-puzzle/index.js";
import { typingWordsPlugin } from "./typing-words/index.js";
import { typingQuotesPlugin } from "./typing-quotes/index.js";
import { verbalMemoryPlugin } from "./verbal-memory/index.js";
import { chimpTestPlugin } from "./chimp-test/index.js";
import { stroopTestPlugin } from "./stroop-test/index.js";
import { digitSpanPlugin } from "./digit-span/index.js";
import { aimTrainerPlugin } from "./aim-trainer/index.js";
import { visualMemoryGridPlugin } from "./visual-memory-grid/index.js";
import { homeRunDerbyPlugin } from "./home-run-derby/index.js";
import { soccerPenaltyPlugin } from "./soccer-penalty/index.js";
import { hockeyShootoutPlugin } from "./hockey-shootout/index.js";
import { pingPongRallyPlugin } from "./ping-pong-rally/index.js";
import { longJumpPlugin } from "./long-jump/index.js";
import { discusPlugin } from "./discus/index.js";
import { curlingPlugin } from "./curling/index.js";
import { darts501Plugin } from "./darts-501/index.js";
import { cookieClickerMiniPlugin } from "./cookie-clicker-mini/index.js";
import { idleMinerPlugin } from "./idle-miner/index.js";
import { bpmTapPlugin } from "./bpm-tap/index.js";
import { hexColorGuessPlugin } from "./hex-color-guess/index.js";
import { rgbMixerPlugin } from "./rgb-mixer/index.js";
import { keyboardWarriorPlugin } from "./keyboard-warrior/index.js";
import { dicePredictionPlugin } from "./dice-prediction/index.js";
import { breathGaugePlugin } from "./breath-gauge/index.js";
import { osmosisPlugin } from "./osmosis/index.js";
import { shamrocksPlugin } from "./shamrocks/index.js";
import { terracePlugin } from "./terrace/index.js";
import { marthaPlugin } from "./martha/index.js";
import { littleSpiderPlugin } from "./little-spider/index.js";
import { quadrillePlugin } from "./quadrille/index.js";
import { rankAndFilePlugin } from "./rank-and-file/index.js";
import { royalCotillionPlugin } from "./royal-cotillion/index.js";
import { senetPlugin } from "./senet/index.js";
import { royalGameOfUrPlugin } from "./royal-game-of-ur/index.js";
import { morabarabaPlugin } from "./morabaraba/index.js";
import { picariaPlugin } from "./picaria/index.js";
import { seegaPlugin } from "./seega/index.js";
import { frisianDraughtsPlugin } from "./frisian-draughts/index.js";
import { russianDraughtsPlugin } from "./russian-draughts/index.js";
import { poolCheckersPlugin } from "./pool-checkers/index.js";
import { eggCatcherPlugin } from "./egg-catcher/index.js";
import { fishFeederPlugin } from "./fish-feeder/index.js";
import { ninjaHopPlugin } from "./ninja-hop/index.js";
import { samuraiSlicePlugin } from "./samurai-slice/index.js";
import { caveFlyerPlugin } from "./cave-flyer/index.js";
import { dodgeCarsPlugin } from "./dodge-cars/index.js";
import { parachuteDropPlugin } from "./parachute-drop/index.js";
import { swarmShootPlugin } from "./swarm-shoot/index.js";
import { moviesTriviaPlugin } from "./movies-trivia/index.js";
import { musicTriviaPlugin } from "./music-trivia/index.js";
import { sportsTriviaPlugin } from "./sports-trivia/index.js";
import { scienceTriviaPlugin } from "./science-trivia/index.js";
import { historyTriviaPlugin } from "./history-trivia/index.js";
import { mythologyQuizPlugin } from "./mythology-quiz/index.js";
import { spaceQuizPlugin } from "./space-quiz/index.js";
import { foodQuizPlugin } from "./food-quiz/index.js";
import { animalQuizPlugin } from "./animal-quiz/index.js";
import { phrazlePlugin } from "./phrazle/index.js";
import { connectionsPlugin } from "./connections-clone/index.js";
import { compoundWordPlugin } from "./compound-word/index.js";
import { wordPyramidPlugin } from "./word-pyramid/index.js";
import { panagramPlugin } from "./panagram/index.js";
import { lastLetterPlugin } from "./last-letter/index.js";
import { phrasePuzzlePlugin } from "./phrase-puzzle/index.js";
import { wordHuntPlugin } from "./word-hunt/index.js";
import { idleFarmerPlugin } from "./idle-farmer/index.js";
import { idleWizardPlugin } from "./idle-wizard/index.js";
import { idleBlacksmithPlugin } from "./idle-blacksmith/index.js";
import { idleWarriorPlugin } from "./idle-warrior/index.js";
import { idleBakerPlugin } from "./idle-baker/index.js";
import { gemClickerPlugin } from "./gem-clicker/index.js";
import { goldRushIdlePlugin } from "./gold-rush-idle/index.js";
import { prestigeClickerPlugin } from "./prestige-clicker/index.js";
import { klondikeDicePlugin } from "./klondike-dice/index.js";
import { goingToBostonPlugin } from "./going-to-boston/index.js";
import { cosmicWimpoutPlugin } from "./cosmic-wimpout/index.js";
import { cragPlugin } from "./crag/index.js";
import { crownAndAnchorPlugin } from "./crown-and-anchor/index.js";
import { fourFiveSixPlugin } from "./four-five-six/index.js";
import { streetCrapsPlugin } from "./street-craps/index.js";
import { pirateDicePlugin } from "./pirate-dice/index.js";
import { napoleonCardPlugin } from "./napoleon-card/index.js";
import { ecartePlugin } from "./ecarte/index.js";
import { tarockPlugin } from "./tarock/index.js";
import { pidroPlugin } from "./pidro/index.js";
import { hokmPlugin } from "./hokm/index.js";
import { ultiPlugin } from "./ulti/index.js";
import { klopPlugin } from "./klop/index.js";
import { sjavsPlugin } from "./sjavs/index.js";
import { cubeRollPlugin } from "./cube-roll/index.js";
import { tiltMazePlugin } from "./tilt-maze/index.js";
import { tubeColorPlugin } from "./tube-color/index.js";
import { wireConnectPlugin } from "./wire-connect/index.js";
import { mirrorMazePlugin } from "./mirror-maze/index.js";
import { gearPuzzlePlugin } from "./gear-puzzle/index.js";
import { pentominoPuzzlePlugin } from "./pentomino-puzzle/index.js";
import { parkingPuzzlePlugin } from "./parking-puzzle/index.js";
import { classicMazePlugin } from "./classic-maze/index.js";
import { fogMazePlugin } from "./fog-maze/index.js";
import { keyMazePlugin } from "./key-maze/index.js";
import { iceSlideMazePlugin } from "./ice-slide-maze/index.js";
import { teleportMazePlugin } from "./teleport-maze/index.js";
import { ghostMazePlugin } from "./ghost-maze/index.js";
import { gravityMazePlugin } from "./gravity-maze/index.js";
import { coloredTileMazePlugin } from "./colored-tile-maze/index.js";
import { wishPlugin } from "./wish/index.js";
import { royalMarriagePlugin } from "./royal-marriage/index.js";
import { jubileePlugin } from "./jubilee/index.js";
import { intelligencePlugin } from "./intelligence/index.js";
import { eagleWingPlugin } from "./eagle-wing/index.js";
import { demonPlugin } from "./demon/index.js";
import { coloradoPlugin } from "./colorado/index.js";
import { algerianPatiencePlugin } from "./algerian-patience/index.js";
import { interregnumPlugin } from "./interregnum/index.js";
import { boxerKnockoutPlugin } from "./boxer-knockout/index.js";
import { tankBattlePlugin } from "./tank-battle/index.js";
import { pixelRunnerPlugin } from "./pixel-runner/index.js";
import { castleDefenderPlugin } from "./castle-defender/index.js";
import { submarineHuntPlugin } from "./submarine-hunt/index.js";
import { pinballMiniPlugin } from "./pinball-mini/index.js";
import { ufoRescuePlugin } from "./ufo-rescue/index.js";
import { motorcycleJumpPlugin } from "./motorcycle-jump/index.js";
import { einsteinPuzzlePlugin } from "./einstein-puzzle/index.js";
import { weighingPuzzlePlugin } from "./weighing-puzzle/index.js";
import { prisonerHatPlugin } from "./prisoner-hat/index.js";
import { montyHallPlugin } from "./monty-hall/index.js";
import { seatingPuzzlePlugin } from "./seating-puzzle/index.js";
import { safeCrackerPlugin } from "./safe-cracker/index.js";
import { riddleMachinePlugin } from "./riddle-machine/index.js";
import { digitDeducePlugin } from "./digit-deduce/index.js";
import { spoonsPlugin } from "./spoons/index.js";
import { palacePlugin } from "./palace/index.js";
import { parliamentPlugin } from "./parliament/index.js";
import { karmaCardPlugin } from "./karma-card/index.js";
import { garbageCardPlugin } from "./garbage-card/index.js";
import { pigCardPlugin } from "./pig-card/index.js";
import { playOrPayPlugin } from "./play-or-pay/index.js";
import { snipSnapSnoremPlugin } from "./snip-snap-snorem/index.js";
import { christmasCookiePlugin } from "./christmas-cookie/index.js";
import { easterEggHuntPlugin } from "./easter-egg-hunt/index.js";
import { halloweenPumpkinPlugin } from "./halloween-pumpkin/index.js";
import { valentineMatchPlugin } from "./valentine-match/index.js";
import { wizardSpellCastPlugin } from "./wizard-spell-cast/index.js";
import { dragonEggHatchPlugin } from "./dragon-egg-hatch/index.js";
import { robotArenaPlugin } from "./robot-arena/index.js";
import { marsColonyPlugin } from "./mars-colony/index.js";
import { taxiDriverPlugin } from "./taxi-driver/index.js";
import { foragerGamePlugin } from "./forager-game/index.js";
import { spaceTraderPlugin } from "./space-trader/index.js";
import { bountyHunterPlugin } from "./bounty-hunter/index.js";
import { boggleProPlugin } from "./boggle-pro/index.js";
import { slotMachineProPlugin } from "./slot-machine-pro/index.js";
import { diceStackPlugin } from "./dice-stack/index.js";
import { towerBuilderPlugin } from "./tower-builder/index.js";
import { bottleFlipPlugin } from "./bottle-flip/index.js";
import { paperAirplanePlugin } from "./paper-airplane/index.js";
import { frisbeeTossPlugin } from "./frisbee-toss/index.js";
import { boomerangThrowPlugin } from "./boomerang-throw/index.js";
import { targetShooterPlugin } from "./target-shooter/index.js";
import { marbleRollPlugin } from "./marble-roll/index.js";
import { cupFlipPlugin } from "./cup-flip/index.js";
import { slingshotLaunchPlugin } from "./slingshot-launch/index.js";
import { australianPatiencePlugin } from "./australian-patience/index.js";
import { betsyRossPlugin } from "./betsy-ross/index.js";
import { florentinePlugin } from "./florentine-patience/index.js";
import { fourLeafCloverPlugin } from "./four-leaf-clover/index.js";
import { kingsRowPlugin } from "./kings-row/index.js";
import { precedencePlugin } from "./precedence/index.js";
import { tripletsPlugin } from "./triplets/index.js";
import { paganiniPlugin } from "./paganini/index.js";
import { danceArrowsPlugin } from "./dance-arrows/index.js";
import { melodyRepeaterPlugin } from "./melody-repeater/index.js";
import { morseTapPlugin } from "./morse-tap/index.js";
import { sequenceFlashPlugin } from "./sequence-flash/index.js";
import { drumPadPlugin } from "./drum-pad/index.js";
import { mosaicCopyPlugin } from "./mosaic-copy/index.js";
import { repeatAfterMePlugin } from "./repeat-after-me/index.js";
import { rhythmLadderPlugin } from "./rhythm-ladder/index.js";
import { cosmicDicePlugin } from "./cosmic-dice/index.js";
import { vikingDicePlugin } from "./viking-dice/index.js";
import { medievalDicePlugin } from "./medieval-dice/index.js";
import { cowboyDicePlugin } from "./cowboy-dice/index.js";
import { samuraiDicePlugin } from "./samurai-dice/index.js";
import { diceBaseballPlugin } from "./dice-baseball/index.js";
import { diceGolfPlugin } from "./dice-golf/index.js";
import { straightOrBustPlugin } from "./straight-or-bust/index.js";
import { mateIn1Plugin } from "./mate-in-1/index.js";
import { mateIn2Plugin } from "./mate-in-2/index.js";
import { mateIn3Plugin } from "./mate-in-3/index.js";
import { chessTacticsPlugin } from "./chess-tactics/index.js";
import { chessEndgameKrPlugin } from "./chess-endgame-kr/index.js";
import { chessEndgameKqkPlugin } from "./chess-endgame-kqk/index.js";
import { pawnPromotionPuzzlePlugin } from "./pawn-promotion-puzzle/index.js";
import { chessBackRankPlugin } from "./chess-back-rank/index.js";
import { textAdventureMiniPlugin } from "./text-adventure-mini/index.js";
import { cyoaFantasyPlugin } from "./cyoa-fantasy/index.js";
import { cyoaHorrorPlugin } from "./cyoa-horror/index.js";
import { questTavernPlugin } from "./quest-tavern/index.js";
import { monsterSlayerPlugin } from "./monster-slayer/index.js";
import { lootGoblinPlugin } from "./loot-goblin/index.js";
import { arenaChampionPlugin } from "./arena-champion/index.js";
import { tombOfKingsPlugin } from "./tomb-of-kings/index.js";
import { acronymQuizPlugin } from "./acronym-quiz/index.js";
import { idiomQuizPlugin } from "./idiom-quiz/index.js";
import { homophoneMatchPlugin } from "./homophone-match/index.js";
import { silentLettersPlugin } from "./silent-letters/index.js";
import { prefixSuffixPlugin } from "./prefix-suffix/index.js";
import { grammarFixPlugin } from "./grammar-fix/index.js";
import { anagramPairPlugin } from "./anagram-pair/index.js";
import { rhymeFinderPlugin } from "./rhyme-finder/index.js";
import { kalahPlugin } from "./kalah/index.js";
import { brandubPlugin } from "./brandub/index.js";
import { tawlbwrddPlugin } from "./tawlbwrdd/index.js";
import { connect6Plugin } from "./connect6/index.js";
import { havannahPlugin } from "./havannah/index.js";
import { hareAndHoundsPlugin } from "./hare-and-hounds/index.js";
import { wolfAndSheepPlugin } from "./wolf-and-sheep/index.js";
import { cathedralGamePlugin } from "./cathedral-game/index.js";
import { safeDriverPlugin } from "./safe-driver/index.js";
import { submarineSonarPlugin } from "./submarine-sonar/index.js";
import { nimMultiPlugin } from "./nim-multi/index.js";
import { tripleDicePlugin } from "./triple-dice/index.js";
import { rollAndWriteProPlugin } from "./roll-and-write-pro/index.js";
import { solitaireMarathonPlugin } from "./solitaire-marathon/index.js";
import { towerOfHanoi7Plugin } from "./tower-of-hanoi-7/index.js";
import { swarmDefensePlugin } from "./swarm-defense/index.js";
import { spaceArenaPlugin } from "./space-arena/index.js";
import { gladiatorArenaPlugin } from "./gladiator-arena/index.js";
import { slimeDefensePlugin } from "./slime-defense/index.js";
import { zombieSurvivalPlugin } from "./zombie-survival/index.js";
import { wizardCardDuelPlugin } from "./wizard-card-duel/index.js";
import { alienCardBattlePlugin } from "./alien-card-battle/index.js";
import { dotGridPuzzlePlugin } from "./dot-grid-puzzle/index.js";
import { foodTruckTycoonPlugin } from "./food-truck-tycoon/index.js";
import { forestTrekPlugin } from "./forest-trek/index.js";
import { mountainClimbPlugin } from "./mountain-climb/index.js";
import { frozenRiverPlugin } from "./frozen-river/index.js";
import { cardBlastPlugin } from "./card-blast/index.js";
import { volcanoEscapePlugin } from "./volcano-escape/index.js";
import { coralReefPlugin } from "./coral-reef/index.js";
import { circusJugglePlugin } from "./circus-juggle/index.js";
import { magicianTrickPlugin } from "./magician-trick/index.js";
import { clownTossPlugin } from "./clown-toss/index.js";
import { acrobatFlipPlugin } from "./acrobat-flip/index.js";
import { desertTrekPlugin } from "./desert-trek/index.js";
import { archwayPlugin } from "./archway/index.js";
import { babettePlugin } from "./babette/index.js";
import { frogSolitairePlugin } from "./frog-solitaire/index.js";
import { lastMonarchPlugin } from "./last-monarch/index.js";
import { peekPlugin } from "./peek/index.js";
import { salicLawPlugin } from "./salic-law/index.js";
import { sevenUpPlugin } from "./seven-up/index.js";
import { tournamentPlugin } from "./tournament/index.js";
import { connectPipesProPlugin } from "./connect-pipes-pro/index.js";
import { tileFlipPlugin } from "./tile-flip/index.js";
import { colorFlowPlugin } from "./flowfree-clone/index.js";
import { crosswordProPlugin } from "./crossword-pro/index.js";
import { ultimateTicTacToePlugin } from "./ultimate-tic-tac-toe/index.js";
import { diceFootballPlugin } from "./dice-football/index.js";
import { diceBasketballPlugin } from "./dice-basketball/index.js";
import { kartTournamentPlugin } from "./kart-tournament/index.js";
import { racingStuntsPlugin } from "./racing-stunts/index.js";
import { bikeRacePlugin } from "./bike-race/index.js";
import { timeTrialPlugin } from "./time-trial/index.js";
import { pirateShipCannonPlugin } from "./pirate-ship-cannon/index.js";
import { ufoShooterPlugin } from "./ufo-shooter/index.js";
import { diceSoccerPlugin } from "./dice-soccer/index.js";
import { diceTennisPlugin } from "./dice-tennis/index.js";
import { diceHockeyPlugin } from "./dice-hockey/index.js";
import { superTicTacToePlugin } from "./super-tic-tac-toe/index.js";
import { feedTheCatPlugin } from "./feed-the-cat/index.js";
import { petShopMiniPlugin } from "./pet-shop-mini/index.js";
import { aquariumKeeperPlugin } from "./aquarium-keeper/index.js";
import { iceCreamStandPlugin } from "./ice-cream-stand/index.js";
import { fireworkShowPlugin } from "./firework-show/index.js";
import { swimmingLapsPlugin } from "./swimming-laps/index.js";
import { kiteFightPlugin } from "./kite-fight/index.js";
import { tacoTruckPlugin } from "./taco-truck/index.js";
import { pastaShopPlugin } from "./pasta-shop/index.js";
import { donutShopPlugin } from "./donut-shop/index.js";
import { bridgeBuilderPuzzlePlugin } from "./bridge-builder-puzzle/index.js";
import { paintingPuzzlePlugin } from "./painting-puzzle/index.js";
import { triathlonMiniPlugin } from "./triathlon-mini/index.js";
import { marathonPacerPlugin } from "./marathon-pacer/index.js";
import { poleClimbingPlugin } from "./pole-climbing/index.js";
import { trampolineBouncePlugin } from "./trampoline-bounce/index.js";
import { seesawBalancePlugin } from "./seesaw-balance/index.js";
import { boomerangTossPlugin } from "./boomerang-toss/index.js";
import { bottleSpinPlugin } from "./bottle-spin/index.js";
import { diceRunnerPlugin } from "./dice-runner/index.js";
import { rollAndAddPlugin } from "./roll-and-add/index.js";
import { cardSharkPlugin } from "./card-shark/index.js";
import { matchThreeSagaPlugin } from "./match-three-saga/index.js";
import { wallBouncePlugin } from "./wall-bounce/index.js";
import { diceArcheryPlugin } from "./dice-archery/index.js";
import { diceDartsPlugin } from "./dice-darts/index.js";
import { dicePoolMatchPlugin } from "./dice-pool-match/index.js";
import { rollingThunderDicePlugin } from "./rolling-thunder-dice/index.js";
import { bingoCallPlugin } from "./bingo-call/index.js";
import { cardFlipPuzzlePlugin } from "./card-flip-puzzle/index.js";
import { solitaireClockTournamentPlugin } from "./solitaire-clock-tournament/index.js";
import { ticTacToeToroidalPlugin } from "./tic-tac-toe-toroidal/index.js";
import { numericTicTacToePlugin } from "./numeric-tic-tac-toe/index.js";
import { chessPuzzleForkPlugin } from "./chess-puzzle-fork/index.js";
import { gomokuTacticPlugin } from "./gomoku-tactic/index.js";
import { weatherQuizPlugin } from "./weather-quiz/index.js";
import { musicDecadeQuizPlugin } from "./music-decade-quiz/index.js";
import { tvShowQuizPlugin } from "./tv-show-quiz/index.js";
import { videoGameQuizPlugin } from "./video-game-quiz/index.js";
import { countryFlagQuizPlugin } from "./country-flag-quiz/index.js";
import { capitalsQuizPlugin } from "./capitals-quiz/index.js";
import { instrumentsQuizPlugin } from "./instruments-quiz/index.js";
import { planetsQuizPlugin } from "./planets-quiz/index.js";
import { highestCardBetPlugin } from "./highest-card-bet/index.js";
import { lowestCardBetPlugin } from "./lowest-card-bet/index.js";
import { cardColorGuessPlugin } from "./card-color-guess/index.js";
import { cardSuitGuessPlugin } from "./card-suit-guess/index.js";
import { evensOrOddsDicePlugin } from "./evens-or-odds-dice/index.js";
import { total7OrNotPlugin } from "./total-7-or-not/index.js";
import { diceFlushPlugin } from "./dice-flush/index.js";
import { threeOfAKindRollPlugin } from "./three-of-a-kind-roll/index.js";
import { ticTacToeLargePlugin } from "./tic-tac-toe-large/index.js";
import { ticTacToeCornersWinPlugin } from "./tic-tac-toe-corners-win/index.js";
import { ticTacToe3InRowPlugin } from "./tic-tac-toe-3-in-row/index.js";
import { gomokuMiniPlugin } from "./gomoku-mini/index.js";
import { targetGrabPlugin } from "./target-grab/index.js";
import { flySwatterPlugin } from "./fly-swatter/index.js";
import { balloonDartsPlugin } from "./balloon-darts/index.js";
import { dunkTankPlugin } from "./dunk-tank/index.js";
import { ringTossProPlugin } from "./ring-toss-pro/index.js";
import { basketTossPlugin } from "./basket-toss/index.js";
import { paperArrowPlugin } from "./paper-arrow/index.js";
import { waterPistolPlugin } from "./water-pistol/index.js";
import { colorRecallPlugin } from "./color-recall/index.js";
import { shapeRecallPlugin } from "./shape-recall/index.js";
import { numberRecallPlugin } from "./number-recall/index.js";
import { positionRecallPlugin } from "./position-recall/index.js";
import { birdsQuizPlugin } from "./birds-quiz/index.js";
import { plantsQuizPlugin } from "./plants-quiz/index.js";
import { gemstonesQuizPlugin } from "./gemstones-quiz/index.js";
import { occupationsQuizPlugin } from "./occupations-quiz/index.js";
import { cardUpDownPlugin } from "./card-up-down/index.js";
import { redOrBlackPlugin } from "./red-or-black/index.js";
import { aceFinderPlugin } from "./ace-finder/index.js";
import { doubleOrNothingDicePlugin } from "./double-or-nothing-dice/index.js";
import { climbTheLadderDicePlugin } from "./climb-the-ladder-dice/index.js";
import { sumTargetDicePlugin } from "./sum-target-dice/index.js";
import { swordSlicePlugin } from "./sword-slice/index.js";
import { magicWandCastPlugin } from "./magic-wand-cast/index.js";
import { frogLeapPlugin } from "./frog-leap/index.js";
import { monkeyBananaPlugin } from "./monkey-banana/index.js";
import { cribbageSquarePlugin } from "./cribbage-square/index.js";
import { decadeSolitairePlugin } from "./decade-solitaire/index.js";
import { treesQuizPlugin } from "./trees-quiz/index.js";
import { herbsQuizPlugin } from "./herbs-quiz/index.js";
import { fruitsQuizPlugin } from "./fruits-quiz/index.js";
import { vegetablesQuizPlugin } from "./vegetables-quiz/index.js";
import { danceQuizPlugin } from "./dance-quiz/index.js";
import { paintersQuizPlugin } from "./painters-quiz/index.js";
import { composersQuizPlugin } from "./composers-quiz/index.js";
import { philosophersQuizPlugin } from "./philosophers-quiz/index.js";
import { warsQuizPlugin } from "./wars-quiz/index.js";
import { treatiesQuizPlugin } from "./treaties-quiz/index.js";
import { cardRankGuessPlugin } from "./card-rank-guess/index.js";
import { cardPairPickPlugin } from "./card-pair-pick/index.js";
import { cardPileBetPlugin } from "./card-pile-bet/index.js";
import { cardShuffleBetPlugin } from "./card-shuffle-bet/index.js";
import { cardLowHigh3Plugin } from "./card-low-high-3/index.js";
import { diceTwinBetPlugin } from "./dice-twin-bet/index.js";
import { dice100TargetPlugin } from "./dice-100-target/index.js";
import { diceDoubleTroublePlugin } from "./dice-double-trouble/index.js";
import { dicePipAddPlugin } from "./dice-pip-add/index.js";
import { diceMirrorRollPlugin } from "./dice-mirror-roll/index.js";
import { appleTossPlugin } from "./apple-toss/index.js";
import { bananaPeelPlugin } from "./banana-peel/index.js";
import { birdShootPlugin } from "./bird-shoot/index.js";
import { candyGrabPlugin } from "./candy-grab/index.js";
import { coinPopPlugin } from "./coin-pop/index.js";
import { donutGrabPlugin } from "./donut-grab/index.js";
import { eggDropPlugin } from "./egg-drop/index.js";
import { gemGrabPlugin } from "./gem-grab/index.js";
import { hatTossPlugin } from "./hat-toss/index.js";
import { hulaHoopPlugin } from "./hula-hoop/index.js";
import { spicesQuizPlugin } from "./spices-quiz/index.js";
import { drinksQuizPlugin } from "./drinks-quiz/index.js";
import { snacksQuizPlugin } from "./snacks-quiz/index.js";
import { festivalsQuizPlugin } from "./festivals-quiz/index.js";
import { religionsQuizPlugin } from "./religions-quiz/index.js";
import { sportsRulesQuizPlugin } from "./sports-rules-quiz/index.js";
import { olympicEventsQuizPlugin } from "./olympic-events-quiz/index.js";
import { transportationQuizPlugin } from "./transportation-quiz/index.js";
import { architectureQuizPlugin } from "./architecture-quiz/index.js";
import { dictatorsQuizPlugin } from "./dictators-quiz/index.js";
import { cardFlipThreePlugin } from "./card-flip-three/index.js";
import { cardPickBetPlugin } from "./card-pick-bet/index.js";
import { cardColorStreakPlugin } from "./card-color-streak/index.js";
import { cardPileStackPlugin } from "./card-pile-stack/index.js";
import { cardHotColdPlugin } from "./card-hot-cold/index.js";
import { dicePyramidStackPlugin } from "./dice-pyramid-stack/index.js";
import { diceBullseyeRollPlugin } from "./dice-bullseye-roll/index.js";
import { diceSequence3Plugin } from "./dice-sequence-3/index.js";
import { diceFlushRollPlugin } from "./dice-flush-roll/index.js";
import { diceUpDownGamePlugin } from "./dice-up-down-game/index.js";
import { iceSkaterPlugin } from "./ice-skater/index.js";
import { kiteRunnerPlugin } from "./kite-runner/index.js";
import { knightChargePlugin } from "./knight-charge/index.js";
import { leafRakePlugin } from "./leaf-rake/index.js";
import { lemonSqueezePlugin } from "./lemon-squeeze/index.js";
import { melonSmashPlugin } from "./melon-smash/index.js";
import { nailHammerPlugin } from "./nail-hammer/index.js";
import { oilPumpPlugin } from "./oil-pump/index.js";
import { pencilSharpenPlugin } from "./pencil-sharpen/index.js";
import { pizzaCutPlugin } from "./pizza-cut/index.js";
import { literatureGenresQuizPlugin } from "./literature-genres-quiz/index.js";
import { artMovementsQuizPlugin } from "./art-movements-quiz/index.js";
import { militaryLeadersQuizPlugin } from "./military-leaders-quiz/index.js";
import { scientistsQuizPlugin } from "./scientists-quiz/index.js";
import { mathematiciansQuizPlugin } from "./mathematicians-quiz/index.js";
import { explorersQuizPlugin } from "./explorers-quiz/index.js";
import { queensQuizPlugin } from "./queens-quiz/index.js";
import { kingsQuizPlugin } from "./kings-quiz/index.js";
import { popesQuizPlugin } from "./popes-quiz/index.js";
import { primeMinistersQuizPlugin } from "./prime-ministers-quiz/index.js";
import { cardThreeFlipPlugin } from "./card-three-flip/index.js";
import { cardDiscardBetPlugin } from "./card-discard-bet/index.js";
import { cardPickThreePlugin } from "./card-pick-three/index.js";
import { cardFoldThreePlugin } from "./card-fold-three/index.js";
import { cardDrawUpPlugin } from "./card-draw-up/index.js";
import { dicePairRollPlugin } from "./dice-pair-roll/index.js";
import { diceAddBetPlugin } from "./dice-add-bet/index.js";
import { diceColorBetPlugin } from "./dice-color-bet/index.js";
import { diceSkipBetPlugin } from "./dice-skip-bet/index.js";
import { diceStepBetPlugin } from "./dice-step-bet/index.js";
import { springJumpPlugin } from "./spring-jump/index.js";
import { stickyBunPlugin } from "./sticky-bun/index.js";
import { sushiRollTossPlugin } from "./sushi-roll-toss/index.js";
import { swingBatPlugin } from "./swing-bat/index.js";
import { tacoTossPlugin } from "./taco-toss/index.js";
import { tennisVolleyPlugin } from "./tennis-volley/index.js";
import { tileFlipArcadePlugin } from "./tile-flip-arcade/index.js";
import { tinCanTossPlugin } from "./tin-can-toss/index.js";
import { topSpinPlugin } from "./top-spin/index.js";
import { vaseBalancePlugin } from "./vase-balance/index.js";
import { asianCuisineQuizPlugin } from "./asian-cuisine-quiz/index.js";
import { europeanCuisineQuizPlugin } from "./european-cuisine-quiz/index.js";
import { africanCuisineQuizPlugin } from "./african-cuisine-quiz/index.js";
import { americanCuisineQuizPlugin } from "./american-cuisine-quiz/index.js";
import { italianCuisineQuizPlugin } from "./italian-cuisine-quiz/index.js";
import { frenchCuisineQuizPlugin } from "./french-cuisine-quiz/index.js";
import { mexicanCuisineQuizPlugin } from "./mexican-cuisine-quiz/index.js";
import { indianCuisineQuizPlugin } from "./indian-cuisine-quiz/index.js";
import { chineseCuisineQuizPlugin } from "./chinese-cuisine-quiz/index.js";
import { japaneseCuisineQuizPlugin } from "./japanese-cuisine-quiz/index.js";
import { thaiCuisineQuizPlugin } from "./thai-cuisine-quiz/index.js";
import { greekCuisineQuizPlugin } from "./greek-cuisine-quiz/index.js";
import { spanishCuisineQuizPlugin } from "./spanish-cuisine-quiz/index.js";
import { koreanCuisineQuizPlugin } from "./korean-cuisine-quiz/index.js";
import { brazilianCuisineQuizPlugin } from "./brazilian-cuisine-quiz/index.js";
import { cardPopBetPlugin } from "./card-pop-bet/index.js";
import { cardStackFlipPlugin } from "./card-stack-flip/index.js";
import { cardSnapPairPlugin } from "./card-snap-pair/index.js";
import { cardPileTossPlugin } from "./card-pile-toss/index.js";
import { cardThrowBetPlugin } from "./card-throw-bet/index.js";
import { cardLowPickPlugin } from "./card-low-pick/index.js";
import { cardHighPickPlugin } from "./card-high-pick/index.js";
import { cardMidPickPlugin } from "./card-mid-pick/index.js";
import { diceToss3Plugin } from "./dice-toss-3/index.js";
import { diceLowRollPlugin } from "./dice-low-roll/index.js";
import { diceHighRollPlugin } from "./dice-high-roll/index.js";
import { diceSpinRollPlugin } from "./dice-spin-roll/index.js";
import { diceClutchRollPlugin } from "./dice-clutch-roll/index.js";
import { diceSpikeRollPlugin } from "./dice-spike-roll/index.js";
import { diceLadderRollPlugin } from "./dice-ladder-roll/index.js";
import { applePieStackPlugin } from "./apple-pie-stack/index.js";
import { bananaSplitPlugin } from "./banana-split/index.js";
import { blueberryPopPlugin } from "./blueberry-pop/index.js";
import { candyCaneGrabPlugin } from "./candy-cane-grab/index.js";
import { cherryTossPlugin } from "./cherry-toss/index.js";
import { donutStackArcPlugin } from "./donut-stack-arc/index.js";
import { eclairGrabPlugin } from "./eclair-grab/index.js";
import { fruitBasketTossPlugin } from "./fruit-basket-toss/index.js";
import { gummyGrabPlugin } from "./gummy-grab/index.js";
import { jellyJarTossPlugin } from "./jelly-jar-toss/index.js";
import { ancientRomeQuizPlugin } from "./ancient-rome-quiz/index.js";
import { ancientEgyptQuizPlugin } from "./ancient-egypt-quiz/index.js";
import { ancientGreeceQuizPlugin } from "./ancient-greece-quiz/index.js";
import { vikingsQuizPlugin } from "./vikings-quiz/index.js";
import { samuraiQuizPlugin } from "./samurai-quiz/index.js";
import { knightsQuizPlugin } from "./knights-quiz/index.js";
import { pharaohsQuizPlugin } from "./pharaohs-quiz/index.js";
import { emperorsQuizPlugin } from "./emperors-quiz/index.js";
import { civilWarQuizPlugin } from "./civil-war-quiz/index.js";
import { ww1QuizPlugin } from "./ww1-quiz/index.js";
import { ww2QuizPlugin } from "./ww2-quiz/index.js";
import { coldWarQuizPlugin } from "./cold-war-quiz/index.js";
import { renaissanceQuizPlugin } from "./renaissance-quiz/index.js";
import { enlightenmentQuizPlugin } from "./enlightenment-quiz/index.js";
import { industrialRevolutionQuizPlugin } from "./industrial-revolution-quiz/index.js";
import { cardBid2Plugin } from "./card-bid-2/index.js";
import { cardBid4Plugin } from "./card-bid-4/index.js";
import { cardStreakFlipPlugin } from "./card-streak-flip/index.js";
import { cardDeckBetPlugin } from "./card-deck-bet/index.js";
import { cardPullBetPlugin } from "./card-pull-bet/index.js";
import { cardPileBet2Plugin } from "./card-pile-bet-2/index.js";
import { cardStackBet2Plugin } from "./card-stack-bet-2/index.js";
import { cardSnapBetPlugin } from "./card-snap-bet/index.js";
import { diceFlushBetPlugin } from "./dice-flush-bet/index.js";
import { diceTripBetPlugin } from "./dice-trip-bet/index.js";
import { diceQuadBetPlugin } from "./dice-quad-bet/index.js";
import { diceStreakBetPlugin } from "./dice-streak-bet/index.js";
import { diceQuickRollPlugin } from "./dice-quick-roll/index.js";
import { diceSlowRollPlugin } from "./dice-slow-roll/index.js";
import { dicePopRollPlugin } from "./dice-pop-roll/index.js";
import { kebabStackPlugin } from "./kebab-stack/index.js";
import { lasagnaLayerPlugin } from "./lasagna-layer/index.js";
import { lemonPopPlugin } from "./lemon-pop/index.js";
import { lobsterGrabPlugin } from "./lobster-grab/index.js";
import { mangoTossPlugin } from "./mango-toss/index.js";
import { marshmallowGrabPlugin } from "./marshmallow-grab/index.js";
import { milkshakeMixPlugin } from "./milkshake-mix/index.js";
import { muffinPopPlugin } from "./muffin-pop/index.js";
import { noodleGrabPlugin } from "./noodle-grab/index.js";
import { oliveGrabPlugin } from "./olive-grab/index.js";
import { classicalMusicQuizPlugin } from "./classical-music-quiz/index.js";
import { modernArtQuizPlugin } from "./modern-art-quiz/index.js";
import { jazzQuizPlugin } from "./jazz-quiz/index.js";
import { rockMusicQuizPlugin } from "./rock-music-quiz/index.js";
import { popMusicQuizPlugin } from "./pop-music-quiz/index.js";
import { hipHopQuizPlugin } from "./hip-hop-quiz/index.js";
import { countryMusicQuizPlugin } from "./country-music-quiz/index.js";
import { electronicMusicQuizPlugin } from "./electronic-music-quiz/index.js";
import { folkMusicQuizPlugin } from "./folk-music-quiz/index.js";
import { bluesQuizPlugin } from "./blues-quiz/index.js";
import { reggaeQuizPlugin } from "./reggae-quiz/index.js";
import { gospelMusicQuizPlugin } from "./gospel-music-quiz/index.js";
import { operaQuizPlugin } from "./opera-quiz/index.js";
import { broadwayQuizPlugin } from "./broadway-quiz/index.js";
import { balletQuizPlugin } from "./ballet-quiz/index.js";
import { streetArtQuizPlugin } from "./street-art-quiz/index.js";
import { sculptureQuizPlugin } from "./sculpture-quiz/index.js";
import { quartetMatchPlugin } from "./quartet-match/index.js";
import { evenEvensPlugin } from "./even-evens/index.js";
import { oddOddsPlugin } from "./odd-odds/index.js";
import { faceFeastPlugin } from "./face-feast/index.js";
import { pipPursePlugin } from "./pip-purse/index.js";
import { redRoulettePlugin } from "./red-roulette/index.js";
import { blackBidderPlugin } from "./black-bidder/index.js";
import { suitStackPlugin } from "./suit-stack/index.js";
import { pairPursuitPlugin } from "./pair-pursuit/index.js";
import { overUnderPlugin } from "./over-under/index.js";
import { straightShotPlugin } from "./straight-shot/index.js";
import { doubleDownPlugin } from "./double-down/index.js";
import { tripleTossPlugin } from "./triple-toss/index.js";
import { centipedeRollPlugin } from "./centipede-roll/index.js";
import { parityPopPlugin } from "./parity-pop/index.js";
import { peachPopPlugin } from "./peach-pop/index.js";
import { pretzelPluckPlugin } from "./pretzel-pluck/index.js";
import { radishRushPlugin } from "./radish-rush/index.js";
import { salamiSlicePlugin } from "./salami-slice/index.js";
import { tangerineTossPlugin } from "./tangerine-toss/index.js";
import { greekMythQuizPlugin } from "./greek-myth-quiz/index.js";
import { norseMythQuizPlugin } from "./norse-myth-quiz/index.js";
import { egyptianMythQuizPlugin } from "./egyptian-myth-quiz/index.js";
import { celticMythQuizPlugin } from "./celtic-myth-quiz/index.js";
import { hinduMythQuizPlugin } from "./hindu-myth-quiz/index.js";
import { buddhismQuizPlugin } from "./buddhism-quiz/index.js";
import { worldReligionsQuizPlugin } from "./world-religions-quiz/index.js";
import { easternPhilosophyQuizPlugin } from "./eastern-philosophy-quiz/index.js";
import { westernPhilosophyQuizPlugin } from "./western-philosophy-quiz/index.js";
import { ethicsQuizPlugin } from "./ethics-quiz/index.js";
import { nbaLegendsQuizPlugin } from "./nba-legends-quiz/index.js";
import { nflLegendsQuizPlugin } from "./nfl-legends-quiz/index.js";
import { mlbLegendsQuizPlugin } from "./mlb-legends-quiz/index.js";
import { soccerStarsQuizPlugin } from "./soccer-stars-quiz/index.js";
import { tennisGreatsQuizPlugin } from "./tennis-greats-quiz/index.js";
import { boxingLegendsQuizPlugin } from "./boxing-legends-quiz/index.js";
import { olympicQuizPlugin } from "./olympic-quiz/index.js";
import { golfGreatsQuizPlugin } from "./golf-greats-quiz/index.js";
import { triadTowerPlugin } from "./triad-tower/index.js";
import { royalRumblePlugin } from "./royal-rumble/index.js";
import { aceAlleyPlugin } from "./ace-alley/index.js";
import { sevenStreakPlugin } from "./seven-streak/index.js";
import { pipPyramidPlugin } from "./pip-pyramid/index.js";
import { redRiverPlugin } from "./red-river/index.js";
import { blackBridgePlugin } from "./black-bridge/index.js";
import { luckySixPlugin } from "./lucky-six/index.js";
import { crapsLightPlugin } from "./craps-light/index.js";
import { yahtzeeMiniPlugin } from "./yahtzee-mini/index.js";
import { diceDuelPlugin } from "./dice-duel/index.js";
import { snakeEyesHuntPlugin } from "./snake-eyes-hunt/index.js";
import { juiceJamboreePlugin } from "./juice-jamboree/index.js";
import { cocoaCascadePlugin } from "./cocoa-cascade/index.js";
import { frappeFlipPlugin } from "./frappe-flip/index.js";
import { latteLeapPlugin } from "./latte-leap/index.js";
import { mochaMarchPlugin } from "./mocha-march/index.js";
import { astronomyQuizPlugin } from "./astronomy-quiz/index.js";
import { chemistryLabQuizPlugin } from "./chemistry-lab-quiz/index.js";
import { physicsQuizPlugin } from "./physics-quiz/index.js";
import { biologyQuizPlugin } from "./biology-quiz/index.js";
import { anatomyQuizPlugin } from "./anatomy-quiz/index.js";
import { botanyQuizPlugin } from "./botany-quiz/index.js";
import { zoologyQuizPlugin } from "./zoology-quiz/index.js";
import { marineBioQuizPlugin } from "./marine-bio-quiz/index.js";
import { geologyQuizPlugin } from "./geology-quiz/index.js";
import { meteorologyQuizPlugin } from "./meteorology-quiz/index.js";
import { computerHistoryQuizPlugin } from "./computer-history-quiz/index.js";
import { programmingLangsQuizPlugin } from "./programming-langs-quiz/index.js";
import { internetHistoryQuizPlugin } from "./internet-history-quiz/index.js";
import { gamingHistoryQuizPlugin } from "./gaming-history-quiz/index.js";
import { cybersecQuizPlugin } from "./cybersec-quiz/index.js";
import { osQuizPlugin } from "./os-quiz/index.js";
import { aiHistoryQuizPlugin } from "./ai-history-quiz/index.js";
import { siliconValleyQuizPlugin } from "./silicon-valley-quiz/index.js";
import { straightSearchPlugin } from "./straight-search/index.js";
import { flushFinderPlugin } from "./flush-finder/index.js";
import { pairPickupPlugin } from "./pair-pickup/index.js";
import { kingsCourtPlugin } from "./kings-court/index.js";
import { queensQuestPlugin } from "./queens-quest/index.js";
import { jacksJamboreePlugin } from "./jacks-jamboree/index.js";
import { tensTallyPlugin } from "./tens-tally/index.js";
import { diceHandPokerPlugin } from "./dice-hand-poker/index.js";
import { farkleMiniPlugin } from "./farkle-mini/index.js";
import { pigClassicPlugin } from "./pig-classic/index.js";
import { dice21Plugin } from "./dice-21/index.js";
import { mexicanDicePlugin } from "./mexican-dice/index.js";
import { lollipopLiftPlugin } from "./lollipop-lift/index.js";
import { gumballGrabPlugin } from "./gumball-grab/index.js";
import { taffyTapPlugin } from "./taffy-tap/index.js";
import { nougatNetPlugin } from "./nougat-net/index.js";
import { caramelCatchPlugin } from "./caramel-catch/index.js";
import { worldCapitalsQuizPlugin } from "./world-capitals-quiz/index.js";
import { usStatesQuizPlugin } from "./us-states-quiz/index.js";
import { europeanCitiesQuizPlugin } from "./european-cities-quiz/index.js";
import { africanGeographyQuizPlugin } from "./african-geography-quiz/index.js";
import { asianGeographyQuizPlugin } from "./asian-geography-quiz/index.js";
import { southAmericaQuizPlugin } from "./south-america-quiz/index.js";
import { oceaniaQuizPlugin } from "./oceania-quiz/index.js";
import { caribbeanQuizPlugin } from "./caribbean-quiz/index.js";
import { worldFlagsQuizPlugin } from "./world-flags-quiz/index.js";
import { worldRiversQuizPlugin } from "./world-rivers-quiz/index.js";
import { shakespeareQuizPlugin } from "./shakespeare-quiz/index.js";
import { classicNovelsQuizPlugin } from "./classic-novels-quiz/index.js";
import { americanLitQuizPlugin } from "./american-lit-quiz/index.js";
import { britishLitQuizPlugin } from "./british-lit-quiz/index.js";
import { russianLitQuizPlugin } from "./russian-lit-quiz/index.js";
import { mysteryNovelsQuizPlugin } from "./mystery-novels-quiz/index.js";
import { sciFiNovelsQuizPlugin } from "./sci-fi-novels-quiz/index.js";
import { fantasyNovelsQuizPlugin } from "./fantasy-novels-quiz/index.js";
import { nineNinePlugin } from "./nine-nine/index.js";
import { eightEatersPlugin } from "./eight-eaters/index.js";
import { lowTidePlugin } from "./low-tide/index.js";
import { highTidePlugin } from "./high-tide/index.js";
import { colorClashPlugin } from "./color-clash/index.js";
import { suitShufflePlugin } from "./suit-shuffle/index.js";
import { rankRumblePlugin } from "./rank-rumble/index.js";
import { rollAndWritePlugin } from "./roll-and-write/index.js";
import { diceBingoPlugin } from "./dice-bingo/index.js";
import { buncoMiniPlugin } from "./bunco-mini/index.js";
import { diceKingPlugin } from "./dice-king/index.js";
import { diceClutchPlugin } from "./dice-clutch/index.js";
import { cucumberCatchPlugin } from "./cucumber-catch/index.js";
import { tomatoTossPlugin } from "./tomato-toss/index.js";
import { pepperPopPlugin } from "./pepper-pop/index.js";
import { spinachSpinPlugin } from "./spinach-spin/index.js";
import { kaleKombatPlugin } from "./kale-kombat/index.js";
import { oscarFilmsQuizPlugin } from "./oscar-films-quiz/index.js";
import { marvelMcuQuizPlugin } from "./marvel-mcu-quiz/index.js";
import { dcComicsFilmsQuizPlugin } from "./dc-comics-films-quiz/index.js";
import { pixarFilmsQuizPlugin } from "./pixar-films-quiz/index.js";
import { disneyClassicsQuizPlugin } from "./disney-classics-quiz/index.js";
import { horrorFilmsQuizPlugin } from "./horror-films-quiz/index.js";
import { sciFiFilmsQuizPlugin } from "./sci-fi-films-quiz/index.js";
import { tvSitcomsQuizPlugin } from "./tv-sitcoms-quiz/index.js";
import { tvDramasQuizPlugin } from "./tv-dramas-quiz/index.js";
import { cartoonsQuizPlugin } from "./cartoons-quiz/index.js";
import { beatlesQuizPlugin } from "./beatles-quiz/index.js";
import { elvisQuizPlugin } from "./elvis-quiz/index.js";
import { bowieQuizPlugin } from "./bowie-quiz/index.js";
import { princeQuizPlugin } from "./prince-quiz/index.js";
import { madonnaQuizPlugin } from "./madonna-quiz/index.js";
import { rollingStonesQuizPlugin } from "./rolling-stones-quiz/index.js";
import { ledZeppelinQuizPlugin } from "./led-zeppelin-quiz/index.js";
import { pinkFloydQuizPlugin } from "./pink-floyd-quiz/index.js";
import { tripleTroublePlugin } from "./triple-trouble/index.js";
import { quartetQuestPlugin } from "./quartet-quest/index.js";
import { flushFivePlugin } from "./flush-five/index.js";
import { lowFivePlugin } from "./low-five/index.js";
import { highFiveCardsPlugin } from "./high-five-cards/index.js";
import { faceFlipPlugin } from "./face-flip/index.js";
import { pipPulsePlugin } from "./pip-pulse/index.js";
import { tripleThreePlugin } from "./triple-three/index.js";
import { diceDerbyPlugin } from "./dice-derby/index.js";
import { diceDominoPlugin } from "./dice-domino/index.js";
import { diceSpinPlugin } from "./dice-spin/index.js";
import { superSixPlugin } from "./super-six/index.js";
import { teaTimeTapPlugin } from "./tea-time-tap/index.js";
import { chaiChasePlugin } from "./chai-chase/index.js";
import { coffeeCollectPlugin } from "./coffee-collect/index.js";
import { bobaBouncePlugin } from "./boba-bounce/index.js";
import { smoothieSwipePlugin } from "./smoothie-swipe/index.js";
import { friendsShowQuizPlugin } from "./friends-show-quiz/index.js";
import { officeShowQuizPlugin } from "./office-show-quiz/index.js";
import { seinfeldQuizPlugin } from "./seinfeld-quiz/index.js";
import { simpsonsQuizPlugin } from "./simpsons-quiz/index.js";
import { familyGuyQuizPlugin } from "./family-guy-quiz/index.js";
import { southParkQuizPlugin } from "./south-park-quiz/index.js";
import { gotQuizPlugin } from "./got-quiz/index.js";
import { breakingBadQuizPlugin } from "./breaking-bad-quiz/index.js";
import { strangerThingsQuizPlugin } from "./stranger-things-quiz/index.js";
import { lostShowQuizPlugin } from "./lost-show-quiz/index.js";
import { marioQuizPlugin } from "./mario-quiz/index.js";
import { zeldaQuizPlugin } from "./zelda-quiz/index.js";
import { pokemonQuizPlugin } from "./pokemon-quiz/index.js";
import { sonicQuizPlugin } from "./sonic-quiz/index.js";
import { finalFantasyQuizPlugin } from "./final-fantasy-quiz/index.js";
import { mortalKombatQuizPlugin } from "./mortal-kombat-quiz/index.js";
import { streetfighterQuizPlugin } from "./streetfighter-quiz/index.js";
import { metalGearQuizPlugin } from "./metal-gear-quiz/index.js";
import { acesUpMiniPlugin } from "./aces-up-mini/index.js";
import { fourFoursPlugin } from "./four-fours/index.js";
import { redRallyPlugin } from "./red-rally/index.js";
import { blackBashPlugin } from "./black-bash/index.js";
import { evenEddyPlugin } from "./even-eddy/index.js";
import { oddOlliePlugin } from "./odd-ollie/index.js";
import { cardClockPlugin } from "./card-clock/index.js";
import { diceTargetPlugin } from "./dice-target/index.js";
import { diceFlushMiniPlugin } from "./dice-flush-mini/index.js";
import { diceStackMiniPlugin } from "./dice-stack-mini/index.js";
import { dicePyramidPlugin } from "./dice-pyramid/index.js";
import { diceArrowPlugin } from "./dice-arrow/index.js";
import { chipsChompPlugin } from "./chips-chomp/index.js";
import { popcornPopPlugin } from "./popcorn-pop/index.js";
import { pretzelPinchPlugin } from "./pretzel-pinch/index.js";
import { nachosNowPlugin } from "./nachos-now/index.js";
import { crackerCrunchPlugin } from "./cracker-crunch/index.js";
import { narutoQuizPlugin } from "./naruto-quiz/index.js";
import { dragonballQuizPlugin } from "./dragonball-quiz/index.js";
import { onepieceQuizPlugin } from "./onepiece-quiz/index.js";
import { attackTitanQuizPlugin } from "./attack-titan-quiz/index.js";
import { bleachQuizPlugin } from "./bleach-quiz/index.js";
import { studioGhibliQuizPlugin } from "./studio-ghibli-quiz/index.js";
import { sailorMoonQuizPlugin } from "./sailor-moon-quiz/index.js";
import { evangelionQuizPlugin } from "./evangelion-quiz/index.js";
import { cowboyBebopQuizPlugin } from "./cowboy-bebop-quiz/index.js";
import { myHeroQuizPlugin } from "./my-hero-quiz/index.js";
import { batmanQuizPlugin } from "./batman-quiz/index.js";
import { supermanQuizPlugin } from "./superman-quiz/index.js";
import { xmenQuizPlugin } from "./xmen-quiz/index.js";
import { spidermanQuizPlugin } from "./spiderman-quiz/index.js";
import { wonderWomanQuizPlugin } from "./wonder-woman-quiz/index.js";
import { flashQuizPlugin } from "./flash-quiz/index.js";
import { greenLanternQuizPlugin } from "./green-lantern-quiz/index.js";
import { comicVillainsQuizPlugin } from "./comic-villains-quiz/index.js";
import { lowPairPlugin } from "./low-pair/index.js";
import { highPairPlugin } from "./high-pair/index.js";
import { rainbowRunPlugin } from "./rainbow-run/index.js";
import { monochromeRunPlugin } from "./monochrome-run/index.js";
import { swapStackPlugin } from "./swap-stack/index.js";
import { cutTheDeckPlugin } from "./cut-the-deck/index.js";
import { mirrorMatchPlugin } from "./mirror-match/index.js";
import { diceFrenzyPlugin } from "./dice-frenzy/index.js";
import { diceBowlPlugin } from "./dice-bowl/index.js";
import { diceSpellPlugin } from "./dice-spell/index.js";
import { diceShippingPlugin } from "./dice-shipping/index.js";
import { diceVortexPlugin } from "./dice-vortex/index.js";
import { cookieClutchPlugin } from "./cookie-clutch/index.js";
import { piePopPlugin } from "./pie-pop/index.js";
import { croissantCatchPlugin } from "./croissant-catch/index.js";
import { bagelBashPlugin } from "./bagel-bash/index.js";
import { donutDashPlugin } from "./donut-dash/index.js";
import { pizzaQuizPlugin } from "./pizza-quiz/index.js";
import { sushiQuizPlugin } from "./sushi-quiz/index.js";
import { pastaQuizPlugin } from "./pasta-quiz/index.js";
import { bbqQuizPlugin } from "./bbq-quiz/index.js";
import { tacosQuizPlugin } from "./tacos-quiz/index.js";
import { dimSumQuizPlugin } from "./dim-sum-quiz/index.js";
import { curryQuizPlugin } from "./curry-quiz/index.js";
import { cheeseQuizPlugin } from "./cheese-quiz/index.js";
import { breadQuizPlugin } from "./bread-quiz/index.js";
import { dessertQuizPlugin } from "./dessert-quiz/index.js";
import { dogsBreedsQuizPlugin } from "./dogs-breeds-quiz/index.js";
import { catsBreedsQuizPlugin } from "./cats-breeds-quiz/index.js";
import { birdsWorldQuizPlugin } from "./birds-world-quiz/index.js";
import { reptilesWorldQuizPlugin } from "./reptiles-world-quiz/index.js";
import { insectsWorldQuizPlugin } from "./insects-world-quiz/index.js";
import { dinosaursQuizPlugin } from "./dinosaurs-quiz/index.js";
import { horsesQuizPlugin } from "./horses-quiz/index.js";
import { endangeredSpeciesQuizPlugin } from "./endangered-species-quiz/index.js";
import { pipFivePlugin } from "./pip-five/index.js";
import { pipTenPlugin } from "./pip-ten/index.js";
import { faceFlushPlugin } from "./face-flush/index.js";
import { pipFlushPlugin } from "./pip-flush/index.js";
import { dualDealPlugin } from "./dual-deal/index.js";
import { tripleDealPlugin } from "./triple-deal/index.js";
import { quintDealPlugin } from "./quint-deal/index.js";
import { diceRoulettePlugin } from "./dice-roulette/index.js";
import { diceBlackjackPlugin } from "./dice-blackjack/index.js";
import { diceBaccaratPlugin } from "./dice-baccarat/index.js";
import { diceKenoPlugin } from "./dice-keno/index.js";
import { diceCrapsMiniPlugin } from "./dice-craps-mini/index.js";
import { dumplingDancePlugin } from "./dumpling-dance/index.js";
import { ramenRushPlugin } from "./ramen-rush/index.js";
import { tempuraTapPlugin } from "./tempura-tap/index.js";
import { baoBashPlugin } from "./bao-bash/index.js";
import { mochiMashPlugin } from "./mochi-mash/index.js";
import { chessHistoryQuizPlugin } from "./chess-history-quiz/index.js";
import { pokerHistoryQuizPlugin } from "./poker-history-quiz/index.js";
import { cardMagicQuizPlugin } from "./card-magic-quiz/index.js";
import { gardeningQuizPlugin } from "./gardening-quiz/index.js";
import { cookingTechniquesQuizPlugin } from "./cooking-techniques-quiz/index.js";
import { winePairingQuizPlugin } from "./wine-pairing-quiz/index.js";
import { coffeeBrewingQuizPlugin } from "./coffee-brewing-quiz/index.js";
import { photographyQuizPlugin } from "./photography-quiz/index.js";
import { paintingTechniquesQuizPlugin } from "./painting-techniques-quiz/index.js";
import { potteryQuizPlugin } from "./pottery-quiz/index.js";
import { parisQuizPlugin } from "./paris-quiz/index.js";
import { tokyoQuizPlugin } from "./tokyo-quiz/index.js";
import { nycQuizPlugin } from "./nyc-quiz/index.js";
import { londonQuizPlugin } from "./london-quiz/index.js";
import { romeQuizPlugin } from "./rome-quiz/index.js";
import { dubaiQuizPlugin } from "./dubai-quiz/index.js";
import { sydneyQuizPlugin } from "./sydney-quiz/index.js";
import { rioQuizPlugin } from "./rio-quiz/index.js";
import { sevenSevensPlugin } from "./seven-sevens/index.js";
import { sixShootPlugin } from "./six-shoot/index.js";
import { fiveFingersPlugin } from "./five-fingers/index.js";
import { fourFaceoffPlugin } from "./four-faceoff/index.js";
import { twoTwosomePlugin } from "./two-twosome/index.js";
import { threeTriosPlugin } from "./three-trios/index.js";
import { cardCascadePlugin } from "./card-cascade/index.js";
import { diceBingoLinePlugin } from "./dice-bingo-line/index.js";
import { diceMarathonPlugin } from "./dice-marathon/index.js";
import { diceTallyPlugin } from "./dice-tally/index.js";
import { diceCricketPlugin } from "./dice-cricket/index.js";
import { diceShootoutPlugin } from "./dice-shootout/index.js";
import { flowerPluckPlugin } from "./flower-pluck/index.js";
import { weedWhackPlugin } from "./weed-whack/index.js";
import { seedSprinklePlugin } from "./seed-sprinkle/index.js";
import { beeBuzzPlugin } from "./bee-buzz/index.js";
import { butterflyNetPlugin } from "./butterfly-net/index.js";
import { carBrandsQuizPlugin } from "./car-brands-quiz/index.js";
import { techBrandsQuizPlugin } from "./tech-brands-quiz/index.js";
import { fashionBrandsQuizPlugin } from "./fashion-brands-quiz/index.js";
import { sodaBrandsQuizPlugin } from "./soda-brands-quiz/index.js";
import { sneakerBrandsQuizPlugin } from "./sneaker-brands-quiz/index.js";
import { airlineBrandsQuizPlugin } from "./airline-brands-quiz/index.js";
import { bankBrandsQuizPlugin } from "./bank-brands-quiz/index.js";
import { cerealBrandsQuizPlugin } from "./cereal-brands-quiz/index.js";
import { fastFoodBrandsQuizPlugin } from "./fast-food-brands-quiz/index.js";
import { cosmeticBrandsQuizPlugin } from "./cosmetic-brands-quiz/index.js";
import { usPresidentsQuizPlugin } from "./us-presidents-quiz/index.js";
import { britishMonarchsQuizPlugin } from "./british-monarchs-quiz/index.js";
import { worldDictatorsQuizPlugin } from "./world-dictators-quiz/index.js";
import { nobelLaureatesQuizPlugin } from "./nobel-laureates-quiz/index.js";
import { inventorsQuizPlugin } from "./inventors-quiz/index.js";
import { nasaAstronautsQuizPlugin } from "./nasa-astronauts-quiz/index.js";
import { entrepreneursQuizPlugin } from "./entrepreneurs-quiz/index.js";
import { civilRightsQuizPlugin } from "./civil-rights-quiz/index.js";
import { redKingPlugin } from "./red-king/index.js";
import { blackKingPlugin } from "./black-king/index.js";
import { redQueenPlugin } from "./red-queen/index.js";
import { blackQueenPlugin } from "./black-queen/index.js";
import { fourColorFlushPlugin } from "./four-color-flush/index.js";
import { cardSnakePlugin } from "./card-snake/index.js";
import { cardLadderPlugin } from "./card-ladder/index.js";
import { diceShootPlugin } from "./dice-shoot/index.js";
import { diceMirrorPlugin } from "./dice-mirror/index.js";
import { diceStairPlugin } from "./dice-stair/index.js";
import { diceRainbowPlugin } from "./dice-rainbow/index.js";
import { diceFortunePlugin } from "./dice-fortune/index.js";
import { frogFlickPlugin } from "./frog-flick/index.js";
import { antAttackPlugin } from "./ant-attack/index.js";
import { mouseMashPlugin } from "./mouse-mash/index.js";
import { bunnyBouncePlugin } from "./bunny-bounce/index.js";
import { chickChasePlugin } from "./chick-chase/index.js";
import { nineteen20sQuizPlugin } from "./1920s-quiz/index.js";
import { nineteen30sQuizPlugin } from "./1930s-quiz/index.js";
import { nineteen40sQuizPlugin } from "./1940s-quiz/index.js";
import { nineteen50sQuizPlugin } from "./1950s-quiz/index.js";
import { nineteen60sQuizPlugin } from "./1960s-quiz/index.js";
import { nineteen70sQuizPlugin } from "./1970s-quiz/index.js";
import { nineteen80sQuizPlugin } from "./1980s-quiz/index.js";
import { nineteen90sQuizPlugin } from "./1990s-quiz/index.js";
import { twoThousandsQuizPlugin } from "./2000s-quiz/index.js";
import { twentyTensQuizPlugin } from "./2010s-quiz/index.js";

export const GAMES: GamePlugin[] = [
  texasHoldemPlugin as unknown as GamePlugin,
  omahaHoldemPlugin as unknown as GamePlugin,
  sevenCardStudPlugin as unknown as GamePlugin,
  fiveCardDrawPlugin as unknown as GamePlugin,
  razzPlugin as unknown as GamePlugin,
  badugiPlugin as unknown as GamePlugin,
  chessPlugin as unknown as GamePlugin,
  suicideChessPlugin as unknown as GamePlugin,
  atomicChessPlugin as unknown as GamePlugin,
  chess960Plugin as unknown as GamePlugin,
  racingKingsPlugin as unknown as GamePlugin,
  hordeChessPlugin as unknown as GamePlugin,
  threeCheckPlugin as unknown as GamePlugin,
  crazyhousePlugin as unknown as GamePlugin,
  kingOfTheHillPlugin as unknown as GamePlugin,
  antichessPlugin as unknown as GamePlugin,
  progressiveChessPlugin as unknown as GamePlugin,
  internationalDraughtsPlugin as unknown as GamePlugin,
  chineseCheckersPlugin as unknown as GamePlugin,
  halmaPlugin as unknown as GamePlugin,
  cameroonPlugin as unknown as GamePlugin,
  kismetPlugin as unknown as GamePlugin,
  miaPlugin as unknown as GamePlugin,
  chicagoDicePlugin as unknown as GamePlugin,
  shutTheBoxPlugin as unknown as GamePlugin,
  dicePokerPlugin as unknown as GamePlugin,
  accordionPlugin as unknown as GamePlugin,
  beleagueredCastlePlugin as unknown as GamePlugin,
  streetsAndAlleysPlugin as unknown as GamePlugin,
  penguinPlugin as unknown as GamePlugin,
  bakersGamePlugin as unknown as GamePlugin,
  westcliffPlugin as unknown as GamePlugin,
  kingsInTheCornerPlugin as unknown as GamePlugin,
  acesUpPlugin as unknown as GamePlugin,
  yachtPlugin as unknown as GamePlugin,
  balutPlugin as unknown as GamePlugin,
  generalaPlugin as unknown as GamePlugin,
  shipCaptainCrewPlugin as unknown as GamePlugin,
  buncoPlugin as unknown as GamePlugin,
  tenThousandPlugin as unknown as GamePlugin,
  zombieDicePlugin as unknown as GamePlugin,
  canfieldPlugin as unknown as GamePlugin,
  golfPlugin as unknown as GamePlugin,
  yukonPlugin as unknown as GamePlugin,
  fortyThievesPlugin as unknown as GamePlugin,
  scorpionPlugin as unknown as GamePlugin,
  laBelleLuciePlugin as unknown as GamePlugin,
  clockPlugin as unknown as GamePlugin,
  monteCarloPlugin as unknown as GamePlugin,
  goFishPlugin as unknown as GamePlugin,
  warPlugin as unknown as GamePlugin,
  klondikePlugin as unknown as GamePlugin,
  freecellPlugin as unknown as GamePlugin,
  spiderPlugin as unknown as GamePlugin,
  yahtzeePlugin as unknown as GamePlugin,
  farklePlugin as unknown as GamePlugin,
  pigPlugin as unknown as GamePlugin,
  ticTacToePlugin as unknown as GamePlugin,
  checkersPlugin as unknown as GamePlugin,
  blackjackPlugin as unknown as GamePlugin,
  videoPokerPlugin as unknown as GamePlugin,
  connect4Plugin as unknown as GamePlugin,
  unoLikePlugin as unknown as GamePlugin,
  sudokuPlugin as unknown as GamePlugin,
  snakePlugin as unknown as GamePlugin,
  heartsPlugin as unknown as GamePlugin,
  wordGuessPlugin as unknown as GamePlugin,
  minesweeperPlugin as unknown as GamePlugin,
  twoFortyEightPlugin as unknown as GamePlugin,
  memoryMatchPlugin as unknown as GamePlugin,
  crazyEightsPlugin as unknown as GamePlugin,
  pyramidPlugin as unknown as GamePlugin,
  triPeaksPlugin as unknown as GamePlugin,
  reversiPlugin as unknown as GamePlugin,
  lightsOutPlugin as unknown as GamePlugin,
  fifteenPuzzlePlugin as unknown as GamePlugin,
  hangmanPlugin as unknown as GamePlugin,
  liarsDicePlugin as unknown as GamePlugin,
  breakoutPlugin as unknown as GamePlugin,
  oldMaidPlugin as unknown as GamePlugin,
  snapPlugin as unknown as GamePlugin,
  slapjackPlugin as unknown as GamePlugin,
  presidentPlugin as unknown as GamePlugin,
  bsPlugin as unknown as GamePlugin,
  egyptianRatscrewPlugin as unknown as GamePlugin,
  speedPlugin as unknown as GamePlugin,
  nineMensMorrisPlugin as unknown as GamePlugin,
  mancalaPlugin as unknown as GamePlugin,
  mastermindPlugin as unknown as GamePlugin,
  gomokuPlugin as unknown as GamePlugin,
  dotsAndBoxesPlugin as unknown as GamePlugin,
  battleshipPlugin as unknown as GamePlugin,
  nonogramPlugin as unknown as GamePlugin,
  wordSearchPlugin as unknown as GamePlugin,
  wordLadderPlugin as unknown as GamePlugin,
  anagramPlugin as unknown as GamePlugin,
  make24Plugin as unknown as GamePlugin,
  pegSolitairePlugin as unknown as GamePlugin,
  pongPlugin as unknown as GamePlugin,
  tetrisPlugin as unknown as GamePlugin,
  froggerPlugin as unknown as GamePlugin,
  asteroidsPlugin as unknown as GamePlugin,
  spaceInvadersPlugin as unknown as GamePlugin,
  baccaratPlugin as unknown as GamePlugin,
  roulettePlugin as unknown as GamePlugin,
  crapsPlugin as unknown as GamePlugin,
  slotsPlugin as unknown as GamePlugin,
  caribbeanStudPlugin as unknown as GamePlugin,
  whackAMolePlugin as unknown as GamePlugin,
  plinkoPlugin as unknown as GamePlugin,
  bubbleShooterPlugin as unknown as GamePlugin,
  towerOfHanoiPlugin as unknown as GamePlugin,
  reactionTimePlugin as unknown as GamePlugin,
  simonPlugin as unknown as GamePlugin,
  ginRummyPlugin as unknown as GamePlugin,
  spadesPlugin as unknown as GamePlugin,
  euchrePlugin as unknown as GamePlugin,
  rummy500Plugin as unknown as GamePlugin,
  casinoPlugin as unknown as GamePlugin,
  fiveCrownsPlugin as unknown as GamePlugin,
  highCardFlushPlugin as unknown as GamePlugin,
  sevensPlugin as unknown as GamePlugin,
  bowlingPlugin as unknown as GamePlugin,
  horseshoesPlugin as unknown as GamePlugin,
  ticTacToe3DPlugin as unknown as GamePlugin,
  numberGuesserPlugin as unknown as GamePlugin,
  bingoPlugin as unknown as GamePlugin,
  coinFlipStreakPlugin as unknown as GamePlugin,
  spiderettePlugin as unknown as GamePlugin,
  eightOffPlugin as unknown as GamePlugin,
  missMilliganPlugin as unknown as GamePlugin,
  crescentPlugin as unknown as GamePlugin,
  gatePlugin as unknown as GamePlugin,
  yukonCellsPlugin as unknown as GamePlugin,
  whiteheadPlugin as unknown as GamePlugin,
  slyFoxPlugin as unknown as GamePlugin,
  hexPlugin as unknown as GamePlugin,
  abalonePlugin as unknown as GamePlugin,
  santoriniPlugin as unknown as GamePlugin,
  blokusDuoPlugin as unknown as GamePlugin,
  pentagoPlugin as unknown as GamePlugin,
  amazonsPlugin as unknown as GamePlugin,
  bullsAndCowsPlugin as unknown as GamePlugin,
  slitherlinkPlugin as unknown as GamePlugin,
  nurikabePlugin as unknown as GamePlugin,
  hidatoPlugin as unknown as GamePlugin,
  futoshikiPlugin as unknown as GamePlugin,
  cryptogramPlugin as unknown as GamePlugin,
  kakuroPlugin as unknown as GamePlugin,
  kenkenPlugin as unknown as GamePlugin,
  tentsPlugin as unknown as GamePlugin,
  skyscrapersPlugin as unknown as GamePlugin,
  hitoriPlugin as unknown as GamePlugin,
  masyuPlugin as unknown as GamePlugin,
  killerSudokuPlugin as unknown as GamePlugin,
  rushHourPlugin as unknown as GamePlugin,
  sokobanPlugin as unknown as GamePlugin,
  unrulyPlugin as unknown as GamePlugin,
  starBattlePlugin as unknown as GamePlugin,
  missileCommandPlugin as unknown as GamePlugin,
  mazeChasePlugin as unknown as GamePlugin,
  climbJumperPlugin as unknown as GamePlugin,
  gravityLanderPlugin as unknown as GamePlugin,
  endlessRunnerPlugin as unknown as GamePlugin,
  bouncerPlugin as unknown as GamePlugin,
  bogglePlugin as unknown as GamePlugin,
  acrophobiaPlugin as unknown as GamePlugin,
  wordPokerPlugin as unknown as GamePlugin,
  crossCluesPlugin as unknown as GamePlugin,
  codewordsPlugin as unknown as GamePlugin,
  letterBoxedPlugin as unknown as GamePlugin,
  whistPlugin as unknown as GamePlugin,
  fiveHundredPlugin as unknown as GamePlugin,
  pinochlePlugin as unknown as GamePlugin,
  sheepsheadPlugin as unknown as GamePlugin,
  wizardPlugin as unknown as GamePlugin,
  ninetyNinePlugin as unknown as GamePlugin,
  cantStopPlugin as unknown as GamePlugin,
  perudoPlugin as unknown as GamePlugin,
  dudoPlugin as unknown as GamePlugin,
  kingdomsDicePlugin as unknown as GamePlugin,
  tenziPlugin as unknown as GamePlugin,
  beatThatPlugin as unknown as GamePlugin,
  parcheesiPlugin as unknown as GamePlugin,
  ludoPlugin as unknown as GamePlugin,
  sorryPlugin as unknown as GamePlugin,
  troublePlugin as unknown as GamePlugin,
  snakesAndLaddersPlugin as unknown as GamePlugin,
  ratRacePlugin as unknown as GamePlugin,
  hnefataflPlugin as unknown as GamePlugin,
  fanoronaPlugin as unknown as GamePlugin,
  alquerquePlugin as unknown as GamePlugin,
  konanePlugin as unknown as GamePlugin,
  owarePlugin as unknown as GamePlugin,
  xiangqiPlugin as unknown as GamePlugin,
  shogiPlugin as unknown as GamePlugin,
  miniShogiPlugin as unknown as GamePlugin,
  makrukPlugin as unknown as GamePlugin,
  sittuyinPlugin as unknown as GamePlugin,
  janggiPlugin as unknown as GamePlugin,
  baoPlugin as unknown as GamePlugin,
  sungkaPlugin as unknown as GamePlugin,
  tablutPlugin as unknown as GamePlugin,
  briscolaPlugin as unknown as GamePlugin,
  scopaPlugin as unknown as GamePlugin,
  tutePlugin as unknown as GamePlugin,
  conquianPlugin as unknown as GamePlugin,
  setbackPlugin as unknown as GamePlugin,
  musPlugin as unknown as GamePlugin,
  dutchBlitzPlugin as unknown as GamePlugin,
  nertzPlugin as unknown as GamePlugin,
  ligrettoPlugin as unknown as GamePlugin,
  spitPlugin as unknown as GamePlugin,
  californiaSpeedPlugin as unknown as GamePlugin,
  kempsPlugin as unknown as GamePlugin,
  hanabiPlugin as unknown as GamePlugin,
  theCrewPlugin as unknown as GamePlugin,
  justOnePlugin as unknown as GamePlugin,
  codenamesLitePlugin as unknown as GamePlugin,
  spotItPlugin as unknown as GamePlugin,
  setGamePlugin as unknown as GamePlugin,
  tangramPlugin as unknown as GamePlugin,
  chainReactionPlugin as unknown as GamePlugin,
  match3Plugin as unknown as GamePlugin,
  columnsPlugin as unknown as GamePlugin,
  drMarioPlugin as unknown as GamePlugin,
  puyoPopPlugin as unknown as GamePlugin,
  drop7Plugin as unknown as GamePlugin,
  sameGamePlugin as unknown as GamePlugin,
  mahjongTurtlePlugin as unknown as GamePlugin,
  mahjongDragonPlugin as unknown as GamePlugin,
  mahjongPyramidPlugin as unknown as GamePlugin,
  shisenShoPlugin as unknown as GamePlugin,
  pairsThemedPlugin as unknown as GamePlugin,
  tileMatchRushPlugin as unknown as GamePlugin,
  russianSolitairePlugin as unknown as GamePlugin,
  bakersDozPlugin as unknown as GamePlugin,
  sultanPlugin as unknown as GamePlugin,
  grandfathersClockPlugin as unknown as GamePlugin,
  scorpionTailPlugin as unknown as GamePlugin,
  carpetPlugin as unknown as GamePlugin,
  paiGowPokerPlugin as unknown as GamePlugin,
  letItRidePlugin as unknown as GamePlugin,
  threeCardPokerPlugin as unknown as GamePlugin,
  redDogPlugin as unknown as GamePlugin,
  casinoWarPlugin as unknown as GamePlugin,
  sicBoPlugin as unknown as GamePlugin,
  rockPaperScissorsPlugin as unknown as GamePlugin,
  nimPlugin as unknown as GamePlugin,
  truelPlugin as unknown as GamePlugin,
  secretNumberPlugin as unknown as GamePlugin,
  primeClimbPlugin as unknown as GamePlugin,
  rummikubPlugin as unknown as GamePlugin,
  quixoPlugin as unknown as GamePlugin,
  quartoPlugin as unknown as GamePlugin,
  akariPlugin as unknown as GamePlugin,
  yajilinPlugin as unknown as GamePlugin,
  shikakuPlugin as unknown as GamePlugin,
  heyawakePlugin as unknown as GamePlugin,
  cavePlugin as unknown as GamePlugin,
  fillominoPlugin as unknown as GamePlugin,
  aquariumPlugin as unknown as GamePlugin,
  tapaPlugin as unknown as GamePlugin,
  cruelPlugin as unknown as GamePlugin,
  fortyAndEightPlugin as unknown as GamePlugin,
  diplomatPlugin as unknown as GamePlugin,
  congressPlugin as unknown as GamePlugin,
  simpleSimonPlugin as unknown as GamePlugin,
  emperorPlugin as unknown as GamePlugin,
  perseverancePlugin as unknown as GamePlugin,
  canisterPlugin as unknown as GamePlugin,
  skatPlugin as unknown as GamePlugin,
  klaverjasPlugin as unknown as GamePlugin,
  doppelkopfPlugin as unknown as GamePlugin,
  belotePlugin as unknown as GamePlugin,
  tressettePlugin as unknown as GamePlugin,
  schnapsenPlugin as unknown as GamePlugin,
  mariagePlugin as unknown as GamePlugin,
  preferansPlugin as unknown as GamePlugin,
  choHanPlugin as unknown as GamePlugin,
  acesInThePotPlugin as unknown as GamePlugin,
  safeKeeperPlugin as unknown as GamePlugin,
  underOver7Plugin as unknown as GamePlugin,
  bossDicePlugin as unknown as GamePlugin,
  fiveDiceShootoutPlugin as unknown as GamePlugin,
  centennialPlugin as unknown as GamePlugin,
  gluckshausPlugin as unknown as GamePlugin,
  typingSpeedPlugin as unknown as GamePlugin,
  targetPracticePlugin as unknown as GamePlugin,
  colorMatchPlugin as unknown as GamePlugin,
  mathChallengePlugin as unknown as GamePlugin,
  frogCatcherPlugin as unknown as GamePlugin,
  fallingCatcherPlugin as unknown as GamePlugin,
  duckShootPlugin as unknown as GamePlugin,
  stackerPlugin as unknown as GamePlugin,
  handAndFootPlugin as unknown as GamePlugin,
  canastaPlugin as unknown as GamePlugin,
  sambaPlugin as unknown as GamePlugin,
  boliviaPlugin as unknown as GamePlugin,
  continentalRummyPlugin as unknown as GamePlugin,
  contractRummyPlugin as unknown as GamePlugin,
  fiveHundredRumPlugin as unknown as GamePlugin,
  kalookiPlugin as unknown as GamePlugin,
  breakthroughPlugin as unknown as GamePlugin,
  clobberPlugin as unknown as GamePlugin,
  linesOfActionPlugin as unknown as GamePlugin,
  go9x9Plugin as unknown as GamePlugin,
  atariGoPlugin as unknown as GamePlugin,
  phutballPlugin as unknown as GamePlugin,
  dvonnLitePlugin as unknown as GamePlugin,
  dotsCapturePlugin as unknown as GamePlugin,
  europeanPegSolitairePlugin as unknown as GamePlugin,
  uncleWiggilyPlugin as unknown as GamePlugin,
  lotto90Plugin as unknown as GamePlugin,
  klotskiPlugin as unknown as GamePlugin,
  coinCounterPlugin as unknown as GamePlugin,
  guessFlagPlugin as unknown as GamePlugin,
  oddOneOutPlugin as unknown as GamePlugin,
  lightsOut3DPlugin as unknown as GamePlugin,
  windmillPlugin as unknown as GamePlugin,
  seaTowersPlugin as unknown as GamePlugin,
  thumbAndPouchPlugin as unknown as GamePlugin,
  flowerGardenPlugin as unknown as GamePlugin,
  easthavenPlugin as unknown as GamePlugin,
  klondikeByThreesPlugin as unknown as GamePlugin,
  aceOfThePilePlugin as unknown as GamePlugin,
  relaxedSpiderPlugin as unknown as GamePlugin,
  spellingBeePlugin as unknown as GamePlugin,
  crosswordMiniPlugin as unknown as GamePlugin,
  textTwistPlugin as unknown as GamePlugin,
  acrosticPlugin as unknown as GamePlugin,
  bananagramsPlugin as unknown as GamePlugin,
  quordlePlugin as unknown as GamePlugin,
  wordChainPlugin as unknown as GamePlugin,
  wordConstructionPlugin as unknown as GamePlugin,
  logicGridPlugin as unknown as GamePlugin,
  bridgesPlugin as unknown as GamePlugin,
  dominoPlacementPlugin as unknown as GamePlugin,
  kropkiPlugin as unknown as GamePlugin,
  thermometerPlugin as unknown as GamePlugin,
  numberlinkPlugin as unknown as GamePlugin,
  kakurasuPlugin as unknown as GamePlugin,
  laserMazePlugin as unknown as GamePlugin,
  cuckooPlugin as unknown as GamePlugin,
  germanWhistPlugin as unknown as GamePlugin,
  knockOutWhistPlugin as unknown as GamePlugin,
  bastraPlugin as unknown as GamePlugin,
  agramPlugin as unknown as GamePlugin,
  scatPlugin as unknown as GamePlugin,
  doubleDummyWhistPlugin as unknown as GamePlugin,
  twentyNinePlugin as unknown as GamePlugin,
  auldLangSynePlugin as unknown as GamePlugin,
  klondikeSuperSolverPlugin as unknown as GamePlugin,
  calculationPlugin as unknown as GamePlugin,
  pokerSolitairePlugin as unknown as GamePlugin,
  pyramidGolfPlugin as unknown as GamePlugin,
  nestorPlugin as unknown as GamePlugin,
  fortyEightOneDeckPlugin as unknown as GamePlugin,
  dozenPlugin as unknown as GamePlugin,
  candyLandPlugin as unknown as GamePlugin,
  hiHoCherryOPlugin as unknown as GamePlugin,
  dontBreakIcePlugin as unknown as GamePlugin,
  popThePigPlugin as unknown as GamePlugin,
  operationGamePlugin as unknown as GamePlugin,
  guessWhoPlugin as unknown as GamePlugin,
  chutesLaddersKidsPlugin as unknown as GamePlugin,
  connectLightsPlugin as unknown as GamePlugin,
  rollASixPlugin as unknown as GamePlugin,
  highCardDrawPlugin as unknown as GamePlugin,
  pennyFlipPlugin as unknown as GamePlugin,
  oddDicePlugin as unknown as GamePlugin,
  mathBingoPlugin as unknown as GamePlugin,
  balloonPopPlugin as unknown as GamePlugin,
  cardLineupPlugin as unknown as GamePlugin,
  numberMazePlugin as unknown as GamePlugin,
  generalTriviaPlugin as unknown as GamePlugin,
  twoTruthsLiePlugin as unknown as GamePlugin,
  wouldYouRatherPlugin as unknown as GamePlugin,
  triviaTowerPlugin as unknown as GamePlugin,
  wordAssociationPlugin as unknown as GamePlugin,
  rhymeTimePlugin as unknown as GamePlugin,
  charadesPlugin as unknown as GamePlugin,
  pictionaryPlugin as unknown as GamePlugin,
  flappyBirdPlugin as unknown as GamePlugin,
  doodleJumpPlugin as unknown as GamePlugin,
  helicopterPlugin as unknown as GamePlugin,
  wallJumperPlugin as unknown as GamePlugin,
  tapRunnerPlugin as unknown as GamePlugin,
  meteorDodgerPlugin as unknown as GamePlugin,
  paddleBallPlugin as unknown as GamePlugin,
  ringThrowerPlugin as unknown as GamePlugin,
  rikudoPlugin as unknown as GamePlugin,
  kingsAndKnightsPlugin as unknown as GamePlugin,
  battleshipSolitairePlugin as unknown as GamePlugin,
  trainTracksPlugin as unknown as GamePlugin,
  stitchesPlugin as unknown as GamePlugin,
  rangePlugin as unknown as GamePlugin,
  shakashakaPlugin as unknown as GamePlugin,
  crossTheStreamsPlugin as unknown as GamePlugin,
  lcrPlugin as unknown as GamePlugin,
  snakesRacePlugin as unknown as GamePlugin,
  rollRightPlugin as unknown as GamePlugin,
  diddlerPlugin as unknown as GamePlugin,
  fifteensPlugin as unknown as GamePlugin,
  napoleonsTombPlugin as unknown as GamePlugin,
  quickTickPlugin as unknown as GamePlugin,
  paperTossPlugin as unknown as GamePlugin,
  brainiacPlugin as unknown as GamePlugin,
  narcoticPlugin as unknown as GamePlugin,
  bisleyPlugin as unknown as GamePlugin,
  kingsPlugin as unknown as GamePlugin,
  gizaPlugin as unknown as GamePlugin,
  alhambraPlugin as unknown as GamePlugin,
  pouncePlugin as unknown as GamePlugin,
  capriciesePlugin as unknown as GamePlugin,
  bigTwoPlugin as unknown as GamePlugin,
  tienLenPlugin as unknown as GamePlugin,
  pusoyDosPlugin as unknown as GamePlugin,
  nineCardBragPlugin as unknown as GamePlugin,
  presidentsPlugin as unknown as GamePlugin,
  rideTheBusPlugin as unknown as GamePlugin,
  pokerSquares2PPlugin as unknown as GamePlugin,
  californiaJackPlugin as unknown as GamePlugin,
  wheelSpinPlugin as unknown as GamePlugin,
  priceGuessPlugin as unknown as GamePlugin,
  dealOrNoDealPlugin as unknown as GamePlugin,
  jeopardyLikePlugin as unknown as GamePlugin,
  familyFeudPlugin as unknown as GamePlugin,
  lightningRoundPlugin as unknown as GamePlugin,
  millionairePlugin as unknown as GamePlugin,
  cashCabPlugin as unknown as GamePlugin,
  timesTablesPlugin as unknown as GamePlugin,
  divisionDrillPlugin as unknown as GamePlugin,
  fractionMatcherPlugin as unknown as GamePlugin,
  sequencePredictorPlugin as unknown as GamePlugin,
  unitConverterQuizPlugin as unknown as GamePlugin,
  percentCalculatorPlugin as unknown as GamePlugin,
  geographyQuizPlugin as unknown as GamePlugin,
  chemistryQuizPlugin as unknown as GamePlugin,
  blackjackSwitchPlugin as unknown as GamePlugin,
  spanish21Plugin as unknown as GamePlugin,
  pontoonPlugin as unknown as GamePlugin,
  videoKenoPlugin as unknown as GamePlugin,
  bonus6Plugin as unknown as GamePlugin,
  anteUpBlackjackPlugin as unknown as GamePlugin,
  casinoHoldemPlugin as unknown as GamePlugin,
  mississippiStudPlugin as unknown as GamePlugin,
  surakartaPlugin as unknown as GamePlugin,
  yotePlugin as unknown as GamePlugin,
  muTorerePlugin as unknown as GamePlugin,
  shobuPlugin as unknown as GamePlugin,
  loaSmallPlugin as unknown as GamePlugin,
  tumbleweedPlugin as unknown as GamePlugin,
  pentalathPlugin as unknown as GamePlugin,
  slitherPlugin as unknown as GamePlugin,
  numberMemoryPlugin as unknown as GamePlugin,
  colorSequencePlugin as unknown as GamePlugin,
  imageMemoryPlugin as unknown as GamePlugin,
  dualNBackPlugin as unknown as GamePlugin,
  patternRecallPlugin as unknown as GamePlugin,
  quickCountingPlugin as unknown as GamePlugin,
  oddShapeOutPlugin as unknown as GamePlugin,
  faceRecognitionPlugin as unknown as GamePlugin,
  fortuneTellerPlugin as unknown as GamePlugin,
  magic8BallPlugin as unknown as GamePlugin,
  coinCollectorPlugin as unknown as GamePlugin,
  diceLadderPlugin as unknown as GamePlugin,
  leafBlowerPlugin as unknown as GamePlugin,
  puzzleBoxPlugin as unknown as GamePlugin,
  cardSpinnerPlugin as unknown as GamePlugin,
  rollEmPlugin as unknown as GamePlugin,
  trucoPlugin as unknown as GamePlugin,
  escobaPlugin as unknown as GamePlugin,
  chinchonPlugin as unknown as GamePlugin,
  durakPlugin as unknown as GamePlugin,
  trucoPaulistaPlugin as unknown as GamePlugin,
  tarneebPlugin as unknown as GamePlugin,
  tonkPlugin as unknown as GamePlugin,
  kachuufiPlugin as unknown as GamePlugin,
  lemonadeStandPlugin as unknown as GamePlugin,
  farmTycoonPlugin as unknown as GamePlugin,
  stockMarketMiniPlugin as unknown as GamePlugin,
  cityBuilderMicroPlugin as unknown as GamePlugin,
  zooKeeperPlugin as unknown as GamePlugin,
  islandSurvivalPlugin as unknown as GamePlugin,
  piratesBountyPlugin as unknown as GamePlugin,
  spaceColonyPlugin as unknown as GamePlugin,
  pool8BallPlugin as unknown as GamePlugin,
  billiards9BallPlugin as unknown as GamePlugin,
  shuffleboardPlugin as unknown as GamePlugin,
  miniGolfPlugin as unknown as GamePlugin,
  golf18Plugin as unknown as GamePlugin,
  basketballFTPlugin as unknown as GamePlugin,
  fieldGoalPlugin as unknown as GamePlugin,
  tennisServePlugin as unknown as GamePlugin,
  farmManagerPlugin as unknown as GamePlugin,
  stockTickerPlugin as unknown as GamePlugin,
  storehousePlugin as unknown as GamePlugin,
  milliganCellPlugin as unknown as GamePlugin,
  doubleFreeCellPlugin as unknown as GamePlugin,
  westcliffEasyPlugin as unknown as GamePlugin,
  nonogram5x5Plugin as unknown as GamePlugin,
  battleshipSoloPlugin as unknown as GamePlugin,
  lightSwitchPuzzlePlugin as unknown as GamePlugin,
  numberChainPlugin as unknown as GamePlugin,
  pegSolitairePlusPlugin as unknown as GamePlugin,
  logicGatesSimPlugin as unknown as GamePlugin,
  cipherCrackPlugin as unknown as GamePlugin,
  binaryPuzzlePlugin as unknown as GamePlugin,
  colorMatchDashPlugin as unknown as GamePlugin,
  rhythmTapPlugin as unknown as GamePlugin,
  stackTowerPlugin as unknown as GamePlugin,
  planeDodgePlugin as unknown as GamePlugin,
  laserDodgePlugin as unknown as GamePlugin,
  bubblePopChainPlugin as unknown as GamePlugin,
  whackAVirusPlugin as unknown as GamePlugin,
  tunnelRunnerPlugin as unknown as GamePlugin,
  wordScramblePlugin as unknown as GamePlugin,
  categoryQuizPlugin as unknown as GamePlugin,
  missingLettersPlugin as unknown as GamePlugin,
  synonymMatchPlugin as unknown as GamePlugin,
  deucesWildPlugin as unknown as GamePlugin,
  doubleBonusPokerPlugin as unknown as GamePlugin,
  miniRoulettePlugin as unknown as GamePlugin,
  highLowCasinoPlugin as unknown as GamePlugin,
  casinoWarMultiPlugin as unknown as GamePlugin,
  kenoMiniPlugin as unknown as GamePlugin,
  fanTanPlugin as unknown as GamePlugin,
  dragonTigerPlugin as unknown as GamePlugin,
  fortressSolitairePlugin as unknown as GamePlugin,
  seaHavenTowersPlugin as unknown as GamePlugin,
  canfieldStorehousePlugin as unknown as GamePlugin,
  cornersSolitairePlugin as unknown as GamePlugin,
  kingAlbertPlugin as unknown as GamePlugin,
  napoleonAtSaintHelenaPlugin as unknown as GamePlugin,
  fourSeasonsPlugin as unknown as GamePlugin,
  deucesSolitairePlugin as unknown as GamePlugin,
  agonPlugin as unknown as GamePlugin,
  turkishDraughtsPlugin as unknown as GamePlugin,
  armenianDraughtsPlugin as unknown as GamePlugin,
  foxAndGeesePlugin as unknown as GamePlugin,
  kharbagaPlugin as unknown as GamePlugin,
  gomokuProPlugin as unknown as GamePlugin,
  fiveFieldKonoPlugin as unknown as GamePlugin,
  baghChalPlugin as unknown as GamePlugin,
  dropDeadPlugin as unknown as GamePlugin,
  mexicoDicePlugin as unknown as GamePlugin,
  zilchPlugin as unknown as GamePlugin,
  twentySixPlugin as unknown as GamePlugin,
  qwixxPlugin as unknown as GamePlugin,
  rollThroughAgesPlugin as unknown as GamePlugin,
  macaoDicePlugin as unknown as GamePlugin,
  helanGarPlugin as unknown as GamePlugin,
  floodItPlugin as unknown as GamePlugin,
  colorLinesPlugin as unknown as GamePlugin,
  dominosaPlugin as unknown as GamePlugin,
  kyodaiPlugin as unknown as GamePlugin,
  pipeManiaPlugin as unknown as GamePlugin,
  hexMatch3Plugin as unknown as GamePlugin,
  rotateMatchPlugin as unknown as GamePlugin,
  triangleMatchPlugin as unknown as GamePlugin,
  tradingPostPlugin as unknown as GamePlugin,
  resourceChainPlugin as unknown as GamePlugin,
  dungeonDelvePlugin as unknown as GamePlugin,
  kingdomBuilderPlugin as unknown as GamePlugin,
  alchemyShopPlugin as unknown as GamePlugin,
  spyHeistPlugin as unknown as GamePlugin,
  towerDefenseMiniPlugin as unknown as GamePlugin,
  fishingVillagePlugin as unknown as GamePlugin,
  codeBreakerPlugin as unknown as GamePlugin,
  roundTheClockPlugin as unknown as GamePlugin,
  galaxyFormationPlugin as unknown as GamePlugin,
  tunnelDigPlugin as unknown as GamePlugin,
  qJumpPlugin as unknown as GamePlugin,
  barrelJumperPlugin as unknown as GamePlugin,
  skyJoustPlugin as unknown as GamePlugin,
  skyDefenderPlugin as unknown as GamePlugin,
  iceBlocksPlugin as unknown as GamePlugin,
  lunarDescentPlugin as unknown as GamePlugin,
  schafkopfPlugin as unknown as GamePlugin,
  ohHellPlugin as unknown as GamePlugin,
  bourrePlugin as unknown as GamePlugin,
  fortyFivesPlugin as unknown as GamePlugin,
  beziquePlugin as unknown as GamePlugin,
  piquetPlugin as unknown as GamePlugin,
  soloWhistPlugin as unknown as GamePlugin,
  bostonPlugin as unknown as GamePlugin,
  cannonShotPlugin as unknown as GamePlugin,
  archeryTargetPlugin as unknown as GamePlugin,
  dartThrowPlugin as unknown as GamePlugin,
  axeThrowPlugin as unknown as GamePlugin,
  pendulumDropPlugin as unknown as GamePlugin,
  marbleDropPlugin as unknown as GamePlugin,
  catapultCastlePlugin as unknown as GamePlugin,
  skeeBallPlugin as unknown as GamePlugin,
  additionSprintPlugin as unknown as GamePlugin,
  subtractionSprintPlugin as unknown as GamePlugin,
  algebraSolveXPlugin as unknown as GamePlugin,
  orderOfOpsPlugin as unknown as GamePlugin,
  primeFactorPlugin as unknown as GamePlugin,
  exponentDrillPlugin as unknown as GamePlugin,
  romanNumeralsPlugin as unknown as GamePlugin,
  numberBondsPlugin as unknown as GamePlugin,
  memoryPairsKidsPlugin as unknown as GamePlugin,
  countingBearsPlugin as unknown as GamePlugin,
  applePickingPlugin as unknown as GamePlugin,
  farmyardMatchPlugin as unknown as GamePlugin,
  treasureHuntPlugin as unknown as GamePlugin,
  rainbowSortPlugin as unknown as GamePlugin,
  alphabetCatchPlugin as unknown as GamePlugin,
  numberOrderPlugin as unknown as GamePlugin,
  gridRoguePlugin as unknown as GamePlugin,
  cardCrawlerPlugin as unknown as GamePlugin,
  diceDungeonPlugin as unknown as GamePlugin,
  slayTheDeckPlugin as unknown as GamePlugin,
  mineDelverPlugin as unknown as GamePlugin,
  cursedCryptPlugin as unknown as GamePlugin,
  dragonHuntPlugin as unknown as GamePlugin,
  wizardTowerPlugin as unknown as GamePlugin,
  neverHaveIEverPlugin as unknown as GamePlugin,
  truthOrDarePlugin as unknown as GamePlugin,
  mostLikelyToPlugin as unknown as GamePlugin,
  hotSeatPlugin as unknown as GamePlugin,
  storyBuilderPlugin as unknown as GamePlugin,
  fiveSecondRulePlugin as unknown as GamePlugin,
  headsUpPlugin as unknown as GamePlugin,
  hotTakePlugin as unknown as GamePlugin,
  daifugoPlugin as unknown as GamePlugin,
  tichuPlugin as unknown as GamePlugin,
  lastCardPlugin as unknown as GamePlugin,
  maoPlugin as unknown as GamePlugin,
  stopTheBusPlugin as unknown as GamePlugin,
  zhengPlugin as unknown as GamePlugin,
  newmarketPlugin as unknown as GamePlugin,
  michiganPlugin as unknown as GamePlugin,
  arrowSudokuPlugin as unknown as GamePlugin,
  mosaicPuzzlePlugin as unknown as GamePlugin,
  nurimisakiPlugin as unknown as GamePlugin,
  castleWallPlugin as unknown as GamePlugin,
  galaxiesPuzzlePlugin as unknown as GamePlugin,
  corralPuzzlePlugin as unknown as GamePlugin,
  countryRoadPlugin as unknown as GamePlugin,
  pearlPuzzlePlugin as unknown as GamePlugin,
  typingWordsPlugin as unknown as GamePlugin,
  typingQuotesPlugin as unknown as GamePlugin,
  verbalMemoryPlugin as unknown as GamePlugin,
  chimpTestPlugin as unknown as GamePlugin,
  stroopTestPlugin as unknown as GamePlugin,
  digitSpanPlugin as unknown as GamePlugin,
  aimTrainerPlugin as unknown as GamePlugin,
  visualMemoryGridPlugin as unknown as GamePlugin,
  homeRunDerbyPlugin as unknown as GamePlugin,
  soccerPenaltyPlugin as unknown as GamePlugin,
  hockeyShootoutPlugin as unknown as GamePlugin,
  pingPongRallyPlugin as unknown as GamePlugin,
  longJumpPlugin as unknown as GamePlugin,
  discusPlugin as unknown as GamePlugin,
  curlingPlugin as unknown as GamePlugin,
  darts501Plugin as unknown as GamePlugin,
  cookieClickerMiniPlugin as unknown as GamePlugin,
  idleMinerPlugin as unknown as GamePlugin,
  bpmTapPlugin as unknown as GamePlugin,
  hexColorGuessPlugin as unknown as GamePlugin,
  rgbMixerPlugin as unknown as GamePlugin,
  keyboardWarriorPlugin as unknown as GamePlugin,
  dicePredictionPlugin as unknown as GamePlugin,
  breathGaugePlugin as unknown as GamePlugin,
  osmosisPlugin as unknown as GamePlugin,
  shamrocksPlugin as unknown as GamePlugin,
  terracePlugin as unknown as GamePlugin,
  marthaPlugin as unknown as GamePlugin,
  littleSpiderPlugin as unknown as GamePlugin,
  quadrillePlugin as unknown as GamePlugin,
  rankAndFilePlugin as unknown as GamePlugin,
  royalCotillionPlugin as unknown as GamePlugin,
  senetPlugin as unknown as GamePlugin,
  royalGameOfUrPlugin as unknown as GamePlugin,
  morabarabaPlugin as unknown as GamePlugin,
  picariaPlugin as unknown as GamePlugin,
  seegaPlugin as unknown as GamePlugin,
  frisianDraughtsPlugin as unknown as GamePlugin,
  russianDraughtsPlugin as unknown as GamePlugin,
  poolCheckersPlugin as unknown as GamePlugin,
  eggCatcherPlugin as unknown as GamePlugin,
  fishFeederPlugin as unknown as GamePlugin,
  ninjaHopPlugin as unknown as GamePlugin,
  samuraiSlicePlugin as unknown as GamePlugin,
  caveFlyerPlugin as unknown as GamePlugin,
  dodgeCarsPlugin as unknown as GamePlugin,
  parachuteDropPlugin as unknown as GamePlugin,
  swarmShootPlugin as unknown as GamePlugin,
  moviesTriviaPlugin as unknown as GamePlugin,
  musicTriviaPlugin as unknown as GamePlugin,
  sportsTriviaPlugin as unknown as GamePlugin,
  scienceTriviaPlugin as unknown as GamePlugin,
  historyTriviaPlugin as unknown as GamePlugin,
  mythologyQuizPlugin as unknown as GamePlugin,
  spaceQuizPlugin as unknown as GamePlugin,
  foodQuizPlugin as unknown as GamePlugin,
  animalQuizPlugin as unknown as GamePlugin,
  phrazlePlugin as unknown as GamePlugin,
  connectionsPlugin as unknown as GamePlugin,
  compoundWordPlugin as unknown as GamePlugin,
  wordPyramidPlugin as unknown as GamePlugin,
  panagramPlugin as unknown as GamePlugin,
  lastLetterPlugin as unknown as GamePlugin,
  phrasePuzzlePlugin as unknown as GamePlugin,
  wordHuntPlugin as unknown as GamePlugin,
  restaurantTycoonPlugin as unknown as GamePlugin,
  coffeeShopPlugin as unknown as GamePlugin,
  hotelTycoonPlugin as unknown as GamePlugin,
  airlineSimPlugin as unknown as GamePlugin,
  bakeryShopPlugin as unknown as GamePlugin,
  oilTycoonPlugin as unknown as GamePlugin,
  factoryLinePlugin as unknown as GamePlugin,
  gameDevStudioPlugin as unknown as GamePlugin,
  idleFarmerPlugin as unknown as GamePlugin,
  idleWizardPlugin as unknown as GamePlugin,
  idleBlacksmithPlugin as unknown as GamePlugin,
  idleWarriorPlugin as unknown as GamePlugin,
  idleBakerPlugin as unknown as GamePlugin,
  gemClickerPlugin as unknown as GamePlugin,
  goldRushIdlePlugin as unknown as GamePlugin,
  prestigeClickerPlugin as unknown as GamePlugin,
  klondikeDicePlugin as unknown as GamePlugin,
  goingToBostonPlugin as unknown as GamePlugin,
  cosmicWimpoutPlugin as unknown as GamePlugin,
  cragPlugin as unknown as GamePlugin,
  crownAndAnchorPlugin as unknown as GamePlugin,
  fourFiveSixPlugin as unknown as GamePlugin,
  streetCrapsPlugin as unknown as GamePlugin,
  pirateDicePlugin as unknown as GamePlugin,
  napoleonCardPlugin as unknown as GamePlugin,
  ecartePlugin as unknown as GamePlugin,
  tarockPlugin as unknown as GamePlugin,
  pidroPlugin as unknown as GamePlugin,
  hokmPlugin as unknown as GamePlugin,
  ultiPlugin as unknown as GamePlugin,
  klopPlugin as unknown as GamePlugin,
  sjavsPlugin as unknown as GamePlugin,
  cubeRollPlugin as unknown as GamePlugin,
  tiltMazePlugin as unknown as GamePlugin,
  tubeColorPlugin as unknown as GamePlugin,
  wireConnectPlugin as unknown as GamePlugin,
  mirrorMazePlugin as unknown as GamePlugin,
  gearPuzzlePlugin as unknown as GamePlugin,
  pentominoPuzzlePlugin as unknown as GamePlugin,
  parkingPuzzlePlugin as unknown as GamePlugin,
  classicMazePlugin as unknown as GamePlugin,
  fogMazePlugin as unknown as GamePlugin,
  keyMazePlugin as unknown as GamePlugin,
  iceSlideMazePlugin as unknown as GamePlugin,
  teleportMazePlugin as unknown as GamePlugin,
  ghostMazePlugin as unknown as GamePlugin,
  gravityMazePlugin as unknown as GamePlugin,
  coloredTileMazePlugin as unknown as GamePlugin,
  wishPlugin as unknown as GamePlugin,
  royalMarriagePlugin as unknown as GamePlugin,
  jubileePlugin as unknown as GamePlugin,
  intelligencePlugin as unknown as GamePlugin,
  eagleWingPlugin as unknown as GamePlugin,
  demonPlugin as unknown as GamePlugin,
  coloradoPlugin as unknown as GamePlugin,
  algerianPatiencePlugin as unknown as GamePlugin,
  interregnumPlugin as unknown as GamePlugin,
  boxerKnockoutPlugin as unknown as GamePlugin,
  tankBattlePlugin as unknown as GamePlugin,
  pixelRunnerPlugin as unknown as GamePlugin,
  castleDefenderPlugin as unknown as GamePlugin,
  submarineHuntPlugin as unknown as GamePlugin,
  pinballMiniPlugin as unknown as GamePlugin,
  ufoRescuePlugin as unknown as GamePlugin,
  motorcycleJumpPlugin as unknown as GamePlugin,
  einsteinPuzzlePlugin as unknown as GamePlugin,
  weighingPuzzlePlugin as unknown as GamePlugin,
  prisonerHatPlugin as unknown as GamePlugin,
  montyHallPlugin as unknown as GamePlugin,
  seatingPuzzlePlugin as unknown as GamePlugin,
  safeCrackerPlugin as unknown as GamePlugin,
  riddleMachinePlugin as unknown as GamePlugin,
  digitDeducePlugin as unknown as GamePlugin,
  spoonsPlugin as unknown as GamePlugin,
  palacePlugin as unknown as GamePlugin,
  parliamentPlugin as unknown as GamePlugin,
  karmaCardPlugin as unknown as GamePlugin,
  garbageCardPlugin as unknown as GamePlugin,
  pigCardPlugin as unknown as GamePlugin,
  playOrPayPlugin as unknown as GamePlugin,
  snipSnapSnoremPlugin as unknown as GamePlugin,
  christmasCookiePlugin as unknown as GamePlugin,
  easterEggHuntPlugin as unknown as GamePlugin,
  halloweenPumpkinPlugin as unknown as GamePlugin,
  valentineMatchPlugin as unknown as GamePlugin,
  wizardSpellCastPlugin as unknown as GamePlugin,
  dragonEggHatchPlugin as unknown as GamePlugin,
  robotArenaPlugin as unknown as GamePlugin,
  marsColonyPlugin as unknown as GamePlugin,
  antFarmPlugin as unknown as GamePlugin,
  auctionGamePlugin as unknown as GamePlugin,
  pizzaRushPlugin as unknown as GamePlugin,
  stockDayTraderPlugin as unknown as GamePlugin,
  taxiDriverPlugin as unknown as GamePlugin,
  foragerGamePlugin as unknown as GamePlugin,
  spaceTraderPlugin as unknown as GamePlugin,
  bountyHunterPlugin as unknown as GamePlugin,
  boggleProPlugin as unknown as GamePlugin,
  slotMachineProPlugin as unknown as GamePlugin,
  diceStackPlugin as unknown as GamePlugin,
  towerBuilderPlugin as unknown as GamePlugin,
  bottleFlipPlugin as unknown as GamePlugin,
  paperAirplanePlugin as unknown as GamePlugin,
  frisbeeTossPlugin as unknown as GamePlugin,
  boomerangThrowPlugin as unknown as GamePlugin,
  targetShooterPlugin as unknown as GamePlugin,
  marbleRollPlugin as unknown as GamePlugin,
  cupFlipPlugin as unknown as GamePlugin,
  slingshotLaunchPlugin as unknown as GamePlugin,
  australianPatiencePlugin as unknown as GamePlugin,
  betsyRossPlugin as unknown as GamePlugin,
  florentinePlugin as unknown as GamePlugin,
  fourLeafCloverPlugin as unknown as GamePlugin,
  kingsRowPlugin as unknown as GamePlugin,
  precedencePlugin as unknown as GamePlugin,
  tripletsPlugin as unknown as GamePlugin,
  paganiniPlugin as unknown as GamePlugin,
  danceArrowsPlugin as unknown as GamePlugin,
  melodyRepeaterPlugin as unknown as GamePlugin,
  morseTapPlugin as unknown as GamePlugin,
  sequenceFlashPlugin as unknown as GamePlugin,
  drumPadPlugin as unknown as GamePlugin,
  mosaicCopyPlugin as unknown as GamePlugin,
  repeatAfterMePlugin as unknown as GamePlugin,
  rhythmLadderPlugin as unknown as GamePlugin,
  cosmicDicePlugin as unknown as GamePlugin,
  vikingDicePlugin as unknown as GamePlugin,
  medievalDicePlugin as unknown as GamePlugin,
  cowboyDicePlugin as unknown as GamePlugin,
  samuraiDicePlugin as unknown as GamePlugin,
  diceBaseballPlugin as unknown as GamePlugin,
  diceGolfPlugin as unknown as GamePlugin,
  straightOrBustPlugin as unknown as GamePlugin,
  mateIn1Plugin as unknown as GamePlugin,
  mateIn2Plugin as unknown as GamePlugin,
  mateIn3Plugin as unknown as GamePlugin,
  chessTacticsPlugin as unknown as GamePlugin,
  chessEndgameKrPlugin as unknown as GamePlugin,
  chessEndgameKqkPlugin as unknown as GamePlugin,
  pawnPromotionPuzzlePlugin as unknown as GamePlugin,
  chessBackRankPlugin as unknown as GamePlugin,
  textAdventureMiniPlugin as unknown as GamePlugin,
  cyoaFantasyPlugin as unknown as GamePlugin,
  cyoaHorrorPlugin as unknown as GamePlugin,
  questTavernPlugin as unknown as GamePlugin,
  monsterSlayerPlugin as unknown as GamePlugin,
  lootGoblinPlugin as unknown as GamePlugin,
  arenaChampionPlugin as unknown as GamePlugin,
  tombOfKingsPlugin as unknown as GamePlugin,
  acronymQuizPlugin as unknown as GamePlugin,
  idiomQuizPlugin as unknown as GamePlugin,
  homophoneMatchPlugin as unknown as GamePlugin,
  silentLettersPlugin as unknown as GamePlugin,
  prefixSuffixPlugin as unknown as GamePlugin,
  grammarFixPlugin as unknown as GamePlugin,
  anagramPairPlugin as unknown as GamePlugin,
  rhymeFinderPlugin as unknown as GamePlugin,
  kalahPlugin as unknown as GamePlugin,
  brandubPlugin as unknown as GamePlugin,
  tawlbwrddPlugin as unknown as GamePlugin,
  connect6Plugin as unknown as GamePlugin,
  havannahPlugin as unknown as GamePlugin,
  hareAndHoundsPlugin as unknown as GamePlugin,
  wolfAndSheepPlugin as unknown as GamePlugin,
  cathedralGamePlugin as unknown as GamePlugin,
  safeDriverPlugin as unknown as GamePlugin,
  submarineSonarPlugin as unknown as GamePlugin,
  nimMultiPlugin as unknown as GamePlugin,
  tripleDicePlugin as unknown as GamePlugin,
  rollAndWriteProPlugin as unknown as GamePlugin,
  solitaireMarathonPlugin as unknown as GamePlugin,
  towerOfHanoi7Plugin as unknown as GamePlugin,
  swarmDefensePlugin as unknown as GamePlugin,
  spaceArenaPlugin as unknown as GamePlugin,
  gladiatorArenaPlugin as unknown as GamePlugin,
  slimeDefensePlugin as unknown as GamePlugin,
  zombieSurvivalPlugin as unknown as GamePlugin,
  wizardCardDuelPlugin as unknown as GamePlugin,
  alienCardBattlePlugin as unknown as GamePlugin,
  dotGridPuzzlePlugin as unknown as GamePlugin,
  foodTruckTycoonPlugin as unknown as GamePlugin,
  forestTrekPlugin as unknown as GamePlugin,
  mountainClimbPlugin as unknown as GamePlugin,
  frozenRiverPlugin as unknown as GamePlugin,
  cardBlastPlugin as unknown as GamePlugin,
  volcanoEscapePlugin as unknown as GamePlugin,
  coralReefPlugin as unknown as GamePlugin,
  circusJugglePlugin as unknown as GamePlugin,
  magicianTrickPlugin as unknown as GamePlugin,
  clownTossPlugin as unknown as GamePlugin,
  acrobatFlipPlugin as unknown as GamePlugin,
  desertTrekPlugin as unknown as GamePlugin,
  archwayPlugin as unknown as GamePlugin,
  babettePlugin as unknown as GamePlugin,
  frogSolitairePlugin as unknown as GamePlugin,
  lastMonarchPlugin as unknown as GamePlugin,
  peekPlugin as unknown as GamePlugin,
  salicLawPlugin as unknown as GamePlugin,
  sevenUpPlugin as unknown as GamePlugin,
  tournamentPlugin as unknown as GamePlugin,
  connectPipesProPlugin as unknown as GamePlugin,
  tileFlipPlugin as unknown as GamePlugin,
  colorFlowPlugin as unknown as GamePlugin,
  crosswordProPlugin as unknown as GamePlugin,
  ultimateTicTacToePlugin as unknown as GamePlugin,
  diceFootballPlugin as unknown as GamePlugin,
  diceBasketballPlugin as unknown as GamePlugin,
  kartTournamentPlugin as unknown as GamePlugin,
  racingStuntsPlugin as unknown as GamePlugin,
  bikeRacePlugin as unknown as GamePlugin,
  timeTrialPlugin as unknown as GamePlugin,
  pirateShipCannonPlugin as unknown as GamePlugin,
  ufoShooterPlugin as unknown as GamePlugin,
  diceSoccerPlugin as unknown as GamePlugin,
  diceTennisPlugin as unknown as GamePlugin,
  diceHockeyPlugin as unknown as GamePlugin,
  arcticSurvivalPlugin as unknown as GamePlugin,
  jungleExplorerPlugin as unknown as GamePlugin,
  rocketLaunchArcadePlugin as unknown as GamePlugin,
  dotToDotPlugin as unknown as GamePlugin,
  letterPaintPlugin as unknown as GamePlugin,
  infiniteTicTacToePlugin as unknown as GamePlugin,
  cardBingoProPlugin as unknown as GamePlugin,
  walkingTheDogPlugin as unknown as GamePlugin,
  kitchenChaosPlugin as unknown as GamePlugin,
  baristaRushPlugin as unknown as GamePlugin,
  superTicTacToePlugin as unknown as GamePlugin,
  feedTheCatPlugin as unknown as GamePlugin,
  petShopMiniPlugin as unknown as GamePlugin,
  aquariumKeeperPlugin as unknown as GamePlugin,
  iceCreamStandPlugin as unknown as GamePlugin,
  fireworkShowPlugin as unknown as GamePlugin,
  swimmingLapsPlugin as unknown as GamePlugin,
  kiteFightPlugin as unknown as GamePlugin,
  tacoTruckPlugin as unknown as GamePlugin,
  pastaShopPlugin as unknown as GamePlugin,
  donutShopPlugin as unknown as GamePlugin,
  bridgeBuilderPuzzlePlugin as unknown as GamePlugin,
  paintingPuzzlePlugin as unknown as GamePlugin,
  triathlonMiniPlugin as unknown as GamePlugin,
  marathonPacerPlugin as unknown as GamePlugin,
  poleClimbingPlugin as unknown as GamePlugin,
  trampolineBouncePlugin as unknown as GamePlugin,
  seesawBalancePlugin as unknown as GamePlugin,
  boomerangTossPlugin as unknown as GamePlugin,
  bottleSpinPlugin as unknown as GamePlugin,
  diceRunnerPlugin as unknown as GamePlugin,
  rollAndAddPlugin as unknown as GamePlugin,
  cardSharkPlugin as unknown as GamePlugin,
  matchThreeSagaPlugin as unknown as GamePlugin,
  wallBouncePlugin as unknown as GamePlugin,
  diceArcheryPlugin as unknown as GamePlugin,
  diceDartsPlugin as unknown as GamePlugin,
  dicePoolMatchPlugin as unknown as GamePlugin,
  rollingThunderDicePlugin as unknown as GamePlugin,
  bingoCallPlugin as unknown as GamePlugin,
  cardFlipPuzzlePlugin as unknown as GamePlugin,
  solitaireClockTournamentPlugin as unknown as GamePlugin,
  ticTacToeToroidalPlugin as unknown as GamePlugin,
  numericTicTacToePlugin as unknown as GamePlugin,
  chessPuzzleForkPlugin as unknown as GamePlugin,
  gomokuTacticPlugin as unknown as GamePlugin,
  weatherQuizPlugin as unknown as GamePlugin,
  musicDecadeQuizPlugin as unknown as GamePlugin,
  tvShowQuizPlugin as unknown as GamePlugin,
  videoGameQuizPlugin as unknown as GamePlugin,
  countryFlagQuizPlugin as unknown as GamePlugin,
  capitalsQuizPlugin as unknown as GamePlugin,
  instrumentsQuizPlugin as unknown as GamePlugin,
  planetsQuizPlugin as unknown as GamePlugin,
  highestCardBetPlugin as unknown as GamePlugin,
  lowestCardBetPlugin as unknown as GamePlugin,
  cardColorGuessPlugin as unknown as GamePlugin,
  cardSuitGuessPlugin as unknown as GamePlugin,
  evensOrOddsDicePlugin as unknown as GamePlugin,
  total7OrNotPlugin as unknown as GamePlugin,
  diceFlushPlugin as unknown as GamePlugin,
  threeOfAKindRollPlugin as unknown as GamePlugin,
  ticTacToeLargePlugin as unknown as GamePlugin,
  ticTacToeCornersWinPlugin as unknown as GamePlugin,
  ticTacToe3InRowPlugin as unknown as GamePlugin,
  gomokuMiniPlugin as unknown as GamePlugin,
  targetGrabPlugin as unknown as GamePlugin,
  flySwatterPlugin as unknown as GamePlugin,
  balloonDartsPlugin as unknown as GamePlugin,
  dunkTankPlugin as unknown as GamePlugin,
  ringTossProPlugin as unknown as GamePlugin,
  basketTossPlugin as unknown as GamePlugin,
  paperArrowPlugin as unknown as GamePlugin,
  waterPistolPlugin as unknown as GamePlugin,
  colorRecallPlugin as unknown as GamePlugin,
  shapeRecallPlugin as unknown as GamePlugin,
  numberRecallPlugin as unknown as GamePlugin,
  positionRecallPlugin as unknown as GamePlugin,
  birdsQuizPlugin as unknown as GamePlugin,
  plantsQuizPlugin as unknown as GamePlugin,
  gemstonesQuizPlugin as unknown as GamePlugin,
  occupationsQuizPlugin as unknown as GamePlugin,
  cardUpDownPlugin as unknown as GamePlugin,
  redOrBlackPlugin as unknown as GamePlugin,
  aceFinderPlugin as unknown as GamePlugin,
  doubleOrNothingDicePlugin as unknown as GamePlugin,
  climbTheLadderDicePlugin as unknown as GamePlugin,
  sumTargetDicePlugin as unknown as GamePlugin,
  swordSlicePlugin as unknown as GamePlugin,
  magicWandCastPlugin as unknown as GamePlugin,
  frogLeapPlugin as unknown as GamePlugin,
  monkeyBananaPlugin as unknown as GamePlugin,
  cribbageSquarePlugin as unknown as GamePlugin,
  decadeSolitairePlugin as unknown as GamePlugin,
  insectsQuizPlugin as unknown as GamePlugin,
  fishQuizPlugin as unknown as GamePlugin,
  mammalsQuizPlugin as unknown as GamePlugin,
  reptilesQuizPlugin as unknown as GamePlugin,
  oceansQuizPlugin as unknown as GamePlugin,
  desertsQuizPlugin as unknown as GamePlugin,
  mountainsQuizPlugin as unknown as GamePlugin,
  riversQuizPlugin as unknown as GamePlugin,
  citiesQuizPlugin as unknown as GamePlugin,
  monumentsQuizPlugin as unknown as GamePlugin,
  cardBidFlipPlugin as unknown as GamePlugin,
  cardPyramidGrabPlugin as unknown as GamePlugin,
  cardSnap3Plugin as unknown as GamePlugin,
  cardStackBetPlugin as unknown as GamePlugin,
  cardSpinPickPlugin as unknown as GamePlugin,
  diceCoinBetPlugin as unknown as GamePlugin,
  diceTarget25Plugin as unknown as GamePlugin,
  dicePyramidRollPlugin as unknown as GamePlugin,
  diceStreak9Plugin as unknown as GamePlugin,
  diceBingoMiniPlugin as unknown as GamePlugin,
  arrowHitPlugin as unknown as GamePlugin,
  balloonBurstPlugin as unknown as GamePlugin,
  fishingCastPlugin as unknown as GamePlugin,
  ladderClimbPlugin as unknown as GamePlugin,
  lavaLeapPlugin as unknown as GamePlugin,
  molePopPlugin as unknown as GamePlugin,
  pickleJarPlugin as unknown as GamePlugin,
  ringerCoinPlugin as unknown as GamePlugin,
  snowballThrowPlugin as unknown as GamePlugin,
  sockTossPlugin as unknown as GamePlugin,
  treesQuizPlugin as unknown as GamePlugin,
  herbsQuizPlugin as unknown as GamePlugin,
  fruitsQuizPlugin as unknown as GamePlugin,
  vegetablesQuizPlugin as unknown as GamePlugin,
  danceQuizPlugin as unknown as GamePlugin,
  paintersQuizPlugin as unknown as GamePlugin,
  composersQuizPlugin as unknown as GamePlugin,
  philosophersQuizPlugin as unknown as GamePlugin,
  warsQuizPlugin as unknown as GamePlugin,
  treatiesQuizPlugin as unknown as GamePlugin,
  cardRankGuessPlugin as unknown as GamePlugin,
  cardPairPickPlugin as unknown as GamePlugin,
  cardPileBetPlugin as unknown as GamePlugin,
  cardShuffleBetPlugin as unknown as GamePlugin,
  cardLowHigh3Plugin as unknown as GamePlugin,
  diceTwinBetPlugin as unknown as GamePlugin,
  dice100TargetPlugin as unknown as GamePlugin,
  diceDoubleTroublePlugin as unknown as GamePlugin,
  dicePipAddPlugin as unknown as GamePlugin,
  diceMirrorRollPlugin as unknown as GamePlugin,
  appleTossPlugin as unknown as GamePlugin,
  bananaPeelPlugin as unknown as GamePlugin,
  birdShootPlugin as unknown as GamePlugin,
  candyGrabPlugin as unknown as GamePlugin,
  coinPopPlugin as unknown as GamePlugin,
  donutGrabPlugin as unknown as GamePlugin,
  eggDropPlugin as unknown as GamePlugin,
  gemGrabPlugin as unknown as GamePlugin,
  hatTossPlugin as unknown as GamePlugin,
  hulaHoopPlugin as unknown as GamePlugin,
  spicesQuizPlugin as unknown as GamePlugin,
  drinksQuizPlugin as unknown as GamePlugin,
  snacksQuizPlugin as unknown as GamePlugin,
  festivalsQuizPlugin as unknown as GamePlugin,
  religionsQuizPlugin as unknown as GamePlugin,
  sportsRulesQuizPlugin as unknown as GamePlugin,
  olympicEventsQuizPlugin as unknown as GamePlugin,
  transportationQuizPlugin as unknown as GamePlugin,
  architectureQuizPlugin as unknown as GamePlugin,
  dictatorsQuizPlugin as unknown as GamePlugin,
  cardFlipThreePlugin as unknown as GamePlugin,
  cardPickBetPlugin as unknown as GamePlugin,
  cardColorStreakPlugin as unknown as GamePlugin,
  cardPileStackPlugin as unknown as GamePlugin,
  cardHotColdPlugin as unknown as GamePlugin,
  dicePyramidStackPlugin as unknown as GamePlugin,
  diceBullseyeRollPlugin as unknown as GamePlugin,
  diceSequence3Plugin as unknown as GamePlugin,
  diceFlushRollPlugin as unknown as GamePlugin,
  diceUpDownGamePlugin as unknown as GamePlugin,
  iceSkaterPlugin as unknown as GamePlugin,
  kiteRunnerPlugin as unknown as GamePlugin,
  knightChargePlugin as unknown as GamePlugin,
  leafRakePlugin as unknown as GamePlugin,
  lemonSqueezePlugin as unknown as GamePlugin,
  melonSmashPlugin as unknown as GamePlugin,
  nailHammerPlugin as unknown as GamePlugin,
  oilPumpPlugin as unknown as GamePlugin,
  pencilSharpenPlugin as unknown as GamePlugin,
  pizzaCutPlugin as unknown as GamePlugin,
  beersQuizPlugin as unknown as GamePlugin,
  cardBidStreakPlugin as unknown as GamePlugin,
  cardFlipStreakPlugin as unknown as GamePlugin,
  cardHigh3Plugin as unknown as GamePlugin,
  cardLow3Plugin as unknown as GamePlugin,
  cardPickStreakPlugin as unknown as GamePlugin,
  cidersQuizPlugin as unknown as GamePlugin,
  cocktailsQuizPlugin as unknown as GamePlugin,
  danceStylesQuizPlugin as unknown as GamePlugin,
  drinksTypesQuizPlugin as unknown as GamePlugin,
  fashionErasQuizPlugin as unknown as GamePlugin,
  hairstylesQuizPlugin as unknown as GamePlugin,
  philosopherViewsQuizPlugin as unknown as GamePlugin,
  religionsSymbolsQuizPlugin as unknown as GamePlugin,
  winesQuizPlugin as unknown as GamePlugin,
  literatureGenresQuizPlugin as unknown as GamePlugin,
  artMovementsQuizPlugin as unknown as GamePlugin,
  militaryLeadersQuizPlugin as unknown as GamePlugin,
  scientistsQuizPlugin as unknown as GamePlugin,
  mathematiciansQuizPlugin as unknown as GamePlugin,
  explorersQuizPlugin as unknown as GamePlugin,
  queensQuizPlugin as unknown as GamePlugin,
  kingsQuizPlugin as unknown as GamePlugin,
  popesQuizPlugin as unknown as GamePlugin,
  primeMinistersQuizPlugin as unknown as GamePlugin,
  cardThreeFlipPlugin as unknown as GamePlugin,
  cardDiscardBetPlugin as unknown as GamePlugin,
  cardPickThreePlugin as unknown as GamePlugin,
  cardFoldThreePlugin as unknown as GamePlugin,
  cardDrawUpPlugin as unknown as GamePlugin,
  dicePairRollPlugin as unknown as GamePlugin,
  diceAddBetPlugin as unknown as GamePlugin,
  diceColorBetPlugin as unknown as GamePlugin,
  diceSkipBetPlugin as unknown as GamePlugin,
  diceStepBetPlugin as unknown as GamePlugin,
  springJumpPlugin as unknown as GamePlugin,
  stickyBunPlugin as unknown as GamePlugin,
  sushiRollTossPlugin as unknown as GamePlugin,
  swingBatPlugin as unknown as GamePlugin,
  tacoTossPlugin as unknown as GamePlugin,
  tennisVolleyPlugin as unknown as GamePlugin,
  tileFlipArcadePlugin as unknown as GamePlugin,
  tinCanTossPlugin as unknown as GamePlugin,
  topSpinPlugin as unknown as GamePlugin,
  vaseBalancePlugin as unknown as GamePlugin,
  asianCuisineQuizPlugin as unknown as GamePlugin,
  europeanCuisineQuizPlugin as unknown as GamePlugin,
  africanCuisineQuizPlugin as unknown as GamePlugin,
  americanCuisineQuizPlugin as unknown as GamePlugin,
  italianCuisineQuizPlugin as unknown as GamePlugin,
  frenchCuisineQuizPlugin as unknown as GamePlugin,
  mexicanCuisineQuizPlugin as unknown as GamePlugin,
  indianCuisineQuizPlugin as unknown as GamePlugin,
  chineseCuisineQuizPlugin as unknown as GamePlugin,
  japaneseCuisineQuizPlugin as unknown as GamePlugin,
  thaiCuisineQuizPlugin as unknown as GamePlugin,
  greekCuisineQuizPlugin as unknown as GamePlugin,
  spanishCuisineQuizPlugin as unknown as GamePlugin,
  koreanCuisineQuizPlugin as unknown as GamePlugin,
  brazilianCuisineQuizPlugin as unknown as GamePlugin,
  cardPopBetPlugin as unknown as GamePlugin,
  cardStackFlipPlugin as unknown as GamePlugin,
  cardSnapPairPlugin as unknown as GamePlugin,
  cardPileTossPlugin as unknown as GamePlugin,
  cardThrowBetPlugin as unknown as GamePlugin,
  cardLowPickPlugin as unknown as GamePlugin,
  cardHighPickPlugin as unknown as GamePlugin,
  cardMidPickPlugin as unknown as GamePlugin,
  diceToss3Plugin as unknown as GamePlugin,
  diceLowRollPlugin as unknown as GamePlugin,
  diceHighRollPlugin as unknown as GamePlugin,
  diceSpinRollPlugin as unknown as GamePlugin,
  diceClutchRollPlugin as unknown as GamePlugin,
  diceSpikeRollPlugin as unknown as GamePlugin,
  diceLadderRollPlugin as unknown as GamePlugin,
  applePieStackPlugin as unknown as GamePlugin,
  bananaSplitPlugin as unknown as GamePlugin,
  blueberryPopPlugin as unknown as GamePlugin,
  candyCaneGrabPlugin as unknown as GamePlugin,
  cherryTossPlugin as unknown as GamePlugin,
  donutStackArcPlugin as unknown as GamePlugin,
  eclairGrabPlugin as unknown as GamePlugin,
  fruitBasketTossPlugin as unknown as GamePlugin,
  gummyGrabPlugin as unknown as GamePlugin,
  jellyJarTossPlugin as unknown as GamePlugin,
  ancientRomeQuizPlugin as unknown as GamePlugin,
  ancientEgyptQuizPlugin as unknown as GamePlugin,
  ancientGreeceQuizPlugin as unknown as GamePlugin,
  vikingsQuizPlugin as unknown as GamePlugin,
  samuraiQuizPlugin as unknown as GamePlugin,
  knightsQuizPlugin as unknown as GamePlugin,
  pharaohsQuizPlugin as unknown as GamePlugin,
  emperorsQuizPlugin as unknown as GamePlugin,
  civilWarQuizPlugin as unknown as GamePlugin,
  ww1QuizPlugin as unknown as GamePlugin,
  ww2QuizPlugin as unknown as GamePlugin,
  coldWarQuizPlugin as unknown as GamePlugin,
  renaissanceQuizPlugin as unknown as GamePlugin,
  enlightenmentQuizPlugin as unknown as GamePlugin,
  industrialRevolutionQuizPlugin as unknown as GamePlugin,
  cardBid2Plugin as unknown as GamePlugin,
  cardBid4Plugin as unknown as GamePlugin,
  cardStreakFlipPlugin as unknown as GamePlugin,
  cardDeckBetPlugin as unknown as GamePlugin,
  cardPullBetPlugin as unknown as GamePlugin,
  cardPileBet2Plugin as unknown as GamePlugin,
  cardStackBet2Plugin as unknown as GamePlugin,
  cardSnapBetPlugin as unknown as GamePlugin,
  diceFlushBetPlugin as unknown as GamePlugin,
  diceTripBetPlugin as unknown as GamePlugin,
  diceQuadBetPlugin as unknown as GamePlugin,
  diceStreakBetPlugin as unknown as GamePlugin,
  diceQuickRollPlugin as unknown as GamePlugin,
  diceSlowRollPlugin as unknown as GamePlugin,
  dicePopRollPlugin as unknown as GamePlugin,
  kebabStackPlugin as unknown as GamePlugin,
  lasagnaLayerPlugin as unknown as GamePlugin,
  lemonPopPlugin as unknown as GamePlugin,
  lobsterGrabPlugin as unknown as GamePlugin,
  mangoTossPlugin as unknown as GamePlugin,
  marshmallowGrabPlugin as unknown as GamePlugin,
  milkshakeMixPlugin as unknown as GamePlugin,
  muffinPopPlugin as unknown as GamePlugin,
  noodleGrabPlugin as unknown as GamePlugin,
  oliveGrabPlugin as unknown as GamePlugin,
  classicalMusicQuizPlugin as unknown as GamePlugin,
  modernArtQuizPlugin as unknown as GamePlugin,
  jazzQuizPlugin as unknown as GamePlugin,
  rockMusicQuizPlugin as unknown as GamePlugin,
  popMusicQuizPlugin as unknown as GamePlugin,
  hipHopQuizPlugin as unknown as GamePlugin,
  countryMusicQuizPlugin as unknown as GamePlugin,
  electronicMusicQuizPlugin as unknown as GamePlugin,
  folkMusicQuizPlugin as unknown as GamePlugin,
  bluesQuizPlugin as unknown as GamePlugin,
  reggaeQuizPlugin as unknown as GamePlugin,
  gospelMusicQuizPlugin as unknown as GamePlugin,
  operaQuizPlugin as unknown as GamePlugin,
  broadwayQuizPlugin as unknown as GamePlugin,
  balletQuizPlugin as unknown as GamePlugin,
  streetArtQuizPlugin as unknown as GamePlugin,
  sculptureQuizPlugin as unknown as GamePlugin,
  quartetMatchPlugin as unknown as GamePlugin,
  evenEvensPlugin as unknown as GamePlugin,
  oddOddsPlugin as unknown as GamePlugin,
  faceFeastPlugin as unknown as GamePlugin,
  pipPursePlugin as unknown as GamePlugin,
  redRoulettePlugin as unknown as GamePlugin,
  blackBidderPlugin as unknown as GamePlugin,
  suitStackPlugin as unknown as GamePlugin,
  pairPursuitPlugin as unknown as GamePlugin,
  overUnderPlugin as unknown as GamePlugin,
  straightShotPlugin as unknown as GamePlugin,
  doubleDownPlugin as unknown as GamePlugin,
  tripleTossPlugin as unknown as GamePlugin,
  centipedeRollPlugin as unknown as GamePlugin,
  parityPopPlugin as unknown as GamePlugin,
  peachPopPlugin as unknown as GamePlugin,
  pretzelPluckPlugin as unknown as GamePlugin,
  radishRushPlugin as unknown as GamePlugin,
  salamiSlicePlugin as unknown as GamePlugin,
  tangerineTossPlugin as unknown as GamePlugin,
  greekMythQuizPlugin as unknown as GamePlugin,
  norseMythQuizPlugin as unknown as GamePlugin,
  egyptianMythQuizPlugin as unknown as GamePlugin,
  celticMythQuizPlugin as unknown as GamePlugin,
  hinduMythQuizPlugin as unknown as GamePlugin,
  buddhismQuizPlugin as unknown as GamePlugin,
  worldReligionsQuizPlugin as unknown as GamePlugin,
  easternPhilosophyQuizPlugin as unknown as GamePlugin,
  westernPhilosophyQuizPlugin as unknown as GamePlugin,
  ethicsQuizPlugin as unknown as GamePlugin,
  nbaLegendsQuizPlugin as unknown as GamePlugin,
  nflLegendsQuizPlugin as unknown as GamePlugin,
  mlbLegendsQuizPlugin as unknown as GamePlugin,
  soccerStarsQuizPlugin as unknown as GamePlugin,
  tennisGreatsQuizPlugin as unknown as GamePlugin,
  boxingLegendsQuizPlugin as unknown as GamePlugin,
  olympicQuizPlugin as unknown as GamePlugin,
  golfGreatsQuizPlugin as unknown as GamePlugin,
  triadTowerPlugin as unknown as GamePlugin,
  royalRumblePlugin as unknown as GamePlugin,
  aceAlleyPlugin as unknown as GamePlugin,
  sevenStreakPlugin as unknown as GamePlugin,
  pipPyramidPlugin as unknown as GamePlugin,
  redRiverPlugin as unknown as GamePlugin,
  blackBridgePlugin as unknown as GamePlugin,
  luckySixPlugin as unknown as GamePlugin,
  crapsLightPlugin as unknown as GamePlugin,
  yahtzeeMiniPlugin as unknown as GamePlugin,
  diceDuelPlugin as unknown as GamePlugin,
  snakeEyesHuntPlugin as unknown as GamePlugin,
  juiceJamboreePlugin as unknown as GamePlugin,
  cocoaCascadePlugin as unknown as GamePlugin,
  frappeFlipPlugin as unknown as GamePlugin,
  latteLeapPlugin as unknown as GamePlugin,
  mochaMarchPlugin as unknown as GamePlugin,
  astronomyQuizPlugin as unknown as GamePlugin,
  chemistryLabQuizPlugin as unknown as GamePlugin,
  physicsQuizPlugin as unknown as GamePlugin,
  biologyQuizPlugin as unknown as GamePlugin,
  anatomyQuizPlugin as unknown as GamePlugin,
  botanyQuizPlugin as unknown as GamePlugin,
  zoologyQuizPlugin as unknown as GamePlugin,
  marineBioQuizPlugin as unknown as GamePlugin,
  geologyQuizPlugin as unknown as GamePlugin,
  meteorologyQuizPlugin as unknown as GamePlugin,
  computerHistoryQuizPlugin as unknown as GamePlugin,
  programmingLangsQuizPlugin as unknown as GamePlugin,
  internetHistoryQuizPlugin as unknown as GamePlugin,
  gamingHistoryQuizPlugin as unknown as GamePlugin,
  cybersecQuizPlugin as unknown as GamePlugin,
  osQuizPlugin as unknown as GamePlugin,
  aiHistoryQuizPlugin as unknown as GamePlugin,
  siliconValleyQuizPlugin as unknown as GamePlugin,
  straightSearchPlugin as unknown as GamePlugin,
  flushFinderPlugin as unknown as GamePlugin,
  pairPickupPlugin as unknown as GamePlugin,
  kingsCourtPlugin as unknown as GamePlugin,
  queensQuestPlugin as unknown as GamePlugin,
  jacksJamboreePlugin as unknown as GamePlugin,
  tensTallyPlugin as unknown as GamePlugin,
  diceHandPokerPlugin as unknown as GamePlugin,
  farkleMiniPlugin as unknown as GamePlugin,
  pigClassicPlugin as unknown as GamePlugin,
  dice21Plugin as unknown as GamePlugin,
  mexicanDicePlugin as unknown as GamePlugin,
  lollipopLiftPlugin as unknown as GamePlugin,
  gumballGrabPlugin as unknown as GamePlugin,
  taffyTapPlugin as unknown as GamePlugin,
  nougatNetPlugin as unknown as GamePlugin,
  caramelCatchPlugin as unknown as GamePlugin,
  worldCapitalsQuizPlugin as unknown as GamePlugin,
  usStatesQuizPlugin as unknown as GamePlugin,
  europeanCitiesQuizPlugin as unknown as GamePlugin,
  africanGeographyQuizPlugin as unknown as GamePlugin,
  asianGeographyQuizPlugin as unknown as GamePlugin,
  southAmericaQuizPlugin as unknown as GamePlugin,
  oceaniaQuizPlugin as unknown as GamePlugin,
  caribbeanQuizPlugin as unknown as GamePlugin,
  worldFlagsQuizPlugin as unknown as GamePlugin,
  worldRiversQuizPlugin as unknown as GamePlugin,
  shakespeareQuizPlugin as unknown as GamePlugin,
  classicNovelsQuizPlugin as unknown as GamePlugin,
  americanLitQuizPlugin as unknown as GamePlugin,
  britishLitQuizPlugin as unknown as GamePlugin,
  russianLitQuizPlugin as unknown as GamePlugin,
  mysteryNovelsQuizPlugin as unknown as GamePlugin,
  sciFiNovelsQuizPlugin as unknown as GamePlugin,
  fantasyNovelsQuizPlugin as unknown as GamePlugin,
  nineNinePlugin as unknown as GamePlugin,
  eightEatersPlugin as unknown as GamePlugin,
  lowTidePlugin as unknown as GamePlugin,
  highTidePlugin as unknown as GamePlugin,
  colorClashPlugin as unknown as GamePlugin,
  suitShufflePlugin as unknown as GamePlugin,
  rankRumblePlugin as unknown as GamePlugin,
  rollAndWritePlugin as unknown as GamePlugin,
  diceBingoPlugin as unknown as GamePlugin,
  buncoMiniPlugin as unknown as GamePlugin,
  diceKingPlugin as unknown as GamePlugin,
  diceClutchPlugin as unknown as GamePlugin,
  cucumberCatchPlugin as unknown as GamePlugin,
  tomatoTossPlugin as unknown as GamePlugin,
  pepperPopPlugin as unknown as GamePlugin,
  spinachSpinPlugin as unknown as GamePlugin,
  kaleKombatPlugin as unknown as GamePlugin,
  oscarFilmsQuizPlugin as unknown as GamePlugin,
  marvelMcuQuizPlugin as unknown as GamePlugin,
  dcComicsFilmsQuizPlugin as unknown as GamePlugin,
  pixarFilmsQuizPlugin as unknown as GamePlugin,
  disneyClassicsQuizPlugin as unknown as GamePlugin,
  horrorFilmsQuizPlugin as unknown as GamePlugin,
  sciFiFilmsQuizPlugin as unknown as GamePlugin,
  tvSitcomsQuizPlugin as unknown as GamePlugin,
  tvDramasQuizPlugin as unknown as GamePlugin,
  cartoonsQuizPlugin as unknown as GamePlugin,
  beatlesQuizPlugin as unknown as GamePlugin,
  elvisQuizPlugin as unknown as GamePlugin,
  bowieQuizPlugin as unknown as GamePlugin,
  princeQuizPlugin as unknown as GamePlugin,
  madonnaQuizPlugin as unknown as GamePlugin,
  rollingStonesQuizPlugin as unknown as GamePlugin,
  ledZeppelinQuizPlugin as unknown as GamePlugin,
  pinkFloydQuizPlugin as unknown as GamePlugin,
  tripleTroublePlugin as unknown as GamePlugin,
  quartetQuestPlugin as unknown as GamePlugin,
  flushFivePlugin as unknown as GamePlugin,
  lowFivePlugin as unknown as GamePlugin,
  highFiveCardsPlugin as unknown as GamePlugin,
  faceFlipPlugin as unknown as GamePlugin,
  pipPulsePlugin as unknown as GamePlugin,
  tripleThreePlugin as unknown as GamePlugin,
  diceDerbyPlugin as unknown as GamePlugin,
  diceDominoPlugin as unknown as GamePlugin,
  diceSpinPlugin as unknown as GamePlugin,
  superSixPlugin as unknown as GamePlugin,
  teaTimeTapPlugin as unknown as GamePlugin,
  chaiChasePlugin as unknown as GamePlugin,
  coffeeCollectPlugin as unknown as GamePlugin,
  bobaBouncePlugin as unknown as GamePlugin,
  smoothieSwipePlugin as unknown as GamePlugin,
  friendsShowQuizPlugin as unknown as GamePlugin,
  officeShowQuizPlugin as unknown as GamePlugin,
  seinfeldQuizPlugin as unknown as GamePlugin,
  simpsonsQuizPlugin as unknown as GamePlugin,
  familyGuyQuizPlugin as unknown as GamePlugin,
  southParkQuizPlugin as unknown as GamePlugin,
  gotQuizPlugin as unknown as GamePlugin,
  breakingBadQuizPlugin as unknown as GamePlugin,
  strangerThingsQuizPlugin as unknown as GamePlugin,
  lostShowQuizPlugin as unknown as GamePlugin,
  marioQuizPlugin as unknown as GamePlugin,
  zeldaQuizPlugin as unknown as GamePlugin,
  pokemonQuizPlugin as unknown as GamePlugin,
  sonicQuizPlugin as unknown as GamePlugin,
  finalFantasyQuizPlugin as unknown as GamePlugin,
  mortalKombatQuizPlugin as unknown as GamePlugin,
  streetfighterQuizPlugin as unknown as GamePlugin,
  metalGearQuizPlugin as unknown as GamePlugin,
  acesUpMiniPlugin as unknown as GamePlugin,
  fourFoursPlugin as unknown as GamePlugin,
  redRallyPlugin as unknown as GamePlugin,
  blackBashPlugin as unknown as GamePlugin,
  evenEddyPlugin as unknown as GamePlugin,
  oddOlliePlugin as unknown as GamePlugin,
  cardClockPlugin as unknown as GamePlugin,
  diceTargetPlugin as unknown as GamePlugin,
  diceFlushMiniPlugin as unknown as GamePlugin,
  diceStackMiniPlugin as unknown as GamePlugin,
  dicePyramidPlugin as unknown as GamePlugin,
  diceArrowPlugin as unknown as GamePlugin,
  chipsChompPlugin as unknown as GamePlugin,
  popcornPopPlugin as unknown as GamePlugin,
  pretzelPinchPlugin as unknown as GamePlugin,
  nachosNowPlugin as unknown as GamePlugin,
  crackerCrunchPlugin as unknown as GamePlugin,
  narutoQuizPlugin as unknown as GamePlugin,
  dragonballQuizPlugin as unknown as GamePlugin,
  onepieceQuizPlugin as unknown as GamePlugin,
  attackTitanQuizPlugin as unknown as GamePlugin,
  bleachQuizPlugin as unknown as GamePlugin,
  studioGhibliQuizPlugin as unknown as GamePlugin,
  sailorMoonQuizPlugin as unknown as GamePlugin,
  evangelionQuizPlugin as unknown as GamePlugin,
  cowboyBebopQuizPlugin as unknown as GamePlugin,
  myHeroQuizPlugin as unknown as GamePlugin,
  batmanQuizPlugin as unknown as GamePlugin,
  supermanQuizPlugin as unknown as GamePlugin,
  xmenQuizPlugin as unknown as GamePlugin,
  spidermanQuizPlugin as unknown as GamePlugin,
  wonderWomanQuizPlugin as unknown as GamePlugin,
  flashQuizPlugin as unknown as GamePlugin,
  greenLanternQuizPlugin as unknown as GamePlugin,
  comicVillainsQuizPlugin as unknown as GamePlugin,
  lowPairPlugin as unknown as GamePlugin,
  highPairPlugin as unknown as GamePlugin,
  rainbowRunPlugin as unknown as GamePlugin,
  monochromeRunPlugin as unknown as GamePlugin,
  swapStackPlugin as unknown as GamePlugin,
  cutTheDeckPlugin as unknown as GamePlugin,
  mirrorMatchPlugin as unknown as GamePlugin,
  diceFrenzyPlugin as unknown as GamePlugin,
  diceBowlPlugin as unknown as GamePlugin,
  diceSpellPlugin as unknown as GamePlugin,
  diceShippingPlugin as unknown as GamePlugin,
  diceVortexPlugin as unknown as GamePlugin,
  cookieClutchPlugin as unknown as GamePlugin,
  piePopPlugin as unknown as GamePlugin,
  croissantCatchPlugin as unknown as GamePlugin,
  bagelBashPlugin as unknown as GamePlugin,
  donutDashPlugin as unknown as GamePlugin,
  pizzaQuizPlugin as unknown as GamePlugin,
  sushiQuizPlugin as unknown as GamePlugin,
  pastaQuizPlugin as unknown as GamePlugin,
  bbqQuizPlugin as unknown as GamePlugin,
  tacosQuizPlugin as unknown as GamePlugin,
  dimSumQuizPlugin as unknown as GamePlugin,
  curryQuizPlugin as unknown as GamePlugin,
  cheeseQuizPlugin as unknown as GamePlugin,
  breadQuizPlugin as unknown as GamePlugin,
  dessertQuizPlugin as unknown as GamePlugin,
  dogsBreedsQuizPlugin as unknown as GamePlugin,
  catsBreedsQuizPlugin as unknown as GamePlugin,
  birdsWorldQuizPlugin as unknown as GamePlugin,
  reptilesWorldQuizPlugin as unknown as GamePlugin,
  insectsWorldQuizPlugin as unknown as GamePlugin,
  dinosaursQuizPlugin as unknown as GamePlugin,
  horsesQuizPlugin as unknown as GamePlugin,
  endangeredSpeciesQuizPlugin as unknown as GamePlugin,
  pipFivePlugin as unknown as GamePlugin,
  pipTenPlugin as unknown as GamePlugin,
  faceFlushPlugin as unknown as GamePlugin,
  pipFlushPlugin as unknown as GamePlugin,
  dualDealPlugin as unknown as GamePlugin,
  tripleDealPlugin as unknown as GamePlugin,
  quintDealPlugin as unknown as GamePlugin,
  diceRoulettePlugin as unknown as GamePlugin,
  diceBlackjackPlugin as unknown as GamePlugin,
  diceBaccaratPlugin as unknown as GamePlugin,
  diceKenoPlugin as unknown as GamePlugin,
  diceCrapsMiniPlugin as unknown as GamePlugin,
  dumplingDancePlugin as unknown as GamePlugin,
  ramenRushPlugin as unknown as GamePlugin,
  tempuraTapPlugin as unknown as GamePlugin,
  baoBashPlugin as unknown as GamePlugin,
  mochiMashPlugin as unknown as GamePlugin,
  chessHistoryQuizPlugin as unknown as GamePlugin,
  pokerHistoryQuizPlugin as unknown as GamePlugin,
  cardMagicQuizPlugin as unknown as GamePlugin,
  gardeningQuizPlugin as unknown as GamePlugin,
  cookingTechniquesQuizPlugin as unknown as GamePlugin,
  winePairingQuizPlugin as unknown as GamePlugin,
  coffeeBrewingQuizPlugin as unknown as GamePlugin,
  photographyQuizPlugin as unknown as GamePlugin,
  paintingTechniquesQuizPlugin as unknown as GamePlugin,
  potteryQuizPlugin as unknown as GamePlugin,
  parisQuizPlugin as unknown as GamePlugin,
  tokyoQuizPlugin as unknown as GamePlugin,
  nycQuizPlugin as unknown as GamePlugin,
  londonQuizPlugin as unknown as GamePlugin,
  romeQuizPlugin as unknown as GamePlugin,
  dubaiQuizPlugin as unknown as GamePlugin,
  sydneyQuizPlugin as unknown as GamePlugin,
  rioQuizPlugin as unknown as GamePlugin,
  sevenSevensPlugin as unknown as GamePlugin,
  sixShootPlugin as unknown as GamePlugin,
  fiveFingersPlugin as unknown as GamePlugin,
  fourFaceoffPlugin as unknown as GamePlugin,
  twoTwosomePlugin as unknown as GamePlugin,
  threeTriosPlugin as unknown as GamePlugin,
  cardCascadePlugin as unknown as GamePlugin,
  diceBingoLinePlugin as unknown as GamePlugin,
  diceMarathonPlugin as unknown as GamePlugin,
  diceTallyPlugin as unknown as GamePlugin,
  diceCricketPlugin as unknown as GamePlugin,
  diceShootoutPlugin as unknown as GamePlugin,
  flowerPluckPlugin as unknown as GamePlugin,
  weedWhackPlugin as unknown as GamePlugin,
  seedSprinklePlugin as unknown as GamePlugin,
  beeBuzzPlugin as unknown as GamePlugin,
  butterflyNetPlugin as unknown as GamePlugin,
  carBrandsQuizPlugin as unknown as GamePlugin,
  techBrandsQuizPlugin as unknown as GamePlugin,
  fashionBrandsQuizPlugin as unknown as GamePlugin,
  sodaBrandsQuizPlugin as unknown as GamePlugin,
  sneakerBrandsQuizPlugin as unknown as GamePlugin,
  airlineBrandsQuizPlugin as unknown as GamePlugin,
  bankBrandsQuizPlugin as unknown as GamePlugin,
  cerealBrandsQuizPlugin as unknown as GamePlugin,
  fastFoodBrandsQuizPlugin as unknown as GamePlugin,
  cosmeticBrandsQuizPlugin as unknown as GamePlugin,
  usPresidentsQuizPlugin as unknown as GamePlugin,
  britishMonarchsQuizPlugin as unknown as GamePlugin,
  worldDictatorsQuizPlugin as unknown as GamePlugin,
  nobelLaureatesQuizPlugin as unknown as GamePlugin,
  inventorsQuizPlugin as unknown as GamePlugin,
  nasaAstronautsQuizPlugin as unknown as GamePlugin,
  entrepreneursQuizPlugin as unknown as GamePlugin,
  civilRightsQuizPlugin as unknown as GamePlugin,
  redKingPlugin as unknown as GamePlugin,
  blackKingPlugin as unknown as GamePlugin,
  redQueenPlugin as unknown as GamePlugin,
  blackQueenPlugin as unknown as GamePlugin,
  fourColorFlushPlugin as unknown as GamePlugin,
  cardSnakePlugin as unknown as GamePlugin,
  cardLadderPlugin as unknown as GamePlugin,
  diceShootPlugin as unknown as GamePlugin,
  diceMirrorPlugin as unknown as GamePlugin,
  diceStairPlugin as unknown as GamePlugin,
  diceRainbowPlugin as unknown as GamePlugin,
  diceFortunePlugin as unknown as GamePlugin,
  frogFlickPlugin as unknown as GamePlugin,
  antAttackPlugin as unknown as GamePlugin,
  mouseMashPlugin as unknown as GamePlugin,
  bunnyBouncePlugin as unknown as GamePlugin,
  chickChasePlugin as unknown as GamePlugin,
  nineteen20sQuizPlugin as unknown as GamePlugin,
  nineteen30sQuizPlugin as unknown as GamePlugin,
  nineteen40sQuizPlugin as unknown as GamePlugin,
  nineteen50sQuizPlugin as unknown as GamePlugin,
  nineteen60sQuizPlugin as unknown as GamePlugin,
  nineteen70sQuizPlugin as unknown as GamePlugin,
  nineteen80sQuizPlugin as unknown as GamePlugin,
  nineteen90sQuizPlugin as unknown as GamePlugin,
  twoThousandsQuizPlugin as unknown as GamePlugin,
  twentyTensQuizPlugin as unknown as GamePlugin,
];
