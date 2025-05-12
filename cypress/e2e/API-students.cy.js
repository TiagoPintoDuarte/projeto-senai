describe('API - Estudantes', () => {
    const API = 'http://localhost:8000/api/estudantes';
  
    const estudante = {
      nome_completo: 'Teste Estudante Cypress',
      cpf: `000${Date.now().toString().slice(-6)}`,
      data_nascimento: '2000-01-01',
      cep: '01001-000',
      logradouro: 'Rua Teste',
      numero: '123',
      bairro: 'Centro',
      estado: 'SP',
      cidade: 'São Paulo',
      telefone: '11999990000',
      whatsapp: '11999990000',
      email: `estudante_${Date.now()}@qa.com`
    };
  
    let id;
  
    before(() => {
      cy.request('GET', API).then(res => {
        const estudantes = res.body;
        estudantes.forEach(est => {
          cy.request('DELETE', `${API}/${est.id}`);
        });
      });
    });
  
    it('Deve cadastrar um estudante com sucesso', () => {
      cy.request('POST', API, estudante).then((res) => {
        expect(res.status).to.eq(201);
        id = res.body.id;
      });
    });
  
    it('Deve buscar o estudante pelo ID', () => {
      cy.request('GET', `${API}/${id}`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.nome_completo).to.eq(estudante.nome_completo);
      });
    });
  
    it('Deve atualizar o estudante', () => {
      cy.request('PUT', `${API}/${id}`, {
        ...estudante,
        bairro: 'Atualizado'
      }).then((res) => {
        expect(res.status).to.eq(200);
      });
    });
  
    it('Deve excluir o estudante', () => {
      cy.request('DELETE', `${API}/${id}`).then((res) => {
        expect([200, 204]).to.include(res.status);
      });
    });
  });
  