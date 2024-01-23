/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress


//short wait for async ui operation
const shortWait = 100

function clear(cy: Cypress.cy & CyEventEmitter) {
    cy.type('{selectall}')
    cy.wait(10)
    cy.type('{backspace}')
    cy.wait(10)
    return cy
}

// Cypress E2E Test
describe('Home', () => {
    it('should redirect home page', () => {
        // Start from the index page
        cy.visit('http://localhost:3000/')

        cy.url().should('match', /\/home$/)

        

    })
})

// Prevent TypeScript from reading file as legacy script
export { }

