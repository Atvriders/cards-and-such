// Quiz / party trivia specs. Each carries 12 thematic questions (10 used).
const Q = (q, choices, answer) => ({ q, choices, answer });

const TELESTRATIONS_Q = [
  Q("How many players is classic Telestrations designed for?", ["2–4","4–8","8–12","Up to 20"], 1),
  Q("Telestrations alternates between which two actions?", ["Sing and hum","Draw and guess","Act and shout","Roll and read"], 1),
  Q("Telestrations was first released in?", ["2000","2009","2015","1995"], 1),
  Q("Each player passes their sketchbook how often?", ["Once total","After each phase","At the end","Never"], 1),
  Q("Standard Telestrations turn length is?", ["30 sec","60 sec","90 sec","3 min"], 1),
  Q("Telestrations is published by which company?", ["Mattel","USAopoly","Hasbro","Asmodee"], 1),
  Q("After Dark edition is targeted at?", ["Children","Adults","Toddlers","Pets"], 1),
  Q("Each player receives at the start?", ["Cards only","Sketchbook + dry-erase pen","Dice","A board"], 1),
  Q("Telestrations evolved from which folk game?", ["Pictionary","Telephone with sketches","Charades","Scattergories"], 1),
  Q("Maximum players in standard Telestrations is?", ["6","8","12","20"], 1),
  Q("Drawing books in original box?", ["4","6","8","12"], 2),
  Q("After completing your sketchbook you read aloud?", ["Your last guess","Whole evolution","Only word 1","Nothing"], 1),
];

const FIBBAGE_Q = [
  Q("Fibbage was made by which studio?", ["Telltale","Jackbox","Hasbro","Asmodee"], 1),
  Q("In Fibbage you write?", ["A truth","A convincing lie","A poem","A sketch"], 1),
  Q("Players score by?", ["Tricking others","Drawing well","Singing","Acting"], 0),
  Q("Fibbage is part of which Jackbox pack?", ["Pack 1","Pack 2","Pack 7","Pack 9"], 0),
  Q("Players join the game via?", ["Buying cards","Phones at jackbox.tv","Game controllers","Dice"], 1),
  Q("Recommended player count?", ["1","2–8","12+","20"], 1),
  Q("Fibbage was first released in?", ["2014","2010","2018","2022"], 0),
  Q("A Lie Detector lets you?", ["Win automatically","Eliminate one wrong answer","Skip a round","Steal points"], 1),
  Q("If everyone picks the truth, points are?", ["Triple","Doubled","None","Halved"], 1),
  Q("Game ends after?", ["10 rounds","Three rounds","Time only","One round"], 1),
  Q("Fibbage 2 added?", ["Lie likes","Final round mechanic","No new features","Music battles"], 1),
  Q("Fibbage XL features?", ["More questions","Drawing","Acting","Dice"], 0),
];

const QUIPLASH_Q = [
  Q("Quiplash gives you?", ["Two open-ended prompts","Multiple choice","Numbers","Charades"], 0),
  Q("Players vote on?", ["Funniest answer","Best handwriting","Worst answer","Speed"], 0),
  Q("Quiplash is by?", ["Jackbox","USAopoly","Asmodee","CMON"], 0),
  Q("Quiplash player count?", ["3–8","2","20+","1"], 0),
  Q("Quiplash audience members are called?", ["Hecklers","The Audience","Judges","Refs"], 1),
  Q("Final round is called?", ["Quiplash 3","Last Lash","Final Q","Big Lie"], 1),
  Q("Last Lash awards?", ["Triple points","2× points","Half","Same"], 1),
  Q("Quiplash 2 added?", ["Custom episodes","Drawing","Music","Boards"], 0),
  Q("Quiplash was released in?", ["2015","2010","2020","2005"], 0),
  Q("Quiplash needs how many devices?", ["TV + phones","Just TV","Just phones","Dice"], 0),
  Q("XL pack increased question count to?", ["1000+","100","50","10"], 0),
  Q("Quiplash 3 is part of pack?", ["Pack 7","Pack 1","Pack 2","Pack 9"], 0),
];

const DRAWFUL_Q = [
  Q("Drawful is what?", ["Sketch + guess","Trivia","Numbers","Words only"], 0),
  Q("Drawful prompt arrives via?", ["Phone","Cards","Dice","TV only"], 0),
  Q("Players guess by?", ["Typing fake titles","Multiple choice","Speaking","Drawing"], 0),
  Q("Score for tricking others?", ["Yes, +500","None","Negative","Skip"], 0),
  Q("Drawful 2 features?", ["Custom prompts","Music","Cards","Dice"], 0),
  Q("Player count?", ["3–8","12+","2","20"], 0),
  Q("Drawful is by?", ["Jackbox","Hasbro","CMON","USAopoly"], 0),
  Q("Drawful is part of pack?", ["Pack 1","Pack 9","Pack 8","Pack 0"], 0),
  Q("Drawful 2 is part of pack?", ["Pack 4","Pack 1","Pack 9","Pack 0"], 0),
  Q("Audience can?", ["Vote","Draw","Speak","Veto"], 0),
  Q("Sketches are drawn on?", ["Phone","Tablet","Paper","TV remote"], 0),
  Q("Final round is?", ["Bonus round only","Standard final","No different","Skipped"], 1),
];

const DIXIT_Q = [
  Q("Dixit cards feature?", ["Surreal artwork","Photos","Numbers","Words"], 0),
  Q("The active player is called?", ["The Storyteller","The Caller","The Drawer","The Judge"], 0),
  Q("Storyteller gives?", ["A clue or phrase","A lie","A number","A score"], 0),
  Q("Other players?", ["Submit matching cards","Draw","Vote first","Sing"], 0),
  Q("Players vote on?", ["Storyteller's card","Best card","Funniest","Highest number"], 0),
  Q("Dixit is by?", ["Libellud","Jackbox","Asmodee","CMON"], 0),
  Q("Dixit player count?", ["3–6","2","12+","20"], 0),
  Q("First Dixit released?", ["2008","2015","2020","1995"], 0),
  Q("Score on board uses?", ["Bunnies","Tokens","Coins","Dice"], 0),
  Q("If all guess correctly, storyteller scores?", ["0","6","3","10"], 0),
  Q("If none guess correctly, storyteller scores?", ["0","6","3","10"], 0),
  Q("Dixit's designer is?", ["Jean-Louis Roubira","Reiner Knizia","Klaus Teuber","Bruno Cathala"], 0),
];

const WITS_Q = [
  Q("Wits & Wagers asks?", ["Trivia with numeric answers","Sketches","Charades","Words"], 0),
  Q("Players bet on?", ["Whose answer is closest","Their own","No one's","Time"], 0),
  Q("Closest answer wins?", ["Pays per odds","Set amount","Nothing","Half"], 0),
  Q("Wits & Wagers is by?", ["North Star Games","Jackbox","Hasbro","Asmodee"], 0),
  Q("Player count?", ["3–7","2","20+","Solo"], 0),
  Q("Wits & Wagers was released?", ["2005","2015","2020","1995"], 0),
  Q("Designer is?", ["Dominic Crapuchettes","Klaus Teuber","Reiner Knizia","Bruno Cathala"], 0),
  Q("Highest payout multiplier?", ["5×","2×","10×","20×"], 0),
  Q("Default round count?", ["7","10","5","12"], 0),
  Q("Family edition is?", ["Wits & Wagers Family","Wits Lite","Wits Junior","Wits XS"], 0),
  Q("Closest answer that isn't over wins like in?", ["The Price is Right","Jeopardy","Wheel","Bingo"], 0),
  Q("Audience-friendly version is?", ["Wits Party","Wits Pro","Wits Solo","Wits XL"], 0),
];

const APPLES_Q = [
  Q("Apples to Apples uses?", ["Red & green cards","Dice","Spinner","Pawns"], 0),
  Q("Judge picks?", ["Most fitting card","Highest","Random","Smallest"], 0),
  Q("Red cards are?", ["Nouns","Adjectives","Numbers","Pictures"], 0),
  Q("Green cards are?", ["Adjectives","Nouns","Verbs","Numbers"], 0),
  Q("Apples to Apples is by?", ["Mattel","Hasbro","Out of the Box","Asmodee"], 2),
  Q("Player count?", ["4–10","2","20+","Solo"], 0),
  Q("Released in?", ["1999","2005","2015","1995"], 0),
  Q("Card to win is?", ["Green","Red","Black","Blue"], 0),
  Q("Game ends when?", ["Player gets enough green cards","Time","Cards run out","Vote"], 0),
  Q("Apples to Apples Junior is for?", ["Kids","Adults only","Pets","Babies"], 0),
  Q("Big Picture variant uses?", ["Pictures","Dice","Words only","Sounds"], 0),
  Q("Cards Against Humanity is inspired by?", ["Apples to Apples","Pictionary","Charades","Hanabi"], 0),
];

const PICTIONARY_Q = [
  Q("Pictionary players?", ["Draw and guess","Act","Sing","Hum"], 0),
  Q("Pictionary is by?", ["Mattel","Hasbro","CMON","Asmodee"], 0),
  Q("Released in?", ["1985","1995","2005","1975"], 0),
  Q("Game uses a?", ["Sand timer","Phone app","Dice tower","Spinner only"], 0),
  Q("Categories include?", ["Action, person, object, etc.","Just animals","Just food","Numbers"], 0),
  Q("Player count?", ["3–16","2","Solo","100"], 0),
  Q("Pictionary Mania adds?", ["Twists","Cards","Dice","Music"], 0),
  Q("Pictionary Card Game uses?", ["Cards instead of board","Board only","No drawing","Dice"], 0),
  Q("Pictionary Man features?", ["Doodler","Robot","Audio","Spinner"], 0),
  Q("Designer is?", ["Robert Angel","Klaus Teuber","Reiner Knizia","Bruno Cathala"], 0),
  Q("Pictionary uses how many dice?", ["1","0","3","6"], 0),
  Q("Default round time is?", ["1 minute","30 seconds","2 minutes","5 minutes"], 0),
];

const LOADED_Q = [
  Q("Loaded Questions asks?", ["Personal opinion questions","Numbers","Lies","Sketches"], 0),
  Q("Players guess?", ["Who said what","Highest number","Truth","Time"], 0),
  Q("Loaded Questions is by?", ["All Things Equal","Jackbox","Hasbro","Asmodee"], 0),
  Q("Player count?", ["3–6","2","20+","Solo"], 0),
  Q("Released in?", ["1997","2005","2015","2020"], 0),
  Q("Loaded Questions Go is for?", ["Phones/quick play","Console","TV","Solo"], 0),
  Q("Each round writes?", ["Personal answer","Lies","Numbers","Sketches"], 0),
  Q("Active player roles?", ["Judge guesses authors","Speaker","Drawer","Singer"], 0),
  Q("Categories include?", ["Family-friendly","Numeric","Sketches","Songs"], 0),
  Q("Questions per game?", ["Many","One","Five","Ten"], 0),
  Q("Win condition?", ["First to space on board","Most lies","Best art","Random"], 0),
  Q("Loaded Questions Junior is for?", ["Kids","Adults","Pets","Babies"], 0),
];

const TEEKO_Q = [
  Q("Tee K.O. has players design?", ["T-shirts","Posters","Songs","Dance moves"], 0),
  Q("Designs combine?", ["Slogans + drawings","Photos","Music","Voices"], 0),
  Q("Tee K.O. is part of pack?", ["Pack 3","Pack 1","Pack 7","Pack 9"], 0),
  Q("Players vote on?", ["Best matchup","Worst","Fastest","Random"], 0),
  Q("Tee K.O. winners can?", ["Order their shirt","Win cash","Win cards","Skip"], 0),
  Q("Tee K.O. is by?", ["Jackbox","Hasbro","Asmodee","Mattel"], 0),
  Q("Player count?", ["3–8","2","12+","Solo"], 0),
  Q("Released in?", ["2017","2010","2020","1995"], 0),
  Q("Final round structure?", ["Tournament","Round-robin","Single","Random"], 0),
  Q("Devices used?", ["TV + phones","TV only","Phones only","Cards"], 0),
  Q("Tee K.O. 2 adds?", ["More slogans","Music","Drawing","Acting"], 0),
  Q("How many shirts per player?", ["Three","One","Five","Ten"], 0),
];

const JACKBOX_Q = [
  Q("Jackbox Pack 1 includes?", ["You Don't Know Jack 2015","Drawful 2","Tee K.O.","Quiplash 2"], 0),
  Q("Jackbox Pack 7 features?", ["Quiplash 3","Drawful 2","Trivia Murder Party","Bracketeering"], 0),
  Q("Jackbox developer?", ["Jackbox Games","Jellyvision","Telltale","Asmodee"], 0),
  Q("All Jackbox games join via?", ["Jackbox.tv","Steam only","Cartridge","Disc"], 0),
  Q("Player count typical?", ["1–8 (some up to 10)","2 only","20+","Solo"], 0),
  Q("Audience feature size?", ["Up to 10000","Up to 8","Up to 100","None"], 0),
  Q("Pack 7 contains how many games?", ["5","3","8","12"], 0),
  Q("Pack 1 contains how many games?", ["5","3","8","12"], 0),
  Q("First Jackbox Party Pack released?", ["2014","2010","2018","2005"], 0),
  Q("Jackbox 7 standout title?", ["Quiplash 3","Drawful","Tee K.O.","Trivia Death"], 0),
  Q("Jackbox games typically end with?", ["Final round multiplier","Sudden death","Coinflip","Vote"], 0),
  Q("Recommended setup?", ["TV + phones","Phones only","Tabletop","Console"], 0),
];

const SPYFALL_Q = [
  Q("Spyfall: one player is?", ["The Spy","The Detective","The Boss","The Mafia"], 0),
  Q("Other players know?", ["A location","Spy's identity","Random word","Numbers"], 0),
  Q("Players try to?", ["Find spy","Avoid","Lie","Sing"], 0),
  Q("Spy tries to?", ["Identify location","Lie loudly","Win silent","Eat"], 0),
  Q("Player count?", ["3–8","2","20+","Solo"], 0),
  Q("Released in?", ["2014","2010","2020","2005"], 0),
  Q("Spyfall is by?", ["Hobby World","Jackbox","Asmodee","Mattel"], 0),
  Q("Spyfall 2 adds?", ["Two spies, more locations","Cards","Numbers","None"], 0),
  Q("Time Travel variant uses?", ["Eras","Music","Songs","Numbers"], 0),
  Q("Round length?", ["8 minutes","2 mins","20 mins","Open-ended"], 0),
  Q("Win condition for non-spies?", ["Find the spy","Find location","Vote","Random"], 0),
  Q("Win condition for spy?", ["Guess location or run out clock","Lie best","Speak last","Be voted"], 0),
];

const WEREWOLF_Q = [
  Q("Werewolf has?", ["Hidden roles","Open hands","Numbers","Cards face-up"], 0),
  Q("Villagers want to?", ["Kill werewolves","Lie","Hide","Sing"], 0),
  Q("Werewolves want to?", ["Eat villagers","Eat each other","Win silently","Vote out"], 0),
  Q("Rounds alternate?", ["Day & Night","Spring & Fall","Hot & Cold","Active & Rest"], 0),
  Q("Player count?", ["7+","2","20+","Solo"], 0),
  Q("Werewolf is also called?", ["Mafia","Coup","Avalon","Skull"], 0),
  Q("Released in?", ["1986","2005","2020","1995"], 0),
  Q("Day phase ends with?", ["Lynch vote","Random kill","No vote","Random"], 0),
  Q("Night phase werewolves?", ["Choose victim","Sleep","Vote","Sing"], 0),
  Q("Special role: Seer?", ["Sees alignment","Has extra vote","Heals","Lies"], 0),
  Q("Special role: Doctor?", ["Saves a player","Heals two","Kills","Lies"], 0),
  Q("Game ends when?", ["One side eliminated","All vote","Time","Cards out"], 0),
];

const SECRET_HITLER_Q = [
  Q("Secret Hitler has roles?", ["Liberals & Fascists","Cops & Robbers","Mages","Pirates"], 0),
  Q("Players elect?", ["President & Chancellor","Captain","Mayor","Judge"], 0),
  Q("Liberal goal?", ["Pass 5 liberal policies","Eat","Sing","Build"], 0),
  Q("Fascist goal?", ["Pass 6 fascist or elect Hitler","Win random","Vote out","Lie"], 0),
  Q("Player count?", ["5–10","2","20+","Solo"], 0),
  Q("Released in?", ["2016","2005","2020","1995"], 0),
  Q("Secret Hitler is by?", ["Goat, Wolf, & Cabbage","Jackbox","Hasbro","Asmodee"], 0),
  Q("Hitler is technically?", ["A fascist","A liberal","A spy","Neutral"], 0),
  Q("Election rejection cap?", ["3 in a row","No limit","5","2"], 0),
  Q("Policies are drawn by?", ["President","Chancellor","Both","Audience"], 0),
  Q("Power: Investigate Loyalty?", ["See another's role","Heal","Skip","Lie"], 0),
  Q("Win for fascists if Hitler?", ["Elected after 3 fascist policies","Always","Never","Random"], 0),
];

const AVALON_Q = [
  Q("Avalon: Good guys are?", ["Knights of Round Table","Pirates","Mages","Dragons"], 0),
  Q("Bad guys?", ["Mordred's minions","Rebels","Vampires","Aliens"], 0),
  Q("Quests are?", ["Sent on missions","Drawn cards","Random","Voted"], 0),
  Q("Mission outcome?", ["Success or fail","Vote","Random","Skip"], 0),
  Q("Win for good guys?", ["3 successful quests","All quests","Vote out","Lie"], 0),
  Q("Win for evil?", ["3 failed quests or assassinate Merlin","Lie best","Vote in","Random"], 0),
  Q("Special role: Merlin?", ["Sees evil","Heals","Spy","Vote 2x"], 0),
  Q("Special role: Mordred?", ["Hidden from Merlin","Vote 2x","Heals","Spy"], 0),
  Q("Player count?", ["5–10","2","20+","Solo"], 0),
  Q("Released in?", ["2012","2005","2020","1995"], 0),
  Q("Avalon is by?", ["Indie Boards & Cards","Jackbox","Hasbro","Asmodee"], 0),
  Q("Lake of Lady?", ["Reveals alignment","Heals","Skips","Lies"], 0),
];

const RESISTANCE_Q = [
  Q("Resistance: rebels vs?", ["Spies","Cops","Mages","Pirates"], 0),
  Q("Players vote on?", ["Mission team","Words","Roll","Random"], 0),
  Q("Rebels win after?", ["3 successful missions","All","Vote","Random"], 0),
  Q("Spies win after?", ["3 failed missions","All","Vote","Random"], 0),
  Q("Player count?", ["5–10","2","20+","Solo"], 0),
  Q("Released in?", ["2009","2005","2020","1995"], 0),
  Q("Resistance is by?", ["Indie Boards & Cards","Jackbox","Hasbro","Asmodee"], 0),
  Q("Compared to Avalon?", ["No special roles","Same roles","More roles","Random"], 0),
  Q("Mission cards are?", ["Success/Fail","Vote","Color","Number"], 0),
  Q("Mission requires?", ["Specific number of fails","Vote","Random","Time"], 0),
  Q("Avalon adds?", ["Roles","Music","Dice","Cards"], 0),
  Q("Game ends after?", ["3-3 or 5 missions","All vote","Time","Random"], 0),
];

const MAFIA_Q = [
  Q("Mafia is also called?", ["Werewolf","Coup","Avalon","Skull"], 0),
  Q("Mafia knows?", ["Each other","Nothing","All","Random"], 0),
  Q("Town wins by?", ["Eliminating mafia","Lying","Voting all","Random"], 0),
  Q("Mafia wins by?", ["Outnumbering town","Voting","Lying","Random"], 0),
  Q("Special role: Detective?", ["Investigates","Heals","Kills","Lies"], 0),
  Q("Special role: Doctor?", ["Heals","Kills","Lies","Investigates"], 0),
  Q("Created by?", ["Dimitry Davidoff","Reiner Knizia","Klaus Teuber","Bruno Cathala"], 0),
  Q("Year created?", ["1986","2005","2020","1995"], 0),
  Q("Player count?", ["7+","2","20+","Solo"], 0),
  Q("Phases?", ["Day & Night","Hot & Cold","Spring & Fall","Active & Rest"], 0),
  Q("Day phase ends with?", ["Lynch","Random","Skip","Time"], 0),
  Q("Night phase mafia?", ["Choose victim","Sleep","Vote","Sing"], 0),
];

const TELESTRATIONS_DARK_Q = TELESTRATIONS_Q.map(q => ({ ...q })); // re-use q-set
const TELESTRATIONS_UPSIDE_Q = TELESTRATIONS_Q.map(q => ({ ...q }));
const FIBBAGE_2_Q = FIBBAGE_Q.map(q => ({ ...q }));
const FIBBAGE_3_Q = FIBBAGE_Q.map(q => ({ ...q }));
const FIBBAGE_XL_Q = FIBBAGE_Q.map(q => ({ ...q }));
const DRAWFUL_2_Q = DRAWFUL_Q.map(q => ({ ...q }));
const APPLES_KIDS_Q = APPLES_Q.map(q => ({ ...q }));
const APPLES_BIG_Q = APPLES_Q.map(q => ({ ...q }));
const PICTIONARY_MANIA_Q = PICTIONARY_Q.map(q => ({ ...q }));
const PICTIONARY_CARD_Q = PICTIONARY_Q.map(q => ({ ...q }));
const PICTIONARY_MAN_Q = PICTIONARY_Q.map(q => ({ ...q }));
const LOADED_GO_Q = LOADED_Q.map(q => ({ ...q }));
const SPYFALL_2_Q = SPYFALL_Q.map(q => ({ ...q }));
const SPYFALL_TIME_Q = SPYFALL_Q.map(q => ({ ...q }));
const MONIKERS_Q = [
  Q("Monikers descends from?", ["Celebrities (Salad Bowl)","Pictionary","Charades","Telestrations"], 0),
  Q("Monikers has how many rounds?", ["3","2","5","1"], 0),
  Q("Round 1 allows?", ["Anything but the name","Single word","One word","Charades"], 0),
  Q("Round 2 allows?", ["One word","Charades","Sounds","Anything"], 0),
  Q("Round 3 allows?", ["Charades only","One word","Sounds","Free"], 0),
  Q("Monikers is by?", ["Palm Court","Jackbox","Hasbro","Asmodee"], 0),
  Q("Year released?", ["2015","2005","2020","1995"], 0),
  Q("Player count?", ["4+","2","20+","Solo"], 0),
  Q("Game uses cards with?", ["Names + descriptions","Numbers","Photos","Words only"], 0),
  Q("Cards repeat?", ["Across all 3 rounds","No","Random","Once each"], 0),
  Q("Monikers Serious is?", ["Serious-themed deck","Funny","Kids","Adults only"], 0),
  Q("Best for parties because?", ["Fast and social","Slow strategy","Solo","Long"], 0),
];
const CHARADES_Q = [
  Q("Charades is mostly?", ["Acting silently","Drawing","Singing","Roll dice"], 0),
  Q("Charades originated as?", ["Riddle game","Card game","Dice","Computer"], 0),
  Q("Categories include?", ["Movies, books, songs","Numbers","Colors","Foods only"], 0),
  Q("Reverse Charades has?", ["Group acts to one guesser","Solo act","Vote","Sing"], 0),
  Q("Player count?", ["4+","2","20+","Solo"], 0),
  Q("Charades typically uses?", ["Timer","Dice","Spinner","Cards only"], 0),
  Q("Common gesture: book?", ["Open hands","Cup ear","Tap arm","Crank"], 0),
  Q("Common gesture: movie?", ["Crank old camera","Open book","Tap arm","Cup ear"], 0),
  Q("Common gesture: TV?", ["Box with hands","Open hands","Cup ear","Crank"], 0),
  Q("Common gesture: song?", ["Open mouth, music notes","Crank","Open book","Tap"], 0),
  Q("Sounds-like gesture?", ["Tug ear","Crank","Open book","Tap"], 0),
  Q("Categories on cards include?", ["People, places, things","Numbers","Music notes","Food"], 0),
];
const REVERSE_CHARADES_Q = CHARADES_Q.map(q => ({ ...q }));
const CHARADES_CLASSIC_Q = CHARADES_Q.map(q => ({ ...q }));
const MONIKERS_SERIOUS_Q = MONIKERS_Q.map(q => ({ ...q }));

const PICK_LIKE_Q = (theme) => [
  Q(`In ${theme}, what is a "Skip" worth?`, ["0","1","2","5"], 0),
  Q(`Best ${theme} cards generally?`, ["Spark debate","Boring","Numbers","Solo"], 0),
  Q(`${theme} optimal player count?`, ["3+","1","Pets","Robots"], 0),
  Q(`${theme} typically last?`, ["10–30 min","5 sec","Hours","Days"], 0),
  Q(`A great ${theme} card asks?`, ["Open opinions","Yes/no","Numbers","Photos"], 0),
  Q(`${theme} pacing relies on?`, ["Storytelling","Counting","Drawing","Numbers"], 0),
  Q(`${theme} good with?`, ["Friends/family","Strangers","Computers","Pets"], 0),
  Q(`If everyone agrees in ${theme}?`, ["Less interesting","More fun","Same","Won"], 0),
  Q(`${theme} category most popular?`, ["Hypotheticals","Math","Trivia","Sports"], 0),
  Q(`${theme} risk?`, ["Awkward moments","Boredom","Cheating","Loss"], 0),
  Q(`Best follow-up to a ${theme} answer?`, ["Why?","No","Skip","Yes"], 0),
  Q(`${theme} ages well with?`, ["New cards/themes","Same cards","Numbers","None"], 0),
];
const WYR_Q = PICK_LIKE_Q("Would You Rather");
const TOD_Q = PICK_LIKE_Q("Truth or Dare");
const NHIE_Q = PICK_LIKE_Q("Never Have I Ever");
const TTL_Q = PICK_LIKE_Q("Two Truths and a Lie");

export const QUIZ_SPECS = [
  // Telestrations / Charades / Monikers
  { folder: "telestrations-quiz", prefix: "tlq", title: "Telestrations Quiz", accent: "#0d9488", bg: "#ccfbf1", description: "Trivia about the sketching telephone party game.", questions: TELESTRATIONS_Q },
  { folder: "telestrations-after-dark-quiz", prefix: "tldq", title: "Telestrations: After Dark Quiz", accent: "#7c3aed", bg: "#ede9fe", description: "Adult-edition Telestrations trivia.", questions: TELESTRATIONS_DARK_Q },
  { folder: "telestrations-upside-quiz", prefix: "tluq", title: "Telestrations: Upside Drawn Quiz", accent: "#0891b2", bg: "#cffafe", description: "Upside-Drawn variant trivia.", questions: TELESTRATIONS_UPSIDE_Q },
  { folder: "reverse-charades-quiz", prefix: "rcq", title: "Reverse Charades Quiz", accent: "#dc2626", bg: "#fee2e2", description: "Group-acts party charades trivia.", questions: REVERSE_CHARADES_Q },
  { folder: "charades-classic-quiz", prefix: "ccq", title: "Charades Classic Quiz", accent: "#b91c1c", bg: "#fee2e2", description: "Classic acting party trivia.", questions: CHARADES_CLASSIC_Q },
  { folder: "monikers-quiz", prefix: "mnq", title: "Monikers Quiz", accent: "#dc2626", bg: "#fee2e2", description: "Three-round party game trivia.", questions: MONIKERS_Q },
  { folder: "monikers-serious-quiz", prefix: "msq", title: "Monikers Serious Quiz", accent: "#1e3a8a", bg: "#dbeafe", description: "Serious deck Monikers trivia.", questions: MONIKERS_SERIOUS_Q },
  // Fibbage family
  { folder: "fibbage-quiz", prefix: "fbq", title: "Fibbage Quiz", accent: "#a16207", bg: "#fef3c7", description: "Lie-writing party trivia.", questions: FIBBAGE_Q },
  { folder: "fibbage-2-quiz", prefix: "fb2q", title: "Fibbage 2 Quiz", accent: "#92400e", bg: "#fef3c7", description: "Fibbage 2 trivia.", questions: FIBBAGE_2_Q },
  { folder: "fibbage-3-quiz", prefix: "fb3q", title: "Fibbage 3 Quiz", accent: "#854d0e", bg: "#fef9c3", description: "Fibbage 3 trivia.", questions: FIBBAGE_3_Q },
  { folder: "fibbage-xl-quiz", prefix: "fbxq", title: "Fibbage XL Quiz", accent: "#a16207", bg: "#fef3c7", description: "Fibbage XL trivia.", questions: FIBBAGE_XL_Q },
  // Drawful / Quiplash
  { folder: "drawful-quiz", prefix: "drq", title: "Drawful Quiz", accent: "#0891b2", bg: "#cffafe", description: "Drawful sketch-guess trivia.", questions: DRAWFUL_Q },
  { folder: "drawful-2-quiz", prefix: "dr2q", title: "Drawful 2 Quiz", accent: "#0e7490", bg: "#cffafe", description: "Drawful 2 trivia.", questions: DRAWFUL_2_Q },
  { folder: "quiplash-quiz", prefix: "qpq", title: "Quiplash Quiz", accent: "#9333ea", bg: "#f3e8ff", description: "Quiplash trivia.", questions: QUIPLASH_Q },
  // Dixit
  { folder: "dixit-quiz", prefix: "dxq", title: "Dixit Quiz", accent: "#7c3aed", bg: "#ede9fe", description: "Dixit storytelling trivia.", questions: DIXIT_Q },
  { folder: "dixit-clue", prefix: "dxc", title: "Dixit Clue", accent: "#9333ea", bg: "#ede9fe", description: "Dixit clue-puzzle trivia.", questions: DIXIT_Q },
  // Wits
  { folder: "wits-wagers-quiz", prefix: "wwq", title: "Wits & Wagers Quiz", accent: "#16a34a", bg: "#dcfce7", description: "Wits & Wagers trivia.", questions: WITS_Q },
  // Apples
  { folder: "apples-to-apples-quiz", prefix: "atq", title: "Apples to Apples Quiz", accent: "#16a34a", bg: "#dcfce7", description: "Apples-to-Apples trivia.", questions: APPLES_Q },
  { folder: "apples-to-apples-kids-quiz", prefix: "akq", title: "Apples to Apples Kids Quiz", accent: "#a3e635", bg: "#ecfccb", description: "Junior edition trivia.", questions: APPLES_KIDS_Q },
  { folder: "apples-big-picture-quiz", prefix: "abq", title: "Apples Big Picture Quiz", accent: "#65a30d", bg: "#ecfccb", description: "Big Picture variant trivia.", questions: APPLES_BIG_Q },
  // Pictionary
  { folder: "pictionary-base-quiz", prefix: "pbq", title: "Pictionary Quiz", accent: "#dc2626", bg: "#fee2e2", description: "Pictionary trivia.", questions: PICTIONARY_Q },
  { folder: "pictionary-mania-quiz", prefix: "pmq", title: "Pictionary Mania Quiz", accent: "#b91c1c", bg: "#fee2e2", description: "Mania variant trivia.", questions: PICTIONARY_MANIA_Q },
  { folder: "pictionary-card-game-quiz", prefix: "pcq", title: "Pictionary Card Game Quiz", accent: "#9f1239", bg: "#ffe4e6", description: "Card-game version trivia.", questions: PICTIONARY_CARD_Q },
  { folder: "pictionary-man-quiz", prefix: "pmnq", title: "Pictionary Man Quiz", accent: "#7f1d1d", bg: "#fee2e2", description: "Pictionary Man trivia.", questions: PICTIONARY_MAN_Q },
  // Loaded Questions / Tee K.O. / Jackbox
  { folder: "loaded-questions-quiz", prefix: "lqq", title: "Loaded Questions Quiz", accent: "#1d4ed8", bg: "#dbeafe", description: "Loaded Questions trivia.", questions: LOADED_Q },
  { folder: "loaded-questions-go-quiz", prefix: "lgq", title: "Loaded Questions Go Quiz", accent: "#1e40af", bg: "#dbeafe", description: "LQ Go trivia.", questions: LOADED_GO_Q },
  { folder: "tee-ko-quiz", prefix: "tkq", title: "Tee K.O. Quiz", accent: "#db2777", bg: "#fce7f3", description: "Shirt-design party trivia.", questions: TEEKO_Q },
  { folder: "jackbox-pack-1-quiz", prefix: "jp1q", title: "Jackbox Pack 1 Quiz", accent: "#7c3aed", bg: "#ede9fe", description: "Pack 1 trivia.", questions: JACKBOX_Q },
  { folder: "jackbox-pack-7-quiz", prefix: "jp7q", title: "Jackbox Pack 7 Quiz", accent: "#9333ea", bg: "#f3e8ff", description: "Pack 7 trivia.", questions: JACKBOX_Q },
  // Spyfall family
  { folder: "spyfall-2-quiz", prefix: "sf2q", title: "Spyfall 2 Quiz", accent: "#0c4a6e", bg: "#e0f2fe", description: "Spyfall 2 trivia.", questions: SPYFALL_2_Q },
  { folder: "spyfall-time-travel", prefix: "sftq", title: "Spyfall: Time Travel Quiz", accent: "#1d4ed8", bg: "#dbeafe", description: "Time Travel trivia.", questions: SPYFALL_TIME_Q },
  // Bluffing / hidden role quizzes
  { folder: "werewolf-quiz", prefix: "wwq2", title: "Werewolf Quiz", accent: "#7f1d1d", bg: "#fee2e2", description: "Werewolf hidden-role trivia.", questions: WEREWOLF_Q },
  { folder: "secret-hitler-quiz", prefix: "shq", title: "Secret Hitler Quiz", accent: "#374151", bg: "#e5e7eb", description: "Secret Hitler trivia.", questions: SECRET_HITLER_Q },
  { folder: "avalon-quiz", prefix: "avq", title: "Avalon Quiz", accent: "#1d4ed8", bg: "#dbeafe", description: "Avalon trivia.", questions: AVALON_Q },
  { folder: "resistance-quiz", prefix: "rsq", title: "Resistance Quiz", accent: "#dc2626", bg: "#fee2e2", description: "Resistance trivia.", questions: RESISTANCE_Q },
  { folder: "mafia-quiz", prefix: "mfq", title: "Mafia Quiz", accent: "#0f172a", bg: "#e2e8f0", description: "Mafia / Werewolf trivia.", questions: MAFIA_Q },
  // Pick games
  { folder: "would-you-rather-pick", prefix: "wyrp", title: "Would You Rather", accent: "#0891b2", bg: "#cffafe", description: "Hypothetical-pick prompts.", questions: WYR_Q },
  { folder: "truth-or-dare-pick", prefix: "todp", title: "Truth or Dare", accent: "#dc2626", bg: "#fee2e2", description: "Truth-or-dare prompts.", questions: TOD_Q },
  { folder: "never-have-i-ever-pick", prefix: "nhiep", title: "Never Have I Ever", accent: "#7c3aed", bg: "#ede9fe", description: "Never Have I Ever prompts.", questions: NHIE_Q },
  { folder: "two-truths-lie-pick", prefix: "ttlp", title: "Two Truths and a Lie", accent: "#16a34a", bg: "#dcfce7", description: "Two Truths and a Lie prompts.", questions: TTL_Q },
];
