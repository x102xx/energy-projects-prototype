import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import c from '../content/site-content.json';
import { initialValues, validate } from '../lib/validation';
import { attribution, trackEvent } from '../lib/analytics';
import { submitLead } from '../lib/leadService';
import type { Errors, FormValues, LeadContext, LeadPayload } from '../lib/types';
import { Arrow } from './Sections';
type Status = 'initial' | 'editing' | 'validation_error' | 'submitting' | 'demo_success' | 'error';
export default function LeadForm({ context, openDocument, close }: { context: LeadContext; openDocument: (path: string) => void; close: () => void }) {
  const [values, setValues] = useState<FormValues>({ ...initialValues });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('initial');
  const formRef = useRef<HTMLFormElement>(null), controller = useRef<AbortController | null>(null), pending = useRef(false);
  const mockErrorConsumed = useRef(false);
  const common = c.forms.common, investor = context.leadType === 'investor', text = investor ? c.forms.investor : c.forms.projectOwner;
  useEffect(() => () => { controller.current?.abort(); }, []);
  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues(v => ({ ...v, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setStatus('editing');
  }
  function blur(key: keyof FormValues) { const message = validate(values, context.leadType)[key]; setErrors(e => ({ ...e, [key]: message })); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    const next = validate(values, context.leadType); setErrors(next);
    if (Object.keys(next).length) {
      setStatus('validation_error');
      Object.keys(next).forEach(field => trackEvent('form_error', { ...context, field }));
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const payload: LeadPayload = { ...context, name: values.name.trim(), contactMethod: values.contactMethod, contact: values.contactMethod === 'phone' ? values.contact.replace(/\D/g,'') : values.contact.trim(), company: values.company.trim() || null, comment: values.comment.trim() || null, intendedAmountRub: investor && values.amount ? Number(values.amount) : null, projectDetails: investor ? null : { name: values.projectName.trim(), region: values.region.trim(), direction: values.direction, stage: values.stage.trim(), description: values.projectDescription.trim() }, consentAccepted: values.consent, consentDocumentVersion: 'demo-draft', attribution };
    controller.current = new AbortController();
    pending.current = true; setStatus('submitting');
    try {
      const mockError = import.meta.env.DEV && import.meta.env.VITE_DEMO_MOCK_ERROR_ONCE === 'true' && !mockErrorConsumed.current;
      mockErrorConsumed.current = true;
      const result = await submitLead(payload, { signal: controller.current.signal, mockError });
      if (result.status === 'demo_success') { setStatus('demo_success'); setValues({ ...initialValues }); trackEvent('demo_submit_success', context); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('error');
    } finally { pending.current = false; }
  }
  function field(key: Exclude<keyof FormValues, 'consent' | 'contactMethod' | 'direction'>, label: string, options: { required?: boolean; placeholder?: string; type?: string; multiline?: boolean; maxLength?: number; hint?: string; autoComplete?: string } = {}) {
    const id = `lead-${key}`, description = [errors[key] && `${id}-error`, options.hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
    const shared = { id, name: key, value: values[key], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key,e.target.value), onBlur: () => blur(key), 'aria-required': options.required || undefined, 'aria-invalid': !!errors[key], 'aria-describedby': description, placeholder: options.placeholder, maxLength: options.maxLength, autoComplete: options.autoComplete };
    return <div className="field"><label htmlFor={id}>{label}{options.required ? <span aria-hidden="true"> *</span> : <small> · {c.ui.optional}</small>}</label>{options.multiline ? <textarea {...shared} rows={3}/> : <input {...shared} type={options.type || 'text'} inputMode={key === 'contact' ? values.contactMethod === 'phone' ? 'tel' : 'email' : key === 'amount' ? 'decimal' : undefined}/ >}{options.hint && <p className="field-hint" id={`${id}-hint`}>{options.hint}</p>}{errors[key] && <p className="field-error" id={`${id}-error`}>{errors[key]}</p>}</div>;
  }
  if (status === 'demo_success') return <div className="success" role="status"><div className="success-symbol" aria-hidden="true">✓</div><p className="eyebrow">{c.ui.formSuccessLabel}</p><h2 id="modal-title">{common.successTitle}</h2><p>{common.successMessage}</p><button className="button primary" onClick={close}>{c.ui.close}<Arrow/></button></div>;
  return <div className={investor ? 'lead-form investor-form' : 'lead-form owner-form'}><p className="eyebrow">{investor ? c.ui.formInvestorLabel : c.ui.formOwnerLabel}</p><h2 id="modal-title">{text.title}</h2><p className="form-description">{text.description}</p><p className="form-banner"><span className="status-dot"/>{c.forms.banner}</p>{context.projectId && <div className="selected-project"><small>{c.forms.investor.projectLabel}</small><p>{c.projects.find(p => p.id === context.projectId)?.title}</p></div>}<form ref={formRef} noValidate onSubmit={submit} aria-busy={status === 'submitting'}><fieldset disabled={status === 'submitting'} className="form-fields">
    {field('name',common.fullNameLabel,{ required: true, placeholder:common.fullNamePlaceholder, autoComplete:'name', maxLength:120 })}
    <fieldset className="contact-method"><legend>{common.contactTypeLabel}</legend>{common.contactTypes.map(t => <label key={t.value}><input type="radio" name="contactMethod" value={t.value} checked={values.contactMethod===t.value} onChange={() => {setValues(v => ({...v,contactMethod:t.value as 'phone'|'email',contact:''}));setErrors(e=>({...e,contact:undefined}));}}/>{t.label}</label>)}</fieldset>
    {field('contact',values.contactMethod === 'phone' ? common.phoneLabel : common.emailLabel,{ required:true, type:values.contactMethod==='phone'?'tel':'email', autoComplete: values.contactMethod==='phone'?'tel':'email', placeholder:values.contactMethod==='phone'?common.phonePlaceholder:common.emailPlaceholder, maxLength:254 })}
    {field('company',common.companyLabel,{autoComplete:'organization', maxLength:200})}
    {investor ? field('amount',c.forms.investor.intendedAmountLabel,{type:'number',hint:c.forms.investor.intendedAmountHint}) : <details className="project-fields"><summary>{c.forms.projectOwner.additionalFieldsLabel}</summary>{field('projectName',c.forms.projectOwner.projectNameLabel,{maxLength:200})}{field('region',c.forms.projectOwner.regionLabel,{maxLength:200})}<div className="field"><label htmlFor="lead-direction">{c.forms.projectOwner.directionLabel}</label><select id="lead-direction" value={values.direction} onChange={e=>update('direction',e.target.value)}>{c.forms.projectOwner.directions.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}</select></div>{field('stage',c.forms.projectOwner.stageLabel,{maxLength:200})}{field('projectDescription',c.forms.projectOwner.projectDescriptionLabel,{multiline:true,maxLength:2000})}</details>}
    {field('comment',common.commentLabel,{multiline:true,placeholder:text.commentPlaceholder,maxLength:2000})}
    <div className="consent"><input id="lead-consent" type="checkbox" checked={values.consent} onChange={e => update('consent',e.target.checked)} aria-required="true" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-hint consent-error' : 'consent-hint'}/><div><label htmlFor="lead-consent">{common.consentLabel}</label><button className="text-link" type="button" onClick={()=>openDocument('/consent')}>{c.footer.links[1].label}<Arrow/></button></div></div>{errors.consent && <p className="field-error" id="consent-error">{errors.consent}</p>}<p className="field-hint" id="consent-hint">{common.consentDemoHint}</p>
    </fieldset><div aria-live="polite">{status === 'error' && <p className="submit-error" role="alert">{common.errorMessage}</p>}</div><button type="submit" className="button primary submit-button" disabled={status==='submitting'}>{status==='submitting'?common.loadingLabel:status==='error'?common.retryLabel:common.submitLabel}<Arrow/></button><button className="privacy-link text-link" type="button" onClick={()=>openDocument('/privacy')}>{common.privacyLabel}</button></form></div>;
}
