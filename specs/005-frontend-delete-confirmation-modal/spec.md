# Feature Specification: Modal de Confirmacao de Exclusao

**Feature Branch**: `005-frontend-delete-confirmation-modal`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "Crie um spec para implementar uma modal para confirmar a exclusão de um item."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirmar exclusao com mais clareza (Priority: P1)

Como pessoa usuaria do catalogo, quero confirmar a exclusao em uma modal visualmente integrada ao sistema para entender exatamente o que sera removido antes de concluir a acao.

**Why this priority**: A exclusao e uma acao destrutiva e hoje depende de `window.confirm`, que nao segue o padrao visual nem oferece contexto suficiente no frontend.

**Independent Test**: Pode ser testado iniciando a exclusao de um autor, assunto ou livro e validando que a modal exibe o nome do item, permite cancelar e so executa a remocao apos confirmacao explicita.

**Acceptance Scenarios**:

1. **Given** que o usuario clica em excluir um item de uma listagem, **When** a acao e iniciada, **Then** o sistema abre uma modal de confirmacao com titulo, descricao contextual e botoes de cancelar e confirmar.
2. **Given** que a modal esta aberta, **When** o usuario escolhe cancelar, **Then** a modal e fechada sem remover o item nem alterar a listagem.
3. **Given** que a modal esta aberta para um item especifico, **When** o usuario confirma a exclusao, **Then** o frontend executa a remocao correspondente e atualiza a tela conforme o resultado da API.

---

### User Story 2 - Reutilizar a confirmacao nos fluxos destrutivos (Priority: P2)

Como pessoa mantenedora do frontend, quero uma modal reutilizavel para exclusao para evitar duplicacao de comportamento entre autores, assuntos e livros.

**Why this priority**: O comportamento de confirmacao e transversal e precisa ser consistente entre entidades, com uma implementacao unica e configuravel.

**Independent Test**: Pode ser testado acionando exclusao nas tres entidades principais e verificando que a mesma estrutura de modal e reutilizada com textos dinamicos por recurso.

**Acceptance Scenarios**:

1. **Given** que o usuario tenta excluir um autor, um assunto ou um livro, **When** a modal e aberta, **Then** a estrutura visual e comportamental permanece a mesma, mudando apenas os textos e o item alvo.
2. **Given** que diferentes entidades usam a modal, **When** o item possui nomes ou descricoes distintas, **Then** a mensagem apresentada identifica corretamente o recurso que sera removido.

---

### User Story 3 - Operar a modal com acessibilidade e previsibilidade (Priority: P3)

Como pessoa usuaria de teclado ou leitor de tela, quero que a modal receba foco, possa ser fechada de forma previsivel e informe claramente a acao destrutiva em andamento.

**Why this priority**: Confirmacoes destrutivas precisam ser acessiveis e nao podem depender apenas de mouse ou de uma implementacao visual sem semantica adequada.

**Independent Test**: Pode ser testado abrindo a modal via teclado, navegando entre os botoes, fechando com `Esc` ou cancelamento e confirmando que o foco retorna ao elemento de origem.

**Acceptance Scenarios**:

1. **Given** que a modal e aberta, **When** ela aparece na tela, **Then** o foco inicial vai para um elemento interativo relevante dentro da modal e o restante da pagina nao compete pela atencao.
2. **Given** que a modal esta aberta, **When** o usuario pressiona `Esc` ou aciona o cancelamento, **Then** a modal e fechada e o foco retorna ao gatilho original de exclusao.
3. **Given** que a operacao de exclusao esta em andamento, **When** a requisicao ainda nao terminou, **Then** a modal sinaliza estado de processamento e evita confirmacoes duplicadas.

---

### Edge Cases

- O item possui nome ou descricao longos e a modal precisa continuar legivel sem quebrar o layout.
- O usuario abre a modal e fecha sem confirmar repetidas vezes na mesma tela.
- A API retorna erro de conflito ao tentar excluir um item vinculado a outros registros.
- O usuario dispara exclusao em listas paginadas ou filtradas e a tela precisa manter o contexto apos o resultado.
- Duplo clique no botao de confirmar tenta enviar mais de uma requisicao de exclusao.
- A modal e aberta para itens de entidades diferentes em sequencia e nao pode reutilizar textos ou estado do item anterior incorretamente.

## Assumptions

- A implementacao substituira o uso atual de `window.confirm` nos fluxos de exclusao de autores, assuntos e livros.
- O backend e os contratos de exclusao existentes permanecerao inalterados.
- A modal podera ser implementada como componente standalone reutilizavel, acionado por estado local ou servico de UI do frontend.
- As mensagens exibidas ao usuario continuarao centralizadas em `pt-br.ts`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O frontend MUST substituir confirmacoes nativas de exclusao por uma modal visual integrada ao sistema.
- **FR-002**: A modal MUST exibir titulo, mensagem descritiva e identificacao clara do item que sera excluido.
- **FR-003**: A modal MUST oferecer pelo menos as acoes de cancelar e confirmar exclusao.
- **FR-004**: O frontend MUST executar a exclusao somente apos confirmacao explicita dentro da modal.
- **FR-005**: O frontend MUST permitir reutilizacao da mesma modal nos fluxos de exclusao de autores, assuntos e livros.
- **FR-006**: A modal MUST aceitar textos dinamicos por entidade e por item, sem hardcode de um unico recurso.
- **FR-007**: Durante a requisicao de exclusao, a modal MUST indicar estado de processamento e impedir confirmacao duplicada.
- **FR-008**: Ao cancelar ou fechar a modal, o sistema MUST preservar o estado atual da listagem, incluindo filtros, ordenacao e pagina corrente.
- **FR-009**: Ao concluir a exclusao com sucesso, o frontend MUST atualizar a listagem afetada e apresentar o feedback ja previsto pelo fluxo atual.
- **FR-010**: Ao ocorrer erro na exclusao, o frontend MUST fechar ou manter a modal de forma consistente com a estrategia definida e apresentar a mensagem de falha retornada pelo sistema.
- **FR-011**: A modal MUST ser operavel por teclado, incluindo foco inicial, navegacao previsivel entre controles e fechamento por `Esc`.
- **FR-012**: O frontend MUST devolver o foco ao elemento que abriu a modal quando a interacao for encerrada sem navegacao para outra tela.
- **FR-013**: Os textos da modal MUST ficar centralizados no mecanismo de internacionalizacao do frontend.
- **FR-014**: A implementacao MUST manter aderencia visual ao padrao atual do frontend, sem reintroduzir `confirm` nativo em fluxos equivalentes.

### Key Entities *(include if feature involves data)*

- **Delete Confirmation Modal**: Componente visual reutilizavel responsavel por apresentar contexto, risco e acoes de confirmacao de exclusao.
- **Delete Target**: Objeto de configuracao da modal contendo tipo de recurso, identificador, rotulo legivel e callback de confirmacao.
- **Delete Flow State**: Estado transitivo do frontend que controla abertura da modal, item ativo, carregamento e encerramento da interacao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos fluxos principais de exclusao no frontend deixam de usar `window.confirm`.
- **SC-002**: Um usuario consegue identificar qual item sera excluido antes de confirmar a acao em 100% dos cenarios validados.
- **SC-003**: A mesma estrutura de modal atende autores, assuntos e livros sem duplicacao perceptivel de implementacao ou comportamento.
- **SC-004**: A confirmacao destrutiva pode ser executada integralmente por teclado, incluindo abertura, cancelamento, confirmacao e retorno de foco.
- **SC-005**: Nenhum fluxo validado permite disparar duas exclusoes para o mesmo item por interacao duplicada no botao de confirmar.
