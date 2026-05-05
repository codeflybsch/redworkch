#!/usr/bin/env bash
# ============================================================
#  redwork.ch  - VPS / VDS kurulum scripti
#  Desteklenen sistemler: AlmaLinux 9, Rocky Linux 9, RHEL 9
#  Kullanim: sudo bash install-rhel.sh
# ============================================================
set -e

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[x]${NC} $1"; }

if [[ $EUID -ne 0 ]]; then
   err "Bu script root olarak calistirilmalidir.  ->  sudo bash $0"
   exit 1
fi

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

log "Sistem paketleri kuruluyor..."
dnf install -y epel-release || true
dnf install -y curl wget git tar gcc gcc-c++ make openssl openssl-devel \
               python3 python3-pip python3-devel firewalld nginx policycoreutils-python-utils

# ---------- Node.js 20 ----------
log "Node.js 20 kuruluyor..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
npm i -g yarn

# ---------- MongoDB 7 ----------
log "MongoDB 7 kuruluyor..."
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

# ---------- Supervisor ----------
log "Supervisor kuruluyor..."
pip3 install supervisor
mkdir -p /etc/supervisord.d /var/log/supervisor
cat > /etc/supervisord.conf <<'EOF'
[unix_http_server]
file=/var/run/supervisor.sock
chmod=0700

[supervisord]
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
childlogdir=/var/log/supervisor
nodaemon=false

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///var/run/supervisor.sock

[include]
files = /etc/supervisord.d/*.conf
EOF
cat > /etc/systemd/system/supervisord.service <<'EOF'
[Unit]
Description=Supervisor
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/supervisord -c /etc/supervisord.conf
ExecStop=/usr/local/bin/supervisorctl shutdown
ExecReload=/usr/local/bin/supervisorctl reload

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now supervisord

# ---------- Kod ----------
log "Kod /opt/redwork dizinine kopyalaniyor..."
mkdir -p ${APP_DIR}
if [[ -d ./backend && -d ./frontend ]]; then
   cp -r ./* ${APP_DIR}/ || true
else
   warn "Bu scripti proje koksuyle ayni dizinden calistirin (icinde 'backend' ve 'frontend' klasorleri olan)."
   exit 1
fi

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
log "Frontend kuruluyor + build..."
cat > ${APP_DIR}/frontend/.env <<EOF
REACT_APP_BACKEND_URL=https://${DOMAIN}
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
EOF
cd ${APP_DIR}/frontend
yarn install --frozen-lockfile || yarn install
yarn build

# ---------- Supervisor servisi ----------
cat > /etc/supervisord.d/redwork-backend.conf <<EOF
[program:redwork-backend]
command=${APP_DIR}/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
directory=${APP_DIR}/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/redwork-backend.err.log
stdout_logfile=/var/log/redwork-backend.out.log
environment=PYTHONUNBUFFERED=1
EOF
supervisorctl reread || true
supervisorctl update || true
supervisorctl restart redwork-backend || supervisorctl start redwork-backend

# ---------- Nginx ----------
log "Nginx yapilandiriliyor..."
cat > /etc/nginx/conf.d/redwork.conf <<NGX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${APP_DIR}/frontend/build;
    index index.html;
    client_max_body_size 25m;

    location /api/ {
        proxy_pass         http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
    }
    location / {
        try_files \$uri /index.html;
    }
}
NGX
# SELinux: Nginx'in backend'e baglanmasina izin ver + frontend dosyalarini okumasina izin ver
setsebool -P httpd_can_network_connect 1 || true
chcon -Rt httpd_sys_content_t ${APP_DIR}/frontend/build || true
nginx -t
systemctl enable --now nginx
systemctl reload nginx

# ---------- firewalld ----------
log "Firewall yapilandiriliyor..."
systemctl enable --now firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# ---------- SSL ----------
if [[ "$WANT_SSL" =~ ^[Yy]$ ]]; then
   log "Certbot kuruluyor ve SSL aliniyor..."
   dnf install -y certbot python3-certbot-nginx
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
