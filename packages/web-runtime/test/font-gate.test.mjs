import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { fontGate } from '../dist/inline.js';

// The font gate must not open before the faces have loaded. It runs in <head> before the page's
// styles, so it first waits for the family's @font-face rules to be parsed.
function gateFixture({ readyState = 'loading' } = {}) {
  const classes = new Set(['fonts-loading']);
  const faces = [];
  const loads = [];
  const document = {
    readyState,
    documentElement: {
      dataset: { hwioFontFamily: 'Inter' },
      classList: {
        add: (...names) => names.forEach((name) => classes.add(name)),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)),
      },
      getAttribute: () => null,
    },
    fonts: {
      forEach: (callback) => faces.forEach(callback),
      load: (font, text) => new Promise((resolve, reject) => loads.push({ font, text, resolve, reject })),
    },
    addEventListener() {},
  };
  const window = {};
  const run = () => vm.runInNewContext(fontGate.code, { document, window, setTimeout, Promise, Error });
  return { classes, faces, loads, document, window, run };
}
const settle = async () => { for (let i = 0; i < 8; i += 1) await Promise.resolve(); };

test('fontGate stays shut until the family is declared and both samples have loaded', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const gate = gateFixture();
  gate.run();
  await settle();
  assert.equal(gate.loads.length, 0, 'no face is asked for before an @font-face rule of the family exists');
  assert.ok(gate.classes.has('fonts-loading'));

  t.mock.timers.tick(64);
  await settle();
  assert.equal(gate.loads.length, 0);

  gate.faces.push({ family: '"Inter"', weight: '100 900' });
  t.mock.timers.tick(16);
  await settle();
  assert.equal(gate.loads.length, 2, 'the Latin and the Latin Extended sample are asked for once the rules are parsed');
  assert.match(gate.loads[0].font, /^400 1em "Inter"$/, 'a variable face is asked for once, at 400');
  assert.ok(gate.classes.has('fonts-loading'), 'still shut while the faces load');

  gate.loads.forEach((load) => load.resolve([{}]));
  await settle();
  assert.ok(!gate.classes.has('fonts-loading'));
  assert.ok(gate.classes.has('fonts-ready'));
  assert.ok(!gate.classes.has('fonts-failed'));
  assert.equal(gate.window.__hwioFontGate.state, 'ready');
});

test('fontGate pins the fallback when the faces do not arrive in time', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const gate = gateFixture();
  gate.faces.push({ family: 'Inter', weight: '100 900' });
  gate.run();
  await settle();
  assert.equal(gate.loads.length, 2);
  t.mock.timers.tick(4999);
  await settle();
  assert.ok(gate.classes.has('fonts-loading'));
  t.mock.timers.tick(1);
  await settle();
  assert.ok(gate.classes.has('fonts-failed') && gate.classes.has('fonts-ready') && !gate.classes.has('fonts-loading'));
  assert.equal(gate.window.__hwioFontGate.state, 'failed');
});

test('fontGate does not wait for a family the page never declares', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const gate = gateFixture({ readyState: 'complete' });
  gate.run();
  await settle();
  assert.equal(gate.loads.length, 2, 'a loaded document ends the wait');
  gate.loads.forEach((load) => load.resolve([]));
  await settle();
  assert.ok(gate.classes.has('fonts-ready') && !gate.classes.has('fonts-failed'));
});

test('fontGate also bounds the wait for the rules themselves', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const gate = gateFixture();
  gate.run();
  t.mock.timers.tick(5000);
  await settle();
  assert.equal(gate.loads.length, 0);
  assert.ok(gate.classes.has('fonts-failed') && !gate.classes.has('fonts-loading'));
});

test('fontGate waits for every weight a family ships as its own file', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const gate = gateFixture();
  for (const weight of ['400', '600', '700']) {
    gate.faces.push({ family: 'Inter', weight }, { family: 'Inter', weight });   // Latin and Latin Extended of each weight
  }
  gate.faces.push({ family: 'Inter Fallback', weight: '400' });
  gate.run();
  await settle();
  assert.deepEqual(gate.loads.map((load) => load.font.split(' ')[0]).sort(), ['400', '400', '600', '600', '700', '700']);
  gate.loads.slice(0, 5).forEach((load) => load.resolve([{}]));
  await settle();
  assert.ok(gate.classes.has('fonts-loading'), 'one weight still loading keeps the gate shut');
  gate.loads[5].resolve([{}]);
  await settle();
  assert.ok(gate.classes.has('fonts-ready') && !gate.classes.has('fonts-loading'));
});
