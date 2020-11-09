/// <reference types="cypress" />

import faker from "faker"

context("Register museum work form", () => {
  beforeEach(() => cy.visit("/"))

  context(
    "when work name is not at least 6 characters long, should show an error message",
    () => {
      it("when work name is empty", () => {
        cy.get("[data-test-id=submit]").click()

        cy.get("[data-test-id=name]")
          .should("have.class", "text-input-error")
          .get("span")
          .should("be.visible")
          .and("contain", "Nome da obra deve ter no mínimo 6 caracteres")
      })

      it("when work name is less than 6 characters long", () => {
        cy.get("[data-test-id=name]").type(
          faker.random.alphaNumeric(faker.random.number({ min: 1, max: 5 }))
        )

        cy.get("[data-test-id=submit]").click()

        cy.get("[data-test-id=name]")
          .should("have.class", "text-input-error")
          .get("span")
          .should("be.visible")
          .and("contain", "Nome da obra deve ter no mínimo 6 caracteres")
      })
    }
  )

  context(
    "when author name is not at least 10 characters long, should show an error message",
    () => {
      it("when author name is empty", () => {
        cy.get("[data-test-id=submit]").click()

        cy.get("[data-test-id=name]")
          .should("have.class", "text-input-error")
          .get("span")
          .should("be.visible")
          .and("contain", "Nome da obra deve ter no mínimo 6 caracteres")
      })

      it("when author name is less than 10 characters long", () => {
        cy.get("[data-test-id=author]").type(
          faker.random.alphaNumeric(faker.random.number({ min: 1, max: 9 }))
        )

        cy.get("[data-test-id=submit]").click()

        cy.get("[data-test-id=author]")
          .should("have.class", "text-input-error")
          .get("span")
          .should("be.visible")
          .and("contain", "Nome do autor deve ter no mínimo 10 caracteres")
      })
    }
  )

  context(
    "when work release year is not a valid year, should show an error message",
    () => {
      it("when release year is empty", () => {
        cy.get("[data-test-id=submit]").click()

        cy.get("[data-test-id=releaseYear]")
          .should("have.class", "text-input-error")
          .get("span")
          .should("be.visible")
          .and("contain", "O ano da obra deve ser informado")
      })

      it("when release year is not an integer", () => {
        cy.get("[data-test-id=releaseYear]").type("abc")

        cy.get("[data-test-id=submit]").click()

        cy.get("[data-test-id=releaseYear]")
          .should("have.class", "text-input-error")
          .get("span")
          .should("be.visible")
          .and("contain", "O ano da obra deve ser informado")
      })

      it("when release year is not a four digit integer", () => {
        cy.get("[data-test-id=releaseYear]").type(
          faker.random.number({ min: 0, max: 999 })
        )

        cy.get("[data-test-id=submit]").click()

        cy.get("[data-test-id=releaseYear]")
          .should("have.class", "text-input-error")
          .get("span")
          .should("be.visible")
          .and("contain", "O ano da obra deve ser informado")
      })
    }
  )

  it("when work period is not selected, should show an error message", () => {
    cy.get("[data-test-id=submit]").click()

    cy.get("[data-test-id=period]")
      .should("have.class", "text-input-error")
      .get("span")
      .should("be.visible")
      .and("contain", "O período da obra deve ser informado")
  })

  it("when work type is not selected, should show an error message", () => {
    cy.get("[data-test-id=submit]").click()

    cy.get("[data-test-id=type]")
      .should("have.class", "text-input-error")
      .get("span")
      .should("be.visible")
      .and("contain", "O tipo da obra deve ser informado")
  })

  context("after form is filled correctly", () => {
    const fillFormAndSubmit = () => {
      const name = faker.random.alphaNumeric(6)
      const author = faker.random.alphaNumeric(10)
      const releaseYear = faker.date.past().getFullYear()
      const period = faker.random.arrayElement(["dc", "ac"])
      const type = faker.random.arrayElement(["painting", "sculpture", "other"])
      const details = faker.random.alphaNumeric(
        faker.random.number({ min: 1, max: 100 })
      )

      cy.get("[data-test-id=name]").type(name)
      cy.get("[data-test-id=author]").type(author)
      cy.get("[data-test-id=releaseYear]").type(releaseYear)
      cy.get("[data-test-id=period]").select(period)
      cy.get("[data-test-id=type]").select(type)
      cy.get("[data-test-id=details]").type(details)

      cy.get("[data-test-id=submit]").click()

      return { name, author, releaseYear, period, type, details }
    }

    it("when all validation passes, should show the new work in a table", () => {
      fillFormAndSubmit()

      cy.get("[data-test-id=works]")
        .get("ul")
        .should("be.visible")
        .should("exist")
        .get("li")
    })

    it("when a row is clicked, should show work details", () => {
      fillFormAndSubmit()
      fillFormAndSubmit()

      cy.get(".work").should("have.length", 2)
      cy.get(".work-details").should("have.length", 0)

      cy.get(".work:first").click()

      cy.get(".work-details").should("have.length", 1)
    })

    context.only("when deleting a row", () => {
      it.only("when user cancels deletion, nothing should happen", () => {
        fillFormAndSubmit()

        cy.get(".work").should("have.length", 1)

        cy.on("window:confirm", _text => false)

        cy.get("[data-test-id=delete-button]").click()

        cy.get(".work").should("have.length", 1)
      })

      it.only("when user confirms deletion, should delete work", () => {
        fillFormAndSubmit()

        cy.get(".work").should("have.length", 1)

        cy.on("window:confirm", _text => true)

        cy.get("[data-test-id=delete-button]").click()

        cy.get(".work").should("not.exist")
      })
    })
  })
})
