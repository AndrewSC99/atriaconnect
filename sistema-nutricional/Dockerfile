# Estágio 1: Build da aplicação
FROM node:18-alpine AS builder

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Estágio 2: Runtime da aplicação
FROM node:18-alpine AS runner

# Instalar dependências do sistema
RUN apk add --no-cache \
    sqlite \
    dumb-init \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos necessários do estágio de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Criar diretório para banco de dados
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Configurar usuário
USER nextjs

# Expor porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/production.db"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Comando de inicialização com dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma db push && node server.js"]