/*
 * 
 * @author: Dennis Chen
 */

import InnerHTML from "./InnerHTML"

/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress



//short wait for async ui operation
const shortWait = 100


// Cypress Component Test
describe('InnerHTML Test', () => {

    it('should render correctly', () => {
        cy.mount(<InnerHTML html="<p id='innerhtml1'>Value1</p><p id='innerhtml2'>Value2</p>" />)

        cy.get('#innerhtml1').contains('Value1')
        cy.get('#innerhtml2').contains('Value2')
    },)
})

// Prevent TypeScript from reading file as legacy script
export { }

