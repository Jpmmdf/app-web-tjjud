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
- Swagger UI: `http://localhost:4200/swagger-ui.html`
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

## Release automatica

Fluxo configurado:

1. Abrir PR normal para a `main`.
2. Rodar CI de `backend` e `frontend` nessa PR.
3. Fazer merge na `main`.
4. O `release-please` abre ou atualiza as PRs de release do `backend` e do `frontend`.
5. Essas PRs de release podem ser autoaprovadas.
6. Ao fazer merge da PR de release, o `release-please` cria a tag e a GitHub Release.
7. O `push` da tag publica a imagem correspondente no Docker Hub.

As pipelines normais de CI nao rodam nas PRs de release do `release-please`, para evitar trabalho duplicado.

Secrets necessarios no repositorio:

- `DOCKER_USERNAME`
- `DOCKERHUB_TOKEN`
- `RELEASE_PLEASE_TOKEN`: PAT ou token de bot usado pelo `release-please` para abrir PRs e criar tags que possam disparar outros workflows
- `RELEASE_PLEASE_REVIEW_TOKEN`: PAT de outro usuario ou bot, com permissao para aprovar PRs. O `github-actions` nao pode aprovar a propria PR de release.

## Documentacao

```bash
make docs-build
make docs-serve
```

## Diagramas C4

```bash
make diagrams
```
