describe('Login Flow', () => {
    beforeEach(() => {
        // Visit login before each test
        cy.visit('/login');
    });

    it('should display the login form with proper elements', () => {
        // Check elements
        cy.get('#email').should('be.visible');
        cy.get('#password').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    it('should successfully log in and redirect to home page', () => {
        // Mock successful response
        cy.intercept('POST', 'http://localhost:8080/auth/login', {
            statusCode: 200,
            body: { 'jwt-token': 'test-token' }
        }).as('loginRequest');

        // Intercept the user info API call
        cy.intercept('GET', 'http://localhost:8080/auth/me', {
            statusCode: 200,
            body: {
                id: '1',
                email: 'user@example.com',
                name: 'Test User',
                role: {
                    name: 'USER'
                }
            }
        }).as('userInfoRequest');

        // Fill in credentials and submit
        cy.get('#email').type('user@example.com');
        cy.get('#password').type('Password123!');
        cy.get('button[type="submit"]').click();

        // Wait for API requests
        cy.wait('@loginRequest');
        cy.wait('@userInfoRequest');

        // Check navigation to /home
        cy.url().should('include', '/home');

        cy.get('.account-menu-container').should('be.visible');
    });
});
