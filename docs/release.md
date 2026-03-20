# Release e Imagens

## Fluxo recomendado

O fluxo automatizado do repositorio segue esta ordem:

1. uma PR normal e aberta para a `main`
2. as pipelines de CI de backend e frontend rodam nessa PR
3. depois do merge na `main`, a pipeline `Main Delivery` detecta quais componentes mudaram
4. a pipeline executa novamente a CI relevante na `main`
5. para cada componente alterado, a pipeline calcula a proxima versao semantica a partir das tags ja publicadas
6. a pipeline cria a tag do componente e publica a GitHub Release
7. por fim, a pipeline publica a imagem correspondente no Docker Hub

Esse desenho elimina o `release-please` e centraliza o versionamento na propria pipeline.
Ele assume que a `main` esta protegida e recebe alteracoes apenas por PR aprovada e mergeada.

## Fonte da versao

- backend: ultima tag `backend-vX.Y.Z`
- frontend: ultima tag `frontend-vX.Y.Z`

A pipeline sobe o patch por padrao em `push` para `main`.
Nas execucoes manuais (`workflow_dispatch`), e possivel escolher `patch`, `minor` ou `major` para backend e frontend.
Se a execucao for repetida para o mesmo commit, a pipeline reaproveita a tag ja criada para esse commit em vez de tentar gerar uma nova versao.

## Tags publicadas

- backend: `backend-vX.Y.Z`
- frontend: `frontend-vX.Y.Z`

As imagens recebem:

- a versao semantica, por exemplo `1.2.3`
- `latest`

## Workflows

- `main-delivery.yml`: executa no `push` da `main` e tambem pode ser disparado manualmente; no `push` ele detecta as areas alteradas, calcula a proxima versao por componente, cria as tags e GitHub Releases e chama os jobs de publicacao Docker
- `dependabot-auto-approve.yml`: aprova automaticamente PRs validas abertas pelo Dependabot
- `backend-image.yml`: workflow reutilizavel para publicar a imagem do backend, tambem acionavel manualmente
- `frontend-image.yml`: workflow reutilizavel para publicar a imagem do frontend, tambem acionavel manualmente
- `backend-ci.yml` e `frontend-ci.yml`: workflows reutilizaveis usados pela pipeline da `main` e pelas PRs

## Secrets necessarios

- `DOCKER_USERNAME`
- `DOCKERHUB_TOKEN`
- `AUTOMATION_APP_ID`
- `AUTOMATION_APP_PRIVATE_KEY`

O `GITHUB_TOKEN` do proprio workflow cria as tags e as GitHub Releases.

## GitHub App

O GitHub App continua sendo usado apenas para aprovar PRs do Dependabot.
