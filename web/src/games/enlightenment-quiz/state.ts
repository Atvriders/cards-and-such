import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface EnlightenmentQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface EnlightenmentQuizState { settings: EnlightenmentQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type EnlightenmentQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "What era of thought emphasized reason and science over tradition?", answer: "The Enlightenment", wrong: ["The Renaissance","The Reformation","The Scientific Revolution"] },
  { question: "Who wrote the Social Contract?", answer: "Jean-Jacques Rousseau", wrong: ["John Locke","Voltaire","Montesquieu"] },
  { question: "Who proposed the separation of powers in government?", answer: "Montesquieu", wrong: ["Rousseau","Locke","Voltaire"] },
  { question: "Who wrote Two Treatises of Government influencing democracy?", answer: "John Locke", wrong: ["Thomas Hobbes","Montesquieu","Rousseau"] },
  { question: "Who wrote Candide, satirizing blind optimism?", answer: "Voltaire", wrong: ["Rousseau","Diderot","d'Alembert"] },
  { question: "What monumental reference work was produced in France?", answer: "The Encyclopédie", wrong: ["The Principia","The Wealth of Nations","The Spirit of Laws"] },
  { question: "Who wrote Leviathan, arguing for a strong central authority?", answer: "Thomas Hobbes", wrong: ["John Locke","Rousseau","Montesquieu"] },
  { question: "Which Enlightenment thinker wrote the Wealth of Nations?", answer: "Adam Smith", wrong: ["David Hume","Immanuel Kant","Francis Bacon"] },
  { question: "What did John Locke say were natural rights?", answer: "Life, liberty, and property", wrong: ["Life, liberty, and happiness","Liberty, equality, fraternity","Life, liberty, and safety"] },
  { question: "Which scientist's work inspired the Enlightenment's faith in reason?", answer: "Isaac Newton", wrong: ["Francis Bacon","René Descartes","Galileo Galilei"] },
  { question: "What Enlightenment idea shaped the American Declaration of Independence?", answer: "Natural rights and social contract", wrong: ["Divine right of kings","Manifest destiny","Mercantilism"] },
  { question: "Who was the philosopher known for 'I think therefore I am'?", answer: "René Descartes", wrong: ["Francis Bacon","Immanuel Kant","John Locke"] },
  { question: "Which German philosopher wrote the Critique of Pure Reason?", answer: "Immanuel Kant", wrong: ["Hegel","Leibniz","Schopenhauer"] },
  { question: "The Enlightenment is also known as the 'Age of' what?", answer: "Reason", wrong: ["Exploration","Revolution","Reformation"] },
  { question: "Who published the first edition of the Encyclopédie in France?", answer: "Denis Diderot", wrong: ["Voltaire","Rousseau","Montesquieu"] },
  { question: "What Scottish philosopher is known for his work on morality and sentiments?", answer: "David Hume", wrong: ["Adam Smith","Francis Hutcheson","Thomas Reid"] },
  { question: "Which revolution was most directly inspired by Enlightenment ideas?", answer: "French Revolution", wrong: ["Industrial Revolution","American Revolution only","Glorious Revolution"] },
  { question: "Who argued the state of nature was 'solitary, poor, nasty, brutish, and short'?", answer: "Thomas Hobbes", wrong: ["Rousseau","Locke","Voltaire"] },
  { question: "What was Rousseau's view of the natural state of humans?", answer: "Naturally good, corrupted by society", wrong: ["Naturally evil","Naturally rational","Naturally selfish"] },
  { question: "Which Enlightenment concept underpins modern democracy?", answer: "Popular sovereignty", wrong: ["Divine right","Aristocracy","Theocracy"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EnlightenmentQuizSettings): EnlightenmentQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: EnlightenmentQuizState, action: EnlightenmentQuizAction): EnlightenmentQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: EnlightenmentQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
