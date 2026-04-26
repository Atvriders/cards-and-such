import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface IndustrialRevolutionQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface IndustrialRevolutionQuizState { settings: IndustrialRevolutionQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type IndustrialRevolutionQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "Where did the Industrial Revolution begin?", answer: "Great Britain", wrong: ["France","Germany","United States"] },
  { question: "Who invented the steam engine improvements that powered industry?", answer: "James Watt", wrong: ["Thomas Newcomen","George Stephenson","Eli Whitney"] },
  { question: "What invention revolutionized textile production?", answer: "Spinning jenny", wrong: ["Steam engine","Power loom only","Cotton gin"] },
  { question: "What invention by Eli Whitney transformed cotton production in the US?", answer: "Cotton gin", wrong: ["Spinning jenny","Power loom","Spinning mule"] },
  { question: "Who developed the first practical steam-powered locomotive?", answer: "George Stephenson", wrong: ["James Watt","Richard Trevithick","Robert Fulton"] },
  { question: "What was the first steam-powered locomotive railway line called?", answer: "Stockton and Darlington Railway", wrong: ["Liverpool and Manchester","Great Western Railway","London to Birmingham"] },
  { question: "What was the shift from rural to urban life called during industrialization?", answer: "Urbanization", wrong: ["Industrialization","Migration","Enclosure"] },
  { question: "Who wrote about the poor conditions of industrial workers in the Communist Manifesto?", answer: "Karl Marx and Friedrich Engels", wrong: ["Adam Smith","Charles Dickens","Robert Owen"] },
  { question: "What was the factory system characterized by?", answer: "Mass production with machinery", wrong: ["Cottage industry","Guilds","Artisan crafts"] },
  { question: "What was the dominant energy source of the early Industrial Revolution?", answer: "Coal and steam", wrong: ["Oil","Electricity","Water only"] },
  { question: "What invention by Alexander Graham Bell transformed communication?", answer: "Telephone", wrong: ["Telegraph","Radio","Phonograph"] },
  { question: "Which inventor developed the practical incandescent light bulb?", answer: "Thomas Edison", wrong: ["Nikola Tesla","Joseph Swan","Michael Faraday"] },
  { question: "What process did Henry Bessemer invent that revolutionized steel?", answer: "Bessemer process", wrong: ["Open-hearth furnace","Puddling process","Crucible steel"] },
  { question: "What was the name of the first practical steamboat service?", answer: "Clermont (Robert Fulton)", wrong: ["Savannah","Great Western","Enterprise"] },
  { question: "What movement arose to protect workers' rights during industrialization?", answer: "Labor union movement", wrong: ["Luddite movement","Chartist movement","Enclosure movement"] },
  { question: "Who were the Luddites?", answer: "Workers who destroyed machinery", wrong: ["Factory owners","Union organizers","Child workers"] },
  { question: "What was the main fuel that powered the early Industrial Revolution?", answer: "Coal", wrong: ["Wood","Oil","Natural gas"] },
  { question: "Which country industrialized most rapidly after Britain in the 1800s?", answer: "Germany", wrong: ["France","United States","Belgium"] },
  { question: "What major health problem grew from industrial city crowding?", answer: "Cholera and disease outbreaks", wrong: ["Scurvy","Tuberculosis only","Influenza only"] },
  { question: "What social class grew most significantly during industrialization?", answer: "Middle class (bourgeoisie)", wrong: ["Aristocracy","Peasantry","Clergy"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: IndustrialRevolutionQuizSettings): IndustrialRevolutionQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: IndustrialRevolutionQuizState, action: IndustrialRevolutionQuizAction): IndustrialRevolutionQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: IndustrialRevolutionQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
