# 🚀 Guia de Deploy - Sistema Nutricional

Este guia fornece instruções detalhadas para deploy da aplicação Sistema Nutricional em diferentes ambientes.

## 📋 Pré-requisitos

### Servidor de Produção
- **OS:** Ubuntu 20.04 LTS ou superior
- **CPU:** 2+ cores
- **RAM:** 4GB+ (8GB recomendado)
- **Storage:** 20GB+ SSD
- **Docker:** 20.10+ e Docker Compose 2.0+
- **Nginx:** 1.18+ (opcional, para reverse proxy)

### Domínio e SSL
- Domínio registrado
- Certificado SSL (Let's Encrypt recomendado)
- DNS configurado apontando para o servidor

## 🐳 Deploy com Docker (Recomendado)

### 1. Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sessão para aplicar permissões
```

### 2. Preparação da Aplicação

```bash
# Criar diretório da aplicação
sudo mkdir -p /opt/sistema-nutricional
sudo chown $USER:$USER /opt/sistema-nutricional
cd /opt/sistema-nutricional

# Clonar repositório (ou fazer upload dos arquivos)
git clone https://github.com/seu-usuario/sistema-nutricional.git .

# Configurar variáveis de ambiente
cp .env.example .env.production
```

### 3. Configuração de Produção

Edite o arquivo `.env.production`:

```bash
# Aplicação
NODE_ENV=production
NEXTAUTH_URL=https://seudominio.com
NEXTAUTH_SECRET=sua-chave-super-secreta-256-bits
ENCRYPTION_KEY=sua-chave-criptografia-aes-256-32-chars

# Banco de Dados
DATABASE_URL=file:/app/data/production.db

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-gmail
SMTP_FROM=noreply@seudominio.com

# Monitoramento
GRAFANA_PASSWORD=senha-segura-para-grafana
```

### 4. Deploy da Aplicação

```bash
# Build e iniciar containers
docker-compose --env-file .env.production up -d

# Verificar status
docker-compose ps

# Verificar logs
docker-compose logs -f app
```

### 5. Configuração do Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/sistema-nutricional
```

Configuração do Nginx:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

    # Proxy configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Rate limiting for specific endpoints
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://localhost:3000;
        # ... outros headers proxy
    }

    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
        # ... outros headers proxy
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/sistema-nutricional /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Configuração SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obter certificado
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Verificar renovação automática
sudo certbot renew --dry-run
```

## ⚙️ Deploy com Monitoramento Completo

Para deploy com stack completa de monitoramento:

```bash
# Usar o compose de monitoramento
docker-compose -f docker-compose.monitoring.yml --env-file .env.production up -d

# Verificar todos os serviços
docker-compose -f docker-compose.monitoring.yml ps
```

### Acessos de Monitoramento:
- **Grafana:** https://seudominio.com:3001 (admin/senha-configurada)
- **Prometheus:** https://seudominio.com:9090
- **Jaeger:** https://seudominio.com:16686
- **Uptime Kuma:** https://seudominio.com:3002

## 🔄 CI/CD Automático

### 1. Configuração do Servidor

```bash
# Criar usuário para deploy
sudo adduser deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh

# Adicionar chave SSH pública do GitHub Actions
sudo nano /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh

# Configurar permissões para a aplicação
sudo chown -R deploy:deploy /opt/sistema-nutricional
```

### 2. Script de Deploy

Criar `/opt/sistema-nutricional/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."

# Navegar para diretório da aplicação
cd /opt/sistema-nutricional

# Fazer backup do banco de dados
echo "📦 Fazendo backup do banco..."
docker-compose exec -T app cp /app/data/production.db /app/data/backup-$(date +%Y%m%d-%H%M%S).db || true

# Pull da nova imagem
echo "📥 Baixando nova versão..."
docker-compose pull

# Atualizar containers
echo "🔄 Atualizando aplicação..."
docker-compose up -d

# Aguardar aplicação ficar healthy
echo "🏥 Verificando saúde da aplicação..."
sleep 30
curl -f http://localhost:3000/api/health || exit 1

# Limpeza de imagens antigas
echo "🧹 Limpando imagens antigas..."
docker system prune -f

echo "✅ Deploy concluído com sucesso!"
```

```bash
chmod +x /opt/sistema-nutricional/deploy.sh
```

### 3. Configurar GitHub Secrets

No GitHub, configure os seguintes secrets:

```bash
PROD_HOST=ip-do-seu-servidor
PROD_USER=deploy
PROD_SSH_KEY=chave-ssh-privada-do-deploy
DOCKER_USERNAME=seu-usuario-docker
DOCKER_PASSWORD=senha-docker
SLACK_WEBHOOK_URL=webhook-slack-para-notificacoes
```

## 📊 Monitoramento de Produção

### Health Checks

```bash
# Verificar saúde da aplicação
curl https://seudominio.com/api/health

# Verificar logs
docker-compose logs -f --tail=100 app

# Verificar métricas
curl https://seudominio.com/api/system/metrics
```

### Alertas Importantes

Configure alertas para:
- **Uptime < 99%**
- **Response time > 2s**
- **Error rate > 1%**
- **Memory usage > 80%**
- **Disk space < 10%**
- **Failed login attempts > 10/min**

## 🔒 Segurança de Produção

### Firewall

```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Backup Automático

Criar script `/opt/sistema-nutricional/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/sistema-nutricional"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco de dados
docker-compose exec -T app cp /app/data/production.db /tmp/backup-$DATE.db
docker cp $(docker-compose ps -q app):/tmp/backup-$DATE.db $BACKUP_DIR/

# Backup de configurações
cp .env.production $BACKUP_DIR/env-$DATE.backup

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

Configurar cron:
```bash
# Backup diário às 2h
0 2 * * * /opt/sistema-nutricional/backup.sh >> /var/log/backup.log 2>&1
```

## 🚨 Troubleshooting

### Problemas Comuns

**Container não inicia:**
```bash
# Verificar logs
docker-compose logs app

# Verificar recursos
docker stats

# Reiniciar serviços
docker-compose restart
```

**Banco de dados corrompido:**
```bash
# Restaurar backup
docker-compose down
cp /opt/backups/sistema-nutricional/backup-YYYYMMDD-HHMMSS.db ./data/production.db
docker-compose up -d
```

**SSL não funciona:**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

**Performance ruim:**
```bash
# Verificar recursos
htop
docker stats

# Verificar logs de erro
docker-compose logs app | grep ERROR

# Otimizar banco
docker-compose exec app npx prisma db push
```

## 📞 Suporte

Para problemas de deploy:
1. Verificar logs: `docker-compose logs app`
2. Verificar saúde: `curl localhost:3000/api/health`
3. Verificar recursos: `docker stats`
4. Criar issue no GitHub com logs completos

---

**Deploy realizado com sucesso! 🎉**