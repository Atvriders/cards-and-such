import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpaceVehiclesQuizSettings { questions: "10" | "20" | "30"; }
export interface SpaceVehiclesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpaceVehiclesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was the first artificial satellite?", choices: ["Sputnik 1", "Explorer 1", "Vanguard 1", "Telstar"], correct: 0 },
  { question: "Sputnik 1 was launched in what year?", choices: ["1957", "1955", "1961", "1959"], correct: 0 },
  { question: "Who was the first human in space?", choices: ["Yuri Gagarin", "Alan Shepard", "John Glenn", "Neil Armstrong"], correct: 0 },
  { question: "Gagarin flew in which spacecraft?", choices: ["Vostok 1", "Voskhod 1", "Soyuz 1", "Mercury"], correct: 0 },
  { question: "Apollo 11 landed on the Moon in?", choices: ["July 1969", "July 1968", "July 1970", "July 1971"], correct: 0 },
  { question: "Who was the first to step on the Moon?", choices: ["Neil Armstrong", "Buzz Aldrin", "Michael Collins", "Pete Conrad"], correct: 0 },
  { question: "How many manned Moon landings (Apollo) occurred?", choices: ["6", "5", "7", "4"], correct: 0 },
  { question: "What was the U.S.'s first crewed spacecraft program?", choices: ["Mercury", "Gemini", "Apollo", "Skylab"], correct: 0 },
  { question: "What rocket launched Apollo missions to the Moon?", choices: ["Saturn V", "Atlas", "Titan", "Saturn IB"], correct: 0 },
  { question: "Saturn V designer Wernher von Braun previously worked on?", choices: ["German V-2 rockets", "British Spitfire", "Russian R-7", "American Atlas"], correct: 0 },
  { question: "Space Shuttle's first orbital flight?", choices: ["1981 (STS-1, Columbia)", "1979", "1985", "1975"], correct: 0 },
  { question: "How many Space Shuttle orbiters were built (operational)?", choices: ["5 (Columbia, Challenger, Discovery, Atlantis, Endeavour)", "4", "6", "3"], correct: 0 },
  { question: "Challenger disaster occurred in?", choices: ["1986", "1984", "1988", "1990"], correct: 0 },
  { question: "Columbia disaster occurred in?", choices: ["2003", "2001", "2005", "1999"], correct: 0 },
  { question: "When did the Space Shuttle program end?", choices: ["2011", "2008", "2013", "2010"], correct: 0 },
  { question: "International Space Station was first launched in?", choices: ["1998", "1995", "2000", "2005"], correct: 0 },
  { question: "How many countries collaborate on the ISS primarily?", choices: ["5 (USA, Russia, ESA member states, Japan, Canada)", "3", "10", "15"], correct: 0 },
  { question: "Who founded SpaceX?", choices: ["Elon Musk (2002)", "Jeff Bezos", "Richard Branson", "Burt Rutan"], correct: 0 },
  { question: "SpaceX's reusable orbital rocket?", choices: ["Falcon 9", "Atlas V", "Antares", "Delta IV"], correct: 0 },
  { question: "SpaceX's massive next-gen rocket?", choices: ["Starship/Super Heavy", "Falcon Heavy", "BFR Mark 1", "Big Falcon"], correct: 0 },
  { question: "Who founded Blue Origin?", choices: ["Jeff Bezos", "Elon Musk", "Richard Branson", "Paul Allen"], correct: 0 },
  { question: "Blue Origin's suborbital tourist rocket?", choices: ["New Shepard", "New Glenn", "BE-4", "Blue Moon"], correct: 0 },
  { question: "Voyager 1 was launched in?", choices: ["1977", "1972", "1980", "1969"], correct: 0 },
  { question: "Voyager 1 is now in?", choices: ["Interstellar space", "Heliosphere only", "Asteroid belt", "Kuiper belt only"], correct: 0 },
  { question: "What rover landed on Mars in 2021?", choices: ["Perseverance", "Curiosity", "Spirit", "Opportunity"], correct: 0 },
  { question: "Curiosity rover landed in?", choices: ["2012", "2009", "2015", "2018"], correct: 0 },
  { question: "Hubble Space Telescope launched in?", choices: ["1990", "1985", "1995", "1980"], correct: 0 },
  { question: "James Webb Space Telescope launched in?", choices: ["2021", "2018", "2023", "2019"], correct: 0 },
  { question: "First space station in orbit?", choices: ["Salyut 1 (1971)", "Skylab", "Mir", "ISS"], correct: 0 },
  { question: "Mir space station deorbited in?", choices: ["2001", "1995", "2005", "1999"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpaceVehiclesQuizSettings): SpaceVehiclesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpaceVehiclesQuizState, action: SpaceVehiclesQuizAction): SpaceVehiclesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpaceVehiclesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
