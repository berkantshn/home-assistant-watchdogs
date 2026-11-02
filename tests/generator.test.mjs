// Made By FALCREB
// Üretecin gerçek şablonlardan doğru çıktı verdiğini sınar: node --test "tests/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generate, validate } from '../site/generator.js';

const load = (name) => readFileSync(new URL(`../templates/${name}.yaml`, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const templates = {
  camera: load('camera_watchdog'),
  sensor: load('sensor_watchdog'),
  hue: load('hue_bridge_watchdog'),
  tts: load('tts_failover_watchdog'),
};
const ALL = Object.keys(templates);
const opts = {
  notify: 'notify.mobile_app_my_phone',
  second: '',
  hueEntry: 'ABC123',
  sensors: ['binary_sensor.kitchen_smoke', 'binary_sensor.boiler_gas'],
  batteries: ['sensor.kitchen_smoke_battery'],
};

test('yer tutucu kalmaz', () => {
  const out = generate(templates, ALL, opts);
  for (const left of ['mobile_app_example', 'example_second_channel', 'CHANGE_ME_HUE', 'binary_sensor.example', 'sensor.example', 'id: example_', 'alias: Example']) {
    assert.ok(!out.includes(left), left);
  }
  assert.ok(out.includes('entry_id: ABC123'));
  assert.ok(out.includes('- binary_sensor.boiler_gas'));
  assert.ok(out.includes('action: notify.mobile_app_my_phone'));
});

test('ikinci kanal yoksa bloğu silinir, mode satırı kalır', () => {
  const out = generate(templates, ['camera'], opts);
  assert.ok(!out.includes('second_channel'));
  assert.match(out, /\n  mode: parallel\n/);
});

test('ikinci kanal verilirse yazılır', () => {
  const out = generate(templates, ['camera'], { ...opts, second: 'notify.telegram' });
  assert.ok(out.includes('- action: notify.telegram'));
});

test('YAML kırabilecek girdiler reddedilir', () => {
  assert.deepEqual(validate(['camera'], { ...opts, notify: 'notify.x\n- evil: 1' }), ['notify']);
  assert.deepEqual(validate(['sensor'], { ...opts, sensors: ['binary_sensor.a: b'] }), ['sensors']);
  assert.deepEqual(validate(['hue'], { ...opts, hueEntry: 'a b' }), ['hueEntry']);
  assert.deepEqual(validate([], opts), ['select']);
  assert.deepEqual(validate(ALL, opts), []);
});
