import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NationalParksQuizSettings { questions: "10" | "20"; }
export interface NationalParksQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NationalParksQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was the world's first national park?", choices: ["Yosemite","Yellowstone","Grand Canyon","Sequoia"], correct: 1 },
  { question: "In which year was Yellowstone established?", choices: ["1832","1872","1892","1916"], correct: 1 },
  { question: "In which states is Yellowstone primarily located?", choices: ["Wyoming, Montana, Idaho","Colorado, Utah","Montana only","Wyoming only"], correct: 0 },
  { question: "What national park contains El Capitan and Half Dome?", choices: ["Sequoia","Yosemite","Kings Canyon","Lassen Volcanic"], correct: 1 },
  { question: "In which U.S. state is Grand Canyon National Park?", choices: ["Utah","Nevada","Arizona","New Mexico"], correct: 2 },
  { question: "What national park is near Estes Park, Colorado?", choices: ["Mesa Verde","Rocky Mountain","Great Sand Dunes","Black Canyon"], correct: 1 },
  { question: "What is the most-visited U.S. national park?", choices: ["Yellowstone","Grand Canyon","Great Smoky Mountains","Yosemite"], correct: 2 },
  { question: "In which states is Great Smoky Mountains National Park?", choices: ["NC and TN","TN and KY","VA and NC","GA and TN"], correct: 0 },
  { question: "What national park lies between California and Nevada containing the lowest point in North America?", choices: ["Joshua Tree","Death Valley","Mojave","Channel Islands"], correct: 1 },
  { question: "In which national park can you see Old Faithful?", choices: ["Yosemite","Yellowstone","Glacier","Grand Teton"], correct: 1 },
  { question: "What is the largest U.S. national park?", choices: ["Yellowstone","Wrangell-St. Elias","Death Valley","Denali"], correct: 1 },
  { question: "In which country is Banff National Park?", choices: ["United States","Canada","Mexico","Scotland"], correct: 1 },
  { question: "What Tanzanian national park hosts the Great Migration?", choices: ["Serengeti","Kilimanjaro","Tarangire","Ngorongoro"], correct: 0 },
  { question: "What South African national park is the largest game reserve?", choices: ["Kruger","Addo Elephant","Karoo","Mountain Zebra"], correct: 0 },
  { question: "What national park in Argentina contains the Perito Moreno glacier?", choices: ["Iguazu","Los Glaciares","Tierra del Fuego","Nahuel Huapi"], correct: 1 },
  { question: "What U.S. national park has stone arches in Utah?", choices: ["Bryce","Zion","Arches","Canyonlands"], correct: 2 },
  { question: "What U.S. national park has hoodoos in Utah?", choices: ["Bryce Canyon","Arches","Canyonlands","Capitol Reef"], correct: 0 },
  { question: "What Maine national park covers Mount Desert Island?", choices: ["Acadia","Baxter","Cadillac","Katahdin"], correct: 0 },
  { question: "What Florida national park is the largest tropical wilderness in the US?", choices: ["Biscayne","Everglades","Dry Tortugas","Big Cypress"], correct: 1 },
  { question: "What Hawaii national park has active volcanoes?", choices: ["Haleakala","Hawai'i Volcanoes","Both","Kilauea"], correct: 2 },
  { question: "What U.S. national park has Denali, North America's highest peak?", choices: ["Glacier Bay","Wrangell-St. Elias","Denali","Katmai"], correct: 2 },
  { question: "What national park crosses the U.S.-Canada border at Glacier?", choices: ["Glacier Bay","Waterton-Glacier","International Peace","International Falls"], correct: 1 },
  { question: "What national park in Kenya is famous for safari wildlife?", choices: ["Maasai Mara","Tsavo","Amboseli","All are reserves/parks"], correct: 3 },
  { question: "What South American park has Machu Picchu nearby?", choices: ["Manu","Huascaran","Iguazu","Machu Picchu Sanctuary"], correct: 3 },
  { question: "What's the oldest national park in Africa?", choices: ["Virunga","Serengeti","Kruger","Etosha"], correct: 0 },
  { question: "What U.S. park near Tucson is famous for cacti?", choices: ["Joshua Tree","Saguaro","Big Bend","Carlsbad Caverns"], correct: 1 },
  { question: "What Norwegian national park contains UNESCO fjords?", choices: ["Jotunheimen","Hardangervidda","Geirangerfjord","All include fjords"], correct: 2 },
  { question: "What's the highest national park in Africa near Mount Kilimanjaro?", choices: ["Kilimanjaro NP","Tsavo","Mount Kenya","Bwindi"], correct: 0 },
  { question: "What U.S. state has the most national parks?", choices: ["Alaska","California","Utah","Colorado"], correct: 1 },
  { question: "What Indian national park is famous for Bengal tigers?", choices: ["Ranthambore","Kanha","Bandhavgarh","All are tiger reserves"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NationalParksQuizSettings): NationalParksQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NationalParksQuizState, action: NationalParksQuizAction): NationalParksQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NationalParksQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
