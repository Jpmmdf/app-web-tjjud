# Panorama Arquitetural

## Visao de alto nivel

A solucao foi organizada como uma aplicacao web API-first separada em tres blocos principais:

- **Catalog Web**: SPA Angular para operacao do catalogo e exportacao do relatorio.
- **Catalog API**: backend Spring Boot responsavel por regras de negocio, validacoes, persistencia e geracao do PDF.
- **Catalog Database**: PostgreSQL com schema normalizado, tabelas associativas e view do relatorio.

## Modelos aplicados

### Frontend

O frontend adota um modelo de **SPA por features com shell, core e shared**.

- `core` concentra layout, modelos, clientes HTTP, i18n e a fachada de estado
- `features` organiza cada fluxo funcional por dominio (`authors`, `subjects`, `books`, `reports`, `catalog`)
- `pages` cuidam da composicao de rota e `components` encapsulam as interacoes locais
- `shared` reune formatadores, formularios e diretivas reutilizaveis

Na pratica, o comportamento principal fica na **Facade** em `core/state`, que orquestra carregamento, mensagens, sincronizacao entre telas e chamadas da API. Os componentes permanecem mais finos e focados em apresentacao e eventos de interface.

### Backend

O backend segue um modelo de **monolito modular com package-by-feature e camadas internas por slice**.

- cada dominio principal (`authors`, `subjects`, `books`, `reports`) tem pacotes `api`, `application`, `domain` e `infra`
- `api` expoe controllers, DTOs e contratos REST
- `application` concentra casos de uso, transacoes e coordenacao entre repositorios
- `domain` representa entidades e regras centrais do negocio
- `infra` implementa persistencia JPA, consultas JDBC e geracao de PDF

Esse desenho mantem separacao clara entre contrato, regra de negocio e tecnologia, sem quebrar a aplicacao em microservicos.

## Responsabilidades por camada

### Frontend operacional

- consome somente contratos HTTP da API
- aplica mascara monetaria BRL mantendo o valor canonico decimal no modelo
- centraliza CRUD, filtros e exportacao PDF

### Backend operacional

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

Os diagramas C4 nascem do arquivo `docs/architecture/structurizr/workspace.dsl`. A documentacao publica consome a exportacao estatica gerada por:

```bash
make diagrams
```
