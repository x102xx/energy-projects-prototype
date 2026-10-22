import content from '../content/site-content.json';
export type Project = typeof content.projects[number];
export type LeadType = 'investor' | 'project_owner';
export type Placement = 'hero' | 'project' | 'final' | 'header' | 'footer';
export type Attribution = Record<'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term', string | null> & { landingPath: string; referrerHost: string | null };
export interface LeadPayload {
  leadType: LeadType; projectId: string | null; name: string;
  contactMethod: 'phone' | 'email'; contact: string; company: string | null;
  comment: string | null; intendedAmountRub: number | null;
  projectDetails: { name: string; region: string; direction: string; stage: string; description: string } | null;
  consentAccepted: boolean; consentDocumentVersion: 'demo-draft';
  attribution: Attribution; placement: Placement;
}
export type SubmitResult = { status: 'demo_success' } | { status: 'accepted'; leadId: string };
export interface FormValues {
  name: string; contactMethod: 'phone' | 'email'; contact: string; company: string; comment: string;
  amount: string; consent: boolean; projectName: string; region: string; direction: string; stage: string; projectDescription: string;
}
export type Errors = Partial<Record<keyof FormValues, string>>;
export interface LeadContext { leadType: LeadType; projectId: string | null; placement: Placement }
