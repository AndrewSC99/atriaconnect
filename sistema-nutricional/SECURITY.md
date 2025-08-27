# 🔐 Guia de Segurança - Sistema Nutricional

## Funcionalidades de Segurança Implementadas

### 1. Autenticação de Dois Fatores (2FA)

#### Configuração
- **TOTP (Time-based One-Time Password)** usando Google Authenticator ou similar
- **Códigos de backup** para recuperação de acesso
- **Criptografia** de secrets usando AES-256-CBC

#### APIs Disponíveis
- `POST /api/auth/two-factor/setup` - Configurar 2FA
- `POST /api/auth/two-factor/enable` - Habilitar 2FA
- `POST /api/auth/two-factor/disable` - Desabilitar 2FA
- `GET /api/auth/two-factor/status` - Status do 2FA
- `POST /api/auth/two-factor/backup-codes` - Regenerar códigos de backup

#### Como Usar
1. Usuário acessa configurações de segurança
2. Chama `/setup` para obter QR code
3. Escaneia QR code no app autenticador
4. Chama `/enable` com token para ativar

### 2. Recuperação de Senha

#### Fluxo Seguro
- **Tokens únicos** com expiração de 1 hora
- **Rate limiting** de 3 tentativas por hora
- **Validação de força** da nova senha
- **Invalidação** de todos os tokens após uso

#### APIs Disponíveis
- `POST /api/auth/forgot-password` - Solicitar reset
- `POST /api/auth/reset-password` - Definir nova senha

#### Critérios de Senha Segura
- Mínimo 8 caracteres
- Pelo menos 1 letra minúscula
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial
- Não contém padrões comuns

### 3. Rate Limiting

#### Limites Configurados
- **Login:** 5 tentativas por 15 minutos
- **Registro:** 3 tentativas por hora
- **Reset de senha:** 3 tentativas por hora
- **2FA:** 10 tentativas por 5 minutos
- **API geral:** 100 requests por minuto

#### Implementação
- Store em memória (desenvolvimento)
- Redis recomendado para produção
- Identificação por IP + User Agent

### 4. Detecção de Login Suspeito

#### Fatores Analisados
- **IP Address** nunca usado antes
- **User Agent** muito diferente dos habituais
- **Horário atípico** (fora dos padrões normais)
- **Múltiplas tentativas falhadas** recentes

#### Ações Automáticas
- Email de alerta para o usuário
- Log de auditoria detalhado
- Monitoramento contínuo

### 5. Bloqueio de Conta

#### Critérios
- **5 tentativas falhadas** em 15 minutos
- Bloqueio automático por 15 minutos
- Contagem zerada após sucesso

#### Proteções
- Prevenção de ataques de força bruta
- Rate limiting por IP
- Logs detalhados de tentativas

### 6. Logs de Auditoria

#### Eventos Registrados
- Login/Logout
- Mudanças de senha
- Ativação/Desativação 2FA
- Operações CRUD em dados sensíveis
- Tentativas de login falhadas
- Padrões suspeitos

#### APIs de Monitoramento
- `GET /api/admin/audit-logs` - Visualizar logs
- `GET /api/admin/security` - Overview de segurança
- Exportação para CSV para conformidade

### 7. Validações de Segurança

#### Headers HTTP
- Validação de User-Agent
- Verificação de Origin
- Headers de segurança obrigatórios

#### Sanitização
- Limpeza de entradas do usuário
- Proteção contra XSS
- Validação de tipos de dados

## Configuração de Produção

### Variáveis de Ambiente Essenciais

```bash
# Segurança
NEXTAUTH_SECRET="chave-super-secreta-256-bits"
ENCRYPTION_KEY="chave-criptografia-aes-256-32-chars"

# Email
SMTP_HOST="seu-servidor-smtp"
SMTP_USER="seu-email"
SMTP_PASS="sua-senha-ou-app-password"

# Rate Limiting (Produção)
REDIS_URL="redis://localhost:6379"
```

### Headers de Segurança Recomendados

```nginx
# Nginx Configuration
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'";
```

## Monitoramento e Alertas

### Métricas Importantes
- Taxa de login falhados
- Tentativas de 2FA inválidas
- Padrões de acesso suspeitos
- Uso de códigos de backup
- Frequência de reset de senha

### Relatórios Automáticos
- **Diário:** Resumo de segurança
- **Semanal:** Análise de padrões
- **Mensal:** Relatório de conformidade

## Compliance e Conformidade

### LGPD (Lei Geral de Proteção de Dados)
- ✅ Criptografia de dados sensíveis
- ✅ Logs de auditoria detalhados
- ✅ Controle de acesso por função
- ✅ Detecção de acessos suspeitos

### Práticas Recomendadas
- ✅ Autenticação multi-fator
- ✅ Senhas seguras obrigatórias
- ✅ Rate limiting em APIs
- ✅ Logs de auditoria abrangentes
- ✅ Detecção de anomalias
- ✅ Recuperação segura de senha

## Backup e Recuperação

### Códigos de Backup 2FA
- 8 códigos únicos por usuário
- Uso único (removidos após utilização)
- Regeneração sob demanda
- Armazenamento criptografado

### Tokens de Recuperação
- Expiração automática (1 hora)
- Uso único
- Invalidação após sucesso
- Limpeza automática de tokens expirados

## Suporte e Troubleshooting

### Problemas Comuns

**Usuário bloqueado:**
- Aguardar 15 minutos ou
- Admin pode desbloquear via logs de auditoria

**2FA não funciona:**
- Verificar sincronização de tempo
- Usar código de backup
- Regenerar secret se necessário

**Email de reset não chega:**
- Verificar spam/lixo eletrônico
- Confirmar configuração SMTP
- Verificar rate limiting

### Logs de Debug
- Level INFO: Operações normais
- Level WARN: Tentativas suspeitas
- Level ERROR: Falhas de segurança

## Atualizações de Segurança

### Cronograma Recomendado
- **Dependências:** Semanal
- **Review de logs:** Diário
- **Testes de penetração:** Mensal
- **Backup de códigos:** Trimestral

### Checklist de Segurança
- [ ] 2FA habilitado para todos usuários privilegiados
- [ ] Rate limiting ativo
- [ ] Logs de auditoria funcionando
- [ ] Email de alertas configurado
- [ ] Backup dos códigos de recuperação
- [ ] Monitoramento de padrões suspeitos ativo