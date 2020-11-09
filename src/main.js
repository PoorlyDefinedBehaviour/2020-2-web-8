import {
  required,
  minLength,
  validate,
  yearInThePast,
  value,
} from "./form/validators.js"
import * as either from "./data/either.js"
import * as workRepository from "./repositories/work_repository.js"
import { zip } from "./utils/zip.js"

const validations = {
  name: minLength(6, "Nome da obra deve ter no mínimo 6 caracteres"),
  author: minLength(10, "Nome do autor deve ter no mínimo 10 caracteres"),
  releaseYear: yearInThePast("O ano da obra deve ser informado"),
  period: required("O período da obra deve ser informado"),
  type: required("O tipo da obra deve ser informado"),
  details: value(),
}

const cleanErrors = () =>
  Object.keys(validations).forEach(field => {
    document.querySelector(`#${field}`).classList.remove("text-input-error")
    document.querySelector(`#${field}ErrorMessage`).innerText = ""
  })

const displayErrors = errors => {
  const errorMap = Object.fromEntries(
    errors.map(error => [error.field, error.message])
  )

  Object.keys(validations)
    .map(field => [field, errorMap[field]])
    .filter(([_field, errorMessage]) => errorMessage)
    .forEach(([field, errorMessage]) => {
      document.querySelector(`#${field}`).classList.add("text-input-error")
      document.querySelector(`#${field}ErrorMessage`).innerText = errorMessage
    })
}

const onSubmit = event => {
  event.preventDefault()

  cleanErrors()

  validate(validations).then(either.fold(displayErrors, workRepository.save))
}

const displayWorksTable = works => {
  const uls = works.map(work => {
    const ul = document.createElement("ul")

    ul.classList.add("work")

    ul.innerHTML = `
      <li>
        <h6>Obra</h6>
        <p>${work.name}</p>
      </li>
      <li>
        <h6>Autor</h6>
        <p>${work.author}</p>
      </li>
      <li>
        <h6>Ano</h6>
        <p>${work.releaseYear}</p>
      </li>
      <li>
        <h6>Período</h6>
        <p>${work.period}</p>
        </li>
      <li>
        <h6>Tipo</h6>
        <p>${work.type}</p>
      </li>
    `

    ul.addEventListener(
      "click",
      () => {
        const details = document.createElement("p")

        details.classList.add("work-details")

        details.innerText = work.details

        ul.insertAdjacentElement("afterEnd", details)
      },
      {
        once: true,
      }
    )

    const deleteButton = document.createElement("p")

    deleteButton.setAttribute("data-test-id", "delete-button")

    deleteButton.classList.add("work-delete-button")

    deleteButton.innerText = "X"

    ul.insertAdjacentElement("beforeEnd", deleteButton)

    deleteButton.addEventListener("click", () => {
      // eslint-disable-next-line no-alert
      if (confirm("Deletar?")) {
        workRepository.remove(work)
      }
    })

    return ul
  })

  const worksElement = document.querySelector("#works")

  worksElement.innerHTML = ""

  uls.forEach(element =>
    worksElement.insertAdjacentElement("beforeend", element)
  )

  const workElements = Array.from(document.getElementsByName("work"))
  zip(works, workElements).forEach(([work, element]) =>
    element.addEventListener(
      "click",
      () => {
        const details = document.createElement("p")

        details.classList.add("work-details")

        details.innerText = work.details

        element.insertAdjacentElement("afterEnd", details)
      },
      {
        once: true,
      }
    )
  )
}

workRepository
  .getWorks()
  .subscribe(works => displayWorksTable(works.slice().reverse()))

document
  .querySelector("#register-museum-work-form")
  .addEventListener("submit", onSubmit)
