import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MtvMusicAwardsQuizSettings { questions: "10" | "20" | "30"; }
export interface MtvMusicAwardsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MtvMusicAwardsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The first MTV Video Music Awards were held in what year?", choices: ["1981","1984","1986","1990"], correct: 1 },
  { question: "Madonna performed 'Like a Virgin' at the 1984 VMAs in what attire?", choices: ["Cone bra","Wedding dress","Cowboy outfit","Punk leather"], correct: 1 },
  { question: "Who interrupted Taylor Swift's 2009 acceptance speech?", choices: ["Kanye West","Eminem","Lil Wayne","Russell Brand"], correct: 0 },
  { question: "Britney Spears performed with a python in what year?", choices: ["2000","2001","2002","2003"], correct: 1 },
  { question: "The Moonman trophy was renamed to what in 2017?", choices: ["Moon Person","Moon Astronaut","Moonling","Star"], correct: 0 },
  { question: "Lady Gaga wore the famous meat dress at which VMAs?", choices: ["2008","2009","2010","2011"], correct: 2 },
  { question: "Which artist holds the most VMA wins ever?", choices: ["Madonna","Beyoncé","Lady Gaga","Taylor Swift"], correct: 1 },
  { question: "The MTV VMA Vanguard Award is the equivalent of a what?", choices: ["Lifetime achievement","Best Newcomer","Critics' Choice","Fan Favorite"], correct: 0 },
  { question: "Who won the inaugural Vanguard Award (1984)?", choices: ["David Bowie","Michael Jackson","Madonna","Richard Lester"], correct: 3 },
  { question: "Eminem famously parodied Britney Spears at which VMAs?", choices: ["1999","2000","2002","2005"], correct: 1 },
  { question: "Beyoncé and Jay-Z's surprise married debut performance was in what year?", choices: ["2003","2014","2016","2018"], correct: 1 },
  { question: "Miley Cyrus and Robin Thicke's controversial duet was in?", choices: ["2012","2013","2014","2015"], correct: 1 },
  { question: "Diana Ross splashed water on whom in 2017?", choices: ["Pink","Rihanna","Mary J. Blige","Adele"], correct: 0 },
  { question: "MTV's parent network is which media company?", choices: ["Viacom/Paramount","Disney","Warner","NBC"], correct: 0 },
  { question: "Which year saw the first 'Best Latin' VMA?", choices: ["2001","2003","2018","2020"], correct: 1 },
  { question: "Justin Timberlake won Video of the Year for which song in 2007?", choices: ["What Goes Around","Cry Me a River","SexyBack","My Love"], correct: 3 },
  { question: "Which act famously performed inside a giant clear orb?", choices: ["Pink","Beyoncé","Lady Gaga","Britney Spears"], correct: 0 },
  { question: "The VMAs were held in NYC's Madison Square Garden multiple times. The first was?", choices: ["1984","1986","1989","1991"], correct: 0 },
  { question: "Who hosted the VMAs the most times?", choices: ["Chris Rock","Jimmy Fallon","Russell Brand","No host"], correct: 0 },
  { question: "Which 90s alt-rock band made fun of MTV's awards culture in their 1995 set?", choices: ["Nirvana","Pearl Jam","Rage Against the Machine","Beastie Boys"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MtvMusicAwardsQuizSettings): MtvMusicAwardsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MtvMusicAwardsQuizState, action: MtvMusicAwardsQuizAction): MtvMusicAwardsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MtvMusicAwardsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
