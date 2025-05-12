describe('Fluxo completo como Administrador', () => {
  let emailEstudante, emailProfessor;
  const API = 'http://localhost:8000/api/agendamentos';
  const API_EST = 'http://localhost:8000/api/estudantes';
  const API_PROF = 'http://localhost:8000/api/professores';

  before(() => {
    // Limpa agendamentos
    cy.request('GET', API).then(res => {
      res.body.forEach(ag => cy.request('DELETE', `${API}/${ag.id}`));
    });

    // Limpa estudantes
    cy.request('GET', API_EST).then(res => {
      res.body.forEach(est => cy.request('DELETE', `${API_EST}/${est.id}`));
    });

    // Limpa professores
    cy.request('GET', API_PROF).then(res => {
      res.body.forEach(prof => cy.request('DELETE', `${API_PROF}/${prof.id}`));
    });

    // Cadastrar um professor antes de continuar os testes
    cy.request('POST', API_PROF, {
      cpf: "9876543" + Date.now().toString().slice(-4),
      nome_completo: "Professor Teste UI",
      data_nascimento: "1980-10-10",
      especialidade: "Matemática",
      status: true
    }).then(response => {
      emailProfessor = response.body.email;  // Guardar o email do professor
    });
  });

  it('Administrador cadastra e exclui um estudante', () => {
    cy.visit('http://localhost');
    cy.contains('Gestão de estudantes').click();

    const timestamp = Date.now();
    emailEstudante = `estudante_ui_${timestamp}@email.com`;

    cy.get('#btnInserirEstudante').click();

    cy.get('#cpf').type(`1234567${timestamp.toString().slice(-4)}`);
    cy.get('#nome').type('Estudante UI Teste');
    cy.get('#data-nascimento').type('2000-01-01');
    cy.get('#cep').type('01001-000');
    cy.get('#logradouro').type('Rua Teste');
    cy.get('#numero').type('123');
    cy.get('#bairro').type('Centro');
    cy.get('#estado').select('SP');
    cy.get('#cidade').select('São Paulo');
    cy.get('#telefone').type('11999999999');
    cy.get('#whatsapp').type('11999999999');
    cy.get('#email').type(emailEstudante);
    cy.get('#btnSalvar').click();

    // Espera até o nome aparecer na tabela
    cy.contains('Estudante UI Teste', { timeout: 10000 }).should('exist');

    // Edita o estudante
    cy.contains('Estudante UI Teste')
      .parents('tr')
      .within(() => {
        cy.get('.btn-edit').click();
      });

    cy.get('#nome').clear().type('Estudante UI Teste Editado');
    cy.get('#btnSalvar').click();

    // Verifica se a edição foi salva
    cy.contains('Estudante UI Teste Editado').should('exist');

    // Excluir o estudante
    cy.contains('Estudante UI Teste Editado')
      .parents('tr')
      .within(() => {
        cy.get('.btn-delete').click();
      });

    cy.on('window:confirm', () => true);
  });

  it('Administrador cadastra e exclui um professor', () => {
    cy.visit('http://localhost');
    cy.contains('Gestão de Professores').click();

    const timestamp = Date.now();
    emailProfessor = `prof_ui_${timestamp}@email.com`;

    cy.get('#btnInserirProfessor').click();

    cy.get('#cpf').type(`9876543${timestamp.toString().slice(-4)}`);
    cy.get('#nome').type('Professor UI Teste');
    cy.get('#data-nascimento').type('1980-10-10');
    cy.get('#especialidade').type('Matemática');
    cy.get('#status').check();  // Marca o status do professor
    cy.get('#btnSalvar').click();

    // Espera até o nome aparecer na tabela
    cy.contains('Professor UI Teste', { timeout: 10000 }).should('exist');

    // Edita o professor
    cy.contains('Professor UI Teste')
      .parents('tr')
      .within(() => {
        cy.get('.btn-edit').click();
      });

    cy.get('#especialidade').clear().type('Física');
    cy.get('#btnSalvar').click();

    // Verifica se a edição foi salva
    cy.contains('Professor UI Teste').should('exist');

    // Excluir o professor
    cy.contains('Professor UI Teste')
      .parents('tr')
      .within(() => {
        cy.get('.btn-delete').click();
      });

    cy.on('window:confirm', () => true);
  });

  it('Administrador agenda, edita e exclui uma aula para estudante', () => {
    // Cadastra estudante
    cy.visit('http://localhost');
    cy.contains('Gestão de estudantes').click();

    const timestamp = Date.now();
    emailEstudante = `aluno_ag_${timestamp}@email.com`;

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

    // Verifica se o estudante foi adicionado
    cy.wait(2000);
    cy.contains('Aluno Agendamento UI', { timeout: 10000 }).should('exist');

    // Acessa o agendamento via botão
    cy.contains('Aluno Agendamento UI')
      .parents('tr')
      .within(() => {
        cy.get('.btn-schedule').click();
      });

    cy.url().should('include', 'agendamentos.html?estudante_id=');
    cy.wait(1000);

    // Espera o botão de inserir agendamento
    cy.get('#btnNovoAgendamento').should('be.visible').click();

    const data = new Date();
    data.setDate(data.getDate() + 1); // amanhã
    const dataFormatada = data.toISOString().slice(0, 16); // formato datetime-local

    // Preenchendo os campos do modal
    cy.get('#dataHora').type(dataFormatada);
    cy.get('#horaFim').type('15:00');
    cy.get('#professor').select(0, { force: true });  // Força a seleção do primeiro professor
    cy.get('#conteudo').type('Revisão para prova final');

    // Salvar o agendamento
    cy.get('#btnSalvar').click();

    // Verificar se o agendamento foi inserido
    cy.get('table')
      .should('contain', 'Revisão para prova final', { timeout: 10000 })
      .and('be.visible');

    // Editar o agendamento
    cy.contains('Revisão para prova final')
      .parents('tr')
      .within(() => {
        cy.get('.btn-edit').click();  // Abre o modal de edição
      });

    cy.get('#conteudo').clear().type('Revisão para prova final Editada');
    cy.get('#btnSalvar').click();

    // Verifica se a alteração foi salva
    cy.contains('Revisão para prova final Editada').should('exist');

    // Excluir o agendamento
    cy.contains('Revisão para prova final Editada')
      .parents('tr')
      .within(() => {
        cy.get('.btn-delete').click(); // Exclui o agendamento
      });

    cy.on('window:confirm', () => true);

    // Verifica se o agendamento foi excluído
    cy.contains('Revisão para prova final Editada').should('not.exist');
  });

});
