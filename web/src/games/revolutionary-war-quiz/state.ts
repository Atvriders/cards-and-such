import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RevolutionaryWarQuizSettings { questions: "10" | "20" | "30"; }
export interface RevolutionaryWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RevolutionaryWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year did the American Revolutionary War begin?", choices: ["1773","1775","1776","1778"], correct: 1 },
  { question: "What battle is considered the first of the Revolutionary War?", choices: ["Bunker Hill","Lexington and Concord","Trenton","Saratoga"], correct: 1 },
  { question: "In what year was the Declaration of Independence signed?", choices: ["1773","1775","1776","1781"], correct: 2 },
  { question: "Who was the primary author of the Declaration of Independence?", choices: ["John Adams","Benjamin Franklin","Thomas Jefferson","George Washington"], correct: 2 },
  { question: "Who was the British general who surrendered at Yorktown?", choices: ["William Howe","Charles Cornwallis","John Burgoyne","Henry Clinton"], correct: 1 },
  { question: "What treaty ended the war in 1783?", choices: ["Treaty of Paris","Treaty of Versailles","Treaty of Ghent","Jay Treaty"], correct: 0 },
  { question: "What battle is considered the war's turning point?", choices: ["Bunker Hill","Saratoga","Trenton","Yorktown"], correct: 1 },
  { question: "What country allied with America to defeat the British?", choices: ["Spain","France","Netherlands","All of these"], correct: 3 },
  { question: "Who delivered the Give me liberty or give me death speech?", choices: ["Patrick Henry","Samuel Adams","John Hancock","Thomas Paine"], correct: 0 },
  { question: "What pamphlet by Thomas Paine spurred independence sentiment?", choices: ["Common Sense","The Federalist","Rights of Man","The Crisis"], correct: 0 },
  { question: "What 1773 protest occurred over British tea duties?", choices: ["Stamp Act","Boston Tea Party","Intolerable Acts","Townshend"], correct: 1 },
  { question: "What was the colonial militia's nickname for fast assembly?", choices: ["Minutemen","Sons of Liberty","Continentals","Patriots"], correct: 0 },
  { question: "Who famously rode to warn the British were coming?", choices: ["Paul Revere","William Dawes","Samuel Prescott","All three"], correct: 3 },
  { question: "What was Washington's primary winter encampment 1777-78?", choices: ["Morristown","Valley Forge","Cambridge","Trenton"], correct: 1 },
  { question: "What German troops fought for Britain?", choices: ["Bavarians","Hessians","Prussians","Austrians"], correct: 1 },
  { question: "What Continental Congress declared independence?", choices: ["First","Second","Third","Stamp Act"], correct: 1 },
  { question: "What French nobleman became a major general for America at age 19?", choices: ["Rochambeau","Lafayette","de Grasse","de Kalb"], correct: 1 },
  { question: "Who was the first commander-in-chief of the Continental Army?", choices: ["Israel Putnam","George Washington","Henry Knox","Nathanael Greene"], correct: 1 },
  { question: "Whose ship was the Bonhomme Richard?", choices: ["John Paul Jones","John Barry","Esek Hopkins","Joshua Barney"], correct: 0 },
  { question: "What 1775 battle saw heavy British casualties on Boston's hills?", choices: ["Long Island","Bunker Hill","Brandywine","Princeton"], correct: 1 },
  { question: "What night attack on Christmas 1776 captured Hessian troops?", choices: ["Trenton","Princeton","Saratoga","Brandywine"], correct: 0 },
  { question: "What general defected to the British?", choices: ["Charles Lee","Benedict Arnold","Horatio Gates","Anthony Wayne"], correct: 1 },
  { question: "What was Britain's last major loss site in 1781?", choices: ["Charleston","Savannah","Yorktown","Camden"], correct: 2 },
  { question: "What did the Stamp Act tax?", choices: ["Tea","Paper documents","Glass","Sugar"], correct: 1 },
  { question: "What bill of rights followed the Constitution?", choices: ["First Ten Amendments","Magna Carta","Articles of Confederation","Northwest Ordinance"], correct: 0 },
  { question: "What body governed the U.S. before the Constitution?", choices: ["Continental Congress under Articles of Confederation","Senate","Crown","British Parliament"], correct: 0 },
  { question: "Who shouted 'I have not yet begun to fight!'?", choices: ["John Paul Jones","Esek Hopkins","Nicholas Biddle","Joshua Barney"], correct: 0 },
  { question: "What weapon was famous for accuracy among American sharpshooters?", choices: ["Brown Bess","Pennsylvania rifle","Charleville","Blunderbuss"], correct: 1 },
  { question: "Where did Cornwallis surrender?", choices: ["Yorktown","Camden","Charleston","Boston"], correct: 0 },
  { question: "What political faction supported the British?", choices: ["Patriots","Loyalists","Whigs","Federalists"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RevolutionaryWarQuizSettings): RevolutionaryWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RevolutionaryWarQuizState, action: RevolutionaryWarQuizAction): RevolutionaryWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RevolutionaryWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
