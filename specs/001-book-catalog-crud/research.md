# Research: Cadastro de Livros

## Decision 1: API-first com OpenAPI 3.1 como contrato fonte

- **Decision**: Definir a API REST primeiro em `contracts/openapi.yaml`, usando esse artefato como referencia para backend, frontend e testes.
- **Rationale**: A exigencia do usuario foi API-first. Um contrato explicito reduz divergencia entre frontend e backend, documenta payloads de erro e acelera validacao do CRUD e do relatorio.
- **Alternatives considered**:
  - Documentacao derivada do codigo: rejeitada porque enfraquece a disciplina contract-first.
  - GraphQL: rejeitada porque o escopo do desafio e CRUD relacional simples com relatorio e se adapta melhor a REST.

## Decision 2: Spring Boot 3.x com Java 21 no backend

- **Decision**: Usar Spring Boot 3.x sobre Java 21 LTS com Spring Web, Validation, Data JPA, Actuator, springdoc-openapi e JasperReports.
- **Rationale**: Atende ao stack solicitado, oferece produtividade para CRUD e validacoes, integra bem com PostgreSQL/Flyway e permite expor a API com tratamento estruturado de erros.
- **Alternatives considered**:
  - Micronaut ou Quarkus: rejeitados por adicionarem custo de decisao sem ganho necessario para o escopo.
  - JDBC puro: rejeitado porque aumenta o volume de codigo para um desafio com foco mais amplo.

## Decision 3: Angular standalone com formularios reativos e Bootstrap

- **Decision**: Implementar o frontend em Angular com componentes standalone, Angular Router, HttpClient, formularios reativos tipados e Bootstrap como base visual responsiva.
- **Rationale**: Atende ao stack solicitado, simplifica a organizacao por feature, acelera a construcao de layout responsivo e reduz a necessidade de CSS estrutural customizado para formularios, listagens e tela de relatorio.
- **Alternatives considered**:
  - Angular com `NgModule` em todas as features: rejeitado porque adiciona boilerplate sem necessidade.
  - CSS autoral completo sem framework visual base: rejeitada porque aumenta custo de montagem e reduz consistencia entre telas para um escopo demonstrativo.
  - Outra SPA framework: rejeitada porque o pedido explicito foi Angular.

## Decision 4: PostgreSQL com modelagem normalizada e migrations versionadas

- **Decision**: Usar PostgreSQL com Flyway para schema versionado, view de relatorio e constraints de integridade.
- **Rationale**: O banco suporta bem view, indices, check constraints e tipo numerico preciso para moeda. Flyway garante setup reproduzivel para a entrevista tecnica.
- **Alternatives considered**:
  - H2 como banco principal: rejeitado porque empobrece a validacao do relatorio e do SQL real.
  - MySQL: viavel, mas PostgreSQL oferece melhor ergonomia para view e constraints.

## Decision 5: Valor monetario como decimal canonico com mascara BRL na interface

- **Decision**: Trafegar `price`/`valor` como string decimal canonica na API, mapear para `BigDecimal` no backend e armazenar como `NUMERIC(12,2)` no banco. Na UI, exibir e editar com mascara `pt-BR`.
- **Rationale**: Evita erros de ponto flutuante no navegador, preserva precisao contabil e atende ao requisito de mascara monetaria.
- **Alternatives considered**:
  - `double` em API/backend: rejeitado por risco de arredondamento.
  - Inteiro em centavos em toda a API: viavel, mas piora legibilidade para um CRUD demonstrativo simples.

## Decision 6: Relatorio por autor com view de banco e exportacao PDF

- **Decision**: Criar a view `vw_relatorio_livros_por_autor` no banco, consultar essa view no backend e gerar PDF via JasperReports, mantendo endpoint JSON para inspecao e testes.
- **Rationale**: Atende diretamente ao requisito de relatorio baseado em view no banco e permite uma entrega simples, demonstravel e auditavel.
- **Alternatives considered**:
  - Relatorio apenas em HTML/Angular: rejeitado porque nao atende integralmente ao requisito de componente de relatorio.
  - JasperReports consultando tabelas diretamente: rejeitado porque o enunciado pede origem em view.

## Decision 7: Estrategia de testes em quatro niveis

- **Decision**: Cobrir o fluxo com testes unitarios, integracao com PostgreSQL real via Testcontainers, testes de contrato para a API e E2E do fluxo principal em navegador.
- **Rationale**: O desafio cita TDD como diferencial e pede confiabilidade em validacoes, CRUD e relatorio; a cobertura em camadas reduz regressao sem inflar demais o escopo.
- **Alternatives considered**:
  - Somente testes manuais: rejeitado por baixo valor tecnico.
  - Somente testes unitarios: rejeitado porque nao garante view, SQL, integridade referencial e contrato HTTP.

## Decision 8: Mensagens em portugues com externalizacao centralizada

- **Decision**: Manter mensagens de validacao, negocio e interface em portugues do Brasil, usando mecanismo centralizado de i18n ou arquivos `properties` equivalentes no backend e catalogo centralizado no frontend.
- **Rationale**: O usuario solicitou mensagens em portugues e a externalizacao evita literais espalhados, facilita manutencao e prepara a solucao para evolucao futura de idioma sem reescrever regras de negocio.
- **Alternatives considered**:
  - Literais fixas no codigo: rejeitada porque aumenta inconsistencias e dificulta manutencao.
  - Mensagens em ingles com traducao posterior: rejeitada porque entra em conflito com a experiencia exigida para a demonstracao.

## Decision 9: Suporte nativo a OpenTelemetry

- **Decision**: Adotar suporte a OpenTelemetry na aplicacao, com foco em traces de requisicoes HTTP, operacoes de persistencia, geracao de relatorio e exportacao para backend compativel via OTLP.
- **Rationale**: Observabilidade padronizada aumenta a qualidade cloud-native da entrega, melhora diagnostico e atende ao requisito explicito do usuario.
- **Alternatives considered**:
  - Logs isolados sem correlacao: rejeitada porque nao oferece rastreabilidade suficiente entre camadas.
  - Solucao proprietaria de observabilidade: rejeitada porque reduz portabilidade e foge do requisito de compatibilidade aberta.
