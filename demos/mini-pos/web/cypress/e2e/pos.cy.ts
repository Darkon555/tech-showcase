// Covers spec AC-1 (add to cart), AC-2 (qty & totals update) and AC-3 (checkout).
describe("Mini POS checkout flow", () => {
  it("adds a product, updates totals and checks out", () => {
    cy.visit("/");

    // AC-1: add the first product to the cart
    cy.get('[data-cy^="add-"]').first().click();
    cy.get('[data-cy="qty"]').should("contain", "1");

    // AC-2: increasing quantity updates the total
    cy.get('[data-cy="total"]').invoke("text").as("totalBefore");
    cy.contains("button", "+").click();
    cy.get('[data-cy="qty"]').should("contain", "2");
    cy.get("@totalBefore").then((before) => {
      cy.get('[data-cy="total"]').invoke("text").should("not.eq", before);
    });

    // AC-3: checkout produces a receipt
    cy.contains("button", "Checkout").click();
    cy.contains("Receipt").should("be.visible");
  });
});
