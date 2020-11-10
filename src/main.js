import {
  required,
  minLength,
  validate,
  lessThan,
  valueField,
  compose,
  integer,
} from "./form/validators.js"
import * as either from "./data/either.js"
import * as workRepository from "./repositories/work_repository.js"

const validations = {
  name: compose(
    minLength(6, "Nome da obra deve ter no mínimo 6 caracteres"),
    required("O nome da obra deve ser informado")
  ),
  author: compose(
    minLength(10, "Nome do autor deve ter no mínimo 10 caracteres"),
    required("O nome do autor deve ser informado")
  ),
  releaseYear: compose(
    minLength(4, "O ano da obra deve estar no formato AAAA"),
    lessThan(new Date().getFullYear(), "O ano da obra não pode ser no futuro"),
    integer("O ano da obra deve ser um número inteiro"),
    required("O ano da obra deve ser informado")
  ),
  period: required("O período da obra deve ser informado"),
  type: required("O tipo da obra deve ser informado"),
  details: valueField(),
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

const createDeleteWorkButton = () => {
  const button = document.createElement("p")

  button.setAttribute("data-test-id", "delete-button")

  button.classList.add("work-delete-button")

  button.innerText = "X"

  return button
}

const showWorkDetails = (ul, work) => () => {
  const details = document.createElement("p")

  details.classList.add("work-details")

  details.innerText = work.details

  ul.insertAdjacentElement("afterEnd", details)
}

const createWorkUl = work => {
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

  return ul
}

const displayWorksTable = works => {
  const worksElement = document.querySelector("#works")

  worksElement.innerHTML = ""

  works.forEach(work => {
    const ul = createWorkUl(work)

    ul.addEventListener("click", showWorkDetails(ul, work), {
      once: true,
    })

    const deleteWorkButton = createDeleteWorkButton()
    ul.insertAdjacentElement("beforeEnd", deleteWorkButton)

    deleteWorkButton.addEventListener("click", () => {
      // eslint-disable-next-line no-alert
      if (confirm("Deletar?")) {
        workRepository.remove(work)
      }
    })

    worksElement.insertAdjacentElement("beforeend", ul)
  })
}

workRepository
  .getWorks()
  .subscribe(works => displayWorksTable(works.slice().reverse()))

document
  .querySelector("#register-museum-work-form")
  .addEventListener("submit", onSubmit)
