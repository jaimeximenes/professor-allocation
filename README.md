# Professor Allocation — Frontend

Interface web do sistema **Professor Allocation**, desenvolvida como projeto da
disciplina de Frontend da Fafire (2026). O app permite cadastrar departamentos,
cursos e professores e montar a grade semanal de aulas, bloqueando choques de
horário.

O frontend consome a API REST do backend desenvolvido na disciplina de backend
(**atividade_backend**: Spring Boot + Spring Data JPA + MySQL). Para rodar sem
Java/MySQL, o projeto inclui uma API simulada com **json-server** que expõe as
mesmas rotas e o mesmo formato de JSON dos DTOs do backend.

## Requisitos da avaliação

| Requisito                                            | Como foi atendido                                                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Aplicação React (Vite, Next ou Remix)                | React 19 + **Vite** + TypeScript                                                                                                               |
| Landing page com breve introdução ao projeto         | Rota `/`: apresentação, números em tempo real vindos da API, módulos, passo a passo e integração com o backend                                 |
| Páginas de Alocação, Professor, Curso e Departamento | `/allocations`, `/professors`, `/courses` e `/departments`, além das páginas de detalhe `/professors/:id`, `/courses/:id` e `/departments/:id` |
| Sistema de rotas                                     | **TanStack Router** com rotas por arquivos (`src/routes`), parâmetros dinâmicos, filtros na URL e página 404                                   |
| Interface amigável (Chakra UI, Bootstrap ou MUI)     | **Chakra UI**, tema claro/escuro, layout responsivo (menu mobile), toasts, confirmações e estados de carregamento, vazio e erro                |
| CRUD com pelo menos 2 entidades                      | CRUD completo das **4 entidades** (listar, buscar, cadastrar, editar, excluir e ver detalhes)                                                  |
| Entrega do código em repositório Git                 | Este repositório                                                                                                                               |
| Publicação em nuvem (opcional)                       | Pronto para Vercel/Netlify (`vercel.json` e `public/_redirects`); o build publicado roda em modo demonstração                                  |

## Como rodar

Pré-requisito: **Node.js 22.12+** (exigência do json-server 1.x).

```bash
npm install
npm run dev
```

- Site: <http://localhost:3000>
- API simulada (json-server): <http://localhost:3333>

O `npm run dev` inicia o site e a API juntos. Na primeira execução o banco
`db/database.json` é criado a partir dos dados de exemplo (`db/seed.json`).

### Usando o backend Spring Boot

1. Suba o projeto **atividade_backend** (MySQL rodando e `mvn spring-boot:run`).
   A API fica em <http://localhost:8080> (Swagger em `/swagger-ui.html`).
2. Rode o frontend apontando para ele:

```bash
npm run dev:backend
```

A URL da API vem de `.env.backend` (`VITE_API_URL=http://localhost:8080`).

### Modo demonstração (build de produção)

```bash
npm run build
npm run preview
```

Hospedagens estáticas não executam o json-server. Por isso, sem `VITE_API_URL`
(veja `.env.production`), o app usa o **modo demonstração**: implementa a mesma
interface da API sobre o `localStorage` do navegador, iniciando com os dados de
`db/seed.json`. O rodapé mostra a fonte de dados em uso e, nesse modo, um botão
para restaurar os dados de exemplo.

## Scripts

| Script                | O que faz                                                        |
| --------------------- | ---------------------------------------------------------------- |
| `npm run dev`         | Site (porta 3000) + json-server (porta 3333)                     |
| `npm run dev:web`     | Só o site                                                        |
| `npm run dev:api`     | Só o json-server                                                 |
| `npm run dev:backend` | Site usando o backend Spring Boot em `localhost:8080`            |
| `npm run db:reset`    | Restaura `db/database.json` a partir do seed (com a API parada)  |
| `npm run build`       | Gera as rotas, checa os tipos (`tsc`) e gera o build em `dist/`  |
| `npm run preview`     | Serve o build de produção                                        |
| `npm test`            | Testes unitários (Vitest) das regras de negócio e da camada HTTP |
| `npm run lint`        | ESLint                                                           |
| `npm run format`      | Prettier + ESLint com correção automática                        |

## Integração com o backend

Os tipos em `src/types/entities.ts` espelham os DTOs do backend, que são planos
(os relacionamentos chegam como ids):

| Entidade     | DTO do backend                                                               | Rota REST      |
| ------------ | ---------------------------------------------------------------------------- | -------------- |
| Departamento | `DepartmentDTO { id, name }`                                                 | `/departments` |
| Curso        | `CourseDTO { id, name }`                                                     | `/courses`     |
| Professor    | `ProfessorDTO { id, name, cpf, departmentId }`                               | `/professors`  |
| Alocação     | `AllocationDTO { id, dayOfWeek, startHour, endHour, professorId, courseId }` | `/allocations` |

Para cada recurso são usados `GET /recurso`, `GET /recurso/{id}`,
`POST /recurso`, `PUT /recurso/{id}` e `DELETE /recurso/{id}`.

Regras do backend que o frontend valida antes de enviar (com as mesmas mensagens):

- **Nomes** de departamento e curso obrigatórios, com até 100 caracteres e únicos
  (coluna `unique` no banco; a comparação ignora maiúsculas e acentos, como o MySQL).
- **CPF** com exatamente 11 dígitos (`@Pattern("\\d{11}")`) e único. O campo tem
  máscara `000.000.000-00`, mas a API recebe só os dígitos.
- **Alocação**: hora de início anterior à de término e sem choque de horário do
  mesmo professor no mesmo dia (mesma regra do `AllocationService`). O formulário
  avisa o conflito enquanto o usuário escolhe dia e horário.
- **Exclusões**: departamentos com professores, cursos com alocações e professores
  com alocações não podem ser excluídos (chaves estrangeiras no banco). A tela
  explica o motivo em vez de deixar a API responder com erro.

Outros detalhes da integração:

- Os ids `Long` do backend são convertidos em texto na camada HTTP
  (`src/api/http-driver.ts`), o formato também usado pelo json-server.
- Os horários são enviados como `LocalTime` (`"08:00:00"`) e o dia da semana com os
  valores do enum `java.time.DayOfWeek` (`MONDAY`, `TUESDAY`…).
- As mensagens de erro do `GlobalExceptionHandler` (`ErrorResponse`) são exibidas
  nos avisos da interface.

## Estrutura

```text
db/
  seed.json              dados de exemplo (versionado)
  database.json          banco do json-server (gerado, fora do Git)
scripts/db.mjs           cria/restaura o banco do json-server
src/
  api/                   fonte de dados: HTTP (backend/json-server) ou localStorage,
                         hooks do TanStack Query e tratamento de erros
  components/            componentes reutilizáveis (tabela, drawer, diálogos, grade...)
  components/layout/     cabeçalho, rodapé e navegação
  features/              formulários e diálogos de exclusão de cada entidade
  hooks/                 hooks utilitários
  lib/                   regras de negócio e utilitários (conflitos, CPF, horários)
  routes/                páginas (cada arquivo é uma rota do TanStack Router)
  types/entities.ts      tipos espelhando os DTOs do backend
  theme.ts               tema do Chakra UI (cores, fontes, modo escuro)
```

## Tecnologias

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [TanStack Router](https://tanstack.com/router): rotas por arquivos, tipadas, com code splitting
- [TanStack Query](https://tanstack.com/query): cache e sincronização dos dados da API
- [Chakra UI v2](https://v2.chakra-ui.com/) + [Lucide](https://lucide.dev/) (ícones)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/): formulários e validação
- [json-server](https://github.com/typicode/json-server): API simulada
- [Vitest](https://vitest.dev/), ESLint e Prettier

## Publicação (opcional)

- **Vercel**: importe o repositório (framework Vite, build `npm run build`, saída
  `dist`). O `vercel.json` redireciona as rotas para o `index.html`.
- **Netlify**: build `npm run build`, pasta `dist`. O arquivo `public/_redirects`
  faz o mesmo redirecionamento.

Sem `VITE_API_URL` configurada na hospedagem, o site publicado usa o modo
demonstração. Para usar uma API publicada, defina `VITE_API_URL` nas variáveis de
ambiente da hospedagem.

## Autor

Jaime Ximenes — Fafire, 2026.
