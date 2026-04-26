import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface RenaissanceQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface RenaissanceQuizState { settings: RenaissanceQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type RenaissanceQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "Where did the Renaissance begin?", answer: "Italy", wrong: ["France","Germany","England"] },
  { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci", wrong: ["Michelangelo","Raphael","Botticelli"] },
  { question: "Who painted the Sistine Chapel ceiling?", answer: "Michelangelo", wrong: ["Leonardo da Vinci","Raphael","Titian"] },
  { question: "What invention by Gutenberg transformed Renaissance Europe?", answer: "Printing press", wrong: ["Telescope","Compass","Gunpowder"] },
  { question: "What was Machiavelli's famous political work called?", answer: "The Prince", wrong: ["Leviathan","Utopia","The Republic"] },
  { question: "Who was the Renaissance's great patron family in Florence?", answer: "Medici family", wrong: ["Borgia family","Sforza family","Este family"] },
  { question: "What philosophy central to the Renaissance placed humans at the center?", answer: "Humanism", wrong: ["Scholasticism","Naturalism","Empiricism"] },
  { question: "Who sculpted the famous David statue?", answer: "Michelangelo", wrong: ["Donatello","Raphael","Bernini"] },
  { question: "Which Renaissance scientist proposed the heliocentric model?", answer: "Copernicus", wrong: ["Galileo","Kepler","Brahe"] },
  { question: "What was Shakespeare's famous theater called?", answer: "The Globe Theatre", wrong: ["The Rose","The Swan","Curtain Theatre"] },
  { question: "Which Italian city-state was the center of Renaissance banking?", answer: "Florence", wrong: ["Venice","Genoa","Milan"] },
  { question: "What famous Renaissance painting shows the Last Supper?", answer: "The Last Supper by Leonardo", wrong: ["School of Athens by Raphael","Sistine Chapel by Michelangelo","Birth of Venus by Botticelli"] },
  { question: "Who wrote the Decameron, a key Renaissance literary work?", answer: "Boccaccio", wrong: ["Petrarch","Dante","Machiavelli"] },
  { question: "Which explorer funded by Spain reached the Americas in 1492?", answer: "Christopher Columbus", wrong: ["Vasco da Gama","Ferdinand Magellan","Amerigo Vespucci"] },
  { question: "What was the artistic technique of showing depth called?", answer: "Linear perspective", wrong: ["Chiaroscuro","Sfumato","Trompe-l'oeil"] },
  { question: "Who was the first to circumnavigate the globe?", answer: "Ferdinand Magellan's expedition", wrong: ["Christopher Columbus","Vasco da Gama","Francis Drake"] },
  { question: "Who wrote Romeo and Juliet?", answer: "William Shakespeare", wrong: ["Christopher Marlowe","Ben Jonson","Francis Bacon"] },
  { question: "What was the name of Erasmus's famous satirical work?", answer: "The Praise of Folly", wrong: ["Utopia","The Prince","Don Quixote"] },
  { question: "Which painter developed the sfumato technique?", answer: "Leonardo da Vinci", wrong: ["Raphael","Michelangelo","Titian"] },
  { question: "What year did Columbus reach the Americas?", answer: "1492", wrong: ["1488","1498","1500"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RenaissanceQuizSettings): RenaissanceQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: RenaissanceQuizState, action: RenaissanceQuizAction): RenaissanceQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: RenaissanceQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
