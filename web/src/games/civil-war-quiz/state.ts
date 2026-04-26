import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface CivilWarQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface CivilWarQuizState { settings: CivilWarQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type CivilWarQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "When did the American Civil War begin?", answer: "1861", wrong: ["1860","1862","1859"] },
  { question: "Who was the President of the Confederate States?", answer: "Jefferson Davis", wrong: ["Robert E. Lee","Stonewall Jackson","P.G.T. Beauregard"] },
  { question: "What document freed enslaved people in rebel states?", answer: "Emancipation Proclamation", wrong: ["Declaration of Independence","13th Amendment","Missouri Compromise"] },
  { question: "What was the deadliest battle of the Civil War?", answer: "Battle of Gettysburg", wrong: ["Battle of Antietam","Battle of Bull Run","Battle of Chickamauga"] },
  { question: "Who commanded the Union armies at the end of the war?", answer: "Ulysses S. Grant", wrong: ["William T. Sherman","George McClellan","Winfield Scott"] },
  { question: "Where did Lee surrender to Grant?", answer: "Appomattox Court House", wrong: ["Richmond","Petersburg","Vicksburg"] },
  { question: "What Confederate general was called 'Stonewall'?", answer: "Thomas Jackson", wrong: ["James Longstreet","Jubal Early","A.P. Hill"] },
  { question: "What year did the Civil War end?", answer: "1865", wrong: ["1864","1866","1863"] },
  { question: "What ship battle was the first between ironclad warships?", answer: "Monitor vs. Virginia", wrong: ["Merrimack vs. Congress","Hartford vs. Tennessee","Cairo vs. Arkansas"] },
  { question: "What was Sherman's famous campaign through the South?", answer: "March to the Sea", wrong: ["Anaconda Plan","Peninsula Campaign","Valley Campaign"] },
  { question: "Which side did Abraham Lincoln lead?", answer: "Union (North)", wrong: ["Confederacy (South)","Border states","Neither — he was neutral"] },
  { question: "What was the first major battle of the Civil War?", answer: "First Battle of Bull Run", wrong: ["Battle of Fort Sumter","Battle of Shiloh","Battle of Antietam"] },
  { question: "Which amendment abolished slavery after the war?", answer: "13th Amendment", wrong: ["14th Amendment","15th Amendment","12th Amendment"] },
  { question: "What was the Confederate capital?", answer: "Richmond, Virginia", wrong: ["Atlanta","Montgomery","Nashville"] },
  { question: "Who was the Union general who captured Atlanta?", answer: "William T. Sherman", wrong: ["Ulysses Grant","Philip Sheridan","George Thomas"] },
  { question: "What naval strategy did the Union use to blockade the South?", answer: "Anaconda Plan", wrong: ["Scorched Earth","Peninsula Campaign","March to the Sea"] },
  { question: "Who assassinated Lincoln?", answer: "John Wilkes Booth", wrong: ["Charles Guiteau","Leon Czolgosz","James Wilkes"] },
  { question: "What was the bloodiest single day of the Civil War?", answer: "Battle of Antietam", wrong: ["Battle of Gettysburg","Battle of Shiloh","Battle of Chickamauga"] },
  { question: "Which state was the last to be readmitted to the Union after the war?", answer: "Georgia", wrong: ["Mississippi","Texas","South Carolina"] },
  { question: "What famous address did Lincoln give at a cemetery dedication?", answer: "Gettysburg Address", wrong: ["Emancipation Proclamation","Second Inaugural Address","Farewell Address"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CivilWarQuizSettings): CivilWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: CivilWarQuizState, action: CivilWarQuizAction): CivilWarQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: CivilWarQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
