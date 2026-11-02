# Home Assistant Watchdogs

**Know when your Home Assistant silently breaks.**

*[Türkçe açıklama aşağıda](#türkçe)*

A camera drops off, a sensor battery dies, a bridge loses its connection, or your voice assistant stops talking, and nothing tells you. These ready-to-use automations turn silent failures into notifications.

They were generalized from a real install, where a lost bridge connection went unnoticed for 3 days and a safety automation stayed disabled for months.

## Watchdogs

| Template | What it catches |
|---|---|
| [`camera_watchdog.yaml`](templates/camera_watchdog.yaml) | Any `camera.*` entity unavailable for 10 minutes, with a message when it returns. New cameras are covered automatically |
| [`sensor_watchdog.yaml`](templates/sensor_watchdog.yaml) | Critical sensors offline for 15 minutes, or batteries below 20% |
| [`hue_bridge_watchdog.yaml`](templates/hue_bridge_watchdog.yaml) | Failed Hue bridge reconnects: reloads the integration and notifies you |
| [`tts_failover_watchdog.yaml`](templates/tts_failover_watchdog.yaml) | Cloud text-to-speech failure: moves your assistant to a local fallback and back again |

## Install

1. Back up Home Assistant first.
2. Copy the watchdogs you want into `automations.yaml`, or create them in YAML mode in the UI.
3. Replace every placeholder, such as `notify.mobile_app_example`. Each file header lists what to change.
4. Merge [`templates/configuration.example.yaml`](templates/configuration.example.yaml) into `configuration.yaml`.
5. For TTS failover, copy [`templates/scripts/tts_failover.py`](templates/scripts/tts_failover.py) to `/config/scripts/` and add the values from [`secrets.yaml.example`](secrets.yaml.example) to your `secrets.yaml`.
6. Check the configuration, restart, then trigger each watchdog and read its trace.

## Testing status

The templates were tested on a real Home Assistant 2026.10.4 in an isolated Docker container, with simulated devices and shortened wait times. `check_config` passed, and the camera, sensor, Hue and TTS scenarios passed after one bug was fixed.

Not yet tested: a real Hue bridge, real Azure and Piper, real phone notifications, real cameras and sensors, the full 10, 15 and 30 minute waits, and Home Assistant OS or HTTPS setups. Try each watchdog on your own system. The TTS script connects to `http://localhost:8123`, so an HTTPS-only setup needs that address changed.

## Limits

- These watchdogs report problems; they do not replace certified smoke or gas alarms.
- A notification can only arrive if Home Assistant, your network and the notification service are running. Consider a second notification channel.
- Some watchdogs match log text, which can change between Home Assistant versions. Re-check after updates.

## Raspberry Pi 5 reliability guide

The [guide](docs/pi5-reliability-guide.md) covers backups, stable addresses, secrets, automation fixes and voice without the cloud, with lessons from real failures.

## License

[MIT](LICENSE)

---

# Türkçe

**Home Assistant'ın sessizce bozulduğunu anında öğren.**

Kamera düşer, sensörün pili biter, köprünün bağlantısı kopar ya da sesli asistan konuşmayı bırakır ve kimse sana haber vermez. Bu hazır otomasyonlar, sessiz arızaları bildirime dönüştürür.

Şablonlar gerçek bir kurulumdan genelleştirildi. O kurulumda kopan bir köprü bağlantısı 3 gün fark edilmemiş, bir güvenlik otomasyonu da aylarca kapalı kalmıştı.

## Bekçiler

| Şablon | Neyi yakalar |
|---|---|
| [`camera_watchdog.yaml`](templates/camera_watchdog.yaml) | 10 dakika erişilemeyen her `camera.*` varlığı; kamera dönünce de haber verir. Yeni kameralar otomatik kapsanır |
| [`sensor_watchdog.yaml`](templates/sensor_watchdog.yaml) | 15 dakika çevrimdışı kalan kritik sensörler veya %20'nin altına düşen piller |
| [`hue_bridge_watchdog.yaml`](templates/hue_bridge_watchdog.yaml) | Hue köprüsüne yeniden bağlanamama: entegrasyonu yeniden yükler ve bildirir |
| [`tts_failover_watchdog.yaml`](templates/tts_failover_watchdog.yaml) | Bulut ses motoru arızası: asistanı yerel yedeğe geçirir, düzelince geri alır |

## Kurulum

1. Önce Home Assistant yedeği al.
2. İstediğin bekçileri `automations.yaml` dosyasına kopyala ya da arayüzde YAML modunda oluştur.
3. `notify.mobile_app_example` gibi tüm yer tutucuları değiştir. Her dosyanın başında değiştirilecekler yazıyor.
4. [`templates/configuration.example.yaml`](templates/configuration.example.yaml) içeriğini `configuration.yaml` dosyana ekle.
5. Ses motoru yedeği için [`templates/scripts/tts_failover.py`](templates/scripts/tts_failover.py) dosyasını `/config/scripts/` altına kopyala, [`secrets.yaml.example`](secrets.yaml.example) içindeki değerleri `secrets.yaml` dosyana ekle.
6. Yapılandırmayı kontrol et, yeniden başlat, sonra her bekçiyi tetikleyip izini (trace) oku.

## Test durumu

Şablonlar, izole bir Docker kabındaki gerçek Home Assistant 2026.10.4 üzerinde, sanal cihazlarla ve kısaltılmış bekleme süreleriyle test edildi. `check_config` geçti; bulunan bir hata düzeltildikten sonra kamera, sensör, Hue ve ses motoru senaryoları da geçti.

Henüz test edilmeyenler: gerçek Hue köprüsü, gerçek Azure ve Piper, telefona gerçek bildirim, gerçek kamera ve sensörler, tam 10, 15 ve 30 dakikalık beklemeler, Home Assistant OS ve HTTPS kurulumları. Her bekçiyi kendi sisteminde dene. Ses motoru betiği `http://localhost:8123` adresine bağlanır; yalnızca HTTPS kullanan kurulumlarda bu adresi değiştirmen gerekir.

## Sınırlar

- Bu bekçiler sorunu bildirir; sertifikalı duman veya gaz alarmlarının yerine geçmez.
- Bildirim ancak Home Assistant, ağın ve bildirim servisi çalışıyorsa ulaşır. İkinci bir bildirim kanalı kullanmayı düşün.
- Bazı bekçiler log metnine bakar; bu metin sürümler arasında değişebilir. Güncellemelerden sonra kontrol et.

## Raspberry Pi 5 güvenilirlik rehberi

[Rehber](docs/pi5-reliability-guide.md); yedekleme, sabit adres, gizli bilgiler, otomasyon düzeltmeleri ve buluta bağlı kalmadan ses konularını gerçek arızalardan çıkan derslerle anlatıyor.

## Lisans

[MIT](LICENSE)

---

## ⭐ Support this project

If this project helped you, please give it a ⭐ and [follow me on GitHub](https://github.com/berkantshn) for more.

İşine yaradıysa projeye ⭐ verip [beni GitHub'da takip edebilirsin](https://github.com/berkantshn).

---

**Made By FALCREB**
