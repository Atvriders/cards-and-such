import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WinterOlympicsQuizSettings { questions: "10" | "20"; }
export interface WinterOlympicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WinterOlympicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year did the first Winter Olympics take place?", choices: ["1908", "1924", "1932", "1948"], correct: 1 },
  { question: "Where were the first Winter Olympics held?", choices: ["Chamonix, France", "Lake Placid, USA", "Oslo, Norway", "Innsbruck, Austria"], correct: 0 },
  { question: "Which city hosted the 2010 Winter Olympics?", choices: ["Turin", "Vancouver", "Sochi", "Salt Lake City"], correct: 1 },
  { question: "Where were the 2014 Winter Olympics held?", choices: ["Pyeongchang", "Sochi", "Beijing", "Vancouver"], correct: 1 },
  { question: "Which country hosted the 2018 Winter Olympics?", choices: ["Japan", "South Korea", "China", "Russia"], correct: 1 },
  { question: "Which city hosted the 2022 Winter Olympics?", choices: ["Beijing", "Tokyo", "Sapporo", "Lillehammer"], correct: 0 },
  { question: "How often are the Winter Olympics held?", choices: ["Every 2 years", "Every 4 years", "Every 5 years", "Every 6 years"], correct: 1 },
  { question: "Which Norwegian skater won 3 gold medals in 1936?", choices: ["Sonja Henie", "Bjorn Daehlie", "Johann Olav Koss", "Tore Edman"], correct: 0 },
  { question: "Which sport is featured in 'Cool Runnings' (1993 film)?", choices: ["Skating", "Bobsled", "Skiing", "Curling"], correct: 1 },
  { question: "Where will the 2026 Winter Olympics be held?", choices: ["Sapporo", "Stockholm", "Milan-Cortina", "Salt Lake City"], correct: 2 },
  { question: "Which country has won the most Winter Olympic medals overall?", choices: ["Norway", "USA", "Russia", "Germany"], correct: 0 },
  { question: "Which event is NOT in the Winter Olympics?", choices: ["Skeleton", "Biathlon", "Triathlon", "Curling"], correct: 2 },
  { question: "Where were the 1980 Winter Olympics ('Miracle on Ice')?", choices: ["Calgary", "Lake Placid", "Sapporo", "Innsbruck"], correct: 1 },
  { question: "Which country won the 'Miracle on Ice' hockey game in 1980?", choices: ["Canada", "USSR", "USA", "Sweden"], correct: 2 },
  { question: "Which figure skater won gold in 1994 amid scandal?", choices: ["Tonya Harding", "Nancy Kerrigan", "Oksana Baiul", "Michelle Kwan"], correct: 2 },
  { question: "Which biathlete is most decorated in history?", choices: ["Ole Einar Bjørndalen", "Martin Fourcade", "Magdalena Forsberg", "Raphaël Poirée"], correct: 0 },
  { question: "Where were the 1998 Winter Olympics held?", choices: ["Nagano", "Sapporo", "Lillehammer", "Albertville"], correct: 0 },
  { question: "Which sport involves sliding stones on ice?", choices: ["Curling", "Bobsled", "Luge", "Skeleton"], correct: 0 },
  { question: "Which Olympics first allowed pro hockey players?", choices: ["1992", "1994", "1998", "2002"], correct: 2 },
  { question: "Where were the 1976 Winter Olympics held?", choices: ["Innsbruck", "Sapporo", "Grenoble", "Lake Placid"], correct: 0 },
  { question: "Which speed skater won 5 golds at the 1980 Olympics?", choices: ["Eric Heiden", "Dan Jansen", "Apolo Ohno", "Johann Olav Koss"], correct: 0 },
  { question: "Where were the 2002 Winter Olympics held?", choices: ["Salt Lake City", "Turin", "Vancouver", "Calgary"], correct: 0 },
  { question: "Where were the 2006 Winter Olympics held?", choices: ["Turin", "Vancouver", "Sochi", "Nagano"], correct: 0 },
  { question: "Which event combines skiing and shooting?", choices: ["Biathlon", "Skeleton", "Nordic combined", "Pentathlon"], correct: 0 },
  { question: "Where were the 1988 Winter Olympics held?", choices: ["Calgary", "Albertville", "Lillehammer", "Sarajevo"], correct: 0 },
  { question: "Which figure skater landed the first quad axel in competition?", choices: ["Yuzuru Hanyu", "Nathan Chen", "Ilia Malinin", "Patrick Chan"], correct: 2 },
  { question: "Which country dominated cross-country skiing historically?", choices: ["Sweden", "Norway", "Finland", "Russia"], correct: 1 },
  { question: "Which sport features a single rider going head-first down a track?", choices: ["Luge", "Skeleton", "Bobsled", "Snowboard cross"], correct: 1 },
  { question: "Which Winter Olympics was the first held in Asia?", choices: ["Sapporo 1972", "Nagano 1998", "Pyeongchang 2018", "Beijing 2022"], correct: 0 },
  { question: "Which snowboarder is known for the X Games and Olympic golds halfpipe?", choices: ["Shaun White", "Travis Rice", "Chloe Kim", "Ayumu Hirano"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WinterOlympicsQuizSettings): WinterOlympicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WinterOlympicsQuizState, action: WinterOlympicsQuizAction): WinterOlympicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WinterOlympicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
