import { useEffect, useRef, useState } from 'react';
import c from '../content/site-content.json';
import LeadForm from './LeadForm';
import type { LeadContext } from '../lib/types';
export type ModalState = { kind:'lead'; context:LeadContext } | { kind:'project' } | { kind:'document'; path:string };
export default function Modal({ state, close, discuss }: { state: ModalState; close:()=>void; discuss:()=>void }) {
  const ref = useRef<HTMLDialogElement>(null), docOpener = useRef<HTMLElement | null>(null);
  const [subDocument,setSubDocument] = useState<string|null>(null);
  const path = subDocument || (state.kind === 'document' ? state.path : null), doc = c.legalPages.find(p=>p.path === path);
  const p = c.projects[0];
  function back() { setSubDocument(null); requestAnimationFrame(()=>docOpener.current?.focus()); }
  function openDocument(path:string) { docOpener.current = document.activeElement as HTMLElement; setSubDocument(path); }
  useEffect(()=>{const dialog=ref.current!; const previousOverflow=document.body.style.overflow; document.body.style.overflow='hidden'; dialog.showModal(); return ()=>{dialog.close();document.body.style.overflow=previousOverflow;};},[]);
  useEffect(()=>{ref.current?.scrollTo(0,0); ref.current?.querySelector<HTMLElement>('[data-doc-title]')?.focus();},[path]);
  return <dialog ref={ref} className={`modal ${state.kind==='project' ? 'project-modal' : ''}`} aria-labelledby={doc ? 'document-title' : 'modal-title'} onCancel={e=>{e.preventDefault();subDocument ? back() : close();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) close();}}}>
    <button className="modal-close" aria-label={c.ui.close} onClick={close}>×</button>
    {state.kind==='lead' && <div hidden={!!doc}><LeadForm context={state.context} openDocument={openDocument} close={close}/></div>}
    {doc && <div className="document-content"><p className="eyebrow">{c.ui.prototype}</p><h2 id="document-title" data-doc-title tabIndex={-1}>{doc.title}</h2><p>{doc.body}</p><button className="button primary" onClick={subDocument ? back : close}>{subDocument ? c.ui.back : doc.backLabel}</button></div>}
    {state.kind==='project' && !doc && <div className="project-details"><p className="eyebrow">{c.ui.projectCategory}</p><p className="demo-badge">{p.display.badge}</p><h2 id="modal-title">{p.title}</h2><p>{p.display.description}</p><h3>{p.display.detailTitle}</h3><dl>{['amount','term','yield','stage','security'].map(key=><div key={key}><dt>{key==='amount'?c.ui.amountLabel:key==='term'?c.ui.termLabel:key==='yield'?c.ui.yieldLabel:key==='stage'?c.ui.stageLabel:c.ui.securityLabel}</dt><dd>{p.display[key as keyof typeof p.display]}{key==='security' && <small>{c.ui.securityNote}</small>}</dd></div>)}</dl><p className="detail-note">{p.display.detailNote}</p><button className="button primary" onClick={discuss}>{p.contactCta.label}<span aria-hidden="true">↗</span></button></div>}
  </dialog>;
}
