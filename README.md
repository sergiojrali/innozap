InnoZap – Roadmap de Backend/Frontend SaaS WhatsApp (Baileys)

Checklist macro (marcarei conforme concluído):

- [ ] Backend base (NestJS + Fastify, config, logs, validação)
- [ ] Integração Baileys com multi-sessões (auth multi-file por conexão)
- [ ] Persistência (Postgres via Prisma) para contas, sessões, contatos, chats, mensagens, filas
- [ ] Cache/Rate limiting e filas de jobs (Redis + BullMQ)
- [ ] Webhooks internos e API REST/GraphQL pública
- [ ] WebSocket para chat em tempo real e eventos (Socket.IO)
- [ ] Upload/download de mídia (armazenamento local/S3)
- [ ] RBAC (multi-tenant: workspaces, usuários, papéis)
- [ ] Auditoria e observabilidade (Pino, traces, métricas)
- [ ] Testes (unit, e2e) e CI básico
- [ ] Frontend SaaS (Next.js + UI) com:
	- [ ] Multiatendimento (salas/fila/atendentes)
	- [ ] Construtor visual de fluxo de bot
	- [ ] Disparo de marketing (segmentação + agendamento)
	- [ ] Gestão de conexões WhatsApp (múltiplas instâncias)
	- [ ] Billing e planos

Como executar (prévia):
- Requisitos: Node 18+, Docker, Docker Compose
- Depois que o backend estiver configurado, traremos comandos aqui.
# innozap