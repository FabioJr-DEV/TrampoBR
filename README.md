# TrampoBR — Projeto Integrador SENAI

Plataforma fullstack de vagas e candidaturas inspirada no protótipo enviado. Backend com **quatro microserviços independentes** Express/Mongoose, comunicação HTTP REST e gateway. Frontend HTML5/CSS3/JavaScript com Skeleton CSS local e `fetch`.

## Pré-requisitos
- Node.js 20+ e npm
- MongoDB local na porta 27017, ou Docker Desktop (`docker compose up -d`)

## Executar
1. Abra a pasta `TrampoBR_Fullstack` no terminal.
2. Copie `.env.example` para `.env` (Windows: `copy .env.example .env`).
3. Execute `npm install`.
4. Inicie MongoDB localmente ou com `docker compose up -d`.
5. Execute `npm run seed` para criar registros de exemplo (opcional).
6. Execute `npm run dev`.
7. Abra **http://localhost:3000**.

**Importante:** `npm start` inicia somente o gateway; para a aplicação completa use `npm run dev`.

## Arquitetura
```
Browser (frontend) -> Gateway :3000 -> Empresas :3101 -> MongoDB
                                  -> Vagas :3102 -> MongoDB
                                  -> Candidatos :3103 -> MongoDB
                                  -> Candidaturas :3104 -> MongoDB
```
Os serviços de vagas e candidaturas verificam entidades relacionadas via HTTP/REST. Cada serviço tem seu próprio `server.js` e model Mongoose; as coleções são distintas em um banco compartilhado (simplificação acadêmica).

## API REST
Base no gateway: `http://localhost:3000/api`.

| Recurso | Métodos | Caminho |
|---|---|---|
| Empresas | GET, POST | `/empresas` |
| Empresas | GET, PUT, DELETE | `/empresas/:id` |
| Vagas | GET, POST | `/vagas` |
| Vagas | GET, PUT, DELETE | `/vagas/:id` |
| Candidatos | GET, POST | `/candidatos` |
| Candidatos | GET, PUT, DELETE | `/candidatos/:id` |
| Candidaturas | GET, POST | `/candidaturas` |
| Candidaturas | GET, PUT, DELETE | `/candidaturas/:id` |

`GET /vagas?busca=backend&modalidade=Remoto` filtra vagas. `GET /candidaturas?vagaId=...` filtra candidaturas. HTTP: 200 sucesso, 201 criado, 204 excluído, 400 inválido, 404 ausente, 409 candidatura duplicada, 500 falha inesperada.

### Exemplo de requisição
```json
POST /api/empresas
{"nome":"Empresa Exemplo","cnpj":"12345678000195","email":"contato@exemplo.com","telefone":"51999999999","cidade":"Porto Alegre"}
```

## Testes
- `npm test` — Jest + Supertest + MongoDB Memory Server (o primeiro uso pode baixar binário MongoDB).
- `npm run test:e2e` — Cypress (requer aplicação e MongoDB iniciados).

## Telas
Home, lista de vagas, detalhes, empresas (cadastro e listagem), cadastro/edição de vaga, cadastro/edição de candidato, lista de candidatos, candidatura, dashboard.

## Observações
- Login/autenticação são desafios extras do PDF e **não foram implementados**. Não exponha o sistema à internet sem autenticação e autorização.
- Upload de arquivo PDF não foi implementado; currículo pode ser informado por URL, como no desafio extra.
- O layout usa a imagem como inspiração, não uma cópia pixel a pixel.
- Dependências devem ser instaladas em uma máquina com acesso ao npm. Caso a rede corporativa tenha proxy/certificado próprio, solicite a cadeia CA à TI, sem desativar a validação TLS.


## Correção do erro "Falha na requisição"
O gateway foi corrigido para encaminhar `/api/vagas` para `http://localhost:3102/vagas` (e os outros serviços da mesma forma). Antes, o proxy podia remover o prefixo, causando 404.

1. Inicie o MongoDB (Windows: `services.msc` → MongoDB Server → Iniciar).
2. Na raiz do projeto execute `npm.cmd install` e `npm.cmd run dev`.
3. Em outro terminal execute `npm.cmd run seed` para inserir exemplos (com os serviços ligados).
4. Acesse http://localhost:3000 e http://localhost:3000/api/health.
5. Teste http://localhost:3000/api/vagas (deve retornar JSON).

Se o MongoDB estiver desligado, o gateway agora informa qual serviço não está disponível em vez de uma falha genérica.
