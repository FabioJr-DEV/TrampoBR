# TrampoBR — Projeto Integrador SENAI

## Descrição

O TrampoBR é uma plataforma de vagas de emprego desenvolvida como projeto integrador do SENAI. O sistema permite consultar empresas, visualizar vagas, cadastrar candidatos e gerenciar candidaturas.

O projeto utiliza uma arquitetura baseada em microsserviços, com APIs REST desenvolvidas em Node.js e Express, integração com MongoDB por meio do Mongoose e uma interface web construída com HTML, CSS e JavaScript.

## Tecnologias utilizadas

- **Backend:** Node.js e Express
- **Banco de dados:** MongoDB Atlas
- **ODM:** Mongoose
- **Frontend:** HTML5, CSS3 e JavaScript
- **Estilização:** Skeleton CSS
- **Comunicação com a API:** Fetch API
- **Arquitetura:** Microsserviços com API Gateway

## Requisitos

- Node.js versão 20 ou superior
- npm
- Conta e cluster configurados no MongoDB Atlas
- Conexão com a internet para acessar o banco de dados

## Como executar o projeto

1. Abra a pasta raiz do projeto `TrampoBR_Fullstack`.
2. Instale as dependências necessárias com `npm install`, conforme a configuração de cada serviço.
3. Configure a string de conexão do MongoDB Atlas nos arquivos de configuração dos serviços, utilizando suas próprias credenciais.
4. Verifique se o IP de acesso está autorizado no MongoDB Atlas e se o usuário do banco possui as permissões necessárias.
5. Inicie os serviços conforme os scripts disponíveis no `package.json`.
6. Com os serviços em execução, acesse o gateway pelo navegador:

   `http://localhost:3000`

**Observação:** a porta 3000 corresponde ao API Gateway. Os demais serviços utilizam portas próprias.

## Arquitetura do projeto

O sistema está organizado em quatro microsserviços e um API Gateway:

```text
TrampoBR
│
├── API Gateway
│   └── Porta 3000
│
├── Serviço de Empresas
│   └── Porta 3101
│
├── Serviço de Vagas
│   └── Porta 3102
│
├── Serviço de Candidatos
│   └── Porta 3103
│
├── Serviço de Candidaturas
│   └── Porta 3104
│
└── MongoDB Atlas
    ├── empresas
    ├── vagas
    ├── candidatos
    └── candidaturas
```

O API Gateway centraliza as requisições do frontend e as encaminha aos serviços correspondentes. Cada microsserviço possui suas próprias rotas e utiliza o MongoDB para persistência dos dados.

## Endpoints da API

As requisições são realizadas por meio do API Gateway, utilizando o endereço-base:

`http://localhost:3000/api`

| Recurso | Endpoint |
|---|---|
| Empresas | `/api/empresas` |
| Vagas | `/api/vagas` |
| Candidatos | `/api/candidatos` |
| Candidaturas | `/api/candidaturas` |

Os endpoints disponibilizam operações de consulta e gerenciamento dos respectivos recursos, conforme as rotas implementadas em cada serviço.

## Banco de dados

O projeto utiliza o MongoDB Atlas como banco de dados em nuvem.

As coleções utilizadas pelo sistema são:

- `empresas`: armazena os dados das empresas.
- `vagas`: armazena as informações das vagas de emprego.
- `candidatos`: armazena os dados dos candidatos.
- `candidaturas`: armazena as candidaturas vinculadas aos candidatos e às vagas.

O serviço de candidaturas utiliza a coleção `candidaturas`, evitando a consulta indevida à coleção antiga `TRAMPOBR`, que reunia documentos de diferentes tipos.

Para que os relacionamentos funcionem corretamente, os campos `candidatoId` e `vagaId` de cada candidatura devem corresponder aos identificadores dos registros existentes nas coleções `candidatos` e `vagas`.

## Funcionalidades

- Cadastro e consulta de empresas.
- Cadastro e consulta de vagas.
- Cadastro e consulta de candidatos.
- Registro e consulta de candidaturas.
- Integração entre frontend, API Gateway e microsserviços.
- Persistência dos dados no MongoDB Atlas.
- Visualização das informações por meio das páginas do sistema e do dashboard.

## Interface do sistema

O frontend utiliza HTML, CSS e JavaScript para apresentar as páginas e consumir as APIs do backend.

A comunicação com os serviços é realizada por meio de requisições HTTP utilizando a Fetch API. A interface utiliza o Skeleton CSS para auxiliar na organização e estilização dos elementos.

## Observações

- Os microsserviços devem estar em execução para que as funcionalidades dependentes das APIs funcionem corretamente.
- A conexão com o MongoDB Atlas deve ser configurada com credenciais válidas.
- Não publique senhas, strings de conexão ou outras credenciais no repositório.
- Os identificadores utilizados nas candidaturas devem corresponder aos registros existentes de candidatos e vagas.
- As funcionalidades descritas correspondem à estrutura e às implementações identificadas no projeto.

## Solução de problemas

### Falha na requisição

Se o frontend apresentar erros ao carregar os dados:

1. Verifique se o API Gateway está em execução na porta 3000.
2. Confirme se o microsserviço responsável pelo recurso solicitado está funcionando.
3. Verifique a conexão com o MongoDB Atlas e as credenciais configuradas.
4. Teste os endpoints diretamente pelo navegador ou por uma ferramenta de requisições HTTP.
5. Confira os logs do serviço correspondente para identificar possíveis erros.
6. Se uma candidatura não apresentar os dados do candidato ou da vaga, confira se os valores de `candidatoId` e `vagaId` correspondem aos `_id` existentes nas coleções corretas.