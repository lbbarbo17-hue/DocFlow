# 📋 Formulário e Roteiro de Testes de QA — DocFlow

Este documento é o roteiro oficial de testes e formulário de validação para a equipe de Garantia da Qualidade (QA) validar todas as funcionalidades, regras de negócio e fluxos da plataforma **DocFlow**.

---

## 📌 1. Identificação da Execução de Teste

| Campo | Dados do Teste |
| :--- | :--- |
| **Nome do Analista de QA** | |
| **Data da Execução** | |
| **Ambiente de Teste** | [ ] Desenvolvimento &nbsp;&nbsp; [ ] Homologação/Staging &nbsp;&nbsp; [ ] Produção |
| **Branch / Commit** | `criacao_interface` / `b802c1b` |
| **Navegadores Testados** | [ ] Google Chrome &nbsp;&nbsp; [ ] Firefox &nbsp;&nbsp; [ ] Safari &nbsp;&nbsp; [ ] Microsoft Edge |
| **Dispositivos / Resoluções** | [ ] Desktop (1920x1080) &nbsp;&nbsp; [ ] Laptop (1366x768) &nbsp;&nbsp; [ ] Tablet &nbsp;&nbsp; [ ] Mobile (375x812) |
| **Parecer Geral** | [ ] **APROVADO** &nbsp;&nbsp; [ ] **APROVADO COM RESSALVAS** &nbsp;&nbsp; [ ] **REPROVADO** |

---

## ⚙️ 2. Legenda de Status dos Testes

- **[PASS] Aprovado**: O comportamento atende integralmente ao critério de aceite.
- **[FAIL] Falhou**: O comportamento difere do esperado ou gera erro.
- **[BLCK] Bloqueado**: Teste dependente de outra funcionalidade com defeito.
- **[N/A] Não Aplicável**: Não elegível para o escopo do ciclo de teste.

---

## 🎓 3. Módulo Estudante (Jovem Aprendiz / Estagiário)

### TC-EST-01: Cabeçalho de Boas-Vindas & Simulação de Perfil
- **Objetivo**: Validar a exibição da identificação do aluno e o chaveamento dinâmico de perfil.
- **Passos**:
  1. Acessar `/estudante`.
  2. Verificar no cabeçalho: saudação com primeiro nome ("Olá, [Nome]! 👋"), badge de vínculo ("Jovem Aprendiz" ou "Estagiário"), nome completo, matrícula, curso/instituição e empresa concedente.
  3. No seletor `"Simular Perfil:"`, selecionar outro estudante da lista (ex: aluno com estágio ou conformidade diferente).
- **Resultado Esperado**:
  - Dados cadastrais do aluno são atualizados instantaneamente.
  - Ícone e cor do badge se adaptam (Ciano para Aprendiz, Esmeralda para Estágio).
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-EST-02: Dashboard e Indicador de Saúde do Dossiê (`StudentHealthCard`)
- **Objetivo**: Validar o cálculo e apresentação visual do progresso de conformidade documental.
- **Passos**:
  1. Observar o card "Status da Documentação".
  2. Confirmar a ausência da frase redundante `"Acompanhamento da conformidade"`.
  3. Checar a barra de progresso e a porcentagem geral de conformidade (ex: 80%).
  4. Checar a listagem de pendências (documentos faltantes ou expirados) exibidos no card.
- **Resultado Esperado**:
  - Percentual bate com a proporção de documentos aprovados vs exigidos.
  - O subtítulo não é renderizado.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-EST-03: Central de Avisos & Vencimento de Documentos (`ExpirationAlert`)
- **Objetivo**: Testar alerta de documentos com vencimento próximo (< 30 dias) ou rejeitados.
- **Passos**:
  1. No painel do estudante, inspecionar o card "Central de Avisos".
  2. Se houver documento vencendo ou reprovado, verificar presença de botão "Enviar Agora" / "Atualizar".
  3. Clicar no botão de envio rápido dentro do aviso.
- **Resultado Esperado**:
  - Abre modal de upload pré-configurado para o documento em questão.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-EST-04: Tela "Meus Documentos & Checklist"
- **Objetivo**: Validar a exibição do checklist e seus estados de conformidade.
- **Passos**:
  1. Navegar para `/estudante/checklist`.
  2. Confirmar que o título é "Meus Documentos & Checklist" e **não** exibe a frase `"Guarda digital rápida e conferência..."`.
  3. Verificar filtros de listagem (Todos, Obrigatórios, Pendentes, Aprovados).
  4. Clicar em "Visualizar" em um documento aprovado.
- **Resultado Esperado**:
  - Modal de visualização exibe informações de custódia digital, hash SHA-256 e status.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-EST-05: Envio / Adição de Documentos com Validação de Segurança
- **Objetivo**: Testar upload com limites de tamanho, extensões permitidas e cálculo de hash.
- **Passos**:
  1. Acessar `/estudante/enviar`.
  2. Confirmar ausência da frase `"Envio com conferência de autenticidade e custódia digital"`.
  3. **Cenário A (Válido)**: Selecionar um arquivo PDF ou PNG com menos de 10 MB e enviar.
  4. **Cenário B (Inválido - Limite de Tamanho)**: Tentar enviar arquivo maior que 10 MB.
  5. **Cenário C (Inválido - Extensão)**: Tentar enviar arquivo não suportado (ex: `.exe`, `.bat`).
- **Resultado Esperado**:
  - Cenário A: Sucesso, feedback em toast verde, documento passa para status "EM_ANALISE", hash SHA-256 gerado e evento registrado em auditoria.
  - Cenário B: Bloqueio no gateway com toast de alerta vermelho ("Payload Limit").
  - Cenário C: Rejeição com mensagem de arquivo não suportado.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-EST-06: Perfil do Estudante
- **Objetivo**: Validar edição de dados cadastrais e alteração de credenciais.
- **Passos**:
  1. Acessar `/perfil`.
  2. Confirmar ausência da frase `"Gerencie sua foto de exibição, dados cadastrais e credenciais de segurança."`.
  3. Alterar telefone ou e-mail de contato e salvar.
  4. Tentar alterar senha com senha atual correta e senha nova válida.
- **Resultado Esperado**:
  - Mensagem de sucesso ao salvar dados e ao alterar senha.
  - Registro de auditoria gerado para as alterações de perfil.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

## 👩‍🏫 4. Módulo Coordenador & RH

### TC-CRD-01: Cabeçalho de Boas-Vindas (`CoordinatorHeader`)
- **Objetivo**: Validar a substituição do banner com a palavra "Dashboard" pelo cabeçalho de boas-vindas padronizado.
- **Passos**:
  1. Acessar `/coordenador` e `/coordenador/dashboard`.
  2. Verificar a exibição do novo cabeçalho:
     - Avatar com gradiente azul/ciano e ícone de capelo (`GraduationCap`).
     - Selo de verificação de coordenação.
     - Saudação `"Olá, [Nome]! 👋"` e badge `"Coordenação & RH"`.
     - Nome completo e tag de Registro (ex: `REGISTRO: USR-002`).
     - Badges de Cargo e Instituição Ativa.
     - Ausência da frase `"Visão executiva em tempo real de conformidade..."`.
  3. No seletor `"Simular Perfil:"`, alternar entre as instituições conveniadas (ex: Mariana / ETEC, Roberto / SENAI, Camila / TechCorp).
  4. Clicar no botão `"Explorar Dossiês"`.
- **Resultado Esperado**:
  - Cabeçalho renderiza perfeitamente em modo claro e escuro.
  - Ao trocar de perfil no select, a instituição ativa e o coordenador corrente mudam em toda a aplicação.
  - Botão redireciona para `/coordenador/dossies`.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-CRD-02: Dashboard Executivo da Coordenação
- **Objetivo**: Validar o resumo de pendências críticas e alertas da coordenação.
- **Passos**:
  1. Verificar o card de alerta de urgência caso existam pendências críticas ou recusadas.
  2. Verificar os contadores de documentos: Críticos, Em Análise e Vencendo em 30 dias.
  3. Clicar no atalho de resolução rápida de pendências.
- **Resultado Esperado**:
  - Contadores refletem a quantidade exata de documentos dos estudantes sob aquela instituição.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-CRD-03: Dossiês de Aprendizes e Estagiários
- **Objetivo**: Testar navegação, busca e visualização master-detail dos dossiês.
- **Passos**:
  1. Acessar `/coordenador/dossies`.
  2. Confirmar que o banner **não** possui a frase `"Gestão de dossiês documentais, validação..."`.
  3. Filtrar por turma, status de conformidade ou digitar nome/CPF de estudante.
  4. Selecionar um estudante da lista à esquerda e visualizar os documentos à direita.
- **Resultado Esperado**:
  - Filtro em tempo real funciona sem travar.
  - Dossiê detalhado do estudante selecionado é exibido com precisão.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-CRD-04: Avaliação de Documento (Aprovação / Recusa Justificada)
- **Objetivo**: Garantir que a validação de documentos respeite as regras de conformidade e auditoria.
- **Passos**:
  1. Em um documento com status "Em Análise", clicar em "Avaliar".
  2. **Cenário A (Aprovação)**: Clicar em "Aprovar Documento".
  3. **Cenário B (Recusa sem justificativa)**: Clicar em "Recusar" deixando o campo de justificativa em branco.
  4. **Cenário C (Recusa fundamentada)**: Preencher justificativa detalhada (ex: "Falta carimbo do médico no atestado") e confirmar recusa.
- **Resultado Esperado**:
  - Cenário A: Documento passa para status "APROVADO", conformidade do aluno sobe, log gravado.
  - Cenário B: Sistema bloqueia o envio e avisa que a justificativa é obrigatória.
  - Cenário C: Status muda para "RECUSADO", justificativa fica gravada no documento e log de auditoria é emitido.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-CRD-05: Monitoramento de Turmas & Análise de Risco
- **Objetivo**: Validar a tabela comparativa analítica de turmas.
- **Passos**:
  1. Acessar `/analytics`.
  2. Confirmar ausência da frase `"Indicadores de conformidade geral, análise de risco..."`.
  3. Na tabela "Monitoramento por Turma", confirmar ausência da frase `"Visão detalhada e índice de conformidade de cada turma"`.
  4. Analisar os indicadores: Total de Alunos, Regularidade Média, Alunos em Risco Crítico.
- **Resultado Esperado**:
  - Dados matematicamente coerentes com os dossiês dos alunos.
  - Nenhum elemento quebrado visualmente na tabela.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-CRD-06: Cadastro & Admissão de Alunos e Turmas
- **Objetivo**: Validar criação de novos aprendizes e turmas pela coordenação.
- **Passos**:
  1. Acessar `/coordenador/cadastro`.
  2. Confirmar ausência da frase `"Cadastramento de novos estudantes aprendizes e abertura de turmas"`.
  3. Preencher formulário de Novo Estudante (Nome, CPF válido, Matrícula, Turma, Empresa).
  4. Submeter formulário.
  5. Alternar para aba "Nova Turma", preencher nome, instituição e ano/semestre e submeter.
- **Resultado Esperado**:
  - Validação de CPF bloqueia números inválidos.
  - Novo estudante aparece imediatamente na lista de aprendizes e na turma selecionada.
  - Nova turma fica disponível para associação.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

## 🛡️ 5. Módulo Super Administrador

### TC-ADM-01: Cabeçalho de Boas-Vindas (`AdminHeader`)
- **Objetivo**: Validar o cabeçalho executivo de governança global.
- **Passos**:
  1. Acessar `/admin`.
  2. Verificar exibição do novo cabeçalho:
     - Avatar com gradiente escuro e ícone de escudo (`Shield`).
     - Badge roxo de `"Super Administrador"`.
     - Identificação de acesso `"ACESSO: ROOT GLOBAL"`.
     - Badges de Cargo e Escopo.
     - Ausência da frase `"Gerenciamento de usuários, permissões globais..."`.
  3. No seletor `"Simular Perfil:"`, alternar o escopo entre "Global (Todas)" e instituições específicas.
  4. Clicar no botão `"Trilha de Auditoria"`.
- **Resultado Esperado**:
  - Filtro afeta os membros e métricas exibidos na página.
  - Botão redireciona corretamente para `/auditoria`.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-ADM-02: Gestão Unificada de Membros (Admin Dashboard)
- **Objetivo**: Testar controle centralizado de usuários de todos os papéis.
- **Passos**:
  1. No painel de administração, navegar entre as abas: "Todos", "Coordenadores", "Estagiários", "Aprendizes".
  2. Usar o campo de busca rápida por nome ou e-mail.
  3. Testar a alteração de perfil de um usuário ou desativação de conta.
- **Resultado Esperado**:
  - Apenas membros do tipo selecionado são filtrados.
  - A busca responde com precisão.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-ADM-03: Gestão de Coordenadores e Empresas
- **Objetivo**: Validar credenciamento de gestores educacionais e empresas conveniadas.
- **Passos**:
  1. Acessar `/admin/coordenadores`.
  2. Confirmar ausência da frase `"Credenciamento centralizado de gestores educacionais..."`.
  3. Testar cadastro de nova empresa conveniada (Razão Social, CNPJ, e-mail RH).
  4. Testar cadastro de novo gestor/coordenador vinculado a uma instituição.
- **Resultado Esperado**:
  - Nova empresa passa a constar nos dropdowns de vínculo de alunos.
  - Novo coordenador passa a ter acesso correspondente.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-ADM-04: Trilha de Auditoria & Registro de Atividades
- **Objetivo**: Validar a rastreabilidade imutável e integridade das operações.
- **Passos**:
  1. Acessar `/auditoria`.
  2. Confirmar ausência da frase `"Rastreabilidade completa de todas as operações..."`.
  3. Verificar registros gerados pelos testes anteriores (Uploads, Aprovações, Edição de Perfil).
  4. Filtrar por tipo de ação (ex: `DOCUMENT_UPLOAD`, `DOCUMENT_APPROVAL`, `LGPD_VIEW`).
  5. Expandir um registro para conferir IP, Timestamp UTC, identificador do recurso e hash SHA-256.
- **Resultado Esperado**:
  - Logs são estritamente append-only (sem opção de exclusão ou edição).
  - Todas as ações executadas possuem correspondência exata.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-ADM-05: Conformidade LGPD & Tarjamento de Dados Sensíveis
- **Objetivo**: Testar o mecanismo de proteção a dados sensíveis (redaction/masking).
- **Passos**:
  1. Na barra superior ou no visualizador de documentos, acionar o botão de Máscara LGPD (Anonimização Ativa).
  2. Abrir visualização de documento com dados como CPF, RG, filiação.
  3. Desativar a máscara temporariamente com operador autorizado.
  4. Consultar a Trilha de Auditoria após desmascarar dados.
- **Resultado Esperado**:
  - Com máscara ativa: Dados sensíveis aparecem como `***.***.***-**` ou tarjados em preto.
  - Ao desmascarar: Ação grava obrigatoriamente evento de auditoria (`DOCUMENT_VIEW_UNMASKED`).
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

## 🎨 6. Testes Globais, Usabilidade & Não Funcionais

### TC-NF-01: Tema Claro e Escuro (Dark Mode)
- **Objetivo**: Validar alternância de temas e persistência.
- **Passos**:
  1. Clicar no ícone de Sol/Lua no topo direito.
  2. Verificar contraste de texto, botões, modais e tabelas nos dois modos.
  3. Atualizar a página (F5) no modo escuro.
- **Resultado Esperado**:
  - Tema permanece o mesmo após atualização (persistido no `localStorage`).
  - Textos permanecem legíveis com taxa de contraste adequada.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

### TC-NF-02: Responsividade e Menu Lateral
- **Objetivo**: Testar layout em resoluções mobile, tablet e desktop.
- **Passos**:
  1. Reduzir a largura da janela para menos de 768px (modo mobile).
  2. Verificar se a barra lateral se recolhe automaticamente em drawer.
  3. Clicar no botão de menu hamburguer para abrir e fechar a gaveta.
  4. Testar rolagem horizontal em tabelas densas (Dossiês, Auditoria, Risco de Turma).
- **Resultado Esperado**:
  - Nenhum elemento ultrapassa a largura da tela sem scroll horizontal controlado.
  - Menu abre e fecha suavemente.
- **Status**: [ ] PASS &nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp; [ ] BLCK
- **Evidência / Observações**:

---

## 📊 7. Quadro Resumo de Execução

Preencha ao finalizar todos os cenários de teste:

| Módulo | Casos de Teste | Aprovados (PASS) | Falhas (FAIL) | Bloqueados (BLCK) | % Sucesso |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Estudante** | 6 | | | | % |
| **Coordenador & RH** | 6 | | | | % |
| **Super Administrador** | 5 | | | | % |
| **Não Funcionais & UX** | 2 | | | | % |
| **TOTAL** | **19** | | | | **%** |

---

## 🐞 8. Registro de Defeitos Encontrados (Bug Tracker)

Se encontrar falhas durante o teste, registre-as na tabela abaixo:

| ID Bug | Caso de Teste | Severidade (Crítica/Alta/Média/Baixa) | Descrição Resumida do Defeito | Passos para Reproduzir | Status (Aberto / Em Análise / Resolvido) |
| :---: | :---: | :---: | :--- | :--- | :---: |
| BUG-01 | | | | | |
| BUG-02 | | | | | |
| BUG-03 | | | | | |

---

## ✍️ 9. Parecer Final e Assinatura

- **Decisão do QA**:
  - [ ] **APROVADO**: O sistema está estável, íntegro e em conformidade para release.
  - [ ] **APROVADO COM RESSALVAS**: Há pequenos ajustes cosméticos ou de baixa severidade que não impedem o uso.
  - [ ] **REPROVADO**: Existem bloqueadores ou falhas em regras de negócio críticas.

- **Parecer Descritivo do Analista**:
  > _Escreva aqui comentários gerais sobre estabilidade, usabilidade ou riscos observados durante a bateria de testes._

- **Assinatura do QA**: __________________________________________________
- **Data de Fechamento**: _____/_____/_________
