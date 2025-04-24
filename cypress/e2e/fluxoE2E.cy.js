describe('Fluxo E2E', () => {
    beforeEach(function () {
        cy.clearLocalStorage()
        cy.fixture("user").as('dadosUsuario');
        cy.fixture("mensagens").as('mensagens');
        cy.fixture('departamentos').as('departamento')
        cy.fixture('pagamento').as('dadospagamento')
    });

    context('Login', () => {

        it('Login invalido', function () {
            cy.login(this.dadosUsuario.senhaInvalida)
            cy.validarTextoVisivel(this.mensagens.senhaInvalida)
        });

        it('Login com sucesso', function () {
            cy.login(this.dadosUsuario.senha)
            cy.validarTextoVisivel(this.mensagens.loginSucesso)
        });

    });
    context('Carrinho de compra', () => {
        beforeEach(() => {
            cy.sessionLogin()
            cy.visit('/')
        });
        it('Adicionar produto ao carrinho', function () {
            cy.adicionarProdutoCarrinho('Ingrid Running Jacket', 'XS', 'White');
        });

        it('Remover produto do carrinho', function () {
            cy.selecionarDepartamento(this.departamento.carrinho);
            cy.removerCarrinho();
        });
        it('Adicionar multiplos Produtos ao carrinho', function () {
            cy.selecionarDepartamento(this.departamento.produtos);
            cy.adicionarProdutoCarrinho('Abominable Hoodie', 'XS', 'Green');
            cy.selecionarDepartamento(this.departamento.produtos);
            cy.adicionarProdutoCarrinho('Aero Daily Fitness Tee', 'XS', 'Black');
            cy.selecionarDepartamento(this.departamento.produtos);
            cy.adicionarProdutoCarrinho('Aether Gym Pant', '32', 'Blue');
        });
    });

    context('Finalização do carrinho de compras', function () {
        beforeEach(() => {
            cy.sessionLogin()
            cy.visit('/carrinho/')
        });

        it('Finalizando carrinho de compras com boleto', function () {
            cy.selecionarDepartamento(this.departamento.checkout);
            cy.cadastroCompra();
            cy.finalizarCompra();
            cy.validarMetodoPagamento();

        });

        it('Finalizando carrinho de compras com cheque', function () {
            cy.visit('/')
            cy.adicionarProdutoCarrinho('Ingrid Running Jacket', 'XS', 'White');
            cy.selecionarDepartamento(this.departamento.checkout);
            cy.esolherMetodoPagamentoCheque()
            cy.cadastroCompra();
            cy.finalizarCompra();
            cy.validarMetodoPagamento();
        });
        it('Finalizando carrinho de compras com pagamento na entrega', function () {
            cy.visit('/')
            cy.adicionarProdutoCarrinho('Ingrid Running Jacket', 'XS', 'White');
            cy.selecionarDepartamento(this.departamento.checkout);
            cy.esolherMetodoPagamentonaEntrega()
            cy.cadastroCompra();
            cy.finalizarCompra();
            cy.validarMetodoPagamento();
        });
    })
});
