# 🚀 Kendi VPS'ine Kurulum Rehberi (14 Yaşında Anlat Modu)

Selam! Bu rehber, redwork.ch sitesini kendi sunucuna (VPS) kurmak için. **Adım adım, yavaş yavaş, tıkır tıkır** ilerleyeceğiz. Endişelenme, hata yapsan da geri dönebilirsin. ✌️

> **Hangi işletim sistemi?** Bu rehberde **Ubuntu**, **Debian** ve **AlmaLinux/Rocky** için ayrı talimatlar var. VPS satın aldığında bunlardan birini seçmen yeterli. En kolay = Ubuntu 22.04.

---

## 📦 Sana Lazım Olanlar

1. Bir VPS (örn. Hetzner, Contabo, DigitalOcean, Hostinger). En az **2 GB RAM, 1 vCPU, 20 GB disk**.
2. Bir **alan adı** (mesela `redwork.ch`). Domain'in DNS ayarlarına bir **A kaydı** ekleyip VPS IP'sine yönlendireceksin.
3. Bir **SSH istemcisi** (Windows: Termius veya PuTTY; Mac/Linux: zaten var, terminal yeter).
4. Bu projenin kodları (zip dosyası ya da git repo).

---

## 🪜 Adım 0 — VPS'e Bağlan

Aldığın VPS'in size IP, kullanıcı adı (genelde `root`) ve parola/SSH key vermiştir.

```bash
ssh root@VPS_IP_ADRESIN
```

Şifre sorarsa yaz, **Enter**. İlk açılışta `yes` yaz, **Enter**.

Şimdi VPS'in içindeyiz. Tüm aşağıdaki komutları **VPS terminalinde** çalıştıracağız.

---

## 🅰️ ADIM 1 — Sistemi Güncelle

### Ubuntu / Debian
```bash
apt update && apt upgrade -y
apt install -y curl wget git unzip nano ufw build-essential ca-certificates gnupg
```

### AlmaLinux / Rocky / RHEL
```bash
dnf update -y
dnf install -y curl wget git unzip nano firewalld policycoreutils-python-utils \
               gcc gcc-c++ make tar
systemctl enable --now firewalld
```

> 💡 **Tip**: Komut çok uzunsa kopyalarken `\` (devam karakteri) işaretlerine dikkat. Tek satır da yazabilirsin.

---

## 🔥 ADIM 2 — Güvenlik Duvarı (Firewall)

### Ubuntu / Debian (`ufw`)
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

### AlmaLinux (`firewalld`)
```bash
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

---

## 🐍 ADIM 3 — Python 3.11+ Kur

### Ubuntu / Debian
```bash
apt install -y python3 python3-pip python3-venv \
               libpango-1.0-0 libcairo2 libffi-dev pkg-config
python3 --version    # 3.11+ görmelisin
```

### AlmaLinux
```bash
dnf install -y python3.11 python3.11-pip python3.11-devel \
               cairo pango libffi-devel
ln -sf /usr/bin/python3.11 /usr/local/bin/python3
python3 --version
```

---

## 🟢 ADIM 4 — Node.js 20 + Yarn

### Ubuntu / Debian
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g yarn
node -v && yarn -v
```

### AlmaLinux
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
npm install -g yarn
node -v && yarn -v
```

---

## 🍃 ADIM 5 — MongoDB Kur

### Ubuntu 22.04
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] \
  https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  tee /etc/apt/sources.list.d/mongodb-org-7.0.list

apt update && apt install -y mongodb-org
systemctl enable --now mongod
systemctl status mongod   # "active (running)" görmelisin
```

> Debian 12 için yukarıdaki `jammy` kelimesini `bookworm` ile değiştir.

### AlmaLinux 9
`/etc/yum.repos.d/mongodb-org-7.0.repo` dosyası oluştur:
```bash
cat > /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

dnf install -y mongodb-org
systemctl enable --now mongod
```

---

## 📁 ADIM 6 — Proje Dosyalarını Yükle

```bash
mkdir -p /var/www
cd /var/www
# Eğer zip varsa:
# scp ile yükle ya da:
# wget -O proje.zip "ZIP_LINKIN" && unzip proje.zip -d redwork
# Ya da git ile:
# git clone https://github.com/KULLANICI/redwork.git redwork

# Burada "redwork" klasörü oluştuğunu varsayıyoruz:
cd /var/www/redwork
ls   # backend/ frontend/ INSTALL.md ... görmelisin
```

---

## 🔧 ADIM 7 — Backend'i Hazırla

```bash
cd /var/www/redwork/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**`.env` dosyasını oluştur** (parolayı kendine göre değiştir!):

```bash
cat > .env <<'EOF'
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=redwork_db
JWT_SECRET=BURAYA-EN-AZ-32-KARAKTER-RANDOM-BIR-SEY-YAZ
ADMIN_USERNAME=admin
ADMIN_PASSWORD=COKIYI-BIR-PAROLA-DEGISTIR

# E-Posta gönderebilmek için (örn. Mailgun, SendGrid SMTP, kendi mailservern):
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=info@redwork.ch
SMTP_FROM_NAME=redwork.ch
SMTP_USE_TLS=true
EOF
```

> ⚠️ `JWT_SECRET` ve `ADMIN_PASSWORD` mutlaka uzun, karışık olsun! Tahmin edilebilir parola koyarsan hesabını çalarlar.

Backend'i bir kere elle test et:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001
# Tarayıcıdan http://VPS_IP:8001/api → "redwork.ch API läuft" görmelisin
# Ctrl+C ile kapat
```

---

## 🎨 ADIM 8 — Frontend'i Build Et

```bash
cd /var/www/redwork/frontend

# .env dosyası
cat > .env <<EOF
REACT_APP_BACKEND_URL=https://SENIN-DOMAIN.ch
WDS_SOCKET_PORT=443
EOF

yarn install
yarn build       # build/ klasörü oluşur
```

> **Önemli:** `REACT_APP_BACKEND_URL`'e backend'in dış adresini yaz. Domain ayarlanmadıysa `http://VPS_IP` da yazabilirsin (geçici).

---

## 🛡 ADIM 9 — Servisleri Sürekli Çalıştır (systemd)

### Backend için servis dosyası
```bash
cat > /etc/systemd/system/redwork-backend.service <<'EOF'
[Unit]
Description=redwork.ch Backend (FastAPI)
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/redwork/backend
EnvironmentFile=/var/www/redwork/backend/.env
ExecStart=/var/www/redwork/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now redwork-backend
systemctl status redwork-backend
```

> **AlmaLinux için ek**: SELinux backend'i engelliyorsa:
> ```bash
> setsebool -P httpd_can_network_connect 1
> ```

---

## 🌐 ADIM 10 — NGINX + HTTPS (SSL)

### NGINX kur
```bash
# Ubuntu/Debian
apt install -y nginx
# AlmaLinux
dnf install -y nginx && systemctl enable --now nginx
```

### Site konfigürasyonu
```bash
cat > /etc/nginx/sites-available/redwork.conf <<'EOF'
server {
    listen 80;
    server_name SENIN-DOMAIN.ch www.SENIN-DOMAIN.ch;

    # Frontend (React build)
    root /var/www/redwork/frontend/build;
    index index.html;

    # Static dosyaları cache'le
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Backend API'yi /api → localhost:8001'e ilet
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        client_max_body_size 25M;
    }

    # SPA: tüm yolları index.html'e döndür
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Ubuntu/Debian:
ln -sf /etc/nginx/sites-available/redwork.conf /etc/nginx/sites-enabled/redwork.conf
rm -f /etc/nginx/sites-enabled/default

# AlmaLinux:
# /etc/nginx/conf.d/redwork.conf altına aynı içeriği yazsan da çalışır.

nginx -t
systemctl reload nginx
```

### Let's Encrypt ile ücretsiz HTTPS
```bash
# Ubuntu/Debian:
apt install -y certbot python3-certbot-nginx

# AlmaLinux:
dnf install -y epel-release
dnf install -y certbot python3-certbot-nginx

certbot --nginx -d SENIN-DOMAIN.ch -d www.SENIN-DOMAIN.ch \
        --redirect --agree-tos -m senin@email.com --non-interactive
```

Bittiğinde tarayıcıdan `https://SENIN-DOMAIN.ch` aç → site açılır 🎉

---

## 🛠 ADIM 11 — Admin Paneline Giriş

URL: `https://SENIN-DOMAIN.ch/admin/login`
Kullanıcı: `admin`
Parola: `.env`'e koyduğun `ADMIN_PASSWORD`.

---

## 📨 ADIM 12 — E-Posta Gönderimi

Faturaları/teklifleri tek tıkla göndermek için bir SMTP gerekir.

**Mailgun, SendGrid, Brevo, kendi cPanel'in** ya da Gmail-uygulamaşifresi gibi seçeneklerden birini seç. Sonra:

```bash
nano /var/www/redwork/backend/.env
# SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM doldur
systemctl restart redwork-backend
```

---

## 🔁 ADIM 13 — Güncelleme Yapmak İstediğinde

```bash
cd /var/www/redwork
git pull   # ya da yeni zip yükle

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
systemctl restart redwork-backend

# Frontend
cd ../frontend
yarn install
yarn build
systemctl reload nginx
```

---

## 🆘 Sorun mu var?

| Belirti | Çözüm |
|---|---|
| "502 Bad Gateway" | `systemctl status redwork-backend` ile kontrol et, log'a bak: `journalctl -u redwork-backend -e` |
| "Mixed content" / API 404 | `frontend/.env` içindeki `REACT_APP_BACKEND_URL` doğru mu? `yarn build` yeniden çalıştır. |
| MongoDB bağlanmıyor | `systemctl status mongod`. Yeniden çalıştır: `systemctl restart mongod`. |
| Site açılmıyor | `nginx -t`, sonra `systemctl status nginx`. DNS A-kaydı VPS IP'ye işaret ediyor mu? |
| SELinux (AlmaLinux) | `setenforce 0` ile geçici olarak kapat, sorun gidiyorsa policy ekle. |

---

## ✨ Bonus İpuçları

- **Yedek almayı unutma!** Haftalık MongoDB dump:
  ```bash
  mongodump --db redwork_db --out /var/backups/$(date +%F)
  ```
- VPS'inde **fail2ban** kur, SSH'a deneme yapanları otomatik banla:
  ```bash
  apt install -y fail2ban   # / dnf install -y fail2ban
  systemctl enable --now fail2ban
  ```
- VPS'i **swap** ile rahatlatmak (1 GB swap):
  ```bash
  fallocate -l 1G /swapfile && chmod 600 /swapfile
  mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  ```

---

Yardıma ihtiyacın olursa: `journalctl -u redwork-backend -e` ile hata logu paylaşırsan tek tek çözeriz. **İyi çalışmalar!** 🎉
