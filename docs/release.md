# Release e Imagens

## Fluxo recomendado

O fluxo de release automatica do repositorio segue esta ordem:

1. uma PR normal e aberta para a `main`
2. as pipelines de CI de backend e frontend rodam nessa PR
3. depois do merge na `main`, o `release-please` abre ou atualiza a PR de release por componente
4. a PR de release pode ser aprovada automaticamente
5. ao fazer merge da PR de release, o `release-please` cria a tag e a GitHub Release com `GITHUB_TOKEN`
6. no mesmo workflow, quando uma release real e criada, os jobs reutilizaveis publicam a imagem correspondente no Docker Hub

Esse desenho evita publicar imagem oficial antes de uma versao semanticamente fechada e vincula o artefato Docker a uma tag real do repositorio, sem depender de um segundo workflow disparado por essa tag.

## Tags publicadas

- backend: `backend-vX.Y.Z`
- frontend: `frontend-vX.Y.Z`

As imagens recebem:

- a versao semantica, por exemplo `1.2.3`
- a tag Git completa, por exemplo `backend-v1.2.3`
- `latest`

## Workflows

- `release-please.yml`: executa no `push` da `main`, abre ou atualiza PRs de release e, quando uma release e criada, chama os jobs de publicacao Docker
- `release-please-auto-approve.yml`: aprova automaticamente PRs de release validas
- `dependabot-auto-approve.yml`: aprova automaticamente PRs validas abertas pelo Dependabot
- `backend-image.yml`: workflow reutilizavel para publicar a imagem do backend, tambem acionavel manualmente
- `frontend-image.yml`: workflow reutilizavel para publicar a imagem do frontend, tambem acionavel manualmente
- `backend-ci.yml` e `frontend-ci.yml`: nao rodam nas PRs de release para evitar duplicidade

## Secrets necessarios

- `DOCKER_USERNAME`
- `DOCKERHUB_TOKEN`
- `AUTOMATION_APP_ID`
- `AUTOMATION_APP_PRIVATE_KEY`

## GitHub App

- o repositorio usa `actions/create-github-app-token` para gerar tokens efemeros em tempo de execucao
- o App precisa ter permissao de `pull requests` no repositorio
- o App e usado para aprovar PRs de release e aprovar PRs do Dependabot
- a abertura das PRs de release e a criacao das tags ficam com `GITHUB_TOKEN`, enquanto a publicacao Docker acontece no mesmo workflow do `release-please`
