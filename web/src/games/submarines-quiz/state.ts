import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SubmarinesQuizSettings { questions: "10" | "20" | "30"; }
export interface SubmarinesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SubmarinesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who built the first successful military submarine (1775)?", choices: ["David Bushnell (Turtle)", "Robert Fulton", "Cornelius Drebbel", "John Holland"], correct: 0 },
  { question: "What was Bushnell's submarine called?", choices: ["Turtle", "Nautilus", "Hunley", "Argonaut"], correct: 0 },
  { question: "What Confederate submarine sank a Union ship in 1864?", choices: ["H.L. Hunley", "CSS Virginia", "USS Monitor", "USS Holland"], correct: 0 },
  { question: "Hunley sank which Union vessel?", choices: ["USS Housatonic", "USS Cumberland", "USS Congress", "USS Monitor"], correct: 0 },
  { question: "Who is considered the father of modern submarine design?", choices: ["John Philip Holland", "Robert Fulton", "Cornelius Drebbel", "Simon Lake"], correct: 0 },
  { question: "USS Holland (SS-1) commissioned in?", choices: ["1900", "1895", "1905", "1910"], correct: 0 },
  { question: "What was the first nuclear-powered submarine?", choices: ["USS Nautilus (SSN-571)", "USS Seawolf", "USS Skipjack", "HMS Dreadnought"], correct: 0 },
  { question: "USS Nautilus was launched in?", choices: ["1954", "1950", "1958", "1960"], correct: 0 },
  { question: "Who is the 'father of the nuclear navy'?", choices: ["Hyman Rickover", "Arleigh Burke", "Chester Nimitz", "Ernest King"], correct: 0 },
  { question: "What nuclear sub class is the largest in U.S. inventory?", choices: ["Ohio-class (SSBN)", "Virginia", "Seawolf", "Los Angeles"], correct: 0 },
  { question: "How many Trident missiles can an Ohio-class SSBN carry?", choices: ["Up to 24 (now reduced to 20)", "10", "16", "32"], correct: 0 },
  { question: "Russian Typhoon-class submarines are?", choices: ["The largest submarines ever built", "Smallest", "Fastest only", "Hovering subs"], correct: 0 },
  { question: "Russia's Typhoon-class displacement?", choices: ["About 48,000 tons submerged", "20,000 tons", "70,000 tons", "10,000 tons"], correct: 0 },
  { question: "WWII most successful U-boat commander?", choices: ["Otto Kretschmer", "Karl Doenitz", "Reinhard Hardegen", "Erich Topp"], correct: 0 },
  { question: "Who commanded the German U-boat fleet in WWII?", choices: ["Karl Doenitz", "Erich Raeder", "Wilhelm Canaris", "Hermann Goering"], correct: 0 },
  { question: "U-boat is short for?", choices: ["Unterseeboot (undersea boat)", "Underwater boat", "Universal boat", "Unbreakable boat"], correct: 0 },
  { question: "Which sub film stars Jurgen Prochnow as a U-boat captain?", choices: ["Das Boot", "U-571", "Crimson Tide", "Hunt for Red October"], correct: 0 },
  { question: "What sub thriller features Sean Connery as a Soviet captain?", choices: ["The Hunt for Red October", "Crimson Tide", "Down Periscope", "K-19"], correct: 0 },
  { question: "K-19: The Widowmaker is based on a real?", choices: ["Soviet sub reactor accident", "WWII U-boat", "American ballistic sub mishap", "British Polaris failure"], correct: 0 },
  { question: "What is a 'boomer' in submarine slang?", choices: ["Ballistic missile sub", "Attack sub", "Coastal sub", "Diesel sub"], correct: 0 },
  { question: "What is an SSN?", choices: ["Nuclear-powered attack submarine", "Diesel sub", "Ballistic missile sub", "Surface ship"], correct: 0 },
  { question: "What does SSBN stand for?", choices: ["Ship, Submersible, Ballistic, Nuclear", "Sub-surface Ballistic Nuclear", "Strategic Sub Ballistic Nuclear", "Special Strike Ballistic Nuclear"], correct: 0 },
  { question: "USS Thresher disaster year?", choices: ["1963", "1968", "1958", "1972"], correct: 0 },
  { question: "Kursk submarine disaster year?", choices: ["2000", "1995", "2005", "2003"], correct: 0 },
  { question: "Kursk was which class?", choices: ["Oscar II-class (Project 949A)", "Typhoon", "Akula", "Yasen"], correct: 0 },
  { question: "Polaris missile was carried by?", choices: ["Early US (and UK Resolution-class) SSBNs", "Trident only", "Tomahawk subs only", "Diesel boats"], correct: 0 },
  { question: "First sub to circumnavigate underwater (1960)?", choices: ["USS Triton", "USS Nautilus", "USS Seawolf", "USS Skipjack"], correct: 0 },
  { question: "USS Nautilus famously crossed under?", choices: ["The North Pole (1958)", "Antarctica", "Cape Horn", "Equator"], correct: 0 },
  { question: "Virginia-class is the newest US?", choices: ["Attack submarine class", "Boomer class", "Coastal sub", "Research sub"], correct: 0 },
  { question: "Royal Navy's nuclear submarine base is at?", choices: ["Faslane (HMNB Clyde)", "Portsmouth", "Devonport", "Gibraltar"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SubmarinesQuizSettings): SubmarinesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SubmarinesQuizState, action: SubmarinesQuizAction): SubmarinesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SubmarinesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
