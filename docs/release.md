# Release e Imagens

## Fluxo recomendado

O fluxo de release automatica do repositorio segue esta ordem:

1. uma PR normal e aberta para a `main`
2. as pipelines de CI de backend e frontend rodam nessa PR
3. depois do merge na `main`, uma pipeline unica executa a CI relevante antes do `release-please`
4. o `release-please` abre ou atualiza uma PR unica de release, agrupando `backend` e `frontend` quando ambos mudaram
5. a PR de release pode ser aprovada e mesclada automaticamente no mesmo workflow
6. ao fazer merge da PR de release, o `release-please` cria as tags e a GitHub Release com `GITHUB_TOKEN`
7. no mesmo workflow, quando uma release real e criada, os jobs reutilizaveis publicam a imagem correspondente no Docker Hub

Esse desenho evita publicar imagem oficial antes de uma versao semanticamente fechada e vincula o artefato Docker a uma tag real do repositorio, sem depender de um segundo workflow disparado por essa tag.
O agrupamento da release em uma unica PR tambem evita conflito no `.release-please-manifest.json`, ja que o manifesto deixa de ser atualizado simultaneamente por PRs separadas de `backend` e `frontend`.

Para o componente `backend`, a configuracao usa `skip-snapshot` no strategy `maven`, evitando PRs de release com sufixo `-SNAPSHOT`. Assim, ao fechar a release, o `pom.xml` fica com a versao final publicada. Para o `frontend`, o strategy `node` atualiza o `package.json` quando a release e fechada.

## Tags publicadas

- backend: `backend-vX.Y.Z`
- frontend: `frontend-vX.Y.Z`

As imagens recebem:

- a versao semantica, por exemplo `1.2.3`
- a tag Git completa, por exemplo `backend-v1.2.3`
- `latest`

## Workflows

- `main-delivery.yml`: executa no `push` da `main`, detecta as areas alteradas, roda a CI relevante, abre ou atualiza a PR de release agrupada, autoaprova e mescla PRs de release validas e, quando uma release e criada, chama os jobs de publicacao Docker
- `dependabot-auto-approve.yml`: aprova automaticamente PRs validas abertas pelo Dependabot
- `backend-image.yml`: workflow reutilizavel para publicar a imagem do backend, tambem acionavel manualmente
- `frontend-image.yml`: workflow reutilizavel para publicar a imagem do frontend, tambem acionavel manualmente
- `backend-ci.yml` e `frontend-ci.yml`: workflows reutilizaveis usados pela pipeline da `main` e pelas PRs; nao rodam nas PRs de release para evitar duplicidade

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
