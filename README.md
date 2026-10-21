# ERROR

> O sistema está tentando te enganar. Desconfie do óbvio.

**ERROR** é um jogo de perguntas, pegadinhas e raciocínio lateral entregue como
web app + PWA, com API própria, ranking global e progressão anônima por dispositivo.
A resposta óbvia costuma ser a armadilha: o jogo testa interpretação, atenção e
paciência — não conhecimento decorado.

- **12 fases** com 8 mecânicas diferentes
- **3 vidas** por rodada
- **Ranking global** com o melhor resultado de cada jogador
- **Sem cadastro ou senha**: sessão anônima vinculada ao dispositivo
- **PWA instalável** com shell offline

---

## Stack

| Camada | Tecnologias |
| --- | --- |
| Web | React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router 7 |
| PWA | `vite-plugin-pwa` (Workbox), manifest, ícones maskable |
| API | Node.js 22+, Express 5, TypeScript, Zod, JWT, Helmet, Pino |
| Banco | PostgreSQL 17, `pg` e migrations SQL puras |
| Testes | Vitest (regras de fase e pontuação) |

O projeto é um monorepo npm workspaces:

```
.
├─ apps/
│  ├─ api/                 # Express + PostgreSQL
│  │  ├─ db/migrations/    # SQL versionado
│  │  ├─ src/game/         # fases, validação e pontuação (somente servidor)
│  │  ├─ src/routes/       # auth, perfil, partidas, ranking
│  │  ├─ src/services/     # regras de negócio e acesso a dados
│  │  └─ tests/            # Vitest
│  └─ web/                 # React + Vite + PWA
│     ├─ public/           # logo, ícones, OG image
│     └─ src/
│        ├─ components/    # layout, UI, ícones, prompts PWA
│        ├─ features/      # autenticação e renderização das fases
│        ├─ pages/         # home, jogo, resultado, ranking, perfil, regras
│        └─ styles/        # tokens e componentes visuais
├─ packages/shared/        # contratos TypeScript compartilhados
├─ scripts/                # setup do .env e geração de ícones
└─ docs/DESIGN-SYSTEM.md   # identidade visual e componentes
```

---

## Requisitos

- **Node.js 22.12+** (recomendado 22 LTS ou 24)
- **npm 10+**
- **Docker** com Compose (ou um PostgreSQL 17 acessível)

> O `docker-compose.yml` publica o PostgreSQL na porta **5433** para não conflitar
> com instalações locais que já usam a 5432. Se você não tem esse conflito, pode
> trocar o mapeamento e o `DATABASE_URL`.

---

## Começando

```bash
# 1. Dependências
npm install

# 2. Cria apps/api/.env com um JWT_SECRET aleatório
npm run setup

# 3. Sobe o PostgreSQL
docker compose up -d

# 4. Aplica as migrations
npm run db:migrate

# 5. API + web em modo desenvolvimento
npm run dev
```

- Web: <http://localhost:5173>
- API: <http://localhost:3333/api/health>
- Banco: `postgresql://error:error@localhost:5433/error`

O Vite faz proxy de `/api` para `http://localhost:3333`, então o frontend usa
caminhos relativos em desenvolvimento.

### Variáveis de ambiente

As variáveis ficam em `apps/api/.env` (veja `apps/api/.env.example`):

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development`, `test` ou `production` |
| `PORT` | `3333` | Porta da API |
| `DATABASE_URL` | `postgresql://error:error@localhost:5433/error` | Conexão PostgreSQL |
| `JWT_SECRET` | — | Obrigatório, mínimo de 32 caracteres |
| `JWT_EXPIRES_IN` | `30d` | Validade do token de sessão |
| `WEB_ORIGIN` | `http://localhost:5173,http://localhost:4173` | Origens CORS, separadas por vírgula (dev e preview) |
| `LOG_LEVEL` | `info` | Nível do Pino |

No frontend, `VITE_API_URL` é opcional. Deixe vazio para usar o proxy/caminho
relativo; em produção, defina a URL pública da API.

---

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Compila o pacote compartilhado e sobe API + web |
| `npm run dev:api` | Só a API (`tsx watch`) |
| `npm run dev:web` | Só o frontend (Vite) |
| `npm run build` | Build de shared, API e web (gera o PWA) |
| `npm start` | Executa a API compilada |
| `npm run typecheck` | TypeScript em todos os workspaces |
| `npm test` | Testes unitários da API |
| `npm run db:migrate` | Aplica migrations pendentes |
| `npm run db:reset` | **Apaga** o schema e reaplica as migrations |
| `npm run setup` | Cria `apps/api/.env` sem sobrescrever o existente |
| `npm run icons` | Regenera logo tratado, favicon, ícones PWA e OG image |

---

## Como o jogo funciona

1. A pessoa informa um apelido e recebe uma sessão anônima (JWT de 30 dias).
2. Ao iniciar uma partida, a API cria uma rodada com **3 vidas** e **12 fases**.
3. O servidor envia apenas a **especificação pública** da fase (texto, alternativas,
   tipo de interação). As soluções nunca chegam ao cliente.
4. Cada resposta é validada no servidor:
   - **Acerto:** soma pontos, aumenta a sequência e avança.
   - **Erro:** perde uma vida, recebe a explicação da armadilha e avança.
5. A rodada termina **concluída** ao passar da 12ª fase ou **bloqueada** ao ficar
   sem vidas (ou errar a última fase).
6. Abandonar encerra a rodada e ela não entra no ranking. Iniciar uma nova partida
   também abandona a anterior.
7. O ranking considera apenas o **melhor resultado** de cada jogador entre partidas
   concluídas ou bloqueadas.

### Mecânicas de fase

`choice`, `outside` (clicar fora de um painel), `wait` (esperar a barra),
`sequence` (ordenar), `type` (resposta escrita), `drag` (arrastar/tocar),
`hold` (segurar) e `multi` (seleção múltipla).

### Pontuação

| Componente | Valor |
| --- | --- |
| Resposta correta | **100** pontos |
| Bônus de velocidade | até **40** (perde 4 por segundo) |
| Bônus de sequência | **25 × (sequência − 1)**, limitado a **75** |

Uma resposta errada vale **0** e zera a sequência. O desempate do ranking é:
pontuação → fases superadas → menor tempo → data de conclusão.

---

## API

Base local: `http://localhost:3333/api`. Rotas autenticadas exigem
`Authorization: Bearer <token>`.

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Status da API e do banco |
| `POST` | `/auth/guest` | — | Cria/retoma jogador por `deviceId` e apelido |
| `GET` | `/me` | Sim | Perfil atual |
| `PATCH` | `/me` | Sim | Altera o apelido |
| `GET` | `/me/stats` | Sim | Recorde, precisão, tempo e partidas recentes |
| `POST` | `/runs` | Sim | Inicia rodada (abandona a ativa, se houver) |
| `GET` | `/runs/active` | Sim | Rodada ativa, se existir |
| `GET` | `/runs/:id` | Sim | Detalhes e histórico de respostas da rodada |
| `POST` | `/runs/:id/answers` | Sim | Valida uma resposta e avança a fase |
| `POST` | `/runs/:id/abandon` | Sim | Abandona a rodada |
| `GET` | `/leaderboard?limit=25` | — | Ranking (limite de 1 a 50) |

### Exemplo: entrar e iniciar uma partida

```bash
curl -X POST http://localhost:3333/api/auth/guest \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"00000000-0000-4000-8000-000000000000","nickname":"neon"}'
```

Resposta:

```json
{
  "token": "<jwt>",
  "player": {
    "id": "<uuid>",
    "nickname": "neon",
    "createdAt": "2026-10-20T20:00:00.000Z"
  }
}
```

```bash
curl -X POST http://localhost:3333/api/runs \
  -H "Authorization: Bearer <jwt>"
```

### Formato de resposta

Sucesso: JSON específico de cada rota. Erro:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Os dados enviados são inválidos.",
    "details": "..."
  }
}
```

Códigos comuns: `VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`,
`RUN_FINISHED`, `PHASE_MISMATCH`, `ANSWER_KIND_MISMATCH`, `RATE_LIMITED`,
`INTERNAL_ERROR`.

### Limites de requisição

- Global: 300 requisições/minuto por IP
- Autenticação: 30 tentativas/10 minutos
- Partidas/respostas: 120 requisições/minuto

---

## PWA e offline

O build de produção gera `sw.js` e `manifest.webmanifest` via Workbox.

- O **shell** (HTML, CSS, JS, fontes e imagens) fica em cache.
- **Respostas e ranking continuam dependendo do servidor** — não há validação offline.
- Um aviso de offline aparece quando o navegador perde conexão.
- A instalação é sugerida por um prompt próprio, dispensável.
- Atualizações usam `registerType: "prompt"`: o usuário decide quando recarregar.
- O app pode ser instalado com atalhos para **Jogar** e **Ranking**.

Para testar o PWA:

```bash
npm run build
npm run preview -w @error/web
# abra http://localhost:4173
```

O service worker só é registrado no build de produção.

---

## Banco de dados

Migration inicial em `apps/api/db/migrations/001_init.sql`.

- `players`: identidade anônima (`device_id` único, apelido, timestamps)
- `runs`: estado da rodada (status, pontos, vidas, sequência, tempos)
- `answers`: resposta JSON validada, acerto, pontos e duração
- Índices para histórico do jogador e ranking
- Trigger `set_updated_at` em `players`

Comandos úteis:

```bash
# inspecionar o banco pelo container
docker compose exec postgres psql -U error -d error

# zerar dados de teste e reaplicar migrations
npm run db:reset
```

`db:reset` é destrutivo: remove tabelas, dados e o histórico de migrations.

---

## Qualidade e testes

```bash
npm run typecheck
npm test
npm run build
```

Os testes cobrem:

- validação de todas as 12 fases (incluindo respostas erradas);
- cálculo de pontos, bônus de velocidade e limite de sequência.

O build do frontend roda `tsc --noEmit` antes do Vite. A API é empacotada com `tsup`.

---

## Segurança

- Senhas não existem: o token identifica um jogador anônimo por dispositivo.
- JWT assinado com segredo de no mínimo 32 caracteres e validade de 30 dias.
- Validação de entrada com Zod em todas as rotas.
- Soluções e explicações permanecem no servidor; o cliente recebe só o necessário.
- `Helmet`, CORS restrito por `WEB_ORIGIN` e rate limiting por IP.
- Consultas parametrizadas e transações com `SELECT ... FOR UPDATE` nas respostas.
- Limite de corpo JSON de 32 KB.
- A sessão fica em `localStorage`; limpar os dados do navegador perde o acesso ao
  perfil e ao histórico daquele dispositivo — não há recuperação de conta.

---

## Solução de problemas

**`28P01` / autenticação falhou ao migrar**
Já existe um PostgreSQL na 5432. Confirme que o container está na 5433:

```bash
docker compose ps
# error-postgres ... 0.0.0.0:5433->5432/tcp
```

E que `DATABASE_URL` em `apps/api/.env` aponta para `localhost:5433`.

**`EADDRINUSE`**
Outro processo está usando 3333 ou 5173. Encerre-o ou ajuste `PORT`/`server.port`.

**API responde 429**
Os limites por IP foram atingidos. Aguarde a janela indicada ou reinicie a API
em desenvolvimento.

**Ranking com dados de teste**
Rode `npm run db:reset` para limpar tudo e reaplicar as migrations.

**PWA não atualiza**
O service worker usa confirmação explícita. Aceite o prompt de atualização ou
limpe o cache/site data no navegador.

---

## Licença

MIT. Veja [LICENSE](LICENSE).
