# Implementation Plan: Cadastro de Livros

**Branch**: `001-book-catalog-crud` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-book-catalog-crud/spec.md`

**Note**: Este plano detalha a implementacao de uma solucao web API-first com backend Spring Boot, frontend Angular e banco relacional com view dedicada ao relatorio.

## Summary

Implementar uma aplicacao web de cadastro de livros em dois projetos, com `contracts/openapi.yaml` como fonte de verdade para o contrato REST. O backend em Spring Boot entregara CRUD de livros, autores e assuntos, validacoes especificas, relatorio por autor alimentado por view de banco, exportacao em PDF, mensagens externalizadas em portugues e telemetria compativel com OpenTelemetry. O frontend em Angular consumira o contrato da API, usara formularios reativos, centralizara mensagens da interface e tera componente reutilizavel de mascara monetaria em reais para o campo de valor.

## Technical Context

**Language/Version**: Java 21 LTS, TypeScript 5.x, SQL (PostgreSQL 16+)  
**Primary Dependencies**: Spring Boot 3.x (Web, Validation, Data JPA, Actuator), Flyway, springdoc-openapi, OpenTelemetry/OTLP, bundles de mensagens via i18n ou `properties`, Angular 19+ com componentes standalone, Angular Reactive Forms, Angular HttpClient  
**Storage**: PostgreSQL 16+ com schema normalizado, constraints, indices e view de relatorio  
**Testing**: JUnit 5, Spring Boot Test, MockMvc, Testcontainers para PostgreSQL, Angular unit tests, Playwright para fluxo critico ponta a ponta  
**Target Platform**: Navegadores modernos no frontend e API REST executando em Linux/macOS localmente ou em container  
**Project Type**: web application (Angular SPA + Spring Boot REST API)  
**Performance Goals**: p95 menor que 300 ms para operacoes de CRUD e consulta simples; geracao do relatorio em ate 5 s para base com 10 mil livros  
**Constraints**: abordagem API-first obrigatoria, valor monetario com precisao decimal e mascara BRL, view de banco obrigatoria para o relatorio, aderencia ao modelo fornecido com melhorias apenas de qualidade/performance, mensagens de erro especificas em portugues com i18n/properties, suporte a OpenTelemetry e setup reproduzivel para demonstracao  
**Scale/Scope**: desafio tecnico com 4 areas principais de interface, base pequena a media, dezenas de usuarios concorrentes e ate 10 mil livros catalogados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

O arquivo [constitution.md](./../../.specify/memory/constitution.md) ainda esta no template padrao, sem principios ratificados para o projeto. Para nao bloquear a execucao da feature, este plano adota gates provisiorios alinhados ao desafio e revalidados apos o desenho tecnico.

- **Gate 1 - Contract First**: PASS. O contrato OpenAPI sera produzido antes da implementacao de backend e frontend e sera a referencia para integracao.
- **Gate 2 - Data Integrity First**: PASS. O banco usara migrations versionadas, chaves estrangeiras, chaves compostas nas tabelas de associacao, `NUMERIC(12,2)` para valor e view dedicada ao relatorio.
- **Gate 3 - Testable Delivery**: PASS. O plano inclui testes de unidade, integracao, contrato e fluxo critico de interface.
- **Gate 4 - Specific Failures**: PASS. A API retornara erros estruturados, mensagens de validacao por campo e mapeamento explicito para conflitos de exclusao/integridade.
- **Gate 5 - Reproducible Demo**: PASS. Quickstart, scripts de banco e pipeline local ficam definidos para reproduzir a demonstracao tecnica.

Re-check apos Phase 1 design: PASS. Os artefatos `research.md`, `data-model.md`, `quickstart.md` e `contracts/openapi.yaml` mantem os mesmos gates sem violacoes.

## Project Structure

### Documentation (this feature)

```text
specs/001-book-catalog-crud/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
backend/
|-- pom.xml
|-- src/
|   |-- main/
|   |   |-- java/br/com/tjjud/catalog/
|   |   |   |-- api/
|   |   |   |-- authors/
|   |   |   |-- books/
|   |   |   |-- reports/
|   |   |   |-- subjects/
|   |   |   `-- shared/
|   |   `-- resources/
|   |       |-- application.yml
|   |       |-- db/migration/
|   |       `-- jasper/
|   `-- test/
|       `-- java/br/com/tjjud/catalog/
|           |-- contract/
|           |-- integration/
|           `-- unit/
frontend/
|-- package.json
|-- angular.json
|-- src/
|   |-- app/
|   |   |-- core/
|   |   |-- shared/
|   |   `-- features/
|   |       |-- authors/
|   |       |-- books/
|   |       |-- reports/
|   |       `-- subjects/
|   |-- assets/
|   `-- styles/
`-- e2e/
```

**Structure Decision**: A solucao sera separada em `backend/` e `frontend/` para isolar responsabilidades, permitir evolucao independente e manter a abordagem API-first. O contrato OpenAPI permanecera dentro de `specs/001-book-catalog-crud/contracts/` durante o planejamento e sera espelhado para o backend na implementacao para validacao automatica.

## Phase 0 - Research Outcome

- Adotar PostgreSQL como banco principal pela combinacao de constraints robustas, suporte nativo a view, tipos numericos confiaveis para moeda e boa integracao com Spring Boot/Testcontainers.
- Representar valor monetario como decimal canonico na API e `NUMERIC(12,2)` no banco, com `BigDecimal` no backend e mascara `pt-BR` no frontend para evitar erros de ponto flutuante.
- Implementar a interface web com Angular standalone e formularios reativos, usando um controle reutilizavel de moeda em vez de acoplamento a uma biblioteca de mascara de baixa manutencao.
- Gerar o relatorio a partir de uma view relacional do banco e renderiza-lo via JasperReports no backend para exportacao PDF, mantendo uma consulta JSON equivalente para inspecao e testes.
- Validar integracao com testes em camadas: unitarios para regras, integracao para persistencia/view, contrato para API e E2E para o fluxo principal.
- Externalizar mensagens de negocio e validacao em mecanismo centralizado de i18n/properties, com `pt-BR` como idioma padrao da demonstracao.
- Instrumentar API e runtime com suporte a OpenTelemetry para traces, metricas e correlacao de logs nas operacoes principais.

## Phase 1 - Design Decisions

### Backend

- Arquitetura por fatias de dominio: `authors`, `subjects`, `books`, `reports` e `shared`.
- Controladores REST enxutos, servicos com regras de negocio e repositorios JPA apenas para persistencia.
- DTOs separados das entidades de banco para evitar vazamento de persistencia no contrato.
- Tratamento de erros padronizado com `ProblemDetail`, erros de validacao por campo e resolucao de mensagens via i18n/`properties`.
- Migrations versionadas com Flyway, incluindo tabelas, indices, constraints e view de relatorio.
- Instrumentacao OpenTelemetry para HTTP, acesso a banco, geracao de relatorio e correlacao por `traceId`.

### Frontend

- Angular com componentes standalone, roteamento por feature e formularios reativos tipados.
- `CurrencyInputComponent` ou diretiva equivalente para entrada de `valor`, exibindo `R$ 1.234,56` e persistindo decimal canonico.
- Servicos HTTP gerados ou alinhados ao contrato OpenAPI, com adaptadores finos para a camada de tela.
- Paginas separadas para listagem/formulario de autores, assuntos e livros, mais tela de relatorio com filtros simples.
- Rotulos, mensagens de erro e feedbacks centralizados em catalogo de mensagens para manter a interface integralmente em portugues.

### Database

- Tabelas `livro`, `autor` e `assunto` com chaves surrogate `BIGINT GENERATED BY DEFAULT AS IDENTITY`.
- Tabelas de associacao `livro_autor` e `livro_assunto` com chave primaria composta e indices secundarios para consultas reversas.
- Campo `ano_publicacao` armazenado como `SMALLINT` com validacao de faixa para manter semantica do modelo original com tipagem mais segura.
- Campo `valor` armazenado como `NUMERIC(12,2)` com `CHECK (valor >= 0)`.
- View `vw_relatorio_livros_por_autor` consolidando livro, autor e assunto para alimentar o relatorio.

### API-first Workflow

1. Fechar `contracts/openapi.yaml`.
2. Implementar testes de contrato/backend a partir do contrato.
3. Implementar endpoints REST no backend.
4. Implementar cliente e telas do Angular consumindo o contrato.
5. Validar o fluxo principal e o relatorio com dados reais no PostgreSQL.

## Implementation Milestones

1. Estruturar `backend/` com Spring Boot, Flyway, PostgreSQL, validacao, tratamento de erros, i18n/properties e OpenTelemetry.
2. Estruturar `frontend/` com Angular, navegacao principal, layout simples e estilos base.
3. Entregar CRUD de autores e assuntos.
4. Entregar CRUD de livros com relacionamentos e mascara monetaria.
5. Entregar view, consulta e exportacao do relatorio por autor.
6. Finalizar mensagens em portugues, telemetria observavel, scripts de setup, testes automatizados e roteiro de demonstracao.

## Risks And Mitigations

- **Risco**: divergencia entre contrato e implementacao.  
  **Mitigacao**: contrato OpenAPI como fonte de verdade e testes de contrato no backend.
- **Risco**: inconsistencias no valor monetario entre UI, API e banco.  
  **Mitigacao**: usar decimal canonico na API, `BigDecimal` no backend e `NUMERIC(12,2)` no banco.
- **Risco**: duplicidade indevida nas tabelas de associacao e no relatorio.  
  **Mitigacao**: chave composta, restricao unica e validacoes de dominio antes de persistir.
- **Risco**: relatorio PDF adicionar peso excessivo ao escopo.  
  **Mitigacao**: manter layout simples no JasperReports e reutilizar a view para JSON e PDF.
- **Risco**: mensagens dispersas gerarem inconsistencias entre portugues e ingles.  
  **Mitigacao**: centralizar mensagens em i18n/properties e validar textos dos fluxos principais.
- **Risco**: observabilidade insuficiente dificultar diagnostico em demonstracao ou deploy.  
  **Mitigacao**: habilitar suporte a OpenTelemetry desde o backend e definir verificacao basica no quickstart.

## Complexity Tracking

Nenhuma violacao de complexidade foi identificada para este escopo. As escolhas de separacao `backend/frontend`, OpenAPI, migrations e relatorio PDF se justificam diretamente pelos requisitos obrigatorios do desafio.
