# app-web-tjjud

Portal tecnico da solucao API-first para cadastro de autores, assuntos e livros com relatorio por autor, PDF e entrega cloud-native.

## Acessos publicos

- Frontend demo: [https://front-demo.pavim.com.br](https://front-demo.pavim.com.br)
- Swagger UI: [https://front-demo.pavim.com.br/swagger-ui.html](https://front-demo.pavim.com.br/swagger-ui.html)
- OpenAPI JSON: [https://front-demo.pavim.com.br/api-docs](https://front-demo.pavim.com.br/api-docs)
- Documentacao publica: [https://jpmmdf.github.io/app-web-tjjud/](https://jpmmdf.github.io/app-web-tjjud/)

## O que existe aqui

- backend `Spring Boot 4 / Java 21` com CRUD, relatorio e exportacao PDF
- frontend `Angular 21` com filtros, formularios reativos e consumo do OpenAPI
- banco `PostgreSQL 16` com modelagem normalizada e view `vw_relatorio_livros_por_autor`
- deploy demo em Kubernetes com GitOps via Argo CD
- documentacao tecnica com diagramas C4 derivados de `Structurizr DSL`

## Como navegar

- **Visao Geral**: links publicos da demo, acessos e ambiente publicado
- **Arquitetura**: panorama, diagramas C4 e decisoes tecnicas
- **Referencia**: contrato HTTP e modelo de dados
- **Operacao**: runtime, GitOps, releases e publicacao Docker
- **Comecando**: caminho minimo para validar a solucao localmente

## Fluxo principal

1. cadastrar autores
2. cadastrar assuntos
3. cadastrar livros associando pelo menos um autor e um assunto
4. consultar o relatorio agrupado por autor
5. exportar o PDF do relatorio

## Criterio de atualizacao

Sempre que houver mudanca relevante de arquitetura, contrato, runtime ou topologia:

1. atualizar o `Structurizr DSL` em `docs/architecture/structurizr/workspace.dsl`
2. executar `make diagrams`
3. revisar as paginas de arquitetura, operacao e onboarding
4. validar o portal com `make docs-build`
