FROM node:20-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages packages

RUN pnpm install

COPY . .

EXPOSE 5173
