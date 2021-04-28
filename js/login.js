const User = require("./userData");
const mongoose = require("mongoose");
const dbURL = "mongodb+srv://PRJ666Admin:PRJ666-Password@prj666-cluster.n7led.mongodb.net/PRJ666DB?retryWrites=true&w=majority";

mongoose.connect(dbURL).then((result) => console.log("Connected to DB")).catch((err) => console.log(`Error: ${err} found`));


function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    loginForm.addEventListener("submit", e => {
        e.preventDefault();

        // Perform AJAX/Fetch login

        setFormMessage(loginForm, "error", "Invalid username/password combination");
    });

});