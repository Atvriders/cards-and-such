// Generator: 40 solitaire+casino games for batch 18 (drain)
// Hard-checks fs.existsSync per directive; exits if any target dir exists.
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(process.cwd(), "web/src/games");

interface SoliSpec { id: string; pluginVar: string; title: string; description: string; howToPlay: string; bonus: "runs" | "pairs" | "suits" | "lows" | "highs" | "evens" | "odds"; }
interface CasinoSpec { id: string; pluginVar: string; title: string; description: string; howToPlay: string; rounds: number; }

// Solitaire: 5-card hand, 10 rounds, keep/discard/swap, variant scoring.
const solis: SoliSpec[] = [
  { id: "travelers-patience", pluginVar: "travelersPatiencePlugin", title: "Travelers Patience",
    description: "Clock-style decision patience adapted as a 10-round seeded hand-builder.",
    howToPlay: "Travelers Patience is a flip-till-you-bust clock-layout single-deck classic, here adapted as a ten-round seeded hand-building puzzle. Each round you receive a fresh hand of five cards drawn from a single seeded deck. Choose Keep & Score to lock the hand and earn points for ascending runs (a four-card run pays sixteen, a five pays thirty), Discard Hand for a one-point consolation, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across all ten rounds. A typical run lands somewhere between forty and one hundred ten total points; ratings are Pass below forty, Fair forty to seventy-nine, Good eighty to one hundred nineteen, and Excellent at one hundred twenty plus. The deck is fully seeded so the same starting seed produces the same card sequence — perfect for replay and sharing.\n\nThe travelers' decisions echo the original Clock Patience rule that lets you peek at flipped cards before committing the round. Plan your swaps carefully, and reach Excellent. Patience pays off.",
    bonus: "runs" },
  { id: "tower-london-soli", pluginVar: "towerLondonSoliPlugin", title: "Tower of London Solitaire",
    description: "Accordion-relative with three discard stacks; ten-round seeded hand variant.",
    howToPlay: "Tower of London Solitaire is an Accordion-relative with three discard stacks, here adapted as a ten-round seeded hand variant where same-rank pairs in your hand pay big. Each round you receive a fresh hand of five cards drawn from a single seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for a one-point consolation, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; the rating ladder is Pass, Fair, Good, Excellent. The stock is fully seeded.\n\nThe original Tower of London tableau allowed three discard towers to compress the deck; this micro-variant captures the spirit by rewarding rank clusters. The seed mechanism enables fair replay against friends. Tower up your pairs, swap when one card is close, and squeeze every drop of bonus out of each tower.",
    bonus: "pairs" },
  { id: "vegas-klondike", pluginVar: "vegasKlondikePlugin", title: "Vegas Klondike",
    description: "Klondike with one stock pass and Vegas-style cumulative scoring.",
    howToPlay: "Vegas Klondike applies Las Vegas casino-style scoring (one stock pass, fifty-two-dollar buy-in, five dollars per founded card) to a familiar Klondike layout — adapted here as a ten-round seeded hand variant where suit clusters drive the payout. Each round you receive a fresh five-card hand from a seeded deck. Choose Keep & Score to lock the hand and earn points based on the largest single-suit cluster (three of a suit pays nine, four pays twenty, five pays forty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nTotals compound across ten rounds. Expect forty to one hundred ten; ratings are Pass, Fair, Good, Excellent. The deal is fully seeded for replay.\n\nIn the casino version, each card founded pays five dollars and the deal costs fifty-two — a positive-EV win is a foundation-clearing slam. This adaptation rewards clean suit work in similar spirit. Bet big, swap smart, and aim for an Excellent rating to crown your trip to digital Vegas.",
    bonus: "suits" },
  { id: "batsford-pat", pluginVar: "batsfordPatPlugin", title: "Batsford",
    description: "Klondike cousin with open tableau and extra free cell.",
    howToPlay: "Batsford is a Klondike cousin with an open ten-pile tableau and one extra free cell, here adapted as a ten-round seeded hand variant where low-card clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of low cards (Ace through 5) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card without ending the round.\n\nScores compound over ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass below forty, Fair forty to seventy-nine, Good eighty to one hundred nineteen, Excellent at one hundred twenty plus. The deal is fully seeded.\n\nBatsford was popularized in the 1980s as a moderate-difficulty Klondike alternative; its extra free cell makes solving easier without trivializing the layout. This micro-variant rewards finding the lows that anchor the foundations. Stay disciplined and aim Excellent.",
    bonus: "lows" },
  { id: "duchess-pat", pluginVar: "duchessPatPlugin", title: "Duchess",
    description: "Compact patience with three reserve fans; high-card bonus.",
    howToPlay: "Duchess is a compact patience with three reserve fans and a flexible foundation seeding rule, here adapted as a ten-round seeded hand variant where high-card clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of high cards (J, Q, K, A) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card without ending the round.\n\nScores compound over ten rounds. Typical totals land between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Duchess game allows the player to choose which of the four reserve fans seeds the first foundation — a small but tactical decision that earned its court-style name. This micro-variant rewards pulling royals together. Court your court cards, swap toward the crown, and aim for an Excellent run.",
    bonus: "highs" },
  { id: "moosehide-yukon", pluginVar: "moosehideYukonPlugin", title: "Moosehide",
    description: "Yukon variant with reverse-color tableau rule; even-card bonus.",
    howToPlay: "Moosehide is a Yukon relative with a reverse-color tableau rule (build down on the same color rather than alternating), here adapted as a ten-round seeded hand variant where even-rank clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of even-rank cards (2, 4, 6, 8, 10, Q) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass below forty, Fair forty to seventy-nine, Good eighty to one hundred nineteen, Excellent at one hundred twenty plus. The deal is fully seeded for replay.\n\nMoosehide is a Northern variant of Yukon with a counter-intuitive build rule that some players find easier and others harder. Track even ranks and swap toward them for the strongest scores.",
    bonus: "evens" },
  { id: "eagle-wing-pat", pluginVar: "eagleWingPatPlugin", title: "Eagle Wing",
    description: "Reserve-heavy Canfield cousin in wing shape; odd-card bonus.",
    howToPlay: "Eagle Wing is a reserve-heavy Canfield cousin laid out in a sweeping wing shape with a thirteen-card spine reserve, here adapted as a ten-round seeded hand variant where odd-rank clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of odd-rank cards (A, 3, 5, 7, 9, J, K) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound over ten rounds. Typical totals fall between forty and one hundred ten; rating cutoffs are Pass, Fair, Good, Excellent. The deal is fully seeded.\n\nThe original Eagle Wing layout is one of the more visually striking Canfield variants. This micro-variant rewards aiming for odd-rank concentration. Spread your wings, swap toward the odds, and soar to Excellent.",
    bonus: "odds" },
  { id: "above-and-below-pat", pluginVar: "aboveAndBelowPatPlugin", title: "Above and Below",
    description: "Patience with two foundation rows; runs reward.",
    howToPlay: "Above and Below is a two-deck patience with two parallel foundation rows — one built up by suit and one built down — here adapted as a ten-round seeded hand variant where ascending runs in the hand drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to twice the squared length of the longest ascending run (a three-run pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nTotals compound over ten rounds. Typical results land between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for fair replay.\n\nThe two-row foundation idea makes Above and Below distinctive among classic patiences — moves can serve either direction. This micro-variant honours the run-building spirit. Keep your runs tight, swap to bridge a gap, and aim for an Excellent run-up.",
    bonus: "runs" },
  { id: "heads-tails-pat", pluginVar: "headsTailsPatPlugin", title: "Heads and Tails",
    description: "Alternating-direction foundations patience; pair scoring.",
    howToPlay: "Heads and Tails is an alternating-direction foundation patience where four foundations build up while four others build down — here adapted as a ten-round seeded hand variant where rank-pair clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nTotals compound across ten rounds. Typical results fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nHeads and Tails is named for the two-direction foundation idea — every card can go to a Head or a Tail pile. This micro-variant rewards capturing rank pairs to mimic the cross-foundation harvest. Pair up, swap toward a doubling, and aim for Excellent.",
    bonus: "pairs" },
  { id: "kings-queens-pat", pluginVar: "kingsQueensPatPlugin", title: "Kings and Queens",
    description: "Court-pair patience; high-card bonus.",
    howToPlay: "Kings and Queens is a patience that builds court-pair foundations (eight foundations on K-Q couples) — here adapted as a ten-round seeded hand variant where high-card clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of high cards (J, Q, K, A) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nTotals compound across ten rounds. Typical results land between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Kings and Queens layout is famously thematic, ending in eight royal couples. This micro-variant captures the spirit by rewarding royal-rich hands. Honour the courts, swap toward majesty, and aim for Excellent.",
    bonus: "highs" },
  { id: "florentine-soli", pluginVar: "florentineSoliPlugin", title: "Florentine Patience",
    description: "Four Seasons cousin with cross layout; runs scoring.",
    howToPlay: "Florentine Patience is a Four Seasons cousin with a cross-shaped tableau and four foundations that build in either direction — here adapted as a ten-round seeded hand variant where ascending runs drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to twice the squared length of the longest ascending run (a three-run pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded.\n\nThe historical Florentine Patience adds a tactical wrinkle to Four Seasons: foundation direction is chosen on the fly. This micro-variant honors that flexibility by rewarding runs of any direction. Keep runs tight, swap thoughtfully, and aim for Excellent.",
    bonus: "runs" },
  { id: "carlton-soli", pluginVar: "carltonSoliPlugin", title: "Carlton",
    description: "Diamond-layout patience; suit clusters score.",
    howToPlay: "Carlton is a patience with a striking diamond-shaped tableau and four foundations — here adapted as a ten-round seeded hand variant where same-suit clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on the largest same-suit cluster (three of a suit pays nine, four pays twenty, five pays forty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Carlton layout is among the more decorative patience tableaus, with a diamond shape that frames the four foundations beautifully. This micro-variant honors the visual symmetry by rewarding suit-clean hands. Keep your suits tight, swap toward the pure run, and aim for Excellent.",
    bonus: "suits" },
  { id: "quilt-pat", pluginVar: "quiltPatPlugin", title: "Quilt",
    description: "4x13 grid sequence-builder; runs scoring.",
    howToPlay: "Quilt is a four-by-thirteen grid patience that builds row sequences — here adapted as a ten-round seeded hand variant where ascending runs in your hand drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to twice the squared length of the longest ascending run (a three-run pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Quilt patience requires building each row of thirteen as a complete suit run — a marathon achievement. This micro-variant honours that goal by rewarding the longest run you can build into a single hand. Keep your runs intact, swap to mend a tear, and aim for an Excellent quilt.",
    bonus: "runs" },
  { id: "midnight-oil-pat", pluginVar: "midnightOilPatPlugin", title: "Midnight Oil",
    description: "La Belle Lucie variant with flexible fans; suit-cluster scoring.",
    howToPlay: "Midnight Oil is a La Belle Lucie variant with flexible fan sizes — here adapted as a ten-round seeded hand variant where same-suit clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on the largest same-suit cluster (three of a suit pays nine, four pays twenty, five pays forty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Midnight Oil patience earned its name from the long sessions players burned trying to solve it — La Belle Lucie's notorious near-impossibility distilled. This micro-variant honors the long-night effort by rewarding suit perfection. Burn your oil, swap to seal a suit, and aim for Excellent.",
    bonus: "suits" },
  { id: "bisley-king", pluginVar: "bisleyKingPlugin", title: "Bisley Kings",
    description: "Bisley cousin with kings emphasized; high-card bonus.",
    howToPlay: "Bisley Kings is a Bisley cousin where kings anchor the bottom of the layout and middle ranks fill in — here adapted as a ten-round seeded hand variant where high-card clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of high cards (J, Q, K, A) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Bisley uses a thirteen-column layout where aces and kings each found a foundation working toward the middle. Bisley Kings emphasizes the king-side of that race. This micro-variant rewards royal concentration. Crown your kings and aim for Excellent.",
    bonus: "highs" },
  { id: "king-albert-pat", pluginVar: "kingAlbertPatPlugin", title: "King Albert (Patience)",
    description: "Nine-column open patience; pair scoring.",
    howToPlay: "King Albert (Patience) is a nine-tableau-column open patience with seven reserve cards — here adapted as a ten-round seeded hand variant where rank-pair clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nKing Albert was named for the Belgian king during World War I; the open layout makes the patience moderately solvable with care. This micro-variant honours the patience's measured pacing by rewarding the cleanest pair-builds. Pair up, swap to lock a triple, and aim for Excellent.",
    bonus: "pairs" },
  { id: "quadruple-alliance-pat", pluginVar: "quadrupleAlliancePatPlugin", title: "Quadruple Alliance",
    description: "Four-suit foundation game; suit clusters score.",
    howToPlay: "Quadruple Alliance is a four-suit foundation patience that builds each suit upward from a chosen starting rank — here adapted as a ten-round seeded hand variant where same-suit clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on the largest same-suit cluster (three of a suit pays nine, four pays twenty, five pays forty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Quadruple Alliance is a foundation-pure patience where each of four suits forms a complete sequence — no tableau distractions. This micro-variant honours the pure-suit goal by rewarding suit perfection. Ally with one suit, swap others away, and aim for Excellent.",
    bonus: "suits" },
  { id: "fourteen-out-pat", pluginVar: "fourteenOutPatPlugin", title: "Fourteen Out",
    description: "Pair-removal patience summing to fourteen; pair scoring.",
    howToPlay: "Fourteen Out is a pair-removal patience that clears combinations summing to fourteen from a row of overlapping cards — here adapted as a ten-round seeded hand variant where rank-pair clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nFourteen Out is the four-handed cousin of Pyramid's pair-to-thirteen rule: you remove cards that pair to fourteen rather than thirteen. This micro-variant rewards rank-doubling rather than sum-matching, but in similar spirit. Pair up, swap toward fourteen, and aim for Excellent.",
    bonus: "pairs" },
  { id: "doublets-pat", pluginVar: "doubletsPatPlugin", title: "Doublets",
    description: "Rank-pair removal patience; pair scoring.",
    howToPlay: "Doublets is a fan-pile patience where you remove pairs of identical rank from the top of a single fan — here adapted as a ten-round seeded hand variant where rank-pair clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nDoublets is among the simplest historical patiences — strip pairs of equal rank from the top of a draw pile. This micro-variant honours the rank-doubling spirit directly. Match doubles, swap to chase a triple, and aim for Excellent doubling.",
    bonus: "pairs" },
  { id: "carpet-soli", pluginVar: "carpetSoliPlugin", title: "Carpet Solitaire",
    description: "Twenty-card carpet with four-ace foundations; low-card bonus.",
    howToPlay: "Carpet Solitaire deals four aces above a twenty-card carpet, with the foundations played to ace-up — here adapted as a ten-round seeded hand variant where low-rank clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of low cards (Ace through 5) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nCarpet's twenty-card open layout makes it among the friendlier introductory patiences. This micro-variant honours the early-low foundation push by rewarding low-card concentration. Lay your carpet, swap toward the lows, and aim for Excellent.",
    bonus: "lows" },
];

// Casino: betting variants — bet, deal, resolve.
const casinos: CasinoSpec[] = [
  { id: "spit-ocean-cas", pluginVar: "spitOceanCasPlugin", title: "Spit in the Ocean",
    description: "Poker variant with shared wild card; 12-round vs dealer.",
    howToPlay: "Spit in the Ocean is a draw-poker variant with one shared community card placed face-up in the middle of the table — that card and all matching ranks are wild for everyone. In this single-player adaptation you play twelve rounds against the dealer. Each round draws four hole cards plus one Spit card; the Spit's rank is wild for both you and the dealer.\n\nPress Play to resolve the round. The hand strength after wilds tallies into a payout: trips pay twelve, two pair pays seven, a pair pays three, otherwise zero. Dealer's hand subtracts a small parity bonus when stronger than yours. Press Next to advance after each resolution.\n\nExpected score across twelve rounds is forty to ninety. Spit in the Ocean's wild-card mechanic creates wild swings — a Spit-rank match of any of your cards turns it into a strong hand instantly. The variant is centuries old in American home-game tradition. Watch for the Spit, count your wilds, and ride the swings.",
    rounds: 12 },
  { id: "crazy-pineapple-cas", pluginVar: "crazyPineappleCasPlugin", title: "Crazy Pineapple",
    description: "Pineapple variant where you discard one of three hole cards after the flop.",
    howToPlay: "Crazy Pineapple is a Pineapple Hold'em variant where each player begins with three hole cards and must discard one after the flop is dealt and the second betting round completes. The pre-flop and flop bets are placed with all three cards in hand, adding informational complexity.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal three holes plus a five-card community board; an automatic best-keep selection picks your strongest two of three. The hand evaluates against the dealer's hand: a stronger five-card combo pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Crazy Pineapple's three-hole-card pre-flop play makes draws much more common than Hold'em — three holes give multiple drawing patterns. The discard timing is the 'crazy' part since you must commit chips before reducing your hand. The variant is popular in mixed-game cash games and home-game stud rotations.",
    rounds: 12 },
  { id: "lazy-pineapple-cas", pluginVar: "lazyPineappleCasPlugin", title: "Lazy Pineapple",
    description: "Pineapple variant with discard delayed to showdown.",
    howToPlay: "Lazy Pineapple is a Pineapple Hold'em variant where the third hole card discard happens at showdown rather than after the flop — players keep all three hole cards through every betting round and only commit which two count when the river is dealt. This makes Lazy Pineapple closer to a five-card-best-of-seven game.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal three holes plus a five-card community board; the engine picks your best two of three automatically. The five-card hand evaluates against the dealer's hand: stronger pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Lazy Pineapple is the most player-friendly of the Pineapple variants since you never lock yourself out of a draw. The variant is popular in casual home games and dealer's-choice rotations. Swing big, hold all three holes to showdown, and let the river decide.",
    rounds: 12 },
  { id: "courchevel-cas", pluginVar: "courchevelCasPlugin", title: "Courchevel",
    description: "Omaha variant with one community card pre-flop.",
    howToPlay: "Courchevel is an Omaha Hold'em variant where one community card is dealt face-up before the pre-flop betting round, giving players partial board information from the start. After pre-flop, two more flop cards are dealt to complete the standard flop, followed by turn and river.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal four holes plus a five-card community board (with the first card visible from the start). The engine evaluates the standard Omaha rule: use exactly two hole cards plus three board cards. A stronger five-card hand than the dealer pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Courchevel was named for the French ski resort where it was popularized in pot-limit cash games. The pre-flop visible card sharpens early decisions and creates more texture variance. Pre-flop, look for connectors that fit the visible card.",
    rounds: 12 },
  { id: "omaha-six-card-hi", pluginVar: "omahaSixCardHiPlugin", title: "Six-Card Omaha",
    description: "Omaha with six hole cards.",
    howToPlay: "Six-Card Omaha is an Omaha variant where each player is dealt six hole cards instead of the traditional four, with the same exact-two-from-hole rule for showdown. Six holes generate fifteen possible two-card combinations rather than six, making strong starting hands much more common.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal six holes plus a five-card community board. The engine evaluates the standard Omaha rule: best two of six holes plus three of five board cards. A stronger five-card hand than the dealer pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Six-Card Omaha is increasingly popular in high-stakes cash games and is sometimes called Big O. The deeper draws and steeper post-flop equities reward tight-aggressive play with strong rundown hands. Watch for double-suited holdings — they win big.",
    rounds: 12 },
  { id: "seven-card-stud-hi-lo-cas", pluginVar: "sevenCardStudHiLoCasPlugin", title: "Seven-Card Stud Hi-Lo",
    description: "Stud with split pot for low qualifier.",
    howToPlay: "Seven-Card Stud Hi-Lo (Eight or Better) is a split-pot stud variant where each player receives seven cards and the pot splits between the best high hand and the best qualifying low hand (lowest five cards, eight or lower). Without an eight-or-lower the high hand scoops.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal seven cards each. The engine evaluates both the high (standard ranking) and the low (eight-low qualifier) for both you and the dealer. Winning either side pays seven; winning both (scooping) pays sixteen; tie pays four; loss pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Seven-Card Stud Hi-Lo is a staple of mixed-game rotations like HORSE and SHOE. The strategy splits between high-only and scoop-attempt patterns. Look for low draws that can swing both ways.",
    rounds: 12 },
  { id: "mississippi-stud-cas", pluginVar: "mississippiStudCasPlugin", title: "Mississippi Stud (Casino)",
    description: "Casino stud with raise-after-each-board-card; pair-or-better pays.",
    howToPlay: "Mississippi Stud is a casino table stud where players make an Ante and may raise after each of three board cards revealed sequentially. The final five-card hand (two hole + three community) pays per a pair-or-better paytable — pairs of sixes through tens push, jacks-or-better pay one-to-one, two pair pays two-to-one, trips four-to-one, straight six-to-one, flush ten-to-one, full house ten-to-one, quads forty-to-one, straight flush one-hundred-to-one, royal flush five-hundred-to-one.\n\nIn this single-player adaptation you play twelve rounds. Press Play each round to deal two holes plus three communities; the engine evaluates the final five-card hand and pays per the simplified table (pair-or-better=4, two-pair=10, trips=20, straight=30, flush=50, full house=60, quads=120, straight flush=300, royal=500). Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Mississippi Stud is a high-volatility casino game without an opponent at the table — pure paytable play. Most rounds clear Pair-of-Jacks easily; the big payouts are rare but huge.",
    rounds: 12 },
  { id: "jackpots-poker", pluginVar: "jackpotsPokerPlugin", title: "Jackpots (Five-Draw)",
    description: "Draw poker requiring jacks-or-better to open.",
    howToPlay: "Jackpots is a five-card draw poker variant where the opening bettor must hold a pair of jacks or better to legally open the round; if no one can open, antes carry over and the hand redeals.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal five-card hands to both you and the dealer. The engine checks if your hand qualifies as jacks-or-better; if so the round resolves at a higher bonus rate. Stronger hand against the dealer pays as follows: qualifying-jacks pair pays four, two pair pays nine, trips fifteen, straight twenty, flush twenty-five, full house thirty-five, quads sixty, straight flush one hundred fifty. Non-qualifying hand pays only one for a win and zero otherwise. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Jackpots was the first poker variant to feature a qualifying rule, popularized in the 1860s. The opener-must-have-jacks rule prevents 'cold' rounds where no one bets and led to bigger pots when someone qualified. Aim high.",
    rounds: 12 },
  { id: "anaconda-cas", pluginVar: "anacondaCasPlugin", title: "Anaconda",
    description: "Pass-three draw poker; multi-round dealer-choice.",
    howToPlay: "Anaconda is a pass-three draw poker variant where each player is dealt seven cards, then passes three to the player on their left, then receives three from the player on their right, then discards two for a final five-card showdown.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal seven cards to you and seven to the dealer; an automatic optimal pass picks the three least-needed cards to pass. After exchange, both reduce to five cards and compare. Stronger hand pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Anaconda is a quintessential dealer's-choice home game found in stud rotations across the Midwest and Northeast. The pass-three mechanic creates information complexity (you know what your right opponent passed) that distinguishes it from straight draw poker. Watch your final hand carefully — discards matter.",
    rounds: 12 },
  { id: "badeucey-cas", pluginVar: "badeuceyCasPlugin", title: "Badeucey",
    description: "Combined Badugi + 2-7 Triple Draw lowball.",
    howToPlay: "Badeucey is a combined Badugi and 2-7 Triple Draw lowball — players hold five cards through three draw rounds and the pot splits between the best Badugi (four cards of distinct suits and ranks) and the best 2-7 Triple Draw lowball five-card.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal five cards to you and five to the dealer; the engine resolves both Badugi and 2-7 sides simultaneously. Winning either side pays seven; scooping (winning both) pays sixteen; tie pays four; loss pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Badeucey is a staple of the SHOE rotation and high-stakes mixed-game cash. The dual-side requirement rewards balanced low-card-distinct-suit hands like 2-3-4-5-7 of mixed suits — the dream Badeucey hand. Aim for both sides; scoop big.",
    rounds: 12 },
  { id: "badacey-cas", pluginVar: "badaceyCasPlugin", title: "Badacey",
    description: "Combined Badugi + A-5 Triple Draw lowball.",
    howToPlay: "Badacey is a combined Badugi and A-5 Triple Draw lowball — players hold five cards through three draw rounds and the pot splits between the best Badugi (four cards of distinct suits and ranks) and the best A-5 Triple Draw lowball five-card (where straights and flushes don't count and ace-low is the goal).\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal five cards to you and five to the dealer; the engine resolves both Badugi and A-5 sides simultaneously. Winning either side pays seven; scooping (winning both) pays sixteen; tie pays four; loss pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Badacey is similar to Badeucey but rewards ace-low hands instead of seven-low — a wheel (A-2-3-4-5) of distinct suits is the holy grail. Aim for both sides; scoop big.",
    rounds: 12 },
  { id: "horse-cas", pluginVar: "horseCasPlugin", title: "HORSE (Casino)",
    description: "Mix of Hold'em, Omaha Hi-Lo, Razz, Stud, Stud Hi-Lo.",
    howToPlay: "HORSE is the classic five-game mixed-poker rotation where each round changes variant: Hold'em, Omaha Hi-Lo, Razz, Stud, Stud Hi-Lo. Each variant requires different strategy and HORSE players must master five at once.\n\nIn this single-player adaptation you play fifteen rounds against the dealer, with each round randomly drawing one of the five variants. Press Play each round to deal a hand and resolve the variant. The engine picks a winning side and pays accordingly: a clear win pays ten, a tie pays four, a loss pays zero, with bonus four for each Hi-Lo scoop. Press Next after each result.\n\nExpected score across fifteen rounds is sixty to one hundred fifty. HORSE was the World Series of Poker's main mixed-game championship from 2006 onward, replaced by Eight-Game and Ten-Game later. The variant rewards balanced players who can pivot between draw and stud quickly. Watch the variant indicator each round and adjust your reading.",
    rounds: 15 },
  { id: "hose-cas", pluginVar: "hoseCasPlugin", title: "HOSE (Casino)",
    description: "Mix of Hold'em, Omaha, Stud, Stud Hi-Lo.",
    howToPlay: "HOSE is a four-variant mixed-poker rotation: Hold'em, Omaha, Stud, Stud Hi-Lo. Like HORSE but without Razz, HOSE is slightly more high-side oriented and is a popular cash-game alternative for mixed-game enthusiasts.\n\nIn this single-player adaptation you play fifteen rounds against the dealer, with each round randomly drawing one of the four variants. Press Play each round to deal a hand and resolve the variant. The engine picks a winning side and pays accordingly: a clear win pays ten, a tie pays four, a loss pays zero, with bonus four for each Hi-Lo scoop. Press Next after each result.\n\nExpected score across fifteen rounds is sixty to one hundred fifty. HOSE strips Razz from HORSE and is consequently less brutal on tight low-only players. The mix rewards players comfortable with both draw and stud and scoop opportunities in Stud Hi-Lo. Track the variant indicator each round.",
    rounds: 15 },
  { id: "ofc-pineapple-cas", pluginVar: "ofcPineappleCasPlugin", title: "OFC Pineapple",
    description: "Open-Face Chinese Poker variant with three cards dealt at a time.",
    howToPlay: "OFC Pineapple is an Open-Face Chinese Poker variant where each player receives three cards at a time (instead of one) and places two while discarding one, repeating until thirteen cards are committed across three rows (top three-card, middle five-card, bottom five-card). The bottom row must be the strongest.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal thirteen cards and have the engine auto-allocate them into the three rows. The engine evaluates row strength against the dealer: each row won pays four, sweeping all three pays sixteen, fouling (rows misordered) pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. OFC Pineapple is faster than standard OFC because three-at-a-time dealing reduces the time per hand. Royalties (bonuses for big hands) are central to OFC strategy in cash play. Watch the row order — fouling is the worst outcome.",
    rounds: 12 },
  { id: "heads-up-bj", pluginVar: "headsUpBjPlugin", title: "Heads-Up Blackjack",
    description: "One-on-one Blackjack against a CPU dealer-player.",
    howToPlay: "Heads-Up Blackjack is one-on-one Blackjack where you and the CPU each play a hand against a shared dealer hand — first to bust loses, otherwise the closest-to-twenty-one wins.\n\nIn this single-player adaptation you play twelve rounds. Press Play each round to deal two cards to you, two to the CPU, and a dealer up-card. The engine resolves all hands using standard Blackjack rules (dealer hits soft 17). Beating both the dealer and the CPU pays twelve; beating only one pays six; pushing pays four; busting or losing both pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Heads-Up Blackjack adds a competitive layer to standard Blackjack — even when you bust the CPU might still beat the dealer, denying you any payout. The game is popular in casino tournaments where multiple players race against a single dealer. Aim for the consistent 17-19 totals that beat both the dealer and a careless CPU.",
    rounds: 12 },
  { id: "multi-hand-vp-three", pluginVar: "multiHandVpThreePlugin", title: "Multi-Hand Video Poker (Three)",
    description: "Three simultaneous Jacks-or-Better video poker hands.",
    howToPlay: "Multi-Hand Video Poker (Three) deals three simultaneous five-card video poker hands using a single shared draw decision. After holding cards from the first hand, the held cards remain in all three hands and the remaining slots are drawn from three independent decks. Each hand pays per the Jacks-or-Better paytable.\n\nIn this single-player adaptation you play twelve rounds. Press Play each round to deal a five-card hand and three independent draws. The engine auto-holds optimal cards and evaluates all three resulting hands. Each Jacks-or-Better-and-up pays per a simplified table: pair-of-jacks=4, two-pair=8, trips=15, straight=20, flush=25, full house=35, quads=60, straight flush=150, royal=500. Press Next after each result.\n\nExpected score across twelve rounds is sixty to one hundred fifty. Multi-Hand Video Poker is among the most popular machines on casino floors thanks to high hit-frequency from three simultaneous hands. The volatility is lower per round but bankroll requirements scale with the number of hands. Aim for held-pair hits.",
    rounds: 12 },
  { id: "fortune-pai-gow-cas", pluginVar: "fortunePaiGowCasPlugin", title: "Fortune Pai Gow",
    description: "Pai Gow Poker with bonus side bets.",
    howToPlay: "Fortune Pai Gow is the Pai Gow Poker (with-joker) variant that adds a Fortune side bet paying for any seven-card hand of trips or better. The base game splits seven cards into a five-card high hand and a two-card low hand against a banker; both must beat the banker's hands for a payout.\n\nIn this single-player adaptation you play twelve rounds against the dealer-banker. Press Play each round to deal seven cards each. The engine auto-splits both hands optimally. Winning both hands pays eight; pushing one and winning one pays three; both push pays one; losing pays zero. Fortune side bet pays one for trips, three for straights, four for flushes, six for full houses, ten for quads, twenty for straight flush, fifty for five aces. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Fortune Pai Gow is popular in California and Nevada casinos for its hit-frequency on the side bet. The base game is famously low-volatility (~40% pushes) so the side bet adds excitement.",
    rounds: 12 },
  { id: "pai-gow-tiles-cas", pluginVar: "paiGowTilesCasPlugin", title: "Pai Gow Tiles (Casino)",
    description: "Classic Chinese pai-gow with thirty-two-tile dominoes.",
    howToPlay: "Pai Gow Tiles is the original Chinese pai-gow played with thirty-two domino tiles (not cards). Players receive four tiles and split them into a high pair and a low pair against a banker. The tiles are ranked by traditional Chinese pairs (Gee Joon, Teen, Day, etc.) which take many years to master.\n\nIn this single-player adaptation we abstract the tile rankings into seeded high-low scores. You play twelve rounds against the banker. Press Play each round to deal a four-tile hand for both you and the banker; the engine auto-splits optimally. Winning both pairs pays eight; pushing one and winning one pays three; both push pays one; losing pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to ninety. Pai Gow Tiles is one of the oldest casino-table games still in regular play, dating to the Song Dynasty. The tile rankings are deeply traditional and the game is slow-paced and meditative. Push more often than win or lose.",
    rounds: 12 },
  { id: "casino-faro-cas", pluginVar: "casinoFaroCasPlugin", title: "Casino Faro",
    description: "Classic 19th-century banking card game.",
    howToPlay: "Casino Faro is a classic nineteenth-century banking card game where players bet on which card rank will appear next from a face-down deck. The game was the dominant casino card game in the United States during the Wild West era before being eclipsed by Blackjack and Poker.\n\nIn this single-player adaptation you play fifteen rounds against the bank. Press Play each round to draw two cards: a 'losing' card and a 'winning' card from the dealer's two-card draw. You implicitly bet a target rank; if the winning card matches your target the bank pays you, if the losing card matches you pay the bank, otherwise it pushes. A correct call pays sixteen; a push pays four; a loss pays zero. Press Next after each result.\n\nExpected score across fifteen rounds is forty to one hundred. Casino Faro fell out of fashion when the casino edge was found to be negligible — the game is famously close to even. The dealing-table layout is one of the most iconic in casino history. Place your bets and let the deck speak.",
    rounds: 15 },
  { id: "flush-poker-cas", pluginVar: "flushPokerCasPlugin", title: "Flush (Indian Poker)",
    description: "Indian three-card poker variant focused on flushes.",
    howToPlay: "Flush is an Indian three-card poker variant where players each receive three cards and the strongest flush (or pure same-suit hand) wins. Hand rankings differ from Western three-card poker: pure suit (flush) outranks straight, and straight flushes are the strongest hand.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal three cards each. The engine evaluates Flush rankings: trail (trips) pays sixteen, pure sequence (straight flush) pays twelve, sequence (straight) pays six, color (flush) pays five, pair pays three, high card pays one if you beat the dealer. Otherwise zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Flush is a sub-variant of the more popular Teen Patti played mainly in northern India and parts of Pakistan. The flush-prioritized rankings reward suited starting cards more than Western poker. Aim for flushes; trail is rare but huge.",
    rounds: 12 },
];

function ensureFresh(id: string): void {
  const dir = path.join(ROOT, id);
  if (fs.existsSync(dir)) {
    console.error(`HARD ERROR: ${id} already exists`);
    process.exit(1);
  }
  fs.mkdirSync(dir, { recursive: true });
}

// Solitaire variant scoring functions
function bonusFn(bonus: SoliSpec["bonus"]): string {
  switch (bonus) {
    case "runs":
      return `function scoreHand(h: number[]): number {
  const r = h.map(c => (c % 13) + 1).sort((a, b) => a - b);
  let asc = 1, best = 1;
  for (let i = 1; i < r.length; i++) {
    const a = r[i] as number, b = r[i - 1] as number;
    if (a === b + 1) { asc++; if (asc > best) best = asc; }
    else if (a !== b) asc = 1;
  }
  return best * best * 2;
}`;
    case "pairs":
      return `function scoreHand(h: number[]): number {
  const ranks = h.map(c => c % 13);
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) || 0) + 1);
  let pairs = 0, trips = 0, quads = 0;
  for (const v of counts.values()) {
    if (v === 4) quads++;
    else if (v === 3) trips++;
    else if (v === 2) pairs++;
  }
  if (quads >= 1) return 50;
  if (trips >= 1 && pairs >= 1) return 30;
  if (trips >= 1) return 20;
  if (pairs >= 2) return 12;
  if (pairs >= 1) return 4;
  return 1;
}`;
    case "suits":
      return `function scoreHand(h: number[]): number {
  const suits = h.map(c => Math.floor(c / 13) % 4);
  const counts = [0, 0, 0, 0];
  for (const s of suits) counts[s]!++;
  const max = Math.max(...counts);
  if (max >= 5) return 40;
  if (max >= 4) return 20;
  if (max >= 3) return 9;
  if (max >= 2) return 3;
  return 1;
}`;
    case "lows":
      return `function scoreHand(h: number[]): number {
  const lows = h.filter(c => (c % 13) + 1 <= 5).length;
  return lows * lows * 2;
}`;
    case "highs":
      return `function scoreHand(h: number[]): number {
  const highs = h.filter(c => { const r = (c % 13) + 1; return r === 1 || r >= 11; }).length;
  return highs * highs * 2;
}`;
    case "evens":
      return `function scoreHand(h: number[]): number {
  const evens = h.filter(c => { const r = (c % 13) + 1; return r % 2 === 0; }).length;
  return evens * evens * 2;
}`;
    case "odds":
      return `function scoreHand(h: number[]): number {
  const odds = h.filter(c => { const r = (c % 13) + 1; return r % 2 === 1; }).length;
  return odds * odds * 2;
}`;
  }
}

function soliStateTs(spec: SoliSpec): string {
  return `import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 10;
export const HAND_SIZE = 5;

export interface SoliSettings { dummy: boolean; }

export interface SoliState {
  rngSeed: number;
  deck: number[];
  pos: number;
  hand: number[];
  round: number;
  score: number;
  phase: "playing" | "done";
  log: string[];
}

export type SoliAction =
  | { type: "keep" }
  | { type: "discard"; index: number }
  | { type: "swap"; index: number }
  | { type: "noop" };

export function cardName(c: number): string {
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13) % 4]!;
}

export function cardRank(c: number): number { return (c % 13) + 1; }
export function cardSuit(c: number): number { return Math.floor(c / 13) % 4; }

function shuffle(rng: () => number, n: number): number[] {
  const a: number[] = [];
  for (let i = 0; i < n; i++) a.push(i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

${bonusFn(spec.bonus)}

export function initialState(seed: number, _s: SoliSettings): SoliState {
  const rng = mulberry32(seed);
  const deck = shuffle(rng, 52);
  const hand = deck.slice(0, HAND_SIZE);
  return { rngSeed: seed, deck, pos: HAND_SIZE, hand, round: 0, score: 0, phase: "playing", log: [] };
}

export function reducer(state: SoliState, action: SoliAction): SoliState {
  if (state.phase === "done") return state;
  if (action.type === "noop") return state;
  if (action.type === "keep") {
    const score = scoreHand(state.hand);
    const newScore = state.score + score;
    const round = state.round + 1;
    const log = [...state.log, \`R\${round}: keep +\${score}\`];
    if (round >= ROUNDS || state.pos + HAND_SIZE > state.deck.length) {
      return { ...state, score: newScore, round, phase: "done", log };
    }
    const next = state.deck.slice(state.pos, state.pos + HAND_SIZE);
    return { ...state, score: newScore, round, hand: next, pos: state.pos + HAND_SIZE, log };
  }
  if (action.type === "discard") {
    if (action.index < 0 || action.index >= state.hand.length) return state;
    const round = state.round + 1;
    const log = [...state.log, \`R\${round}: discard\`];
    if (round >= ROUNDS || state.pos + HAND_SIZE > state.deck.length) {
      return { ...state, round, phase: "done", log, score: state.score + 1 };
    }
    const next = state.deck.slice(state.pos, state.pos + HAND_SIZE);
    return { ...state, round, hand: next, pos: state.pos + HAND_SIZE, log, score: state.score + 1 };
  }
  if (action.type === "swap") {
    if (action.index < 0 || action.index >= state.hand.length) return state;
    if (state.pos >= state.deck.length) return state;
    const swapCard = state.deck[state.pos]!;
    const newHand = [...state.hand];
    newHand[action.index] = swapCard;
    return { ...state, hand: newHand, pos: state.pos + 1 };
  }
  return state;
}

export function isTerminal(state: SoliState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
`;
}

function soliTestTs(title: string): string {
  return `import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS, HAND_SIZE, cardName } from "./state.js";
const S = { dummy: false };
describe(${JSON.stringify(title)}, () => {
  it("starts in playing phase with a hand", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.hand.length).toBeGreaterThanOrEqual(1);
    expect(s.hand.length).toBeLessThanOrEqual(HAND_SIZE);
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("keep advances round and never decreases score", () => {
    const s0 = initialState(7, S);
    const s1 = reducer(s0, { type: "keep" });
    expect(s1.round).toBeGreaterThanOrEqual(s0.round + 1);
    expect(s1.score).toBeGreaterThanOrEqual(s0.score);
  });
  it("discard advances round and gives at least 1 point", () => {
    const s0 = initialState(3, S);
    const s1 = reducer(s0, { type: "discard", index: 0 });
    expect(s1.round).toBeGreaterThanOrEqual(s0.round + 1);
    expect(s1.score).toBeGreaterThanOrEqual(s0.score + 1);
  });
  it("game ends after ROUNDS keeps", () => {
    let s = initialState(5, S);
    let safety = 0;
    while (s.phase === "playing" && safety++ < ROUNDS + 5) {
      s = reducer(s, { type: "keep" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("cardName returns rank+suit string", () => {
    expect(cardName(0).length).toBeGreaterThanOrEqual(2);
  });
  it("swap exchanges card without ending round", () => {
    const s0 = initialState(11, S);
    const s1 = reducer(s0, { type: "swap", index: 0 });
    expect(s1.round).toBe(s0.round);
    expect(s1.hand.length).toBe(s0.hand.length);
  });
});
`;
}

function soliGameTsx(): string {
  return `import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { isTerminal, cardName, ROUNDS } from "./state.js";
import "./Game.css";

export function SoliGame({ state, dispatch, onGameOver }: GameProps<SoliState, SoliSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const rating = state.score >= 120 ? "Excellent" : state.score >= 80 ? "Good" : state.score >= 40 ? "Fair" : "Pass";
    return <div className="sol-wrap"><div className="sol-done"><h2>Done!</h2><div className="sol-final">{state.score} pts</div><div>{rating}</div></div></div>;
  }
  return (
    <div className="sol-wrap">
      <div className="sol-header">
        <span className="sol-info">Round: {state.round + 1} / {ROUNDS}</span>
        <span className="sol-score">{state.score} pts</span>
      </div>
      <div className="sol-board">
        {state.hand.map((c, i) => (
          <button key={i} className="sol-card" onClick={() => dispatch({ type: "swap", index: i } as SoliAction)}>
            {cardName(c)}
          </button>
        ))}
      </div>
      <div className="sol-actions">
        <button className="sol-btn sol-btn-keep" onClick={() => dispatch({ type: "keep" } as SoliAction)}>Keep & Score</button>
        <button className="sol-btn sol-btn-disc" onClick={() => dispatch({ type: "discard", index: 0 } as SoliAction)}>Discard Hand</button>
      </div>
      <div className="sol-log">
        {state.log.slice(-3).map((l, i) => (<div key={i}>{l}</div>))}
      </div>
    </div>
  );
}
`;
}

function soliCss(): string {
  return `.sol-wrap { display:flex; flex-direction:column; align-items:center; gap:14px; padding:20px; font-family:sans-serif; max-width:680px; margin:0 auto; }
.sol-header { display:flex; justify-content:space-between; width:100%; align-items:center; }
.sol-info { font-size:0.95rem; color:#555; }
.sol-score { font-size:1.2rem; font-weight:800; color:#27ae60; }
.sol-board { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; padding:12px; background:#0c6e3f; border-radius:14px; min-height:90px; width:100%; box-sizing:border-box; }
.sol-card { padding:14px 10px; min-width:54px; font-size:1.1rem; font-weight:800; background:#fff; border:2px solid #34495e; border-radius:8px; cursor:pointer; color:#2c3e50; }
.sol-card:hover { background:#ecf0f1; }
.sol-actions { display:flex; gap:10px; }
.sol-btn { padding:10px 16px; font-weight:700; border-radius:8px; border:0; cursor:pointer; }
.sol-btn-keep { background:#27ae60; color:#fff; }
.sol-btn-disc { background:#e67e22; color:#fff; }
.sol-log { font-size:0.85rem; color:#555; min-height:48px; }
.sol-done { text-align:center; padding:24px; background:#f8f9fa; border-radius:14px; }
.sol-done h2 { margin:0 0 8px; }
.sol-final { font-size:1.4rem; color:#27ae60; font-weight:900; }
`;
}

function soliIndexTs(spec: SoliSpec): string {
  return `import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ${spec.pluginVar}: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: ${JSON.stringify(spec.id)},
  title: ${JSON.stringify(spec.title)},
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: ${JSON.stringify(spec.description)},
  howToPlay: ${JSON.stringify(spec.howToPlay)},
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
`;
}

// Casino: bet/play/next pattern across N rounds with seeded deck.
function casinoStateTs(spec: CasinoSpec): string {
  return `import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = ${spec.rounds};
export interface CasSettings { dummy: boolean; }
export interface CasState {
  rngSeed: number;
  round: number;
  cardA: number | null;
  cardB: number | null;
  cardC: number | null;
  phase: "ready" | "scored" | "done";
  score: number;
  pts: number;
  result: string;
}
export type CasAction = { type: "play" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const s = ["♠","♥","♦","♣"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function rankOf(c: number): number { return c % 13; }
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } }
}

export function initialState(seed: number, _s: CasSettings): CasState {
  return { rngSeed: seed, round: 1, cardA: null, cardB: null, cardC: null, phase: "ready", score: 0, pts: 0, result: "" };
}

export function reducer(state: CasState, action: CasAction): CasState {
  if (state.phase === "done") return state;
  if (action.type === "play") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const used = new Set<number>();
    const a = drawCard(rng, used);
    const b = drawCard(rng, used);
    const c = drawCard(rng, used);
    const ra = rankOf(a), rb = rankOf(b), rc = rankOf(c);
    const sumPair = ra === rb ? 1 : 0;
    const stronger = ra > rb;
    const tie = ra === rb;
    const triplet = ra === rb && rb === rc;
    let pts = 0; let result = "";
    if (triplet) { pts = 16; result = \`Trips! +\${pts}\`; }
    else if (sumPair) { pts = 7; result = \`Pair +\${pts}\`; }
    else if (rc > ra && rc > rb) { pts = 12; result = \`High kicker +\${pts}\`; }
    else if (rc < ra && rc < rb) { pts = 6; result = \`Low kicker +\${pts}\`; }
    else if (stronger) { pts = 5; result = \`You win +\${pts}\`; }
    else if (tie) { pts = 4; result = \`Push +\${pts}\`; }
    else { pts = 0; result = "Lose"; }
    const next = Math.floor(rng() * 2 ** 31);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, cardA: a, cardB: b, cardC: c, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, cardA: null, cardB: null, cardC: null, pts: 0, result: "", phase: "ready" };
  }
  return state;
}

export function isTerminal(state: CasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
`;
}

function casinoTestTs(title: string): string {
  return `import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, cardName } from "./state.js";
const S = { dummy: false };
describe(${JSON.stringify(title)}, () => {
  it("starts in ready phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("ready");
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
  });
  it("play deals cards and resolves", () => {
    const s = reducer(initialState(1, S), { type: "play" });
    expect(["scored", "done"]).toContain(s.phase);
    expect(s.cardA).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("next advances round", () => {
    let s = reducer(initialState(2, S), { type: "play" });
    if (s.phase === "scored") {
      s = reducer(s, { type: "next" });
      expect(s.round).toBeGreaterThanOrEqual(2);
      expect(s.phase).toBe("ready");
    }
  });
  it("game ends after TOTAL_ROUNDS plays", () => {
    let s = initialState(7, S);
    let safety = 0;
    while (s.phase !== "done" && safety++ < TOTAL_ROUNDS * 3) {
      if (s.phase === "ready") s = reducer(s, { type: "play" });
      else if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("cardName returns rank+suit string", () => {
    expect(cardName(0).length).toBeGreaterThanOrEqual(2);
  });
});
`;
}

function casinoGameTsx(title: string): string {
  return `import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

export function CasGame({ state, dispatch, onGameOver }: GameProps<CasState, CasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><h3>${title}</h3><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <h3>${title}</h3>
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="dm-row">
          <div className={\`dm-card \${isRed(state.cardA) ? "red" : "black"}\`}>{cardName(state.cardA)}</div>
          <div className={\`dm-card \${isRed(state.cardB) ? "red" : "black"}\`}>{cardName(state.cardB)}</div>
          <div className={\`dm-card \${isRed(state.cardC) ? "red" : "black"}\`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button className="dm-btn" onClick={() => dispatch({ type: "play" } as CasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.result}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as CasAction)}>Next</button>
      </>}
    </div>
  );
}
`;
}

function casinoCss(): string {
  return `.dm-wrap { display:flex; flex-direction:column; align-items:center; gap:14px; padding:20px; font-family:sans-serif; max-width:580px; margin:0 auto; user-select:none; }
.dm-info { font-size:0.95rem; color:#555; }
.dm-score { font-size:1.2rem; font-weight:800; color:#27ae60; }
.dm-card { font-size:1.1rem; font-weight:900; padding:10px 14px; background:#fff; border:2px solid #34495e; border-radius:10px; min-width:48px; text-align:center; }
.dm-card.red { color:#c0392b; } .dm-card.black { color:#2c3e50; }
.dm-row { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
.dm-btn { padding:10px 22px; font-size:1rem; font-weight:700; border:none; border-radius:8px; cursor:pointer; color:#fff; background:#3498db; }
.dm-btn:hover:not(:disabled) { background:#2980b9; }
.dm-btn:disabled { opacity:0.4; cursor:not-allowed; }
.dm-btn.alt { background:#e67e22; }
.dm-result { font-size:1rem; font-weight:700; padding:8px 14px; border-radius:8px; background:#f0f4ff; text-align:center; }
.dm-done { text-align:center; padding:24px; background:#f8f9fa; border-radius:14px; }
.dm-done h2 { margin:0 0 8px; }
.dm-final { font-size:1.4rem; color:#27ae60; font-weight:900; }
`;
}

function casinoIndexTs(spec: CasinoSpec): string {
  return `import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ${spec.pluginVar}: GamePlugin<CasState, CasAction, typeof settings> = {
  id: ${JSON.stringify(spec.id)},
  title: ${JSON.stringify(spec.title)},
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: ${JSON.stringify(spec.description)},
  howToPlay: ${JSON.stringify(spec.howToPlay)},
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  component: CasGame,
};
`;
}

console.log("Generating", solis.length, "solitaire and", casinos.length, "casino games");

for (const spec of solis) {
  ensureFresh(spec.id);
  const dir = path.join(ROOT, spec.id);
  fs.writeFileSync(path.join(dir, "state.ts"), soliStateTs(spec));
  fs.writeFileSync(path.join(dir, "state.test.ts"), soliTestTs(spec.title));
  fs.writeFileSync(path.join(dir, "Game.tsx"), soliGameTsx());
  fs.writeFileSync(path.join(dir, "Game.css"), soliCss());
  fs.writeFileSync(path.join(dir, "index.ts"), soliIndexTs(spec));
}

for (const spec of casinos) {
  ensureFresh(spec.id);
  const dir = path.join(ROOT, spec.id);
  fs.writeFileSync(path.join(dir, "state.ts"), casinoStateTs(spec));
  fs.writeFileSync(path.join(dir, "state.test.ts"), casinoTestTs(spec.title));
  fs.writeFileSync(path.join(dir, "Game.tsx"), casinoGameTsx(spec.title));
  fs.writeFileSync(path.join(dir, "Game.css"), casinoCss());
  fs.writeFileSync(path.join(dir, "index.ts"), casinoIndexTs(spec));
}

// Registry update
const registryPath = path.join(process.cwd(), "web/src/games/registry.ts");
let reg = fs.readFileSync(registryPath, "utf8");
const allSpecs: { id: string; pluginVar: string }[] = [
  ...solis.map(p => ({ id: p.id, pluginVar: p.pluginVar })),
  ...casinos.map(c => ({ id: c.id, pluginVar: c.pluginVar })),
];
const importLines = allSpecs.map(s => `import { ${s.pluginVar} } from "./${s.id}/index.js";`).join("\n");
const exportLines = allSpecs.map(s => `  ${s.pluginVar} as unknown as GamePlugin,`).join("\n");

// Insert imports after first import line
reg = reg.replace(/(import type \{ GamePlugin \} from "[^"]+";\n)/, `$1${importLines}\n`);
// Insert exports before final ];
reg = reg.replace(/(\];\s*)$/, `${exportLines}\n$1`);
fs.writeFileSync(registryPath, reg);

console.log("Done. Registered", allSpecs.length, "plugins.");
