import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PolarQuizSettings { questions: "10" | "20" | "30"; }
export interface PolarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PolarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Northernmost point on Earth?", choices: ["North Pole", "Greenland", "Svalbard", "Alert"], correct: 0 },
  { question: "Southernmost point on Earth?", choices: ["McMurdo", "South Pole", "Vinson", "Ross"], correct: 1 },
  { question: "Continent at the South Pole?", choices: ["Antarctica", "South America", "Australia", "None"], correct: 0 },
  { question: "North Pole sits on?", choices: ["Land", "Sea ice over Arctic Ocean", "Tundra", "Glacier"], correct: 1 },
  { question: "Antarctica is mostly?", choices: ["Forest", "Ice cap", "Desert sand", "Tundra"], correct: 1 },
  { question: "Antarctica's average ice thickness?", choices: ["~100 m", "~1,900 m", "~5,000 m", "~10,000 m"], correct: 1 },
  { question: "Which is colder on average?", choices: ["North Pole", "South Pole", "Equal", "Depends only on season"], correct: 1 },
  { question: "Coldest temperature ever recorded on Earth?", choices: ["-50 \u00b0C", "-89.2 \u00b0C", "-100 \u00b0C", "-150 \u00b0C"], correct: 1 },
  { question: "Site of that coldest record?", choices: ["Vostok Station", "McMurdo", "Alert", "Eureka"], correct: 0 },
  { question: "First confirmed expedition to South Pole (1911)?", choices: ["Scott", "Amundsen", "Shackleton", "Mawson"], correct: 1 },
  { question: "Amundsen's nationality?", choices: ["British", "Norwegian", "Swedish", "Danish"], correct: 1 },
  { question: "Tragic British expedition led by?", choices: ["Scott", "Shackleton", "Ross", "Cook"], correct: 0 },
  { question: "Shackleton's ship in 1914 Endurance expedition?", choices: ["Discovery", "Endurance", "Terra Nova", "Beagle"], correct: 1 },
  { question: "Shackleton's ship sank because of?", choices: ["Storm", "Crushed by ice", "Fire", "Reef"], correct: 1 },
  { question: "First flight over North Pole credited to?", choices: ["Byrd", "Lindbergh", "Earhart", "Peary"], correct: 0 },
  { question: "Russian icebreaker reached North Pole first by ship in?", choices: ["1977", "1990", "2000", "2010"], correct: 0 },
  { question: "Year Antarctic Treaty signed?", choices: ["1949", "1959", "1969", "1989"], correct: 1 },
  { question: "Antarctic Treaty bans?", choices: ["Tourism", "Military activity", "Research", "Penguins"], correct: 1 },
  { question: "Largest desert on Earth?", choices: ["Sahara", "Antarctica", "Gobi", "Atacama"], correct: 1 },
  { question: "Penguins are found at the?", choices: ["North Pole", "South Pole", "Both", "Neither"], correct: 1 },
  { question: "Polar bears live at the?", choices: ["North Pole", "South Pole", "Both", "Neither"], correct: 0 },
  { question: "Aurora at the North Pole is called?", choices: ["Borealis", "Australis", "Polaris", "Solaris"], correct: 0 },
  { question: "Aurora at the South Pole is called?", choices: ["Borealis", "Australis", "Polaris", "Solaris"], correct: 1 },
  { question: "Magnetic North vs True North differ?", choices: ["No", "Yes", "Only at equator", "Only on Tuesdays"], correct: 1 },
  { question: "Sun behavior at poles in winter?", choices: ["Polar day", "Polar night", "Eclipse", "Normal"], correct: 1 },
  { question: "Inuit term 'iglu' means?", choices: ["Hunt", "House", "Bear", "Snow"], correct: 1 },
  { question: "Sastrugi are?", choices: ["Wind-carved snow ridges", "Sled dogs", "Snowshoes", "Crampons"], correct: 0 },
  { question: "Crevasses are?", choices: ["Cracks in glaciers", "Mountain peaks", "Frozen lakes", "Salt flats"], correct: 0 },
  { question: "Largest research base on Antarctica?", choices: ["McMurdo", "Vostok", "Amundsen-Scott", "Concordia"], correct: 0 },
  { question: "Number of countries that have year-round Antarctic stations (approx)?", choices: ["5", "20", "30", "100"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PolarQuizSettings): PolarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PolarQuizState, action: PolarQuizAction): PolarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PolarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
