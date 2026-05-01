import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TennisGreatsQuizSettings { questions: "10" | "20" | "30"; }
export interface TennisGreatsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TennisGreatsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who has the most men's Grand Slam titles?", choices: ["Novak Djokovic","Rafael Nadal","Roger Federer","All close (Big Three)"], correct: 0 },
  { question: "How many Grand Slams has Djokovic won?", choices: ["24+","20","22","18"], correct: 0 },
  { question: "How many Grand Slams has Nadal won?", choices: ["22","20","18","24"], correct: 0 },
  { question: "How many Grand Slams has Federer won?", choices: ["20","19","21","18"], correct: 0 },
  { question: "Who's known as the King of Clay?", choices: ["Rafael Nadal","Just Nadal","Both","Bjorn Borg"], correct: 0 },
  { question: "How many French Open titles has Nadal won?", choices: ["14","13","15","12"], correct: 0 },
  { question: "Who has the most women's Grand Slams?", choices: ["Margaret Court (24)","Serena Williams (23)","Just Court (incl pre-Open era)","Both"], correct: 3 },
  { question: "How many Grand Slams has Serena Williams won?", choices: ["23","20","25","18"], correct: 0 },
  { question: "Who's Steffi Graf?", choices: ["German tennis legend","22 Slams","Both","Just German"], correct: 2 },
  { question: "What's a calendar Slam?", choices: ["Winning all 4 Slams in one calendar year","Just one slam","Both","Just achievement"], correct: 2 },
  { question: "Who's the only player to win calendar Slam in Open era (women)?", choices: ["Steffi Graf (1988 + Olympic Gold)","Margaret Court","Both","Just Graf 88"], correct: 0 },
  { question: "What's the four Grand Slam tournaments?", choices: ["Australian, French, Wimbledon, US Open","Just Wimbledon","Both","Just four"], correct: 2 },
  { question: "What's Wimbledon's surface?", choices: ["Grass","Clay","Hard","Carpet"], correct: 0 },
  { question: "What's French Open's surface?", choices: ["Clay","Grass","Hard","Carpet"], correct: 0 },
  { question: "What's Australian Open and US Open's surface?", choices: ["Hard","Grass","Clay","Just Hard - both"], correct: 3 },
  { question: "Who's Bjorn Borg?", choices: ["Swedish legend, 11 Slams","Just Swede","Both","Just Borg"], correct: 2 },
  { question: "Who's John McEnroe?", choices: ["American legend, 7 Slams","Just American","Both","Just American"], correct: 2 },
  { question: "Who's Pete Sampras?", choices: ["American with 14 Slams","Just American","Both","Just Pete"], correct: 2 },
  { question: "Who's Andre Agassi?", choices: ["American with 8 Slams","Career Slam","Both","Just Andre"], correct: 2 },
  { question: "What's a career Grand Slam?", choices: ["Winning all 4 in career","Just achievement","Both","Just career"], correct: 2 },
  { question: "Who's Martina Navratilova?", choices: ["Czech-American legend","18 Slams","Both","Just Czech"], correct: 2 },
  { question: "Who's Chris Evert?", choices: ["American legend with 18 Slams","Just American","Both","Rival of Navratilova"], correct: 2 },
  { question: "What did Billie Jean King do?", choices: ["Champion and women's rights pioneer","Just champion","Both","Just rights"], correct: 2 },
  { question: "What's the Battle of the Sexes (1973)?", choices: ["BJK vs Bobby Riggs","Just match","Both","Just exhibition"], correct: 2 },
  { question: "Who was Australian Open women's GOAT considered?", choices: ["Margaret Court","Serena","Both","Just Court"], correct: 0 },
  { question: "What's Wimbledon's traditional dress code?", choices: ["All white","Just colors","Both","Various colors"], correct: 0 },
  { question: "What's a tiebreaker?", choices: ["First to 7 (with 2 lead)","Just tiebreaker","Both","Just rule"], correct: 2 },
  { question: "What's an ace in tennis?", choices: ["Unreturned serve","Just point","Both","Just serve"], correct: 2 },
  { question: "How many sets to win Grand Slam men's match?", choices: ["Best of 5","Best of 3","Both formats","Just 5"], correct: 0 },
  { question: "How many sets to win women's Grand Slam match?", choices: ["Best of 3","Best of 5","Both","Just 3"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TennisGreatsQuizSettings): TennisGreatsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TennisGreatsQuizState, action: TennisGreatsQuizAction): TennisGreatsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TennisGreatsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
