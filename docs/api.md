# API

## Contrato principal

- base path: `/api/v1`
- documentacao interativa: `/swagger-ui/index.html`
- contrato OpenAPI publicado pela API: `/api-docs`

## Recursos

### Autores

- `GET /api/v1/authors`
- `GET /api/v1/authors/{authorId}`
- `POST /api/v1/authors`
- `PUT /api/v1/authors/{authorId}`
- `DELETE /api/v1/authors/{authorId}`

### Assuntos

- `GET /api/v1/subjects`
- `GET /api/v1/subjects/{subjectId}`
- `POST /api/v1/subjects`
- `PUT /api/v1/subjects/{subjectId}`
- `DELETE /api/v1/subjects/{subjectId}`

### Livros

- `GET /api/v1/books`
- `GET /api/v1/books/{bookId}`
- `POST /api/v1/books`
- `PUT /api/v1/books/{bookId}`
- `DELETE /api/v1/books/{bookId}`

### Relatorio

- `GET /api/v1/reports/books-by-author`
- `GET /api/v1/reports/books-by-author/export`

## Regras relevantes

- o frontend envia `price` em formato canonico, por exemplo `129.90`
- o backend retorna `422` para validacao de negocio e `409` para conflito de integridade
- livros precisam ter pelo menos um autor e um assunto
- filtros de livros aceitam titulo, autor e assunto

## Observabilidade HTTP

- health: `/actuator/health`
- readiness: `/actuator/health/readiness`
- liveness: `/actuator/health/liveness`
- metricas: `/actuator/metrics`
