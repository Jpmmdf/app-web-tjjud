# app-web-tjjud

Aplicacao API-first para cadastro de livros, autores e assuntos com relatorio por autor, backend em Spring Boot, frontend em Angular e banco PostgreSQL.

## Stack

- `backend/`: Spring Boot 4.0, Java 21, JPA, Flyway, OpenPDF, Testcontainers
- `frontend/`: Angular 21 standalone, Reactive Forms, mascara BRL customizada
- `docs/`: MkDocs + Structurizr DSL para documentacao cloud-native e diagramas C4
- `docker-compose.yml`: orquestracao local de PostgreSQL, API e SPA

## Subir localmente com Docker

```bash
docker compose up --build
```

Acesse:

- Frontend: `http://localhost:4200`
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:4200/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:4200/api-docs`

## Fluxo local sem containers

```bash
cd backend && ./mvnw spring-boot:run
cd frontend && npm start
```

## Testes

```bash
make backend-test
make frontend-test
```

## Documentacao

```bash
make docs-build
make docs-serve
```

## Diagramas C4

```bash
make diagrams
```
