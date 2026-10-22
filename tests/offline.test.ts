import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('standalone page executes its valid bundle after the React container exists',()=>{
  const html = readFileSync('docs/index.html','utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script);
  assert.ok(html.indexOf('<div id="root"') < script.index!);
  assert.doesNotThrow(()=>new vm.Script(script[1]));
  assert.doesNotMatch(html,/<script\b[^>]*src=/i);
  assert.doesNotMatch(html,/<link\b[^>]*href=/i);
});
