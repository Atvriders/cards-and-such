import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GolfGreatsQuizSettings { questions: "10" | "20" | "30"; }
export interface GolfGreatsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GolfGreatsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who has the most major championships?", choices: ["Jack Nicklaus (18)","Tiger Woods (15)","Just Nicklaus","Both"], correct: 0 },
  { question: "How many majors does Jack Nicklaus have?", choices: ["18","15","20","17"], correct: 0 },
  { question: "How many majors does Tiger Woods have?", choices: ["15","14","18","12"], correct: 0 },
  { question: "What are the four major golf tournaments?", choices: ["Masters, US Open, Open Championship, PGA Championship","Just four","Both","Different list"], correct: 2 },
  { question: "What golf tournament is held at Augusta?", choices: ["The Masters","Just Masters","Both","Annual"], correct: 2 },
  { question: "What's the prize for The Masters winner?", choices: ["Green Jacket","Trophy and money","Both - jacket iconic","Just jacket"], correct: 2 },
  { question: "In what year did Tiger win his first Masters?", choices: ["1997","2000","1996","1998"], correct: 0 },
  { question: "How many Masters has Tiger won?", choices: ["5","4","6","3"], correct: 0 },
  { question: "Who's known as Arnie?", choices: ["Arnold Palmer","Just Arnold Palmer","Both","Sam Snead"], correct: 0 },
  { question: "Who's the Golden Bear?", choices: ["Jack Nicklaus","Just Nicklaus","Both","Different golfer"], correct: 2 },
  { question: "Who's known as the King?", choices: ["Arnold Palmer","Just Palmer","Both","Multiple"], correct: 0 },
  { question: "Who's Phil Mickelson?", choices: ["Lefty","6 majors","Both","Just Phil"], correct: 2 },
  { question: "How many majors does Phil have?", choices: ["6","5","7","4"], correct: 0 },
  { question: "Who's Rory McIlroy?", choices: ["Northern Irish star","4 majors","Both","Just Rory"], correct: 2 },
  { question: "Who's Jordan Spieth?", choices: ["American star with 3 majors (so far)","Just American","Both","Just three"], correct: 2 },
  { question: "What's the Ryder Cup?", choices: ["US vs Europe team event","Just team golf","Both","Just biennial"], correct: 2 },
  { question: "How often is the Ryder Cup?", choices: ["Every 2 years","Every year","Every 4 years","Every 3 years"], correct: 0 },
  { question: "What's a Grand Slam in golf?", choices: ["Winning all 4 majors in career","Just career achievement","Both","Just slam"], correct: 2 },
  { question: "Who's the only golfer to win all 4 majors before age 25?", choices: ["Tiger Woods","Just Tiger","Both","Different golfer"], correct: 2 },
  { question: "What's a hole-in-one called?", choices: ["Ace","Just ace","Both","Single shot"], correct: 2 },
  { question: "What's an eagle?", choices: ["2 under par on a hole","Just under par","Both","Hole achievement"], correct: 2 },
  { question: "What's a birdie?", choices: ["1 under par on a hole","Just under par","Both","Hole achievement"], correct: 2 },
  { question: "What's a bogey?", choices: ["1 over par","Just over par","Both","Just over"], correct: 2 },
  { question: "What's a double bogey?", choices: ["2 over par","Just two over","Both","Just two"], correct: 2 },
  { question: "What's par typically per hole?", choices: ["3, 4, or 5","Just 4","Both","Various"], correct: 2 },
  { question: "How many holes in a standard course?", choices: ["18","9 or 18","Both","Just 18"], correct: 2 },
  { question: "What's the iconic Open Championship trophy?", choices: ["Claret Jug","Wanamaker","Both Open and PGA","Just Claret"], correct: 0 },
  { question: "What's the PGA Championship trophy?", choices: ["Wanamaker Trophy","Claret Jug","Both","Just Wanamaker"], correct: 0 },
  { question: "What's the US Open trophy?", choices: ["US Open Trophy","Wanamaker","Both","Just US Open"], correct: 0 },
  { question: "Who's the LPGA Tour for?", choices: ["Women professional golfers","Just women","Both","Tour"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GolfGreatsQuizSettings): GolfGreatsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GolfGreatsQuizState, action: GolfGreatsQuizAction): GolfGreatsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GolfGreatsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
