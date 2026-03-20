# Panorama Arquitetural

## Visao de alto nivel

A solucao foi organizada como uma aplicacao web API-first separada em quatro blocos principais:

- **Catalog Web**: SPA Angular para operacao do catalogo e exportacao do relatorio.
- **Catalog API**: backend Spring Boot responsavel por regras de negocio, validacoes, persistencia e geracao do PDF.
- **Catalog Database**: PostgreSQL com schema normalizado, tabelas associativas e view do relatorio.
- **Documentation Portal**: site estatico em MkDocs para onboarding, arquitetura e operacao.

## Responsabilidades

### Frontend

- consome somente contratos HTTP da API
- aplica mascara monetaria BRL mantendo o valor canonico decimal no modelo
- centraliza CRUD, filtros e exportacao PDF

### Backend

- garante validacao de entrada e mensagens de erro estruturadas
- preserva integridade relacional entre livros, autores e assuntos
- consulta a view `vw_relatorio_livros_por_autor` para JSON e PDF
- expoe health checks, metricas e Swagger UI

### Banco de dados

- usa `BIGINT` identity para chaves principais
- usa tabelas associativas com chave primaria composta
- usa `NUMERIC(12,2)` para preco
- usa a view de relatorio para reduzir duplicacao de logica no backend

## Fronteiras de deploy

- **borda**: nginx ou ingress publica a SPA e encaminha `/api`
- **camada de aplicacao**: container Spring Boot
- **dados**: PostgreSQL
- **observabilidade**: logs, metricas e endpoints actuator

## Fonte de verdade arquitetural

Os diagramas C4 nascem do arquivo `docs/architecture/structurizr/workspace.dsl`. O portal consome a exportacao estatica gerada por:

```bash
make diagrams
```
