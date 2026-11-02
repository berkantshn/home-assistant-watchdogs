// Made By FALCREB
// Şablonlardaki yer tutucuları kullanıcının değerleriyle değiştirip tek bir
// automations.yaml metni üretir. Her şey tarayıcıda çalışır, hiçbir veri gönderilmez.

const NOTIFY = /^notify\.[a-z0-9_]+$/;
const ENTITY = /^(binary_sensor|sensor)\.[a-z0-9_]+$/;
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
    text = text.replaceAll('notify.mobile_app_example', opts.notify);
    // Yorumlar kısaltılır: geriye yalnızca çalışan otomasyon kalır.
    text = text.split('\n').filter((l) => !/^#/.test(l)).join('\n').trim();
    return text.replace(/^- id: example_/m, '- id: ').replace(/alias: Example - /, 'alias: ');
  });
  return `# Made By FALCREB - home-assistant-watchdogs\n${parts.join('\n\n')}\n`;
}
