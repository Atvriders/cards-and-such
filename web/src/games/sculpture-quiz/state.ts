import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SculptureQuizSettings { questions: "10" | "20" | "30"; }
export interface SculptureQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SculptureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Michelangelo's 'David' is in?", choices: ["Rome", "Florence", "Venice", "Milan"], correct: 1 },
  { question: "Rodin's 'The Thinker' was originally part of?", choices: ["The Burghers of Calais", "The Gates of Hell", "Walking Man", "The Kiss"], correct: 1 },
  { question: "Bernini sculpted 'The Ecstasy of Saint Teresa' in which city?", choices: ["Florence", "Rome", "Naples", "Venice"], correct: 1 },
  { question: "Donatello's 'David' was the first freestanding nude bronze since?", choices: ["The fall of Rome", "The Renaissance", "Antiquity", "The Greek classical era"], correct: 2 },
  { question: "The 'Venus de Milo' is in which museum?", choices: ["Uffizi", "Louvre", "British Museum", "Met"], correct: 1 },
  { question: "The 'Pietà' (Vatican) is by?", choices: ["Donatello", "Bernini", "Michelangelo", "Verrocchio"], correct: 2 },
  { question: "Brancusi's signature is?", choices: ["Pure abstracted shapes", "Hyperrealism", "Soft sculpture", "Found-object collage"], correct: 0 },
  { question: "Alexander Calder invented which sculpture form?", choices: ["Mobiles", "Stables", "Both", "Neither"], correct: 2 },
  { question: "Henry Moore's signature subject is?", choices: ["Reclining figures", "Equestrian portraits", "Religious icons", "Animal totems"], correct: 0 },
  { question: "Giacometti's signature figures are?", choices: ["Tall and thin", "Squat and round", "Cubes and spheres", "Polychrome friezes"], correct: 0 },
  { question: "Louise Bourgeois's iconic spider is named?", choices: ["Maman", "Mater", "Madre", "Mom"], correct: 0 },
  { question: "Anish Kapoor's 'Cloud Gate' is in?", choices: ["NYC", "Chicago", "London", "Paris"], correct: 1 },
  { question: "Cloud Gate is also known as?", choices: ["The Bean", "The Egg", "The Mirror", "The Drop"], correct: 0 },
  { question: "Yayoi Kusama is famous for?", choices: ["Polka dots and infinity rooms", "Welded steel cubes", "Marble figures", "Wood reliefs"], correct: 0 },
  { question: "Richard Serra works mainly in?", choices: ["Marble", "Bronze", "Cor-Ten steel", "Ceramic"], correct: 2 },
  { question: "Jeff Koons's 'Balloon Dog' is made of?", choices: ["Mirror-polished stainless steel", "Aluminum", "Bronze", "Ceramic"], correct: 0 },
  { question: "Maya Lin designed?", choices: ["Vietnam Veterans Memorial", "Lincoln Memorial", "Statue of Liberty", "Rushmore"], correct: 0 },
  { question: "Christo and Jeanne-Claude were known for?", choices: ["Wrapping landmarks", "Bronze portraits", "Marble figures", "Found-object junk"], correct: 0 },
  { question: "Constantin Brancusi was from?", choices: ["France", "Italy", "Romania", "Hungary"], correct: 2 },
  { question: "Auguste Rodin was from?", choices: ["France", "Belgium", "Germany", "Italy"], correct: 0 },
  { question: "Eduardo Chillida was known for working in?", choices: ["Iron and granite", "Glass", "Ceramic", "Plastic"], correct: 0 },
  { question: "Antony Gormley's 'Angel of the North' is in?", choices: ["London", "Manchester", "Gateshead (UK)", "Liverpool"], correct: 2 },
  { question: "The 'Statue of Liberty' was sculpted by?", choices: ["Bartholdi", "Eiffel", "Hartman", "Saint-Gaudens"], correct: 0 },
  { question: "Mount Rushmore was carved by?", choices: ["Daniel Chester French", "Gutzon Borglum", "Augustus Saint-Gaudens", "Lorado Taft"], correct: 1 },
  { question: "Daniel Chester French sculpted the?", choices: ["Lincoln Memorial seated Lincoln", "Statue of Liberty", "Vietnam Veterans Memorial wall", "MLK Memorial"], correct: 0 },
  { question: "Eva Hesse worked primarily in?", choices: ["Marble", "Bronze", "Latex, fiberglass and rope", "Cast iron"], correct: 2 },
  { question: "Damien Hirst is famous for?", choices: ["Animals in formaldehyde", "Marble statues", "Welded steel grids", "Ceramic figurines"], correct: 0 },
  { question: "Magdalena Abakanowicz is known for?", choices: ["Burlap and bronze figure groups", "Marble statues", "Light sculptures", "Stone reliefs"], correct: 0 },
  { question: "Ron Mueck's hyperreal figures are typically?", choices: ["Larger or smaller than life", "Always life-size", "Always heroic-scale", "Always miniature"], correct: 0 },
  { question: "Olafur Eliasson is best known for?", choices: ["Light/atmosphere installations", "Stone carvings", "Bronze busts", "Marble fountains"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SculptureQuizSettings): SculptureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SculptureQuizState, action: SculptureQuizAction): SculptureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SculptureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
