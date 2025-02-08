# 1️⃣ Etapa de instalação de dependências
FROM node:18-alpine AS deps
WORKDIR /usr/app

# Copia apenas os arquivos necessários para instalar dependências
COPY package.json package-lock.json ./  
RUN npm install --frozen-lockfile --production

# 2️⃣ Etapa de compilação
FROM node:18-alpine AS builder
WORKDIR /usr/app

# Copia os arquivos necessários para build
COPY --from=deps /usr/app/node_modules ./node_modules
COPY . .

# Garante que estamos em ambiente de produção
ENV NODE_ENV=production

# Compila o projeto Next.js
RUN npm run build

# 3️⃣ Etapa final: Criação da imagem de produção
FROM node:18-alpine AS runner
WORKDIR /usr/app

# Adiciona dependências essenciais do sistema
RUN apk add --no-cache openssl

# Copia os arquivos compilados e configurações da aplicação
COPY --from=builder /usr/app/.next .next
COPY --from=builder /usr/app/public public
COPY --from=builder /usr/app/package.json .
COPY --from=builder /usr/app/node_modules ./node_modules

# Define a variável de ambiente para produção
ENV NODE_ENV=production

# Expor a porta padrão do Next.js
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "server.js"]
