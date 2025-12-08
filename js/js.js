"use strict"

//arrays med teksten til de forskellige sprog
const danish = ["Velkommen til akvariet!", "Byg dit akvarie"];
const english = ["Welcome to the aquarium!", "Build your aquarium"];
const german = ["Willkommen im Aquarium!", "Baue dein Aquarium"];

//her henter jeg de elementer jeg skal ændre teksten på fra DOM
const title = document.querySelector("h1");
const buttonText = document.querySelector(".button-text");

//her henter jeg knapperne fra DOM
const danishButton = document.querySelector(".danish");
const englishButton = document.querySelector(".english");
const germanButton = document.querySelector(".german");

//funktion som ændrer sproget ved at ændre teksten i de valgte elementer
function changeLanguage(languageArray) {
    title.textContent = languageArray[0];
    buttonText.textContent = languageArray[1];
}

  // Sprogknapper: tilføj eventlisteners her (sikrer DOM er klar)
    if (typeof danishButton !== 'undefined' && danishButton) {
        danishButton.addEventListener('click', () => changeLanguage(danish));
    }
    if (typeof englishButton !== 'undefined' && englishButton) {
        englishButton.addEventListener('click', () => changeLanguage(english));
    }
    if (typeof germanButton !== 'undefined' && germanButton) {
        germanButton.addEventListener('click', () => changeLanguage(german));
    }

//her laver jeg eventlisteners til knapperne så når der bliver klikket på dem, så kalder den funktionen changeLanguage med det rigtige sprog array
document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("jeppeVoice");
    const overlay = document.getElementById("audioOverlay");
    const overlayBtn = document.getElementById("overlayBtn");

    function tryPlay() {
        audio.currentTime = 0;
        return audio.play();
    }

    // Forsøg at afspille efter 3 sek
    setTimeout(() => {
        tryPlay().catch(err => {
            console.warn("Autoplay blokeret:", err);
            overlay.classList.remove("hidden"); // Vis overlay
        });
    }, 3000);

    // Hvis bruger trykker på overlay
    overlayBtn.addEventListener("click", () => {
        tryPlay().then(() => {
            overlay.classList.add("hidden");
        });
    });

    // Make the crab clickable to go to the builder page
    const crab = document.querySelector('.crab');
    if (crab) {
        crab.style.cursor = 'pointer';
        crab.addEventListener('click', () => {
            window.location.href = 'bygakvarie.html';
        });
    }

}); 