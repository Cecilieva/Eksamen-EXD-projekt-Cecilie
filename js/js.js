"use strict"

//arrays med teksten til de forskellige sprog
const danish = ["Velkommen til akvariet!", "Byg dit akvarie"];
const english = ["Welcome to the aquarium!", "Build your aquarium"];
const german = ["Willkommen im Aquarium!", "Baue dein Aquarium"];

//Dette er DOM elementer og her henter jeg html elementerne jeg vil ændre sprog på
const title = document.querySelector("h1");
const buttonText = document.querySelector(".button-text");

//også DOM elementer og her henter jeg knapperne som skal skifte sproget
const danishButton = document.querySelector(".danish");
const englishButton = document.querySelector(".english");
const germanButton = document.querySelector(".german");

// her laver jeg en funkton til at ændre sproget på siden, først skifter den titlen og så knappens tekst
function changeLanguage(languageArray) {
    title.textContent = languageArray[0];
    buttonText.textContent = languageArray[1];
}

//og her tilføjer jeg eventlisteners som får dem til at virke, ved klik
danishButton.addEventListener("click", () => changeLanguage(danish));
englishButton.addEventListener("click", () => changeLanguage(english));
germanButton.addEventListener("click", () => changeLanguage(german));