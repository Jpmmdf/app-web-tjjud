# Release e Imagens

## Fluxo recomendado

O fluxo de release automatica do repositorio segue esta ordem:

1. uma PR normal e aberta para a `main`
2. as pipelines de CI de backend e frontend rodam nessa PR
3. depois do merge na `main`, o `release-please` abre ou atualiza a PR de release por componente
4. a PR de release pode ser aprovada automaticamente
5. ao fazer merge da PR de release, o `release-please` cria a tag e a GitHub Release
6. o `push` da tag publica a imagem correspondente no Docker Hub

Esse desenho evita publicar imagem oficial antes de uma versao semanticamente fechada e vincula o artefato Docker a uma tag real do repositorio.

## Tags publicadas

- backend: `backend-vX.Y.Z`
- frontend: `frontend-vX.Y.Z`

As imagens recebem:

- a versao semantica, por exemplo `1.2.3`
- a tag Git completa, por exemplo `backend-v1.2.3`
- `latest`

## Workflows

- `release-please.yml`: executa no `push` da `main` e apenas abre ou atualiza PRs de release e GitHub Releases
- `release-please-auto-approve.yml`: aprova automaticamente PRs de release validas
- `dependabot-auto-approve.yml`: aprova automaticamente PRs validas abertas pelo Dependabot
- `backend-image.yml`: publica a imagem do backend quando uma tag `backend-v*` e enviada
- `frontend-image.yml`: publica a imagem do frontend quando uma tag `frontend-v*` e enviada
- `backend-ci.yml` e `frontend-ci.yml`: nao rodam nas PRs de release para evitar duplicidade

## Secrets necessarios

- `DOCKER_USERNAME`
- `DOCKERHUB_TOKEN`
- `AUTOMATION_APP_ID`
- `AUTOMATION_APP_PRIVATE_KEY`

## GitHub App

- o repositorio usa `actions/create-github-app-token` para gerar tokens efemeros em tempo de execucao
- o App precisa ter permissao para `contents`, `issues` e `pull requests` no repositorio
- o mesmo App e usado para abrir PRs de release, criar tags, aprovar PRs de release e aprovar PRs do Dependabot
- esse desenho evita depender de PATs de usuarios e reduz o risco operacional
