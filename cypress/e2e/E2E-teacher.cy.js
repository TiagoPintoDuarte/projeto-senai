describe('Fluxo completo como Professor', () => {

    let emailProfessor;
    let estudanteId;
    let agendamentoId;
    const API = 'http://localhost:8000/api/agendamentos';
    const API_EST = 'http://localhost:8000/api/estudantes';
    const API_PROF = 'http://localhost:8000/api/professores';
  
    before(() => {
      // Limpar agendamentos
      cy.request('GET', API).then(res => {
        res.body.forEach(ag => cy.request('DELETE', `${API}/${ag.id}`));
      });
  
      // Limpar estudantes
      cy.request('GET', API_EST).then(res => {
        res.body.forEach(est => cy.request('DELETE', `${API_EST}/${est.id}`));
      });
  
      // Limpar professores
      cy.request('GET', API_PROF).then(res => {
        res.body.forEach(prof => cy.request('DELETE', `${API_PROF}/${prof.id}`));
      });
  
      // Criar um professor para testes via API
      cy.request('POST', API_PROF, {
        cpf: "98765434873",
        nome_completo: "Professor Teste UI",
        data_nascimento: "1980-10-10",
        especialidade: "Matemática",
        status: true
      }).then((response) => {
        expect(response.status).to.eq(201);
        emailProfessor = response.body.nome_completo;
      });
    });
  
    it.only('Cadastrar, Editar e Excluir um Professor', () => {
      cy.visit('http://localhost/professor.html');
      cy.contains('Gestão de Professores').click();
  
      const timestamp = Date.now();
      const emailProfessorTeste = `professor_ui_${timestamp}@email.com`;
  
      // Cadastrar professor
      cy.get('#btnInserirProfessor').click();
      cy.get('#cpf').type(`9876543${timestamp.toString().slice(-4)}`);
      cy.get('#nome').type('Professor UI Teste');
      cy.get('#data-nascimento').type('1980-10-10');
      cy.get('#especialidade').type('Matemática');
      cy.get('#status').check();
      
      cy.get('#btnSalvar').click();
  
      // Espera até o nome aparecer na tabela
      cy.contains('Professor UI Teste', { timeout: 10000 }).should('exist');
  
      // Editar professor
      cy.contains('Professor UI Teste')
        .parents('tr')
        .within(() => {
          cy.get('.btn-edit').click();
        });
  
      cy.get('#especialidade').clear().type('Física');
      cy.get('#btnSalvar').click();
  
      // Verifica se a alteração foi salva
      cy.contains('Professor UI Teste').should('exist');
      cy.contains('Física').should('exist');
  
      // Excluir professor
      cy.contains('Professor UI Teste')
        .parents('tr')
        .within(() => {
          cy.get('.btn-delete').click();
        });
  
      cy.on('window:confirm', () => true);
    });
  
    it('Cadastrar, Editar e Excluir Estudante', () => {
      cy.visit('http://localhost/estudante.html');
      cy.contains('Gestão de Estudantes').click();
  
      const timestamp = Date.now();
      const emailEstudante = `estudante_ui_${timestamp}@email.com`;
  
      // Cadastrar estudante
      cy.get('#btnInserirEstudante').click();
  
      cy.get('#cpf').type(`8888888${timestamp.toString().slice(-4)}`);
      cy.get('#nome').type('Aluno Agendamento UI');
      cy.get('#data-nascimento').type('2002-04-20');
      cy.get('#cep').type('01001-000');
      cy.get('#logradouro').type('Rua A');
      cy.get('#numero').type('99');
      cy.get('#bairro').type('Centro');
      cy.get('#estado').select('SP');
      cy.get('#cidade').select('São Paulo');
      cy.get('#telefone').type('11999999999');
      cy.get('#whatsapp').type('11999999999');
      cy.get('#email').type(emailEstudante);
      cy.get('#btnSalvar').click();
  
      // Verifica se o estudante foi adicionado à tabela
      cy.wait(2000);
      cy.contains('Aluno Agendamento UI', { timeout: 10000 }).should('exist');
  
      // Editar estudante
      cy.contains('Aluno Agendamento UI')
        .parents('tr')
        .within(() => {
          cy.get('.btn-edit').click();
        });
  
      cy.get('#nome').clear().type('Aluno Atualizado');
      cy.get('#btnSalvar').click();
  
      // Verifica se a alteração foi salva
      cy.contains('Aluno Atualizado').should('exist');
  
      // Excluir estudante
      cy.contains('Aluno Atualizado')
        .parents('tr')
        .within(() => {
          cy.get('.btn-delete').click();
        });
  
      cy.on('window:confirm', () => true);
    });
  
    it('Cadastrar, Editar e Excluir Agendamento para Estudante', () => {
      // 1. Cadastrar um estudante
      cy.visit('http://localhost/estudante.html');
      cy.contains('Gestão de Estudantes').click();
  
      const timestamp = Date.now();
      const emailEstudante = `aluno_ag_${timestamp}@email.com`;
  
      cy.get('#btnInserirEstudante').click();
  
      cy.get('#cpf').type(`8888888${timestamp.toString().slice(-4)}`);
      cy.get('#nome').type('Aluno Agendamento UI');
      cy.get('#data-nascimento').type('2002-04-20');
      cy.get('#cep').type('01001-000');
      cy.get('#logradouro').type('Rua A');
      cy.get('#numero').type('99');
      cy.get('#bairro').type('Centro');
      cy.get('#estado').select('SP');
      cy.get('#cidade').select('São Paulo');
      cy.get('#telefone').type('11999999999');
      cy.get('#whatsapp').type('11999999999');
      cy.get('#email').type(emailEstudante);
      cy.get('#btnSalvar').click();
  
      // 2. Acessa o agendamento do estudante
      cy.contains('Aluno Agendamento UI')
        .parents('tr')
        .within(() => {
          cy.get('.btn-schedule').click();
        });
  
      cy.url().should('include', 'agendamentos.html?estudante_id=');
      cy.wait(1000);
  
      // 3. Clica no botão para adicionar agendamento
      cy.get('#btnNovoAgendamento').should('be.visible').click();
  
      const data = new Date();
      data.setDate(data.getDate() + 1); // amanhã
      const dataFormatada = data.toISOString().slice(0, 16); // formato datetime-local
  
      // 4. Preenchendo os campos do modal
      cy.get('#dataHora').type(dataFormatada);
      cy.get('#horaFim').type('15:00');
      cy.get('#professor').select(0, { force: true });
      cy.get('#conteudo').type('Revisão para prova final');
  
      // 5. Salva o agendamento
      cy.get('#btnSalvar').click();
  
      // 6. Verifica se o agendamento foi inserido
      cy.get('table')
        .should('contain', 'Revisão para prova final', { timeout: 10000 })
        .and('be.visible');
  
      // 7. Editar o agendamento
      cy.get('table')
        .contains('Revisão para prova final')
        .parents('tr')
        .within(() => {
          cy.get('.btn-edit').click();
        });
  
      cy.get('#conteudo').clear().type('Revisão para a prova final');
      cy.get('#btnSalvar').click();
  
      // Verifica se a alteração foi salva
      cy.contains('Revisão para a prova final').should('exist');
  
      // 8. Excluir o agendamento
      cy.get('table')
        .contains('Revisão para a prova final')
        .parents('tr')
        .within(() => {
          cy.get('.btn-schedule').click();  // Vai para a página de agendamento
        });
  
      cy.url().should('include', 'agendamentos.html');
      cy.wait(1000);
  
      // Agora exclui o agendamento
      cy.contains('Revisão para a prova final')
        .parents('tr')
        .within(() => {
          cy.get('.btn-delete').click();
        });
  
      cy.on('window:confirm', () => true);
      
      // Verifica se o agendamento foi excluído
      cy.contains('Revisão para a prova final').should('not.exist');
    });
  
  });
  