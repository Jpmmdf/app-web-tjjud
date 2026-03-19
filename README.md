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
6. Ao fazer merge da PR de release, o `release-please` cria a tag e a GitHub Release usando `GITHUB_TOKEN`.
7. No mesmo workflow, quando uma release real e criada, os jobs reutilizaveis publicam a imagem correspondente no Docker Hub.

As pipelines normais de CI nao rodam nas PRs de release do `release-please`, para evitar trabalho duplicado.

Secrets necessarios no repositorio:

- `DOCKER_USERNAME`
- `DOCKERHUB_TOKEN`
- `AUTOMATION_APP_ID`: App ID do GitHub App usado nas automacoes de aprovacao
- `AUTOMATION_APP_PRIVATE_KEY`: chave privada PEM do GitHub App

O `release-please` usa `GITHUB_TOKEN`. O GitHub App continua sendo usado para a autoaprovacao das PRs de release e das PRs do Dependabot.

## Documentacao

```bash
make docs-build
make docs-serve
```

## Diagramas C4

```bash
make diagrams
```
