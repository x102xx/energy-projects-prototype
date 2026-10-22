import { useEffect, useRef, useState } from 'react';
import c from './content/site-content.json';
import { trackEvent } from './lib/analytics';
import type { LeadType, Placement } from './lib/types';
import { Header, Hero, Offer, Process, Sectors, ProjectShowcase, Economics, Controls, About, FAQ, Footer } from './components/Sections';
import Modal from './components/Modal';
import type { ModalState } from './components/Modal';
export default function App() {
  const [modal,setModal] = useState<ModalState|null>(null), opener = useRef<HTMLElement|null>(null);
  useEffect(()=>{document.title = `${c.brand.name} — инвестиции в реальные активы`;trackEvent('page_view');},[]);
  function rememberOpener(){if(!modal) opener.current=document.activeElement as HTMLElement;}
  function openLead(leadType:LeadType,placement:Placement,projectId:string|null=null){rememberOpener();const context={leadType,placement,projectId};trackEvent('cta_click',context);trackEvent('form_open',context);setModal({kind:'lead',context});}
  function openProject(){rememberOpener();trackEvent('project_open',{projectId:c.projects[0].id});setModal({kind:'project'});}
  function openDocument(path:string){rememberOpener();setModal({kind:'document',path});}
  function close(){setModal(null);requestAnimationFrame(()=>opener.current?.focus({preventScroll:true}));}
  return <><a className="skip-link" href="#main">{c.ui.skip}</a><Header openLead={openLead}/><main id="main"><Hero openLead={openLead}/><Offer/><Process/><Sectors/><ProjectShowcase openLead={openLead} openProject={openProject}/><Economics/><Controls/><About/><FAQ/></main><Footer openLead={openLead} openDocument={openDocument}/>{modal && <Modal state={modal} close={close} discuss={()=>openLead('investor','project',c.projects[0].id)}/>}</>;
}
