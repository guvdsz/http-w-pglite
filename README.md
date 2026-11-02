# HTTP Tasks API com PGlite

API REST minimalista para gerenciamento de tarefas, construída com os módulos
nativos de HTTP do Node.js e persistência local em PostgreSQL via
[PGlite](https://pglite.dev/). O projeto é pequeno e direto, sendo adequado
para demonstrar fundamentos de APIs HTTP, validação de payloads e acesso
parametrizado ao banco de dados sem um framework web.

## Visão geral

A aplicação disponibiliza operações para:

- listar todas as tarefas;
- consultar uma tarefa pelo identificador;
- criar uma tarefa;
- atualizar uma tarefa;
- excluir uma tarefa.

Na primeira inicialização, o banco cria a tabela `tasks` e insere uma tarefa de
exemplo quando ainda não existem registros. Os dados são armazenados no
diretório local `db/`, que é ignorado pelo Git.

## Tecnologias

- **Node.js** com ES Modules;
- **HTTP nativo do Node.js**, sem Express ou outro framework;
- **PGlite `0.4.4`**, um PostgreSQL executado localmente;
- **SQL parametrizado** para as operações que recebem identificadores ou dados
  do cliente.

## Pré-requisitos

- Node.js instalado;
- npm instalado.

## Instalação e execução

Clone o repositório e instale as dependências:

```bash
git clone <URL_DO_REPOSITORIO>
cd http-w-pglite
npm install
```

Inicie o servidor:

```bash
node server.js
```

Por padrão, a API fica disponível em:

```text
http://localhost:3000
```

O processo cria o banco local automaticamente na pasta `db/`. Para reiniciar
os dados em ambiente de desenvolvimento, pare o servidor e remova apenas essa
pasta antes de iniciá-lo novamente.

## Modelo de dados

A tabela `tasks` possui os seguintes campos:

| Campo         | Tipo     | Descrição                        |
| ------------- | -------- | -------------------------------- |
| `id`          | inteiro  | Identificador da tarefa          |
| `title`       | texto    | Título da tarefa                 |
| `description` | texto    | Descrição da tarefa              |
| `done`        | booleano | Indica se a tarefa foi concluída |

## Endpoints

Todos os endpoints retornam JSON e usam a estrutura `{ "data": ... }` em
respostas que carregam dados.

### Listar tarefas

```http
GET /api/tasks
```

Exemplo:

```bash
curl http://localhost:3000/api/tasks
```

Resposta `200`:

```json
{
    "data": [
        {
            "id": 1,
            "title": "Estudar Node.js",
            "description": "Revisar a API HTTP nativa",
            "done": false
        }
    ]
}
```

### Buscar uma tarefa

```http
GET /api/tasks/:id
```

Exemplo:

```bash
curl http://localhost:3000/api/tasks/1
```

Respostas possíveis:

- `200` com a tarefa encontrada;
- `400` quando o identificador não é informado ou não é válido;
- `404` quando a tarefa não existe.

### Criar uma tarefa

```http
POST /api/tasks
Content-Type: application/json
```

Corpo:

```json
{
    "title": "Estudar Node.js",
    "description": "Revisar a API HTTP nativa"
}
```

Exemplo:

```bash
curl -X POST http://localhost:3000/api/tasks ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Estudar Node.js\",\"description\":\"Revisar a API HTTP nativa\"}"
```

Resposta `201`:

```json
{
    "data": {
        "id": 2,
        "title": "Estudar Node.js",
        "description": "Revisar a API HTTP nativa",
        "done": null
    }
}
```

`title` e `description` são obrigatórios. JSON inválido resulta em `400`.

### Atualizar uma tarefa

```http
PUT /api/tasks/:id
Content-Type: application/json
```

O endpoint exige o objeto completo da tarefa:

```json
{
    "title": "Estudar Node.js e PGlite",
    "description": "Concluir a revisão da implementação",
    "done": true
}
```

Exemplo:

```bash
curl -X PUT http://localhost:3000/api/tasks/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Estudar Node.js e PGlite\",\"description\":\"Concluir a revisão da implementação\",\"done\":true}"
```

Resposta `200`:

```json
{
    "data": {
        "id": 1,
        "title": "Estudar Node.js e PGlite",
        "description": "Concluir a revisão da implementação",
        "done": true
    }
}
```

`title`, `description` e `done` são obrigatórios; `done` deve ser booleano.

### Excluir uma tarefa

```http
DELETE /api/tasks/:id
```

Exemplo:

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

Resposta `200`:

```json
{
    "message": "Task deleted successfully."
}
```

Se a tarefa não existir, a API retorna `404`.

## Organização do código

- [`server.js`](./server.js): inicialização do servidor HTTP, roteamento,
  validações e operações da API;
- [`database.js`](./database.js): criação da instância PGlite, tabela e dado
  inicial;
- [`utils.js`](./utils.js): leitura de corpos JSON, resposta JSON e extração de
  parâmetros da URL;
- [`package.json`](./package.json): configuração do projeto e dependência do
  PGlite.

## Tratamento de erros

As respostas de erro seguem o formato:

```json
{
    "error": "Mensagem do erro."
}
```

Os principais status utilizados são:

| Status | Uso                               |
| ------ | --------------------------------- |
| `200`  | Operação concluída                |
| `201`  | Tarefa criada                     |
| `400`  | Payload ou identificador inválido |
| `404`  | Rota ou tarefa não encontrada     |
| `500`  | Erro interno durante a operação   |
