describe('API - Agendamentos', () => {
    const API = 'http://localhost:8000/api/agendamentos';
    const API_EST = 'http://localhost:8000/api/estudantes';
    const API_PROF = 'http://localhost:8000/api/professores';
  
    let estudanteId, professorId, agendamentoId;
  
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
  
      // Cadastra estudante e professor
      cy.request('POST', API_EST, {
        nome_completo: 'Aluno Agendamento',
        cpf: `333${Date.now().toString().slice(-6)}`,
        data_nascimento: '2003-03-03',
        cep: '01001-000',
        logradouro: 'Rua A',
        numero: '10',
        bairro: 'Bairro A',
        estado: 'SP',
        cidade: 'São Paulo',
        telefone: '11999990001',
        whatsapp: '11999990001',
        email: `aluno_ag_${Date.now()}@qa.com`
      }).then(res => estudanteId = res.body.id);
  
      cy.request('POST', API_PROF, {
        nome_completo: 'Prof Agendamento',
        cpf: `444${Date.now().toString().slice(-6)}`,
        data_nascimento: '1970-07-07',
        especialidade: 'Física',
        status: 1
      }).then(res => professorId = res.body.id);
    });
  
    it('Deve criar um agendamento', () => {
      const dataHora = new Date();
      dataHora.setDate(dataHora.getDate() + 1);
  
      cy.request('POST', API, {
        estudante_id: estudanteId,
        professor_id: professorId,
        data_hora: dataHora.toISOString().slice(0, 16),
        hora_fim: '15:00',
        conteudo: 'Revisão para prova'
      }).then(res => {
        expect(res.status).to.eq(201);
        agendamentoId = res.body.id;
      });
    });
  
    it('Deve buscar agendamentos do estudante', () => {
      cy.request('GET', `${API_EST}/${estudanteId}/agendamentos`).then(res => {
        expect(res.status).to.eq(200);
        expect(res.body.agendamentos.length).to.be.greaterThan(0);
      });
    });
  
    it('Deve atualizar o agendamento', () => {
      cy.request('PUT', `${API}/${agendamentoId}`, {
        estudante_id: estudanteId,
        professor_id: professorId,
        data_hora: new Date().toISOString().slice(0, 16),
        hora_fim: '16:00',
        conteudo: 'Conteúdo alterado',
        status: 'finalizada'
      }).then(res => {
        expect(res.status).to.eq(200);
      });
    });
  
    it('Deve excluir o agendamento', () => {
      cy.request('DELETE', `${API}/${agendamentoId}`).then(res => {
        expect([200, 204]).to.include(res.status);
      });
    });
  });
  