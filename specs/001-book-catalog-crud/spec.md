# Feature Specification: Cadastro de Livros

**Feature Branch**: `001-book-catalog-crud`  
**Created**: 2026-03-18  
**Status**: Draft  
**Input**: User description: "Construir um cadastro de livros API-first com CRUD de livros, autores e assuntos, campo de valor em reais com mascara, relatorio agrupado por autor e aderencia ao modelo de dados fornecido"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manter livros do catalogo (Priority: P1)

Como pessoa responsavel pelo catalogo, quero cadastrar e manter livros com seus autores, assuntos e valor para que o acervo possa ser consultado e atualizado sem acesso direto ao banco.

**Why this priority**: O cadastro de livros e o objetivo central do desafio e concentra o maior valor funcional para a demonstracao.

**Independent Test**: Pode ser testado criando um livro com dados validos, relacionando pelo menos um autor e um assunto existentes, alterando seu valor e confirmando a persistencia correta das associacoes.

**Acceptance Scenarios**:

1. **Given** que existem autores e assuntos cadastrados, **When** o usuario registra um livro com titulo, editora, edicao, ano de publicacao, valor formatado em reais, autores e assuntos, **Then** o livro e salvo e fica disponivel para consulta e edicao.
2. **Given** que um livro ja existe, **When** o usuario altera seus dados bibliograficos, valor ou relacionamentos, **Then** o cadastro e atualizado sem perder a integridade das associacoes existentes.
3. **Given** que o usuario tenta salvar um livro sem autor, sem assunto, com ano invalido ou valor monetario invalido, **When** a operacao e enviada, **Then** o sistema bloqueia a gravacao e apresenta mensagens especificas de validacao em portugues.

---

### User Story 2 - Manter autores e assuntos de referencia (Priority: P2)

Como pessoa responsavel pelo catalogo, quero cadastrar e manter autores e assuntos para que os livros possam ser classificados corretamente.

**Why this priority**: Autores e assuntos sustentam o cadastro principal e precisam existir para permitir a manutencao consistente dos livros.

**Independent Test**: Pode ser testado criando, consultando, alterando e removendo um autor e um assunto que ainda nao estejam associados a nenhum livro.

**Acceptance Scenarios**:

1. **Given** que o usuario acessa a tela de autores ou assuntos, **When** ele informa os dados obrigatorios e confirma a operacao, **Then** o registro e salvo e aparece nas listagens correspondentes.
2. **Given** que um autor ou assunto esta vinculado a livros existentes, **When** o usuario tenta exclui-lo, **Then** o sistema impede a exclusao e informa que ha relacionamento ativo.

---

### User Story 3 - Emitir relatorio consolidado por autor (Priority: P3)

Como avaliador tecnico, quero consultar um relatorio consolidado por autor para entender rapidamente quais livros e assuntos estao associados a cada autor.

**Why this priority**: O relatorio e uma exigencia explicita do desafio e demonstra integracao entre dados relacionais, consulta consolidada e apresentacao.

**Independent Test**: Pode ser testado populando o catalogo com livros, autores e assuntos, gerando o relatorio e verificando o agrupamento por autor inclusive quando um livro possuir multiplos autores.

**Acceptance Scenarios**:

1. **Given** que existem livros vinculados a autores e assuntos, **When** o usuario gera o relatorio, **Then** o resultado agrupa os dados por autor e exibe informacoes coerentes das tres entidades principais.
2. **Given** que um livro possui mais de um autor, **When** o relatorio e consultado, **Then** o livro aparece corretamente em cada agrupamento de autor aplicavel sem omissao dos assuntos relacionados.

---

### User Story 4 - Navegar e consultar o catalogo com facilidade (Priority: P4)

Como usuario do sistema, quero acessar rapidamente as telas principais e consultar os registros existentes para executar manutencoes com baixo esforco.

**Why this priority**: A navegacao simples foi solicitada no desafio e reduz friccao na demonstracao funcional.

**Independent Test**: Pode ser testado abrindo a tela inicial, acessando cada area principal em no maximo um clique e consultando registros existentes antes de editar ou excluir.

**Acceptance Scenarios**:

1. **Given** que o usuario abre a aplicacao, **When** ele acessa a tela inicial, **Then** encontra navegacao direta para livros, autores, assuntos e relatorio.
2. **Given** que existem registros cadastrados, **When** o usuario consulta uma listagem, **Then** consegue identificar o registro desejado para visualizar, editar ou excluir.

---

### Edge Cases

- O usuario tenta associar o mesmo autor mais de uma vez ao mesmo livro.
- O usuario tenta associar o mesmo assunto mais de uma vez ao mesmo livro.
- O usuario informa valor monetario com formato invalido, negativo ou com precisao inconsistente.
- O usuario informa ano de publicacao fora do padrao de quatro digitos ou fora de uma faixa aceitavel para catalogacao.
- O usuario tenta excluir um autor ou assunto que ainda participa de relacionamentos ativos.
- O relatorio precisa refletir corretamente livros com multiplos autores sem duplicar indevidamente os assuntos associados.
- O sistema mistura mensagens em portugues e ingles nos fluxos principais, prejudicando a demonstracao e a experiencia do usuario.
- O ambiente executa os fluxos de CRUD e relatorio, mas nao produz rastreamento padronizado suficiente para observabilidade e diagnostico.

## Assumptions

- Identificadores internos de livros, autores e assuntos podem ser gerenciados pelo sistema, desde que permanecam unicos e rastreaveis.
- Cada livro deve estar vinculado a pelo menos um autor e a pelo menos um assunto.
- Autenticacao e controle de acesso nao fazem parte do escopo inicial deste desafio.
- O relatorio pode ser apresentado em formato visual ou exportavel, desde que mantenha legibilidade e permita entendimento claro dos dados agrupados por autor.
- O idioma inicial de toda comunicacao apresentada ao usuario sera portugues do Brasil.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir criar, consultar, atualizar e remover autores com seus dados de identificacao e nome.
- **FR-002**: O sistema MUST permitir criar, consultar, atualizar e remover assuntos com seus dados de identificacao e descricao.
- **FR-003**: O sistema MUST permitir criar, consultar, atualizar e remover livros com titulo, editora, edicao, ano de publicacao, valor monetario e relacionamentos com autores e assuntos.
- **FR-004**: O sistema MUST exigir pelo menos um autor e um assunto vinculados para que um livro seja considerado valido para cadastro.
- **FR-005**: O sistema MUST permitir que um mesmo livro esteja associado a multiplos autores e multiplos assuntos.
- **FR-006**: O sistema MUST impedir associacoes duplicadas de um mesmo autor ou de um mesmo assunto ao mesmo livro.
- **FR-007**: O sistema MUST validar obrigatoriedade, formato e consistencia dos campos antes de persistir qualquer cadastro.
- **FR-008**: O sistema MUST aceitar e exibir o valor do livro com formatacao monetaria em reais em todos os pontos de entrada e consulta destinados ao usuario.
- **FR-009**: O sistema MUST disponibilizar uma tela inicial com navegacao direta para manutencao de livros, autores, assuntos e emissao do relatorio.
- **FR-010**: O sistema MUST disponibilizar um contrato de integracao consistente para as operacoes de manutencao e consulta antes que a interface consumidora dependa dessas operacoes.
- **FR-011**: O sistema MUST retornar mensagens de erro especificas para falhas de validacao, relacionamentos inexistentes, conflitos de exclusao e inconsistencias de dados, evitando respostas genericas.
- **FR-012**: O sistema MUST preservar a integridade referencial entre livros, autores, assuntos e tabelas de associacao durante criacao, alteracao e exclusao.
- **FR-013**: O sistema MUST gerar um relatorio baseado em uma view de banco de dados que consolide livros, autores e assuntos com agrupamento por autor.
- **FR-014**: O sistema MUST respeitar o modelo logico fornecido para livro, autor, assunto e entidades de associacao, admitindo apenas ajustes estruturais voltados a desempenho sem alterar o comportamento esperado.
- **FR-015**: O sistema MUST disponibilizar listagens e consultas suficientes para localizar registros antes de editar, excluir ou emitir relatorios.
- **FR-016**: O projeto MUST incluir scripts e instrucoes que permitam recriar a estrutura do banco de dados, a view do relatorio e o processo de implantacao para a apresentacao tecnica.
- **FR-017**: O sistema MUST apresentar mensagens, rotulos e feedbacks destinados ao usuario em portugues do Brasil nos fluxos principais de cadastro, consulta, exclusao e relatorio.
- **FR-018**: O sistema MUST manter as mensagens destinadas ao usuario em mecanismo centralizado de internacionalizacao ou arquivos de configuracao equivalentes, evitando literais dispersos pelo codigo.
- **FR-019**: A aplicacao MUST suportar telemetria compativel com OpenTelemetry para rastrear requisicoes, operacoes criticas e integracoes relevantes durante execucao local e em ambiente alvo.

### Key Entities *(include if feature involves data)*

- **Livro**: Item principal do catalogo, identificado de forma unica, com titulo, editora, edicao, ano de publicacao e valor monetario.
- **Autor**: Pessoa responsavel pela autoria de um ou mais livros do catalogo.
- **Assunto**: Classificacao tematica usada para categorizar livros.
- **LivroAutor**: Relacionamento que representa a associacao entre um livro e um autor, permitindo autoria multipla.
- **LivroAssunto**: Relacionamento que representa a associacao entre um livro e um assunto, permitindo classificacao multipla.
- **Visao de Relatorio por Autor**: Conjunto de dados consolidado para leitura que combina livros, autores e assuntos com agrupamento por autor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuario consegue cadastrar autores, assuntos e um livro com pelo menos dois autores e dois assuntos em menos de 3 minutos, sem acesso direto ao banco de dados.
- **SC-002**: 100% das tentativas de gravar livro sem autor, sem assunto, com ano invalido ou valor monetario invalido sao bloqueadas com mensagens especificas ao usuario.
- **SC-003**: Um usuario consegue acessar livros, autores, assuntos e relatorio a partir da tela inicial em no maximo 1 clique para cada area.
- **SC-004**: O relatorio representa corretamente 100% dos casos de validacao preparados para a demonstracao, incluindo livros com multiplos autores e multiplos assuntos.
- **SC-005**: O ambiente da solucao pode ser recriado por um avaliador tecnico em ate 30 minutos usando apenas os scripts e instrucoes entregues com o projeto.
- **SC-006**: Todas as operacoes de cadastro, consulta, alteracao, exclusao e relatorio possuem contrato de integracao definido e revisavel antes do consumo pela interface web.
- **SC-007**: 100% das mensagens exibidas ao usuario nos fluxos principais da demonstracao aparecem em portugues do Brasil, sem textos residuais em ingles.
- **SC-008**: Os fluxos principais de CRUD e emissao de relatorio podem ser acompanhados por telemetria compativel com OpenTelemetry, com rastros exportaveis para um coletor ou backend observavel.
