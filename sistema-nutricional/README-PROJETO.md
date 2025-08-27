# 🥗 Sistema Nutricional

Uma plataforma completa para nutricionistas e pacientes, desenvolvida com Next.js 14, React, TypeScript e tecnologias modernas.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Funcionalidades

### 👥 Para Pacientes
- **Dashboard personalizado** com métricas e progresso
- **Dieta personalizada** com planos alimentares
- **Registro alimentar** para acompanhamento
- **Métricas corporais** com gráficos interativos
- **Agendamento de consultas** com nutricionista
- **Biblioteca de receitas** saudáveis
- **Checklist diário** de hábitos
- **Sistema de mensagens** com nutricionista
- **Notificações em tempo real**

### 👨‍⚕️ Para Nutricionistas
- **Dashboard administrativo** com visão geral
- **Gestão de pacientes** completa
- **Calculadora de dieta** com TMB/GET
- **Sistema de agendamentos** com calendário
- **Biblioteca de receitas** personalizadas
- **Relatórios detalhados** em PDF
- **Sistema de mensagens** com pacientes
- **Logs de auditoria** e segurança

### 🔐 Segurança Avançada
- **Autenticação de dois fatores (2FA)** com TOTP
- **Recuperação segura de senha** por email
- **Rate limiting** inteligente
- **Detecção de login suspeito**
- **Logs de auditoria** completos
- **Criptografia de dados sensíveis**
- **Validações de segurança** robustas

### 🔔 Recursos Técnicos
- **Notificações em tempo real** via Server-Sent Events
- **Interface responsiva** com Tailwind CSS
- **Tema moderno** com shadcn/ui
- **Banco de dados** SQLite com Prisma
- **Containerização** com Docker
- **CI/CD** com GitHub Actions
- **Monitoramento** com Prometheus/Grafana

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, React 19, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend:** Next.js API Routes, Prisma ORM
- **Banco:** SQLite (desenvolvimento), PostgreSQL (produção)
- **Autenticação:** NextAuth.js, JWT, 2FA
- **Validação:** Zod, React Hook Form
- **Gráficos:** Recharts
- **Segurança:** bcrypt, speakeasy, rate limiting
- **DevOps:** Docker, GitHub Actions, Prometheus
- **Monitoramento:** Grafana, Jaeger, Loki

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Docker (opcional)

### Desenvolvimento Local

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/sistema-nutricional.git
cd sistema-nutricional
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados:**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

6. **Acesse a aplicação:**
- URL: http://localhost:3000
- Login Paciente: `paciente@teste.com` / `123456`
- Login Nutricionista: `nutricionista@teste.com` / `123456`

## 🐳 Deploy com Docker

### Build da Imagem
```bash
docker build -t sistema-nutricional .
```

### Execução Simples
```bash
docker run -p 3000:3000 \
  -e NEXTAUTH_SECRET="seu-secret-super-seguro" \
  -e ENCRYPTION_KEY="sua-chave-criptografia-32-chars" \
  sistema-nutricional
```

### Docker Compose (Recomendado)
```bash
# Produção simples
docker-compose up -d

# Com monitoramento completo
docker-compose -f docker-compose.monitoring.yml up -d
```

## 🔧 Configuração de Produção

### Variáveis de Ambiente Essenciais

```bash
# Aplicação
NODE_ENV=production
NEXTAUTH_URL=https://seudominio.com
NEXTAUTH_SECRET=chave-super-secreta-256-bits
ENCRYPTION_KEY=chave-criptografia-aes-256-32-chars

# Banco de Dados
DATABASE_URL=postgresql://user:password@host:5432/database

# Email (para recuperação de senha)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@seudominio.com

# Monitoramento (opcional)
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_PASSWORD=senha-segura-grafana
```

### Nginx Reverse Proxy

O projeto inclui configuração completa do Nginx com:
- SSL/TLS automático
- Rate limiting
- Headers de segurança
- Compressão gzip
- Cache de assets estáticos

## 📊 Monitoramento

### Stack de Observabilidade
- **Métricas:** Prometheus + Grafana
- **Logs:** Loki + Promtail
- **Tracing:** Jaeger
- **Uptime:** Uptime Kuma
- **Alertas:** Alertmanager

### Dashboards Disponíveis
- **Aplicação:** Métricas de negócio e performance
- **Sistema:** CPU, memória, disco, rede
- **Segurança:** Tentativas de login, 2FA, alertas
- **Banco de Dados:** Conexões, queries, performance

### URLs de Monitoramento
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- Jaeger: http://localhost:16686
- Uptime Kuma: http://localhost:3002

## 🚀 CI/CD

### GitHub Actions

O projeto inclui workflows completos para:

1. **CI (Continuous Integration):**
   - Testes automatizados
   - Verificação de tipos TypeScript
   - Lint e formatação de código
   - Análise de segurança
   - Build da aplicação

2. **CD (Continuous Deployment):**
   - Build e push da imagem Docker
   - Deploy automático para staging
   - Deploy manual para produção
   - Notificações no Slack

3. **Segurança:**
   - Scan de vulnerabilidades diário
   - Verificação de dependências
   - Análise SAST
   - Detecção de secrets

### Configuração dos Secrets

```bash
# GitHub Secrets necessários
DOCKER_USERNAME=seu-usuario-docker
DOCKER_PASSWORD=sua-senha-docker
STAGING_HOST=ip-servidor-staging
STAGING_USER=usuario-ssh
STAGING_SSH_KEY=chave-ssh-privada
PROD_HOST=ip-servidor-producao
PROD_USER=usuario-ssh
PROD_SSH_KEY=chave-ssh-privada
SLACK_WEBHOOK_URL=webhook-slack-notificacoes
```

## 🔒 Segurança

### Checklist de Segurança Implementada

✅ **Autenticação:**
- Senhas com hash bcrypt (12 rounds)
- JWT tokens seguros
- 2FA com TOTP (Google Authenticator)
- Códigos de backup criptografados

✅ **Autorização:**
- Role-based access control (RBAC)
- Middleware de proteção de rotas
- Validação de permissões por endpoint

✅ **Rate Limiting:**
- Login: 5 tentativas/15min
- API: 100 requests/min
- Reset senha: 3 tentativas/hora

✅ **Detecção de Ameaças:**
- Login suspeito por IP/device
- Bloqueio automático de contas
- Alertas por email em tempo real

✅ **Logs de Auditoria:**
- Todas as ações são logadas
- Exportação para compliance
- Monitoramento de padrões suspeitos

✅ **Headers de Segurança:**
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options, X-XSS-Protection

✅ **Validação de Entrada:**
- Sanitização de inputs
- Validação com Zod
- Proteção contra XSS/SQLi

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e

# Testes de performance
npm run test:performance
```

## 📈 Performance

### Otimizações Implementadas
- **Bundle splitting** automático
- **Lazy loading** de componentes
- **Image optimization** com Next.js
- **Caching** inteligente
- **Compressão** gzip/brotli
- **CDN** para assets estáticos

### Métricas de Performance
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- **ESLint:** Configuração padrão Next.js
- **Prettier:** Formatação automática
- **Husky:** Hooks de pre-commit
- **Conventional Commits:** Padrão de commits

## 📝 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

### Documentação Adicional
- [Guia de Segurança](SECURITY.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)

### Contato
- **Email:** admin@sistemanutricional.com
- **Issues:** [GitHub Issues](https://github.com/seu-usuario/sistema-nutricional/issues)
- **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/sistema-nutricional/discussions)

---

**Desenvolvido com ❤️ para a comunidade de saúde e nutrição**