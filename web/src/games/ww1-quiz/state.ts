import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Ww1QuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface Ww1QuizState { settings: Ww1QuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type Ww1QuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "When did World War I begin?", answer: "1914", wrong: ["1912","1916","1910"] },
  { question: "What event triggered the start of WWI?", answer: "Assassination of Archduke Franz Ferdinand", wrong: ["Sinking of the Lusitania","Germany invaded Belgium","Russia mobilized army"] },
  { question: "Where was Archduke Franz Ferdinand assassinated?", answer: "Sarajevo", wrong: ["Vienna","Belgrade","Budapest"] },
  { question: "What were the Allied Powers in WWI called?", answer: "Triple Entente", wrong: ["Triple Alliance","Allies","Central Powers"] },
  { question: "What new weapon was first used on a large scale in WWI?", answer: "Poison gas", wrong: ["Tank","Airplane","Submarine"] },
  { question: "What was the famous stalemate in WWI characterized by?", answer: "Trench warfare", wrong: ["Aerial bombing","Naval blockade","Mobile warfare"] },
  { question: "Which treaty ended WWI?", answer: "Treaty of Versailles", wrong: ["Treaty of Brest-Litovsk","Treaty of Saint-Germain","Armistice of Compiègne"] },
  { question: "What year did WWI end?", answer: "1918", wrong: ["1917","1919","1920"] },
  { question: "Which country left WWI after a revolution?", answer: "Russia", wrong: ["Austria-Hungary","Ottoman Empire","Bulgaria"] },
  { question: "What was the famous battle on the Somme in 1916 known for?", answer: "Enormous casualties in one day", wrong: ["First use of tanks","Gas attacks","Trench collapse"] },
  { question: "Who led Germany during WWI?", answer: "Kaiser Wilhelm II", wrong: ["Adolf Hitler","Otto von Bismarck","Franz Joseph I"] },
  { question: "What was the alliance between Germany, Austria-Hungary, and Italy called?", answer: "Triple Alliance", wrong: ["Central Powers","Triple Entente","Axis Powers"] },
  { question: "Which British ocean liner was sunk by Germany in 1915?", answer: "Lusitania", wrong: ["Titanic","Britannic","Olympic"] },
  { question: "What was the famous British recruitment poster slogan?", answer: "Your Country Needs YOU", wrong: ["Over There","Make the World Safe","Fight for King and Country"] },
  { question: "Which front saw the most fighting on land in WWI?", answer: "Western Front", wrong: ["Eastern Front","Italian Front","Gallipoli Front"] },
  { question: "When did the US enter WWI?", answer: "1917", wrong: ["1914","1915","1916"] },
  { question: "What was the failed Allied campaign against Ottoman Turkey?", answer: "Gallipoli Campaign", wrong: ["Dardanelles only","Sinai Campaign","Mesopotamia Campaign"] },
  { question: "Which country joined the Allies in 1915 after switching sides?", answer: "Italy", wrong: ["Bulgaria","Romania","Greece"] },
  { question: "What aircraft was first used for reconnaissance in WWI?", answer: "Biplane", wrong: ["Zeppelin","Triplane","Monoplane"] },
  { question: "What famous espionage code was broken during WWI?", answer: "Zimmermann Telegram", wrong: ["Enigma code","Purple code","Red code"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Ww1QuizSettings): Ww1QuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: Ww1QuizState, action: Ww1QuizAction): Ww1QuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: Ww1QuizState): { score: number } | null { return state.done?{score:state.score}:null; }
