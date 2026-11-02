# Home Assistant on Raspberry Pi 5: Reliability Guide

*[Türkçe aşağıda](#rehber)*

The steps below were done on a real Home Assistant OS install, and the before/after notes come from its maintenance log. No boot time, CPU or latency benchmarks were recorded, so none are given. The work was about reliability, not speed.

## The guide

### 1. Start with a health check

Look at CPU, RAM, disk, temperature, logs and **Settings > System > Repairs** before
changing anything. One check here read 42°C with the PWM fan off. That turned out to be
normal: the fan deliberately stays off at low temperature. A fan that software cannot see
at all may simply be wired to fixed power, and that needs a physical check.

### 2. Back up before every change

- Take a full backup before updates, new integrations or cleanup.
- Copy it off the device and verify it with SHA-256.
- Schedule encrypted daily backups, and keep copies both on and off the device.
- Before updating, compare the release notes' breaking changes against your automations.

### 3. Give devices stable addresses

One long outage traced back to this. A DHCP lease change moved the Hue bridge, Home
Assistant kept trying the old address, and its live connection to the bridge stayed down
for 3 days until a restart rediscovered it. The Pi's own address had changed too, which
looked like the Pi being down.

- Add DHCP reservations on the router that actually runs DHCP for the Pi, bridges,
  cameras and speakers. In a mesh or access point setup, that may be the modem.
- Connect to the Pi using its default `homeassistant.local` name, not an IP address.
- Re-check integrations that still point at an old address.

### 4. Secure access and secrets

- Use key-based SSH through the Terminal & SSH add-on. Generate a new key pair on each
  computer; do not copy private keys between machines.
- Move API keys and tokens out of `configuration.yaml` into `secrets.yaml`.
- Keep `secrets.yaml` out of version control.

### 5. Make alerts reach you

Safety automations here used only `notify.persistent_notification`, which shows inside
Home Assistant and never reached a phone. Send a real mobile push, use critical alerts for
emergencies, and add a second independent channel. Also review your safety automations
from time to time: one had been silently disabled for months before anyone noticed.

### 6. Fix automation behavior

**Use `mode: restart` for timers, and re-check before acting.** With `mode: single`, new
sensor signals were dropped and the log filled with "Already running" messages. Restarting
resets the timer, and a final check stops the light turning off while someone is present:

```yaml
actions:
- delay:
    seconds: 20
- condition: state
  entity_id: binary_sensor.example_motion
  state: "off"
- action: switch.turn_off
  target:
    entity_id: switch.example_light
mode: restart
```

Only check the sensor that really means presence. An early version also checked contact
sensors unrelated to presence, so the light never turned off.

**Ignore changes made by other automations.** Switch-to-toggle automations were fighting
with an alarm's light flashing. This condition limits them to physical or app changes:

```yaml
conditions:
- condition: template
  value_template: >-
    {{ trigger.to_state.context.parent_id is none
       and trigger.from_state.state in ['on', 'off']
       and trigger.to_state.state in ['on', 'off'] }}
```

**Mirror state, do not toggle.** When one switch controls other lights, copy its state
after a short delay using `mode: restart`. On rapid presses the last press wins and the
lights cannot drift out of sync.

**Target explicitly.** Targeting a whole area reached unrelated devices, and their errors
stopped an emergency automation. List the real entities and set `continue_on_error: true`
on steps that must not block the rest. In the same way, target individual lights if a
bridge group contains a lamp you did not intend.

### 7. Add watchdogs

A watchdog turns a silent failure into a notification. See the [templates](../templates) for the Hue
bridge, sensors, cameras, TTS, automations, backups, disk space and open doors. The Hue, TTS and
automation watchdogs depend on `system_log: fire_event: true`.

### 8. Keep voice working without the cloud

- A cloud TTS subscription was disabled and its key began returning HTTP 401. Connecting
  local Piper through Wyoming and adding failover kept the assistant speaking.
- An assistant pipeline with an empty speech-to-text setting will silently break voice
  input. Connecting Whisper and openWakeWord through Wyoming and setting the pipeline's
  STT engine fixed it.

### 9. Clean up carefully

- Remove orphaned automation entries, stale device entries, old backups and `.bak` files.
- If a custom integration breaks after an upgrade, move it out of `custom_components` to a
  holding folder such as `/share/removed/` first. One here crashed on Python 3.14 because
  it still used the removed `imp` module.

### 10. Know where the truth lives

If you keep configuration in Git and also edit in the UI, the live system can get ahead of
your repo. Compare live to repo with `diff` **before** copying anything back to the Pi.

### 11. Watch for moved settings

On this install, from Core 2026.8, `http:` settings had been migrated out of YAML, so
reverse proxy options such as `trusted_proxies` written to `configuration.yaml` no longer
applied. They belong in **Settings > System > Network**. A saved change stays pending and
needs confirming after the restart, otherwise it reverts. Check your version's release
notes, as this may change.

## Before and after

Only changes recorded in the maintenance log are listed. Nothing here is a benchmark.

| Area | Before | After |
|---|---|---|
| Safety alerts | Shown only inside Home Assistant | Mobile push, critical alerts and a second channel |
| Hue bridge | Connection down for 3 days after an address change | Reserved address plus watchdog |
| Timer automation | "Already running" log spam | `mode: restart`, spam gone |
| Motion light | Could turn off with someone present | Re-checks the motion sensor first |
| Cloud TTS failure | Key returned HTTP 401, no fallback | Automatic switch to fallback TTS, checked every 15 minutes |
| Voice input | Empty STT setting, broken | Whisper connected, working |

---

## Rehber

Kod örnekleri için yukarıdaki İngilizce bölümde aynı numaralı adımlara bakın.

1. **Sağlık kontrolüyle başlayın.** Değişiklikten önce CPU, RAM, disk, sıcaklık, loglar ve
   Onarımlar ekranına bakın. Bir kontrolde 42°C'de PWM fanın durduğu görüldü; bu normaldi,
   çünkü fan düşük sıcaklıkta bilinçli olarak kapalı kalır. Yazılımın hiç görmediği bir fan
   sabit güce bağlı olabilir ve fiziksel kontrol gerektirir.
2. **Her değişiklikten önce yedek alın.** Yedeği cihaz dışına kopyalayıp SHA-256 ile
   doğrulayın. Günlük şifreli yedek planlayın; kopyaları hem cihazda hem cihaz dışında tutun. Güncellemeden önce sürüm notlarındaki uyumsuzlukları otomasyonlarınızla
   karşılaştırın.
3. **Cihazlara sabit adres verin.** Uzun bir kesintinin kök nedeni buydu: DHCP Hue
   köprüsünün adresini değiştirdi, Home Assistant eski adresi denemeye devam etti ve canlı
   bağlantı yeniden başlatmaya kadar 3 gün koptu. DHCP'yi gerçekten dağıtan cihazda (bu bazen
   modemdir) rezervasyon yapın ve Pi'ye `homeassistant.local` adıyla bağlanın.
4. **Erişimi ve gizli bilgileri koruyun.** Terminal & SSH eklentisinde anahtar tabanlı giriş
   kullanın, her bilgisayarda yeni anahtar çifti üretin. API anahtarlarını `secrets.yaml`
   dosyasına taşıyın ve bu dosyayı sürüm kontrolüne eklemeyin.
5. **Uyarıların size ulaştığından emin olun.** `notify.persistent_notification` yalnızca Home
   Assistant içinde görünür, telefona gitmez. Mobil bildirim, acil durumlar için kritik uyarı
   ve bağımsız ikinci bir kanal kullanın. Güvenlik otomasyonlarını ara ara gözden geçirin:
   biri aylarca sessizce devre dışı kalmıştı.
6. **Otomasyon davranışını düzeltin.** Zamanlayıcılarda `mode: restart` kullanın ve eylemden
   önce sensörü tekrar kontrol edin. Yalnızca gerçekten varlık gösteren sensöre bakın; ilgisiz
   sensörler ışığın hiç kapanmamasına yol açabilir. Diğer otomasyonların yaptığı değişiklikleri
   `context.parent_id` koşuluyla yok sayın. Toggle yerine durumu aynalayın. Alan yerine gerçek
   varlıkları hedefleyin ve kritik adımlarda `continue_on_error: true` kullanın.
7. **Bekçi otomasyonları ekleyin.** Bekçi, sessiz bir arızayı bildirime dönüştürür. Hue
   bekçisi `system_log: fire_event: true` ayarına ihtiyaç duyar.
8. **Sesi buluta bağımlı bırakmayın.** Bulut TTS aboneliği devre dışı kalınca anahtar HTTP 401
   vermeye başladı; Wyoming ile yerel Piper ve otomatik geçiş asistanın konuşmaya devam
   etmesini sağladı. Hattın konuşmayı metne çevirme (STT) ayarı boşsa sesli giriş sessizce
   bozulur; Whisper bağlamak bunu çözdü.
9. **Dikkatli temizlik yapın.** Yetim kayıtları, eski yedekleri ve `.bak` dosyalarını
    kaldırın. Bozulan özel entegrasyonu önce `/share/removed/` gibi bir klasöre taşıyın.
10. **Güncel halin nerede olduğunu bilin.** Hem Git hem arayüz kullanıyorsanız, Pi'ye bir şey
    kopyalamadan **önce** canlı sistemi depoyla `diff` ile karşılaştırın.
11. **Taşınan ayarlara dikkat edin.** Bu kurulumda Core 2026.8 ile `http:` ayarları YAML'dan
    çıktı; `trusted_proxies` gibi ayarlar artık **Ayarlar > Sistem > Ağ** ekranında yapılıyor.
    Kaydedilen değişiklik yeniden başlatmadan sonra onaylanmazsa eski haline döner. Kendi
    sürümünüzün notlarını kontrol edin.

---

**Made By FALCREB**
