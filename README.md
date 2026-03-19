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
4. Uma pipeline unica na `main` executa a CI relevante antes do `release-please`.
5. O `release-please` abre ou atualiza as PRs de release do `backend` e do `frontend`.
6. Essas PRs de release podem ser autoaprovadas e mescladas automaticamente no mesmo workflow.
7. Ao fazer merge da PR de release, o `release-please` cria a tag e a GitHub Release usando `GITHUB_TOKEN`.
8. No mesmo workflow, quando uma release real e criada, os jobs reutilizaveis publicam a imagem correspondente no Docker Hub.

No backend, a estrategia Maven do `release-please` esta configurada com `skip-snapshot`, entao a PR de release usa a versao final em vez de `-SNAPSHOT`. No frontend, o `package.json` continua sendo atualizado pelo strategy `node` quando a release e fechada.

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
