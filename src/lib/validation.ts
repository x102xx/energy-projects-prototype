import content from '../content/site-content.json';
import type { Errors, FormValues, LeadType } from './types';
export const initialValues: FormValues = { name: '', contactMethod: 'phone', contact: '', company: '', comment: '', amount: '', consent: false, projectName: '', region: '', direction: 'unknown', stage: '', projectDescription: '' };
export function validate(values: FormValues, type: LeadType): Errors {
  const e: Errors = {}, v = content.forms.common.validation, ui = content.ui.validation;
  if (!values.name.trim()) e.name = v.fullNameRequired;
  else if (!/^[\p{L}\p{M}\s'’\-]{2,120}$/u.test(values.name.trim())) e.name = ui.name;
  if (!values.contact.trim()) e.contact = v.contactRequired;
  else if (values.contactMethod === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact.trim()) || values.contact.length > 254 : !/^[+\d\s()\-]+$/.test(values.contact) || !/^\d{10,15}$/.test(values.contact.replace(/\D/g, ''))) e.contact = values.contactMethod === 'phone' ? v.phoneInvalid : v.emailInvalid;
  if (!values.consent) e.consent = v.consentRequired;
  if (values.company.length > 200) e.company = ui.company;
  if (values.comment.length > 2000) e.comment = ui.comment;
  if (type === 'investor' && values.amount && (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0)) e.amount = ui.amount;
  if (type === 'project_owner') {
    for (const field of ['projectName', 'region', 'stage'] as const) if (values[field].length > 200) e[field] = ui.short;
    if (values.projectDescription.length > 2000) e.projectDescription = ui.description;
  }
  return e;
}
