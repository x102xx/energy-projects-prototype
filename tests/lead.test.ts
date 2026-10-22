import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, initialValues } from '../src/lib/validation';
import { submitLead } from '../src/lib/leadService';
import { createDemoAnalytics, readAttribution } from '../src/lib/analytics';
import type { LeadPayload } from '../src/lib/types';
const attribution = readAttribution('?utm_source=partner&utm_medium=referral&email=private&x=1', '/', 'https://example.org/path?private=yes');
const payload: LeadPayload = { leadType:'investor',projectId:null,name:'Тест Прототип',contactMethod:'email',contact:'test@example.com',company:null,comment:null,intendedAmountRub:null,projectDetails:null,consentAccepted:true,consentDocumentVersion:'demo-draft',attribution,placement:'hero' };
test('both lead types require name, one contact and unchecked consent; optional data may stay empty',()=>{
  for (const type of ['investor','project_owner'] as const) {
    assert.deepEqual(Object.keys(validate(initialValues,type)).sort(),['consent','contact','name']);
    assert.deepEqual(validate({...initialValues,name:'Иван Петров',contact:'+7 (999) 123-45-67',consent:true},type),{});
  }
});
test('names, phone/email and optional positive amount follow UI rules',()=>{
  const valid = {...initialValues,name:"Anne O’Neil",contactMethod:'email' as const,contact:'test@example.com',consent:true};
  assert.deepEqual(validate(valid,'investor'),{});
  assert.ok(validate({...valid,contact:'broken'},'investor').contact);
  assert.ok(validate({...valid,contactMethod:'phone',contact:'123'},'investor').contact);
  assert.ok(validate({...valid,contactMethod:'phone',contact:'+7letters9991234567'},'investor').contact);
  assert.ok(validate({...valid,name:'  '},'investor').name);
  assert.ok(validate({...valid,amount:'-1'},'investor').amount);
  assert.ok(validate({...valid,amount:'Infinity'},'investor').amount);
  assert.deepEqual(validate({...valid,amount:'1'},'investor'),{});
});
test('demo submit makes no network call and returns only a demo result',async()=>{
  const original = globalThis.fetch; let count = 0;
  globalThis.fetch = (async()=>{count++;throw new Error('Network forbidden');}) as typeof fetch;
  try { assert.deepEqual(await submitLead(payload),{status:'demo_success'});assert.equal(count,0); }
  finally {globalThis.fetch=original;}
});
test('forced error can be retried with the same unchanged payload',async()=>{
  const before=structuredClone(payload);
  await assert.rejects(submitLead(payload,{mockError:true}),/demo_error/);
  assert.deepEqual(payload,before);
  assert.deepEqual(await submitLead(payload),{status:'demo_success'});
});
test('closing pending form can abort its request',async()=>{
  const controller=new AbortController(); const pending=submitLead(payload,{signal:controller.signal});controller.abort();
  await assert.rejects(pending,{name:'AbortError'});
});
test('attribution is allowlisted, truncated, and stores referrer host only',()=>{
  assert.equal(attribution.utm_source,'partner');assert.equal(attribution.utm_medium,'referral');assert.equal(attribution.referrerHost,'example.org');
  assert.equal('email' in attribution,false);assert.equal('x' in attribution,false);
  assert.equal(readAttribution(`?utm_campaign=${'a'.repeat(500)}`,'/','').utm_campaign?.length,160);
});
test('analytics drops personal payload fields even when passed accidentally',()=>{
  const a=createDemoAnalytics(attribution,'test-session');
  a.track('demo_submit_success',payload);
  const data=JSON.stringify(a.snapshot());
  for(const personal of ['Тест Прототип','test@example.com','company','comment','consentAccepted']) assert.equal(data.includes(personal),false);
  assert.equal(a.snapshot()[0].name,'demo_submit_success');
  assert.equal(data.includes('lead_submit_success'),false);
});
