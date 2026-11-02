# Home Assistant Watchdogs

**Know when your Home Assistant silently breaks.**

**[▶ Build your automations online](https://berkantshn.github.io/home-assistant-watchdogs/)** · **[⬇ Download all templates](https://github.com/berkantshn/home-assistant-watchdogs/releases/latest/download/home-assistant-watchdogs.zip)**

The generator runs entirely in your browser: fill in your own names and copy the result.

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
| [`automation_watchdog.yaml`](templates/automation_watchdog.yaml) | A listed critical automation turned off, unavailable or logging an error, with a daily check for one that was already off |
| [`backup_watchdog.yaml`](templates/backup_watchdog.yaml) | No successful automatic backup for 48 hours, or a backup time that cannot be read |
| [`disk_space_watchdog.yaml`](templates/disk_space_watchdog.yaml) | Disk use above 85% or 95%, with a daily check for a disk that was already full |
| [`door_left_open_watchdog.yaml`](templates/door_left_open_watchdog.yaml) | A listed door or window open for 10 minutes, with a message when it closes |

## Install

The quickest way is the [online generator](https://berkantshn.github.io/home-assistant-watchdogs/), which fills in steps 2 and 3 for you. To do it by hand:

1. Back up Home Assistant first.
2. Copy the watchdogs you want into `automations.yaml`, or create them in YAML mode in the UI.
3. Replace every placeholder, such as `notify.mobile_app_example`. Each file header lists what to change.
4. Merge [`templates/configuration.example.yaml`](templates/configuration.example.yaml) into `configuration.yaml`.
5. For TTS failover, copy [`templates/scripts/tts_failover.py`](templates/scripts/tts_failover.py) to `/config/scripts/` and add the values from [`secrets.yaml.example`](secrets.yaml.example) to your `secrets.yaml`.
6. Check the configuration, restart, then trigger each watchdog and read its trace.

## Testing status

All eight templates were tested on a real Home Assistant 2026.10.4 in an isolated Docker container, with simulated devices and shortened wait times. `check_config` passed on the unmodified templates. The camera, sensor, Hue and TTS scenarios passed after one bug was fixed.

The automation, backup, disk and door scenarios also passed, using real automation errors and restarts, a real automatic backup with the Backup integration, and the real System Monitor disk sensor. High and low disk values, and old or unreadable backup times, were simulated.

Not yet tested: a real Hue bridge, real Azure and Piper, real phone notifications, real cameras and sensors, real door and window sensors, a backup whose upload fails, a really full disk, backups made by add-ons, the full waits (1, 5, 10, 15 and 30 minutes), a Home Assistant language other than English, and Home Assistant OS or HTTPS setups. Try each watchdog on your own system. The TTS script connects to `http://localhost:8123`, so an HTTPS-only setup needs that address changed.

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

**[▶ Otomasyonlarını çevrimiçi oluştur](https://berkantshn.github.io/home-assistant-watchdogs/)** · **[⬇ Tüm şablonları indir](https://github.com/berkantshn/home-assistant-watchdogs/releases/latest/download/home-assistant-watchdogs.zip)**

Üreteç tamamen tarayıcında çalışır: kendi adlarını yaz, sonucu kopyala.

Kamera düşer, sensörün pili biter, köprünün bağlantısı kopar ya da sesli asistan konuşmayı bırakır ve kimse sana haber vermez. Bu hazır otomasyonlar, sessiz arızaları bildirime dönüştürür.

Şablonlar gerçek bir kurulumdan genelleştirildi. O kurulumda kopan bir köprü bağlantısı 3 gün fark edilmemiş, bir güvenlik otomasyonu da aylarca kapalı kalmıştı.

## Bekçiler

| Şablon | Neyi yakalar |
|---|---|
| [`camera_watchdog.yaml`](templates/camera_watchdog.yaml) | 10 dakika erişilemeyen her `camera.*` varlığı; kamera dönünce de haber verir. Yeni kameralar otomatik kapsanır |
| [`sensor_watchdog.yaml`](templates/sensor_watchdog.yaml) | 15 dakika çevrimdışı kalan kritik sensörler veya %20'nin altına düşen piller |
| [`hue_bridge_watchdog.yaml`](templates/hue_bridge_watchdog.yaml) | Hue köprüsüne yeniden bağlanamama: entegrasyonu yeniden yükler ve bildirir |
| [`tts_failover_watchdog.yaml`](templates/tts_failover_watchdog.yaml) | Bulut ses motoru arızası: asistanı yerel yedeğe geçirir, düzelince geri alır |
| [`automation_watchdog.yaml`](templates/automation_watchdog.yaml) | Listedeki kritik otomasyonun kapatılması, erişilemez kalması veya hata vermesi; zaten kapalı olanı da günlük kontrolle yakalar |
| [`backup_watchdog.yaml`](templates/backup_watchdog.yaml) | 48 saattir başarılı otomatik yedek olmaması veya yedek tarihinin okunamaması |
| [`disk_space_watchdog.yaml`](templates/disk_space_watchdog.yaml) | Disk kullanımının %85 veya %95'i geçmesi; zaten dolu diski de günlük kontrolle yakalar |
| [`door_left_open_watchdog.yaml`](templates/door_left_open_watchdog.yaml) | Listedeki kapı veya pencerenin 10 dakika açık kalması; kapanınca da haber verir |

## Kurulum

En hızlı yol [çevrimiçi üreteç](https://berkantshn.github.io/home-assistant-watchdogs/): kendi adlarını yazarsın, 2. ve 3. adımları senin için doldurur. Elle yapmak için:

1. Önce Home Assistant yedeği al.
2. İstediğin bekçileri `automations.yaml` dosyasına kopyala ya da arayüzde YAML modunda oluştur.
3. `notify.mobile_app_example` gibi tüm yer tutucuları değiştir. Her dosyanın başında değiştirilecekler yazıyor.
4. [`templates/configuration.example.yaml`](templates/configuration.example.yaml) içeriğini `configuration.yaml` dosyana ekle.
5. Ses motoru yedeği için [`templates/scripts/tts_failover.py`](templates/scripts/tts_failover.py) dosyasını `/config/scripts/` altına kopyala, [`secrets.yaml.example`](secrets.yaml.example) içindeki değerleri `secrets.yaml` dosyana ekle.
6. Yapılandırmayı kontrol et, yeniden başlat, sonra her bekçiyi tetikleyip izini (trace) oku.

## Test durumu

Sekiz şablonun tamamı, izole bir Docker kabındaki gerçek Home Assistant 2026.10.4 üzerinde, sanal cihazlarla ve kısaltılmış bekleme süreleriyle test edildi. `check_config`, değiştirilmemiş şablonlarda geçti. Bulunan bir hata düzeltildikten sonra kamera, sensör, Hue ve ses motoru senaryoları da geçti.

Otomasyon, yedek, disk ve kapı senaryoları da geçti. Bu testlerde gerçek otomasyon hataları ve yeniden başlatmalar, Backup entegrasyonuyla alınan gerçek bir otomatik yedek ve System Monitor'ün gerçek disk sensörü kullanıldı. Yüksek ve düşük disk değerleri ile eski veya okunamayan yedek tarihleri simüle edildi.

Henüz test edilmeyenler: gerçek Hue köprüsü, gerçek Azure ve Piper, telefona gerçek bildirim, gerçek kamera ve sensörler, gerçek kapı ve pencere sensörleri, yüklemesi başarısız olan yedek, gerçekten dolu disk, eklentilerin aldığı yedekler, tam beklemeler (1, 5, 10, 15 ve 30 dakika), İngilizce dışında bir Home Assistant dili, Home Assistant OS ve HTTPS kurulumları. Her bekçiyi kendi sisteminde dene. Ses motoru betiği `http://localhost:8123` adresine bağlanır; yalnızca HTTPS kullanan kurulumlarda bu adresi değiştirmen gerekir.

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
