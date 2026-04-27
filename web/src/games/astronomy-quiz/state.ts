import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AstronomyQuizSettings { questions: "10" | "20" | "30"; }
export interface AstronomyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AstronomyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which planet is closest to the Sun?", choices: ["Venus", "Earth", "Mercury", "Mars"], correct: 2 },
  { question: "How many planets are in our solar system?", choices: ["7", "8", "9", "10"], correct: 1 },
  { question: "What is the largest planet in our solar system?", choices: ["Saturn", "Jupiter", "Neptune", "Uranus"], correct: 1 },
  { question: "Which galaxy do we live in?", choices: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], correct: 1 },
  { question: "What star is at the center of our solar system?", choices: ["Proxima Centauri", "Sirius", "The Sun", "Polaris"], correct: 2 },
  { question: "Who first proposed a heliocentric model?", choices: ["Galileo", "Copernicus", "Kepler", "Newton"], correct: 1 },
  { question: "What is the name of Saturn's largest moon?", choices: ["Europa", "Titan", "Ganymede", "Callisto"], correct: 1 },
  { question: "What spacecraft first landed humans on the Moon?", choices: ["Apollo 8", "Apollo 11", "Apollo 13", "Gemini 4"], correct: 1 },
  { question: "What year did Neil Armstrong walk on the Moon?", choices: ["1965", "1969", "1972", "1975"], correct: 1 },
  { question: "What is a light-year a measure of?", choices: ["Time", "Distance", "Brightness", "Mass"], correct: 1 },
  { question: "What is the closest star to Earth other than the Sun?", choices: ["Sirius", "Alpha Centauri A", "Proxima Centauri", "Barnard's Star"], correct: 2 },
  { question: "What is a black hole's event horizon?", choices: ["Its core", "The point of no return", "Its outer ring", "Its companion star"], correct: 1 },
  { question: "Which planet has the most moons (as of recent count)?", choices: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1 },
  { question: "What is the name of NASA's most famous space telescope launched in 1990?", choices: ["Spitzer", "Kepler", "Hubble", "Webb"], correct: 2 },
  { question: "What launched in 2021 as Hubble's successor?", choices: ["Kepler Telescope", "James Webb Space Telescope", "Chandra", "Gaia"], correct: 1 },
  { question: "What dwarf planet was reclassified from a planet in 2006?", choices: ["Ceres", "Eris", "Pluto", "Haumea"], correct: 2 },
  { question: "What is the Great Red Spot?", choices: ["A Mars feature", "A Jupiter storm", "A Venus crater", "A solar feature"], correct: 1 },
  { question: "Which planet is known as the 'Red Planet'?", choices: ["Venus", "Jupiter", "Mars", "Mercury"], correct: 2 },
  { question: "What galaxy is closest to the Milky Way?", choices: ["Triangulum", "Andromeda", "Whirlpool", "Sombrero"], correct: 1 },
  { question: "How long does light take from the Sun to Earth?", choices: ["8 seconds", "8 minutes", "8 hours", "8 days"], correct: 1 },
  { question: "What was the first artificial satellite?", choices: ["Explorer 1", "Sputnik 1", "Vanguard", "Telstar"], correct: 1 },
  { question: "Who proved planets orbit in ellipses?", choices: ["Newton", "Kepler", "Galileo", "Brahe"], correct: 1 },
  { question: "What is the asteroid belt located between?", choices: ["Earth and Mars", "Mars and Jupiter", "Jupiter and Saturn", "Venus and Earth"], correct: 1 },
  { question: "Which mission first landed on Mars (1976)?", choices: ["Mariner 4", "Viking 1", "Pathfinder", "Curiosity"], correct: 1 },
  { question: "Which planet rotates on its side?", choices: ["Neptune", "Uranus", "Saturn", "Pluto"], correct: 1 },
  { question: "What is a supernova?", choices: ["A young star", "An exploding star", "A binary system", "A black hole"], correct: 1 },
  { question: "Which constellation contains the Big Dipper?", choices: ["Ursa Major", "Orion", "Cassiopeia", "Leo"], correct: 0 },
  { question: "What spacecraft orbited Saturn from 2004-2017?", choices: ["Juno", "Cassini", "Galileo", "New Horizons"], correct: 1 },
  { question: "What flew past Pluto in 2015?", choices: ["Voyager 2", "New Horizons", "Cassini", "Juno"], correct: 1 },
  { question: "What is dark matter?", choices: ["Visible matter", "Unknown invisible matter", "Black holes", "Neutron stars"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AstronomyQuizSettings): AstronomyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AstronomyQuizState, action: AstronomyQuizAction): AstronomyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AstronomyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
