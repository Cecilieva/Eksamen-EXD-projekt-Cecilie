"use strict"

//arrays med teksten til de forskellige sprog
const danish = ["Velkommen til akvariet!", "Byg dit akvarie"];
const english = ["Welcome to the aquarium!", "Build your aquarium"];
const german = ["Willkommen im Aquarium!", "Baue dein Aquarium"];

// Title/buttonText hentes når vi skal opdatere (sikrer de findes)

//her henter jeg knapperne fra DOM
const danishButton = document.querySelector(".danish");
const englishButton = document.querySelector(".english");
const germanButton = document.querySelector(".german");

//funktion som ændrer sproget ved at ændre teksten i de valgte elementer
function changeLanguage(languageArray) {
    const titleEl = document.querySelector("h1");
    const buttonTextEl = document.querySelector(".button-text");
    if (titleEl) titleEl.textContent = languageArray[0];
    if (buttonTextEl) buttonTextEl.textContent = languageArray[1];
}

  // Note: language button listeners are attached after DOMContentLoaded below

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

    // Attach language button listeners here so we can also switch the audio source
    const jeppeSrc = 'audio/voicertool_audio_Jeppe_08.12.2025.mp3';
    const guySrc = 'audio/voicertool_audio_Guy_08.12.2025_at_17_04_16_on_December_8th_2025.mp3';
    const conradSrc = 'audio/voicertool_audio_Conrad_08.12.2025_at_17_02_29_on_December_8th_2025.mp3';

    if (danishButton) {
        danishButton.addEventListener('click', () => {
            changeLanguage(danish);
            if (audio) {
                audio.pause();
                audio.src = jeppeSrc;
                audio.load();
                tryPlay().catch(()=>{});
            }
        });
    }
    if (englishButton) {
        englishButton.addEventListener('click', () => {
            changeLanguage(english);
            if (audio) {
                audio.pause();
                audio.src = guySrc;
                audio.load();
                tryPlay().catch(()=>{});
            }
        });
    }
    if (germanButton) {
        germanButton.addEventListener('click', () => {
            changeLanguage(german);
            if (audio) {
                audio.pause();
                audio.src = conradSrc;
                audio.load();
                tryPlay().catch(()=>{});
            }
        });
    }

}); 