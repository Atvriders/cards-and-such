import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IslandQuizSettings { questions: "10" | "20"; }
export interface IslandQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IslandQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest island in the world?", choices: ["New Guinea","Borneo","Greenland","Madagascar"], correct: 2 },
  { question: "What is the second-largest island in the world?", choices: ["Greenland","New Guinea","Borneo","Madagascar"], correct: 1 },
  { question: "What is the largest island in the Mediterranean?", choices: ["Sardinia","Cyprus","Sicily","Corsica"], correct: 2 },
  { question: "In which country is Sicily?", choices: ["Greece","Italy","Tunisia","Malta"], correct: 1 },
  { question: "What is the largest island in Africa?", choices: ["Zanzibar","Madagascar","Mauritius","Reunion"], correct: 1 },
  { question: "What is the largest island in the Caribbean?", choices: ["Hispaniola","Cuba","Jamaica","Puerto Rico"], correct: 1 },
  { question: "Which country owns Greenland?", choices: ["Norway","Denmark","Iceland","Canada"], correct: 1 },
  { question: "What three countries share the island of Borneo?", choices: ["Indonesia, Malaysia, Brunei","Philippines, Malaysia, Indonesia","Indonesia, Singapore, Brunei","Malaysia, Brunei, Thailand"], correct: 0 },
  { question: "What is the largest of Japan's main islands?", choices: ["Hokkaido","Honshu","Kyushu","Shikoku"], correct: 1 },
  { question: "What island country lies south of Florida?", choices: ["Cuba","Bahamas","Haiti","Jamaica"], correct: 0 },
  { question: "What is the largest island of the Philippines?", choices: ["Mindanao","Luzon","Visayas","Palawan"], correct: 1 },
  { question: "What is Britain's largest island?", choices: ["Ireland","Great Britain","Isle of Man","Wight"], correct: 1 },
  { question: "What is the largest island in Oceania?", choices: ["Tasmania","South Island NZ","New Guinea","North Island NZ"], correct: 2 },
  { question: "What is the only island country in Central America?", choices: ["Belize","Cuba","None","Bahamas (sometimes counted)"], correct: 2 },
  { question: "What island country is east of Madagascar?", choices: ["Comoros","Seychelles","Mauritius","Mayotte"], correct: 2 },
  { question: "What island chain is part of Spain in the Atlantic?", choices: ["Balearics","Azores","Canary Islands","Madeira"], correct: 2 },
  { question: "What island chain is Portugal's in the Atlantic?", choices: ["Canary","Madeira and Azores","Cape Verde","Faroe"], correct: 1 },
  { question: "What island country is famous for its volcanic activity and is in the North Atlantic?", choices: ["Greenland","Iceland","Faroe Islands","Norway"], correct: 1 },
  { question: "What is the largest island of Indonesia by area?", choices: ["Java","Sumatra","Borneo","Sulawesi"], correct: 2 },
  { question: "What is the most populous island in the world?", choices: ["Honshu","Java","Luzon","Great Britain"], correct: 1 },
  { question: "Which two countries share the island of Hispaniola?", choices: ["Cuba and Haiti","Dominican Republic and Haiti","Haiti and Jamaica","DR and Puerto Rico"], correct: 1 },
  { question: "What is the largest island in the Atlantic Ocean?", choices: ["Iceland","Great Britain","Cuba","Newfoundland"], correct: 1 },
  { question: "What islands does Charles Darwin visit famously off Ecuador?", choices: ["Falklands","Galapagos","Easter","San Andres"], correct: 1 },
  { question: "What is the largest island in the Indian Ocean?", choices: ["Sri Lanka","Madagascar","Borneo","Sumatra"], correct: 1 },
  { question: "What island state is the only U.S. state made up of islands?", choices: ["Alaska","Hawaii","Florida","Rhode Island"], correct: 1 },
  { question: "Which Caribbean island is also the world's third-most populous Caribbean nation?", choices: ["Jamaica","Cuba","Hispaniola","Puerto Rico"], correct: 0 },
  { question: "What island chain stretches from Russia toward Japan?", choices: ["Aleutian","Kuril","Ryukyu","Mariana"], correct: 1 },
  { question: "What is the largest island in the Pacific?", choices: ["Honshu","New Guinea","Borneo","Sumatra"], correct: 1 },
  { question: "What is the southernmost island country?", choices: ["New Zealand","Tasmania","South Georgia","South Africa (continent)"], correct: 0 },
  { question: "What is the largest of the Greek islands?", choices: ["Rhodes","Lesbos","Crete","Corfu"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: IslandQuizSettings): IslandQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: IslandQuizState, action: IslandQuizAction): IslandQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: IslandQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
