// Made By FALCREB
// Şablonlardaki yer tutucuları kullanıcının değerleriyle değiştirip tek bir
// automations.yaml metni üretir. Her şey tarayıcıda çalışır, hiçbir veri gönderilmez.

const NOTIFY = /^notify\.[a-z0-9_]+$/;
const ENTITY = /^(binary_sensor|sensor)\.[a-z0-9_]+$/;
const AUTOMATION_ENTITY = /^automation\.[a-z0-9_]+$/;
const SENSOR_ENTITY = /^sensor\.[a-z0-9_]+$/;
const BINARY_SENSOR_ENTITY = /^binary_sensor\.[a-z0-9_]+$/;
const HUE_ENTRY = /^[A-Za-z0-9]+$/;

// Kullanılmayan ikinci bildirim kanalının bloğunu siler (README: kullanmadığınızı silin).
function removeActionBlock(text, action) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.trim() === `- action: ${action}`);
  if (start < 0) return text;
  const indent = lines[start].search(/\S/);
  let end = start + 1;
  while (end < lines.length && (lines[end].trim() === '' || lines[end].search(/\S/) > indent)) end++;
  lines.splice(start, end - start);
  return lines.join('\n');
}

// Örnek varlık satırlarını kullanıcının listesiyle değiştirir.
function replaceEntityList(text, pattern, entities) {
  const lines = text.split('\n');
  const first = lines.findIndex((l) => pattern.test(l));
  if (first < 0) return text;
  let end = first;
  while (end < lines.length && pattern.test(lines[end])) end++;
  const indent = lines[first].slice(0, lines[first].search(/\S/));
  lines.splice(first, end - first, ...entities.map((e) => `${indent}- ${e}`));
  return lines.join('\n');
}

function replaceEntityLists(text, pattern, entities) {
  if (!entities.length) return text;
  const lines = text.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length;) {
    if (!pattern.test(lines[i])) {
      i++;
      continue;
    }
    const indent = lines[i].slice(0, lines[i].search(/\S/));
    let end = i;
    while (end < lines.length && pattern.test(lines[end])) end++;
    lines.splice(i, end - i, ...entities.map((e) => `${indent}- ${e}`));
    i += entities.length;
    changed = true;
  }
  return changed ? lines.join('\n') : text;
}

export function validate(selected, opts) {
  const errors = [];
  if (!selected.length) errors.push('select');
  if (!NOTIFY.test(opts.notify || '')) errors.push('notify');
  if (opts.second && !NOTIFY.test(opts.second)) errors.push('second');
  if (selected.includes('hue') && !HUE_ENTRY.test(opts.hueEntry || '')) errors.push('hueEntry');
  if (selected.includes('sensor')) {
    const sensors = opts.sensors || [];
    const batteries = opts.batteries || [];
    if (!sensors.length || !sensors.every((e) => ENTITY.test(e))) errors.push('sensors');
    if (!batteries.length || !batteries.every((e) => ENTITY.test(e))) errors.push('batteries');
  }
  if (selected.includes('automation')) {
    const automations = opts.automations || [];
    if (!automations.length || !automations.every((e) => AUTOMATION_ENTITY.test(e))) errors.push('automations');
  }
  if (selected.includes('disk')) {
    const disks = opts.disks || [];
    if (!disks.length || !disks.every((e) => SENSOR_ENTITY.test(e))) errors.push('disks');
  }
  if (selected.includes('door')) {
    const doors = opts.doors || [];
    if (!doors.length || !doors.every((e) => BINARY_SENSOR_ENTITY.test(e))) errors.push('doors');
  }
  return errors;
}

export function generate(templates, selected, opts) {
  const parts = selected.map((key) => {
    let text = templates[key];
    if (key === 'camera') {
      text = opts.second
        ? text.replaceAll('notify.example_second_channel', opts.second)
        : removeActionBlock(text, 'notify.example_second_channel');
    }
    if (key === 'hue') text = text.replaceAll('CHANGE_ME_HUE_CONFIG_ENTRY_ID', opts.hueEntry);
    if (key === 'sensor') {
      text = replaceEntityList(text, /^\s*- binary_sensor\.example_/, opts.sensors);
      text = replaceEntityList(text, /^\s*- sensor\.example_\w+_battery/, opts.batteries);
    }
    if (key === 'automation') text = replaceEntityLists(text, /^\s*- automation\.example_critical_/, opts.automations);
    if (key === 'disk') text = replaceEntityLists(text, /^\s*- sensor\.system_monitor_disk_usage\b/, opts.disks);
    if (key === 'door') text = replaceEntityLists(text, /^\s*- binary_sensor\.example_/, opts.doors);
    text = text.replaceAll('notify.mobile_app_example', opts.notify);
    // Yorumlar kısaltılır: geriye yalnızca çalışan otomasyon kalır.
    text = text.split('\n').filter((l) => !/^#/.test(l)).join('\n').trim();
    return text.replace(/^- id: example_/m, '- id: ').replace(/alias: Example - /, 'alias: ');
  });
  return `# Made By FALCREB - home-assistant-watchdogs\n${parts.join('\n\n')}\n`;
}
