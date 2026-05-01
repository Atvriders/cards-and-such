import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NflLegendsQuizSettings { questions: "10" | "20" | "30"; }
export interface NflLegendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NflLegendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who's the NFL's all-time leading passer?", choices: ["Tom Brady","Drew Brees","Peyton Manning","Brett Favre"], correct: 0 },
  { question: "How many Super Bowl wins does Tom Brady have?", choices: ["7","6","5","8"], correct: 0 },
  { question: "Who's regarded as the GOAT QB?", choices: ["Tom Brady","Joe Montana","Peyton Manning","Multiple candidates"], correct: 0 },
  { question: "Who held the single-season passing TD record before Brady (50)?", choices: ["Peyton Manning (55)","Tom Brady","Both","Mahomes"], correct: 0 },
  { question: "Who's the NFL's all-time leading rusher?", choices: ["Emmitt Smith","Walter Payton","Barry Sanders","Adrian Peterson"], correct: 0 },
  { question: "Who's known as Sweetness?", choices: ["Walter Payton","Barry Sanders","Jim Brown","Just Payton"], correct: 2 },
  { question: "What team did Joe Montana win Super Bowls with?", choices: ["49ers","Chiefs","Both","Just 49ers"], correct: 2 },
  { question: "How many Super Bowls did Montana win?", choices: ["4","3","5","2"], correct: 0 },
  { question: "Who's Jerry Rice's team primarily?", choices: ["49ers","Raiders","Both","Just 49ers"], correct: 2 },
  { question: "What position did Jerry Rice play?", choices: ["Wide receiver","Running back","TE","QB"], correct: 0 },
  { question: "How many TD receptions does Jerry Rice have (most all-time)?", choices: ["~197","~150","~120","~250"], correct: 0 },
  { question: "Who's the NFL's career sacks leader?", choices: ["Bruce Smith","Reggie White","Both close","Deacon Jones"], correct: 0 },
  { question: "What position did Lawrence Taylor play?", choices: ["Linebacker","Defensive end","Both","Just LB"], correct: 2 },
  { question: "What team did Lawrence Taylor play for?", choices: ["NY Giants","Eagles","Cowboys","49ers"], correct: 0 },
  { question: "Who's known as Mean Joe Greene?", choices: ["Steelers DT","Just DL","Both","Just lineman"], correct: 2 },
  { question: "What team did Mean Joe play for?", choices: ["Pittsburgh Steelers","Cowboys","Bears","49ers"], correct: 0 },
  { question: "How many Super Bowls have the Steelers won?", choices: ["6","5","7","4"], correct: 0 },
  { question: "Who's the Patriots' head coach during their dynasty?", choices: ["Bill Belichick","Tom Coughlin","Andy Reid","Mike Tomlin"], correct: 0 },
  { question: "Who's the Cowboys' all-time leading rusher?", choices: ["Emmitt Smith","Tony Dorsett","Both Hall of Fame","Just Smith"], correct: 0 },
  { question: "What team did Brett Favre play most for?", choices: ["Green Bay Packers","Vikings","Jets","All three"], correct: 0 },
  { question: "Who's known as The Bus?", choices: ["Jerome Bettis","Eddie George","Just Bettis","Both"], correct: 0 },
  { question: "Who's known as Megatron?", choices: ["Calvin Johnson","Andre Johnson","Antonio Brown","Larry Fitzgerald"], correct: 0 },
  { question: "Who's Lawrence Taylor's defensive coordinator famously?", choices: ["Bill Parcells (head coach)","Just LT","Both Parcells and Bill Belichick","Multiple"], correct: 2 },
  { question: "What's the NFL's iconic team Cowboys nickname?", choices: ["America's Team","Just Cowboys","Both","Big D"], correct: 2 },
  { question: "Who's known as Prime Time?", choices: ["Deion Sanders","Charles Woodson","Just Deion","Both"], correct: 0 },
  { question: "What position did Deion Sanders play primarily?", choices: ["Cornerback","Receiver also","Both","Just CB"], correct: 2 },
  { question: "How many MVPs did Peyton Manning win?", choices: ["5","4","3","6"], correct: 0 },
  { question: "Who's Jim Brown?", choices: ["Browns RB legend","Just RB","Both","Star of 50s-60s"], correct: 2 },
  { question: "How many years did Jim Brown play?", choices: ["9","12","10","15"], correct: 0 },
  { question: "Who's Dan Marino?", choices: ["Dolphins QB legend","Hall of Fame","Both","Just QB"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NflLegendsQuizSettings): NflLegendsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NflLegendsQuizState, action: NflLegendsQuizAction): NflLegendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NflLegendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
