# Feature Specification: Idempotencia em Escritas com Idempotency-Key

**Feature Branch**: `006-api-idempotency-key`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "e se a mesma requisição for enviada mais de uma vez? (por retry, timeout ou até um duplo clique) Implemente idempotência usando um Idempotency-Key no header. No teste: a primeira chamada cria normalmente; a segunda, com a mesma chave, não executa a lógica de novo; retorna exatamente o mesmo resultado. A própria API indica isso com: x-idempotency-replayed: true"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reenviar uma criacao sem duplicar efeito colateral (Priority: P1)

Como cliente da API, quero poder reenviar uma requisicao de criacao com a mesma chave de idempotencia para evitar registros duplicados quando houver retry, timeout ou duplo clique.

**Why this priority**: O risco de duplicidade em operacoes de criacao afeta integridade de dados, UX do frontend e confiabilidade da API em cenarios reais de rede instavel.

**Independent Test**: Pode ser testado enviando duas requisicoes `POST` identicas para a mesma rota suportada com o mesmo header `Idempotency-Key`, confirmando que apenas a primeira executa a criacao e que a segunda retorna o mesmo status e corpo da primeira, com `x-idempotency-replayed: true`.

**Acceptance Scenarios**:

1. **Given** que uma requisicao de criacao valida e enviada com um `Idempotency-Key` ainda nao utilizado para aquele endpoint, **When** a API processa a chamada, **Then** a operacao e executada normalmente e o recurso e criado.
2. **Given** que a mesma requisicao de criacao ja foi concluida com sucesso usando um `Idempotency-Key` especifico, **When** a mesma chamada e reenviada com a mesma chave, **Then** a API nao executa a logica de negocio novamente e devolve o mesmo resultado funcional da primeira chamada.
3. **Given** que a resposta devolvida veio de replay idempotente, **When** a API responde ao cliente, **Then** inclui o header `x-idempotency-replayed: true`.

---

### User Story 2 - Detectar reutilizacao incorreta da chave (Priority: P2)

Como cliente integrador, quero receber um erro claro ao tentar reutilizar a mesma chave de idempotencia com payload diferente para nao mascarar inconsistencias de chamada.

**Why this priority**: A mesma chave nao pode representar operacoes semanticamente diferentes, senao o sistema perde previsibilidade e passa a esconder erros do cliente.

**Independent Test**: Pode ser testado enviando duas requisicoes para o mesmo endpoint com a mesma `Idempotency-Key`, mas com corpo diferente, e validando que a API rejeita a segunda chamada sem executar a logica de criacao novamente.

**Acceptance Scenarios**:

1. **Given** que uma chave de idempotencia ja foi associada a uma requisicao concluida, **When** o cliente reusa a mesma chave com payload diferente, **Then** a API rejeita a chamada com erro de conflito semanticamente claro.
2. **Given** que a mesma chave e reutilizada em contexto invalido, **When** a API recusa a operacao, **Then** nenhum novo recurso e criado e nenhum efeito colateral adicional acontece.

---

### User Story 3 - Dar previsibilidade operacional ao backend e ao frontend (Priority: P3)

Como pessoa desenvolvedora, quero que a API registre e reapresente respostas de forma deterministica para simplificar retries automaticos, debounce imperfeito e protecao contra duplo clique.

**Why this priority**: O comportamento idempotente reduz acoplamento entre backend e frontend e melhora resiliencia sem exigir heuristicas ad hoc em cada cliente.

**Independent Test**: Pode ser testado com cobertura automatizada de integracao validando primeira execucao, replay com a mesma chave e deteccao de reuso indevido com corpo divergente.

**Acceptance Scenarios**:

1. **Given** que o frontend faz retry apos timeout percebido pelo usuario, **When** a primeira chamada ja tiver sido concluida no servidor, **Then** a resposta subsequente com a mesma chave reproduz o resultado original sem duplicar o cadastro.
2. **Given** que o usuario realiza duplo clique no fluxo de criacao, **When** ambas as chamadas usam a mesma `Idempotency-Key`, **Then** somente uma execucao efetiva de negocio ocorre.

---

### Edge Cases

- A mesma chave e reenviada com o mesmo corpo apos sucesso, mas com atraso significativo entre as chamadas.
- A mesma chave e reutilizada com corpo diferente para o mesmo endpoint.
- A mesma chave e reutilizada em outro endpoint de criacao.
- Duas chamadas com a mesma chave chegam quase ao mesmo tempo por retry automatico ou duplo clique.
- A primeira chamada falha por validacao de negocio e o cliente tenta reenviar com a mesma chave.
- O armazenamento da chave idempotente expira ou e limpo antes de um retry tardio.
- O cliente nao envia `Idempotency-Key` e a API deve continuar com o comportamento legado definido para endpoints fora da politica.

## Assumptions

- A primeira entrega de idempotencia cobrira operacoes de criacao `POST` da API, em especial autores, assuntos e livros.
- O comportamento idempotente sera aplicado quando o header `Idempotency-Key` estiver presente; chamadas sem esse header permanecem com o comportamento atual.
- O backend podera persistir um registro de idempotencia com chave, fingerprint da requisicao, status, corpo de resposta e metadados necessarios para replay.
- A chave de idempotencia sera tratada em conjunto com o endpoint alvo, evitando colisao indevida entre recursos distintos.
- O replay deve preservar o resultado funcional original, admitindo apenas a adicao do header `x-idempotency-replayed: true` nas respostas reproduzidas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A API MUST aceitar o header `Idempotency-Key` nas operacoes `POST` de criacao suportadas.
- **FR-002**: Quando uma requisicao suportada chegar com `Idempotency-Key` inedito, a API MUST executar a logica normalmente e registrar informacoes suficientes para replay posterior.
- **FR-003**: Quando a mesma requisicao for reenviada com a mesma chave para o mesmo endpoint, a API MUST nao executar a logica de negocio novamente.
- **FR-004**: No replay idempotente, a API MUST devolver o mesmo status HTTP e o mesmo corpo de resposta da primeira chamada concluida.
- **FR-005**: No replay idempotente, a API MUST incluir o header `x-idempotency-replayed: true`.
- **FR-006**: A API MUST distinguir uma repeticao valida de uma reutilizacao indevida da mesma chave com payload diferente.
- **FR-007**: Quando a mesma chave for reutilizada com payload diferente para o mesmo endpoint, a API MUST rejeitar a chamada com resposta de conflito sem reexecutar a logica de criacao.
- **FR-008**: A solucao MUST impedir que retries, timeouts percebidos pelo cliente ou duplo clique gerem mais de um recurso persistido para a mesma operacao idempotente.
- **FR-009**: A implementacao MUST manter o escopo idempotente vinculado ao endpoint e ao fingerprint da requisicao, evitando replay incorreto entre recursos distintos.
- **FR-010**: A API MUST manter o comportamento atual para endpoints ou chamadas fora do escopo da politica de idempotencia definida.
- **FR-011**: O projeto MUST incluir testes automatizados de integracao cobrindo pelo menos primeira chamada, replay com a mesma chave e reutilizacao invalida da mesma chave.
- **FR-012**: O teste principal de idempotencia MUST validar que a primeira chamada cria normalmente.
- **FR-013**: O teste principal de idempotencia MUST validar que a segunda chamada com a mesma chave nao executa a logica novamente.
- **FR-014**: O teste principal de idempotencia MUST validar que a segunda chamada com a mesma chave devolve exatamente o mesmo resultado funcional da primeira.
- **FR-015**: O teste principal de idempotencia MUST validar a presenca do header `x-idempotency-replayed: true` na resposta reproduzida.
- **FR-016**: A documentacao da API MUST explicitar como gerar, enviar e interpretar `Idempotency-Key` e `x-idempotency-replayed`.

### Key Entities *(include if feature involves data)*

- **Idempotency Key**: Identificador enviado pelo cliente no header para representar uma tentativa logica unica de operacao.
- **Idempotency Record**: Registro persistido pelo backend com chave, endpoint, fingerprint da requisicao, estado do processamento, status HTTP, headers relevantes e corpo da resposta original.
- **Request Fingerprint**: Representacao canonica do endpoint e do payload usada para validar se uma mesma chave esta sendo reutilizada corretamente.
- **Replay Response**: Resposta devolvida pela API a partir de um registro idempotente existente, contendo o mesmo resultado funcional da chamada original e o header `x-idempotency-replayed: true`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cenarios validados de retry com a mesma `Idempotency-Key` em endpoints suportados nao geram duplicidade de registros.
- **SC-002**: A segunda chamada idempotente validada devolve o mesmo status e o mesmo corpo da primeira em 100% dos testes definidos.
- **SC-003**: 100% dos replays idempotentes validados retornam `x-idempotency-replayed: true`.
- **SC-004**: 100% das tentativas validadas de reutilizar a mesma chave com payload diferente sao rejeitadas sem novo efeito colateral.
- **SC-005**: Um cliente consegue implementar retry seguro para criacao sem precisar aplicar protecoes adicionais contra duplicidade no backend em todos os fluxos cobertos.
