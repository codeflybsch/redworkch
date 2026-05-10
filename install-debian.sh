#!/usr/bin/env bash
# ============================================================
#  redwork.ch  - VPS / VDS kurulum scripti
#  Desteklenen sistemler: Debian 11/12, Ubuntu 22.04/24.04
#  Kullanim: sudo bash install-debian.sh
# ============================================================
set -e

# ---------- Renkler ----------
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[x]${NC} $1"; }

if [[ $EUID -ne 0 ]]; then
   err "Bu script root olarak calistirilmalidir.  ->  sudo bash $0"
   exit 1
fi

# ---------- Soru-cevap ----------
read -rp "Domain adresi (orn. redwork.ch)              : " DOMAIN
read -rp "Admin kullanici adi                            : " ADMIN_USERNAME
read -rsp "Admin sifresi                                  : " ADMIN_PASSWORD; echo
read -rp "Mail SMTP host (orn. mail.redwork.ch)         : " SMTP_HOST
read -rp "Mail SMTP port (465 / 587)                    : " SMTP_PORT
read -rp "Mail kullanici (orn. info@redwork.ch)         : " SMTP_USER
read -rsp "Mail sifresi                                   : " SMTP_PASSWORD; echo
read -rp "Gonderici ad (orn. RedWORK)                   : " SMTP_FROM_NAME
read -rp "Lets Encrypt SSL kurulsun mu? (y/n)           : " WANT_SSL

APP_DIR=/opt/redwork
NODE_VERSION=20

# ---------- Sistem paketleri ----------
log "Paketler guncelleniyor..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl wget git build-essential ca-certificates gnupg \
                   software-properties-common ufw nginx python3 python3-pip python3-venv

# ---------- Node.js 20 ----------
log "Node.js ${NODE_VERSION} kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
npm i -g yarn pm2

# ---------- MongoDB 7 ----------
log "MongoDB kuruluyor..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
. /etc/os-release
if [[ "$ID" == "ubuntu" ]]; then
  echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu ${VERSION_CODENAME}/mongodb-org/7.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
else
  echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/debian ${VERSION_CODENAME} main" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
fi
apt-get update -y
apt-get install -y mongodb-org
systemctl enable --now mongod

# ---------- Supervisor ----------
log "Supervisor kuruluyor..."
apt-get install -y supervisor
systemctl enable --now supervisor

# ---------- Kod cekiliyor ----------
log "Kod /opt/redwork dizinine kopyalaniyor..."
mkdir -p ${APP_DIR}
if [[ -d ./backend && -d ./frontend ]]; then
   cp -r ./* ${APP_DIR}/ || true
else
   warn "Bu scripti proje koksuyle ayni dizinden calistirin (icinde 'backend' ve 'frontend' klasorleri olan)."
   exit 1
fi
chown -R root:root ${APP_DIR}

# ---------- Backend ----------
log "Backend bagimliliklari kuruluyor..."
cd ${APP_DIR}/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip wheel
pip install -r requirements.txt
deactivate

cat > ${APP_DIR}/backend/.env <<EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=redwork
CORS_ORIGINS=*
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
JWT_SECRET=$(openssl rand -hex 32)
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASSWORD=${SMTP_PASSWORD}
SMTP_FROM=${SMTP_USER}
SMTP_FROM_NAME=${SMTP_FROM_NAME}
SMTP_USE_TLS=true
EOF
chmod 600 ${APP_DIR}/backend/.env

# ---------- Frontend ----------
log "Frontend kuruluyor (yarn install + build)..."
cat > ${APP_DIR}/frontend/.env <<EOF
REACT_APP_BACKEND_URL=https://${DOMAIN}
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
EOF
cd ${APP_DIR}/frontend
yarn install --frozen-lockfile || yarn install
yarn build

# ---------- Supervisor servisleri ----------
log "Supervisor yapilandiriliyor..."
cat > /etc/supervisor/conf.d/redwork-backend.conf <<EOF
[program:redwork-backend]
command=${APP_DIR}/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
directory=${APP_DIR}/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/redwork-backend.err.log
stdout_logfile=/var/log/redwork-backend.out.log
environment=PYTHONUNBUFFERED=1
EOF

# Frontend statik build /frontend/build/ icinden Nginx servisi yapacak
supervisorctl reread
supervisorctl update
supervisorctl restart redwork-backend || supervisorctl start redwork-backend

# ---------- Nginx ----------
log "Nginx yapilandiriliyor..."
cat > /etc/nginx/sites-available/redwork <<NGX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${APP_DIR}/frontend/build;
    index index.html;

    client_max_body_size 25m;

    # API -> backend
    location /api/ {
        proxy_pass         http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
    }

    # SPA fallback
    location / {
        try_files \$uri /index.html;
    }
}
NGX
ln -sf /etc/nginx/sites-available/redwork /etc/nginx/sites-enabled/redwork
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ---------- Guvenlik duvari ----------
log "UFW yapilandiriliyor..."
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
yes | ufw enable || true

# ---------- SSL (Lets Encrypt) ----------
if [[ "$WANT_SSL" =~ ^[Yy]$ ]]; then
   log "Certbot kuruluyor ve SSL aliniyor..."
   apt-get install -y certbot python3-certbot-nginx
   certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m admin@${DOMAIN} --redirect || \
      warn "Certbot basarisiz oldu. DNS A kaydinin sunucuya isaret ettiginden emin olun, sonra: 'certbot --nginx -d ${DOMAIN}' calistirin."
fi

log "------------------------------------------------------------"
log "KURULUM TAMAMLANDI."
log "  Site:        http://${DOMAIN}/"
log "  Admin Panel: http://${DOMAIN}/admin/login"
log "  Backend log: tail -f /var/log/redwork-backend.err.log"
log "  Yeniden baslat: supervisorctl restart redwork-backend"
log "------------------------------------------------------------"
