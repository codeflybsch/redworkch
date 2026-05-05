# redwork.ch – Sıfırdan VPS / VDS Kurulum Rehberi

Bu rehber, **hiç sunucu kurmamış** birini bile elinden tutarak siteyi
canlıya alır. Tahmini süre: **15–25 dakika**.

> Senin durumun: 14 yaşındasın, bu işe yenisin. Hiç stres yapma — komutları
> birebir kopyala-yapıştır yeterli. Bir adım takılırsan dur, hatayı yaz, sonra
> devam et.

---

## 1) İhtiyacın olanlar

| Ne lazım?                       | Açıklama                                                  |
|---------------------------------|-----------------------------------------------------------|
| Bir VPS / VDS                   | En az **2 GB RAM**, 20 GB disk, root erişimi              |
| İşletim sistemi                 | **Ubuntu 22.04/24.04**, **Debian 12** veya **AlmaLinux 9**|
| Bir **domain** (örn. `redwork.ch`) | DNS ayarlarına erişimin olmalı                          |
| SSH istemcisi                   | Windows: PuTTY veya Terminal · Mac/Linux: `ssh` komutu    |
| Mail SMTP bilgileri             | Cevap maili göndermek için (örn. Plesk mail kutusu)       |

---

## 2) Domaini sunucuya yönlendir

Domain panelinden (örn. **Plesk → Domains → DNS Settings**, ya da Cloudflare
gibi nereyi kullanıyorsan) iki **A** kaydı oluştur:

```
A   redwork.ch       ->   <SUNUCU_IP>
A   www.redwork.ch   ->   <SUNUCU_IP>
```

DNS yayılması 5 dk – 1 saat sürebilir. Test için: `ping redwork.ch` çıkan IP
sunucununki olmalı.

---

## 3) Sunucuya bağlan

**Windows:** PuTTY aç → Host: `<SUNUCU_IP>` → Open → kullanıcı `root` →
sunucu sağlayıcının verdiği şifre.

**Mac/Linux:**
```bash
ssh root@<SUNUCU_IP>
```

---

## 4) Projeyi sunucuya yükle

İki yolu var, sana uygun olanı seç:

**(A) ZIP ile (en kolay):**

Projeyi yerel bilgisayarından sunucuya gönder:
```bash
# Yerel bilgisayardan (Mac/Linux veya Windows WSL):
scp redwork.zip root@<SUNUCU_IP>:/root/
```

Sonra sunucuda:
```bash
cd /root
apt-get update -y && apt-get install -y unzip   # AlmaLinux: dnf install -y unzip
unzip redwork.zip -d redwork
cd redwork
```

**(B) Git ile (eğer GitHub'a yüklediysen):**
```bash
cd /root
apt-get install -y git    # AlmaLinux: dnf install -y git
git clone https://github.com/<kullanici>/<repo>.git redwork
cd redwork
```

Şimdi `redwork` klasörünün içinde olmalısın, içinde `backend` ve `frontend`
klasörlerini görmelisin:
```bash
ls
# Görmesi gereken: backend  frontend  install-debian.sh  install-rhel.sh  ...
```

---

## 5) Otomatik kurulum scriptini çalıştır

### 5.A) Ubuntu / Debian için
```bash
bash install-debian.sh
```

### 5.B) AlmaLinux / Rocky / RHEL için
```bash
bash install-rhel.sh
```

Script sana sırayla şunları soracak — örnek cevaplarla:

```
Domain adresi (orn. redwork.ch)              : redwork.ch
Admin kullanici adi                            : admin
Admin sifresi                                  : <gizli, panel girişi için>
Mail SMTP host (orn. mail.redwork.ch)         : mail.redwork.ch
Mail SMTP port (465 / 587)                    : 465
Mail kullanici (orn. info@redwork.ch)         : info@redwork.ch
Mail sifresi                                   : <Plesk mail kutusu şifresi>
Gonderici ad (orn. RedWORK)                   : RedWORK | WebDesign, App, Hosting
Lets Encrypt SSL kurulsun mu? (y/n)           : y
```

> **Önemli:** SSL'in (`y`) çalışması için domainin DNS'i sunucuya zaten
> yönlendirilmiş olmalı (Adım 2). Aksi halde Certbot başarısız olur — sorun
> değil, sonradan da çalıştırabilirsin.

Script tamamlandığında ekranda şu çıkacak:
```
[+] KURULUM TAMAMLANDI.
[+]   Site:        http://redwork.ch/
[+]   Admin Panel: http://redwork.ch/admin/login
```

---

## 6) Test et

1. Tarayıcıdan `https://redwork.ch` aç → site açılmalı.
2. `https://redwork.ch/admin/login` → adım 5'teki admin kullanıcı/şifresi.
3. Admin panelinde **Website-Inhalte** sekmesini aç → bir slide ekle/değiştir →
   **Speichern** → ana sayfayı yenile, değişikliği gör.
4. Bir test mesajı gönder (kontakt formu) → admin panelde **Kontakt-Nachrichten** →
   mesajı aç → **Antwort senden** → kendi adresine gerçek mail gitmeli.

---

## 7) Sık karşılaşılan sorunlar

| Sorun                              | Çözüm                                                                                  |
|------------------------------------|----------------------------------------------------------------------------------------|
| Site açılmıyor / 502               | `supervisorctl status` ile backend çalışıyor mu bak. `tail -f /var/log/redwork-backend.err.log` ile log oku. |
| `nginx -t` "permission denied" der | AlmaLinux için: `setsebool -P httpd_can_network_connect 1`                              |
| SSL Certbot hatası                 | DNS henüz yayılmadıysa biraz bekle, sonra: `certbot --nginx -d redwork.ch -d www.redwork.ch` |
| Mail gitmiyor                      | `/opt/redwork/backend/.env` içindeki SMTP bilgilerini kontrol et, sonra `supervisorctl restart redwork-backend` |
| MongoDB başlamadı                  | `systemctl status mongod` → genelde `journalctl -u mongod` log gösterir                 |
| Plesk fail2ban bizi banladı        | Plesk → Tools & Settings → IP Address Banning → Banned IPs → Unban (veya sunucu IP'ni Trusted'a ekle) |

---

## 8) Faydalı komutlar

```bash
# Backend yeniden başlat (kod değişikliğinden sonra)
supervisorctl restart redwork-backend

# Frontend'i yeniden derle (kod değişikliğinden sonra)
cd /opt/redwork/frontend && yarn build

# Backend logu canlı izle
tail -f /var/log/redwork-backend.err.log

# Nginx logu
tail -f /var/log/nginx/error.log

# .env'yi düzenle (örn. mail şifresi değiştirmek için)
nano /opt/redwork/backend/.env
supervisorctl restart redwork-backend
```

---

## 9) Güncelleme yapmak istersen

Yeni bir versiyon yüklediğinde:
```bash
cd /opt/redwork
# Yeni dosyaları kopyala (ZIP açtığın yerden)
cp -r /root/yeni-redwork/* /opt/redwork/

# Backend'i güncelle
cd /opt/redwork/backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
supervisorctl restart redwork-backend

# Frontend'i güncelle
cd /opt/redwork/frontend
yarn install
yarn build
```

`.env` dosyalarını **silme** — şifreler ve ayarlar orada.

---

## 10) Yedekleme (önerilir)

```bash
# MongoDB veritabanı yedeği
mongodump --db redwork --out /root/backup-$(date +%F)

# Geri yükleme
mongorestore --db redwork /root/backup-2026-05-05/redwork
```

Cron ile her gece otomatik yedek için:
```bash
echo "0 3 * * * mongodump --db redwork --out /root/backup-\$(date +\%F) --gzip" | crontab -
```

---

## Özet

✅ Tek script (`install-debian.sh` veya `install-rhel.sh`) hemen her şeyi kurar.  
✅ Admin panelden **Website-Inhalte** sekmesinde Hero, slides, butonlar, partnerler ve istatistikler düzenlenebilir.  
✅ **Kontakt-Nachrichten** içinde gelen mesajları SMTP üzerinden direkt cevaplayabilirsin (thread görünümü ile).  
✅ Plesk SMTP'si (`mail.redwork.ch`, port 465) doğrulandı, çalışıyor.

İyi yolculuklar! 🚀
