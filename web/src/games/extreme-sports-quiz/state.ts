import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ExtremeSportsQuizSettings { questions: "10" | "20" | "30"; }
export interface ExtremeSportsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ExtremeSportsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "BASE in BASE jumping stands for?", choices: ["Building, Antenna, Span, Earth", "Base, Air, Speed, Edge", "Bridge, Air, Sky, Earth", "Boats, Anchors, Sky, Earth"], correct: 0 },
  { question: "Wingsuit jumping is most similar to?", choices: ["Skydiving", "Hang gliding", "Both", "Neither"], correct: 2 },
  { question: "Free solo climbing means?", choices: ["No partner", "No ropes/protection", "Indoor", "On ice"], correct: 1 },
  { question: "Documentary 'Free Solo' featured?", choices: ["Honnold", "Caldwell", "Croft", "Hill"], correct: 0 },
  { question: "Honnold's iconic free solo route on?", choices: ["The Nose", "Freerider (El Cap)", "Half Dome", "Triple Direct"], correct: 1 },
  { question: "BMX & skate halfpipe pioneer?", choices: ["Tony Hawk", "Travis Pastrana", "Bob Burnquist", "Mat Hoffman"], correct: 0 },
  { question: "First documented 900 in skating by?", choices: ["Tony Hawk", "Hoffman", "Macdonald", "Margera"], correct: 0 },
  { question: "Big-wave surfing spot Nazar\u00e9 is in?", choices: ["Spain", "Portugal", "Brazil", "Hawaii"], correct: 1 },
  { question: "Biggest big-wave hub in Hawaii?", choices: ["Pipeline", "Jaws/Pe'ahi", "Waikiki", "Honolulu"], correct: 1 },
  { question: "Highline is balancing on?", choices: ["Rope", "Slackline at height", "Wire", "Plank"], correct: 1 },
  { question: "Speed flying combines?", choices: ["Skiing & paragliding", "Skydive & glide", "Surfing & wing", "Skate & rail"], correct: 0 },
  { question: "Ice climbing tools are called?", choices: ["Picks", "Ice axes", "Crampons (feet)", "All of these"], correct: 3 },
  { question: "Bouldering grade scale (V-scale) max common difficulty?", choices: ["V5", "V10", "V17", "V25"], correct: 2 },
  { question: "First V17 ascent claimed by?", choices: ["Sharma", "Megos", "Ondra", "Schubert"], correct: 1 },
  { question: "Cliff diving World Series highest platforms (approx)?", choices: ["~10 m", "~27 m", "~40 m", "~60 m"], correct: 1 },
  { question: "Largest extreme sports event?", choices: ["X Games", "Olympics", "Tour de France", "World Cup"], correct: 0 },
  { question: "First X Games held in?", choices: ["1985", "1995", "2005", "2015"], correct: 1 },
  { question: "Sport: down-snowy-slope at high speed on board?", choices: ["Snowboarding", "Skiing", "Both", "Neither"], correct: 0 },
  { question: "'Big-mountain freeride' is mainly which sport?", choices: ["Surfing", "Skiing/snowboarding", "Cycling", "Climbing"], correct: 1 },
  { question: "Iditarod is a race using?", choices: ["Sled dogs", "Reindeer", "Horses", "Drones"], correct: 0 },
  { question: "Iditarod is in which US state?", choices: ["Alaska", "Wyoming", "Montana", "Maine"], correct: 0 },
  { question: "Tour Divide bike race spans?", choices: ["100 km", "1,000 km", "~4,400 km", "~10,000 km"], correct: 2 },
  { question: "Volcano boarding is on?", choices: ["Ash slopes", "Lava", "Magma", "Glacier"], correct: 0 },
  { question: "Volcano boarding hub: Cerro Negro is in?", choices: ["Nicaragua", "Costa Rica", "Mexico", "Colombia"], correct: 0 },
  { question: "Parkour was developed primarily in?", choices: ["UK", "France", "USA", "Brazil"], correct: 1 },
  { question: "'Run, jump, climb' founder of parkour?", choices: ["David Belle", "S\u00e9bastien Foucan", "Both", "Neither"], correct: 2 },
  { question: "Drop-in skateboard ramp is called?", choices: ["Halfpipe", "Vert ramp", "Both", "Neither"], correct: 2 },
  { question: "Largest cliff jump (free-fall) record over?", choices: ["10 m", "30 m", "58 m", "80 m"], correct: 2 },
  { question: "Wingsuit BASE jump fatality rate is?", choices: ["Very low", "Roughly 0.05%/jump", "Roughly 0% if trained", "Higher than tandem"], correct: 1 },
  { question: "Most important rule of all extreme sports?", choices: ["Speed", "Risk management & training", "Audience", "Music"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ExtremeSportsQuizSettings): ExtremeSportsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ExtremeSportsQuizState, action: ExtremeSportsQuizAction): ExtremeSportsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ExtremeSportsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
