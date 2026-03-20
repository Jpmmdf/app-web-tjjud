# Argo CD

Manifestos do Argo CD para o ambiente demo do projeto.

Arquivos:

- `app-project.yaml`: delimita o projeto `app-web-tjjud`
- `app-demo.yaml`: registra a aplicacao `app-web-tjjud-demo`

Observacao importante:

- a `Application` aponta para a branch `codex/demo-deployment-assets`
- depois que essa branch for mergeada, o `targetRevision` deve ser atualizado para `main`
- o Secret `app-web-tjjud-demo-secrets` precisa existir no cluster antes do primeiro sync
