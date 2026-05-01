import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChristmasQuizSettings { questions: "10" | "20" | "30"; }
export interface ChristmasQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChristmasQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is celebrated on December 25?", choices: ["The traditional birth of Jesus Christ", "Saint Nicholas Day", "Boxing Day", "Epiphany"], correct: 0 },
  { question: "Where did the original Saint Nicholas live?", choices: ["Myra (in modern Turkey)", "Holland", "Lapland", "Germany"], correct: 0 },
  { question: "What is 'Yule' historically?", choices: ["Pre-Christian Germanic winter festival", "Just a synonym for Christmas tree", "A type of cake", "A carol style"], correct: 0 },
  { question: "Who wrote 'A Christmas Carol' (1843)?", choices: ["Charles Dickens", "Mark Twain", "Lewis Carroll", "Robert Louis Stevenson"], correct: 0 },
  { question: "Ebenezer Scrooge first encounters which ghost?", choices: ["Jacob Marley", "Christmas Past", "Christmas Present", "Christmas Yet to Come"], correct: 0 },
  { question: "What classic 1946 Capra film features George Bailey?", choices: ["It's a Wonderful Life", "Miracle on 34th Street", "Holiday Inn", "White Christmas"], correct: 0 },
  { question: "Who plays George Bailey?", choices: ["James Stewart", "Cary Grant", "Henry Fonda", "Gregory Peck"], correct: 0 },
  { question: "What 1947 film is set at Macy's?", choices: ["Miracle on 34th Street", "Christmas in Connecticut", "Holiday Affair", "It's a Wonderful Life"], correct: 0 },
  { question: "Who wrote 'White Christmas' (the song)?", choices: ["Irving Berlin", "Cole Porter", "Sammy Cahn", "Mel Torme"], correct: 0 },
  { question: "Bing Crosby's 'White Christmas' is one of the?", choices: ["Best-selling singles of all time", "Worst-selling", "Latest written", "Newest covers"], correct: 0 },
  { question: "Who wrote 'The Christmas Song' ('Chestnuts roasting...')?", choices: ["Mel Torme and Robert Wells", "Irving Berlin", "Cole Porter", "Sammy Cahn"], correct: 0 },
  { question: "What is the German Christmas market called?", choices: ["Christkindlmarkt / Weihnachtsmarkt", "Karneval", "Oktoberfest", "Ostermarkt"], correct: 0 },
  { question: "Where did the Christmas tree tradition primarily originate?", choices: ["Germany", "England", "Russia", "Italy"], correct: 0 },
  { question: "Who popularized the Christmas tree in Britain?", choices: ["Prince Albert (Victoria's husband)", "Queen Victoria alone", "King George III", "Charles Dickens"], correct: 0 },
  { question: "Which Christmas plant is associated with kissing?", choices: ["Mistletoe", "Holly", "Poinsettia", "Ivy"], correct: 0 },
  { question: "What red-and-green flower is named for a U.S. ambassador to Mexico?", choices: ["Poinsettia (Joel Roberts Poinsett)", "Holly", "Mistletoe", "Carnation"], correct: 0 },
  { question: "Rudolph the Red-Nosed Reindeer was created in?", choices: ["1939 (Robert L. May story for Montgomery Ward)", "1949 (song)", "1964 (TV special)", "1900"], correct: 0 },
  { question: "How many reindeer pull Santa's sleigh in 'Twas the Night Before Christmas'?", choices: ["Eight (Rudolph added later)", "Nine", "Six", "Twelve"], correct: 0 },
  { question: "Who wrote 'A Visit from St. Nicholas' ('Twas the Night Before Christmas')?", choices: ["Clement Clarke Moore (commonly attributed)", "Charles Dickens", "Henry Wadsworth Longfellow", "Edgar Allan Poe"], correct: 0 },
  { question: "What does the 'Christingle' refer to?", choices: ["An orange decorated as Christ's symbol (Moravian/Anglican tradition)", "A type of carol", "A church service", "A holly arrangement"], correct: 0 },
  { question: "Boxing Day is observed on?", choices: ["December 26", "December 25", "December 24", "December 27"], correct: 0 },
  { question: "Boxing Day is a public holiday primarily in?", choices: ["Commonwealth countries (UK, Canada, Australia, NZ)", "Just the UK", "Just USA", "All of Europe"], correct: 0 },
  { question: "Christmas Eve in many Catholic countries features?", choices: ["Midnight Mass", "Boxing Day shopping", "Hanukkah candles", "Diwali fireworks"], correct: 0 },
  { question: "Mexican Las Posadas commemorates?", choices: ["Mary and Joseph seeking shelter", "Three Kings", "Saint Nicholas", "Epiphany alone"], correct: 0 },
  { question: "Italian Christmas witch is named?", choices: ["La Befana (delivers on Epiphany)", "Saint Lucia", "Santa Maria", "La Felice"], correct: 0 },
  { question: "Sweden's December 13 saint celebration?", choices: ["Saint Lucia's Day", "Saint Nicholas", "Saint Stephen", "Saint Olaf"], correct: 0 },
  { question: "Twelfth Night refers to?", choices: ["12 days after Christmas (Epiphany Eve)", "Christmas Eve", "New Year's Eve", "Boxing Day"], correct: 0 },
  { question: "How many gifts in 'The Twelve Days of Christmas' total (cumulative)?", choices: ["364", "78", "300", "144"], correct: 0 },
  { question: "What is a 'Yule log' originally?", choices: ["A large log burned at winter solstice", "A type of cake only", "A candle", "A Christmas card"], correct: 0 },
  { question: "What 1965 animated TV special features the Peanuts gang?", choices: ["A Charlie Brown Christmas", "Frosty the Snowman", "Rudolph", "How the Grinch Stole Christmas"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChristmasQuizSettings): ChristmasQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChristmasQuizState, action: ChristmasQuizAction): ChristmasQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChristmasQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
