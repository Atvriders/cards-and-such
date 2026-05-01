import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrainsQuizSettings { questions: "10" | "20" | "30"; }
export interface TrainsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrainsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who built the first commercial steam locomotive 'Locomotion No. 1' (1825)?", choices: ["George Stephenson", "Richard Trevithick", "James Watt", "Isambard Brunel"], correct: 0 },
  { question: "What was the first public railway with steam traction?", choices: ["Stockton & Darlington Railway (1825)", "Liverpool & Manchester (1830)", "Great Western", "Baltimore & Ohio"], correct: 0 },
  { question: "Stephenson's famous Rocket locomotive won which contest?", choices: ["Rainhill Trials (1829)", "Great Exhibition", "World's Fair", "Manchester Race"], correct: 0 },
  { question: "What gauge is 'standard gauge' worldwide?", choices: ["4 ft 8.5 in", "5 ft 0 in", "3 ft 6 in", "1 m"], correct: 0 },
  { question: "What is the world's longest railway?", choices: ["Trans-Siberian Railway", "China-Tibet", "Indian Pacific", "Cross-Canada"], correct: 0 },
  { question: "Trans-Siberian Railway length?", choices: ["About 9,289 km", "About 5,000 km", "About 12,000 km", "About 7,000 km"], correct: 0 },
  { question: "What was the first transcontinental railroad in the U.S. completed?", choices: ["1869", "1860", "1875", "1880"], correct: 0 },
  { question: "Where was the golden spike driven?", choices: ["Promontory Summit, Utah", "Sacramento", "Omaha", "Salt Lake City"], correct: 0 },
  { question: "What is the first underground rail system in the world?", choices: ["London Underground (1863)", "Paris Metro", "New York Subway", "Berlin U-Bahn"], correct: 0 },
  { question: "What year did Japan launch the Shinkansen?", choices: ["1964", "1970", "1958", "1980"], correct: 0 },
  { question: "What is the world's fastest commercial train (production)?", choices: ["Shanghai Maglev (~431 km/h)", "TGV", "Shinkansen", "ICE"], correct: 0 },
  { question: "TGV stands for?", choices: ["Train à Grande Vitesse", "Transit Grand Voiture", "Train Grand Voyage", "Train Galaxy Vector"], correct: 0 },
  { question: "The Orient Express ran between?", choices: ["Paris and Constantinople (Istanbul)", "London and Paris", "Berlin and Moscow", "Vienna and Athens"], correct: 0 },
  { question: "What gauge is Russia's railway system?", choices: ["1520 mm (Russian gauge)", "Standard gauge", "Cape gauge", "Indian gauge"], correct: 0 },
  { question: "Who founded the Pullman sleeper car company?", choices: ["George Pullman", "Cornelius Vanderbilt", "Jay Gould", "Henry Flagler"], correct: 0 },
  { question: "What is the longest tunnel for a train?", choices: ["Gotthard Base Tunnel (~57 km)", "Channel Tunnel", "Seikan Tunnel", "Lötschberg"], correct: 0 },
  { question: "Channel Tunnel connects which countries?", choices: ["UK and France", "France and Belgium", "UK and Belgium", "France and Spain"], correct: 0 },
  { question: "Channel Tunnel opened in?", choices: ["1994", "1990", "2000", "1985"], correct: 0 },
  { question: "Eurostar runs between?", choices: ["London and continental Europe (Paris/Brussels/Amsterdam)", "Paris and Berlin", "Madrid and Rome", "Milan and Vienna"], correct: 0 },
  { question: "What is a 'Maglev' train?", choices: ["Magnetic levitation train", "Magnetic-level train", "Manual gearbox", "Mass transit"], correct: 0 },
  { question: "Amtrak was created in?", choices: ["1971", "1965", "1980", "1955"], correct: 0 },
  { question: "What is BART (San Francisco)?", choices: ["Bay Area Rapid Transit", "Bay Area Regional Train", "Bay Area Railway", "Bay Area Rail Transit"], correct: 0 },
  { question: "Indian Railways is among the world's?", choices: ["Largest employers", "Smallest networks", "Most automated", "Newest systems"], correct: 0 },
  { question: "What is Britain's most famous steam locomotive built 1934?", choices: ["Flying Scotsman", "Mallard", "City of Truro", "Rocket"], correct: 0 },
  { question: "Mallard set what speed record in 1938?", choices: ["126 mph (203 km/h) for steam", "100 mph", "150 mph", "120 mph"], correct: 0 },
  { question: "Brunel's Great Western Railway used what gauge originally?", choices: ["Broad gauge (7 ft 0.25 in)", "Standard gauge", "Narrow gauge", "Russian gauge"], correct: 0 },
  { question: "Who is the 'Father of Railways'?", choices: ["George Stephenson", "Richard Trevithick", "Isambard Brunel", "James Watt"], correct: 0 },
  { question: "What is a 'cog railway' for?", choices: ["Steep mountain ascents", "Underwater tunnels", "Desert", "Arctic"], correct: 0 },
  { question: "Mount Washington Cog Railway in NH opened in?", choices: ["1869", "1850", "1880", "1900"], correct: 0 },
  { question: "What is 'high-speed rail' minimum speed (UIC definition)?", choices: ["250 km/h on new lines / 200 km/h on upgraded", "300 km/h", "200 km/h flat", "150 km/h"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TrainsQuizSettings): TrainsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrainsQuizState, action: TrainsQuizAction): TrainsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrainsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
