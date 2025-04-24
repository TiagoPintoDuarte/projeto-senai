Cypress.Commands.add('gerarEmailTemporario', () => {
    cy.request('GET', 'https://api.guerrillamail.com/ajax.php?f=get_email_address').then((response) => {
        const email = response.body.email_addr;
        Cypress.env('email', email); // Armazena o e-mail no ambiente do Cypress
        cy.log(`E-mail gerado: ${email}`);
    });
});


Cypress.Commands.add('validarTextoVisivel', (texto) => {
    cy.contains(texto)
        .should('be.visible')
});