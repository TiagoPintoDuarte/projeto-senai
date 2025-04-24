Cypress.Commands.add('adicionarProdutoCarrinho', (nomeProduto, tamanho, cor) => {
    cy.intercept('POST', 'http://lojaebac.ebaconline.art.br/wp-admin/admin-ajax.php').as('request');
    cy.scrollTo(0, 500); // rola 200px pra baixo
    cy.contains(nomeProduto).should('be.visible').click();

    if (tamanho) cy.get(`[title="${tamanho}"]`).click();
    if (cor) cy.get(`[title="${cor}"]`).click();

    cy.get('.woocommerce-variation-description')
        .invoke('text')
        .then((descriptionText) => {
            cy.log(descriptionText);
        });

    cy.xpath("//button[contains(text(), 'Comprar')]").click();

    cy.wait('@request').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        cy.log(`✅ ${nomeProduto} adicionado ao carrinho com sucesso!`);
        cy.contains(`“${nomeProduto}” foi adicionado no seu carrinho.`).should('be.visible');
    });

    cy.xpath("//a[contains(text(), 'Ver carrinho')]").click();
    cy.contains('Total no carrinho').should('be.visible');
});

Cypress.Commands.add('removerCarrinho', () => {
    // Acessa o corpo da página para verificar a existência de produtos no carrinho
    cy.get('body').then(($body) => {
        // Verifica quantos elementos com a classe 'product-remove' existem
        const quantidadeItens = $body.find('.product-remove').length;

        // Se não houver nenhum item no carrinho, exibe uma mensagem no log do Cypress e finaliza
        if (quantidadeItens === 0) {
            cy.log('Nenhum produto encontrado no carrinho!')
            return;
        }

        // Cria um array virtual com base na quantidade de itens para realizar a remoção um por um
        cy.wrap([...Array(quantidadeItens)]).each(() => {
            // Clica no último botão de remoção de produto disponível
            cy.get('.product-remove').last().click({ force: true })
            cy.wait(300);
        });
    });
});



Cypress.Commands.add('selecionarDepartamento', (departamento) => {
    cy.visit(departamento);
});


Cypress.Commands.add('cadastroCompra', () => {
    cy.intercept('POST', '/?wc-ajax=checkout').as('request')
    cy.get('#billing_first_name').clear().type('João');
    cy.get('#billing_last_name').clear().type('Silva');
    cy.get('#billing_address_1').clear().type('Rua das Flores, 123');
    cy.get('#billing_city').clear().type('São Paulo');
    cy.get('#billing_postcode').clear().type('01001-000');
    cy.get('#billing_phone').clear().type('11999999999');
    cy.get('#billing_email').clear().type('pewalim570@cxnlab.com');
    cy.get('#terms').click()
    cy.get('#place_order').click()
    cy.wait('@request').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
    });
});

Cypress.Commands.add('finalizarCompra', () => {
    cy.contains('Pedido recebido').should('be.visible')
});
Cypress.Commands.add('esolherMetodoPagamentonaEntrega', () => {
    cy.get('#payment_method_cod').click()
});

Cypress.Commands.add('esolherMetodoPagamentoCheque', () => {
    cy.get('#payment_method_cheque').click()

})
Cypress.Commands.add('validarMetodoPagamento', () => {
    cy.get('[class="woocommerce-order-overview__payment-method method"]')
    .invoke('text')
    .then((descriptionText) => {
        cy.log(descriptionText);
    });
})
