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
4. Uma pipeline unica na `main` executa a CI relevante novamente.
5. Para cada componente alterado, a pipeline le a versao atual em `backend/pom.xml` ou `frontend/package.json`.
6. A pipeline cria a tag do componente, publica a GitHub Release e depois publica a imagem correspondente no Docker Hub.

O fluxo nao usa mais `release-please`. A versao publicada vem direto dos arquivos versionados no proprio PR mergeado.
Esse desenho assume que a `main` esta protegida e recebe alteracoes apenas por PR aprovada e mergeada.

Se um componente mudou e a tag daquela versao ja existir para outro commit, a pipeline falha. Isso força o bump de versao antes do merge na `main`.

Secrets necessarios no repositorio:

- `DOCKER_USERNAME`
- `DOCKERHUB_TOKEN`
- `AUTOMATION_APP_ID`: App ID do GitHub App usado nas automacoes do Dependabot
- `AUTOMATION_APP_PRIVATE_KEY`: chave privada PEM do GitHub App

O `GITHUB_TOKEN` do workflow cria as tags e as GitHub Releases. O GitHub App continua sendo usado apenas para a autoaprovacao das PRs do Dependabot.

## Documentacao

```bash
make docs-build
make docs-serve
```

## Diagramas C4

```bash
make diagrams
```
