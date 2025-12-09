

document.addEventListener('DOMContentLoaded', function () {
    try {
        const shouldPlay = sessionStorage.getItem('playTada');
        if (shouldPlay === '1') {
            // ryd flaget med det samme
            sessionStorage.removeItem('playTada');
            // forbered lyd: brug eksisterende <audio id="tadaAudio"> hvis tilgængelig
            var audioEl = document.getElementById('tadaAudio');
            var audio;
            if (audioEl) {
                audio = audioEl;
            } else {
                // Ingen eksplicit tada-audio på siden; finde første audio-tag som fallback
                audio = document.querySelector('audio');
                if (!audio) {
                    // Intet audio-element fundet — log og afslut, så der ikke refereres direkte til lydfilen her
                    try { console.warn('Ingen <audio> fundet til at afspille tada-lyd.'); } catch(e) {}
                    return;
                }
            }
            try { audio.volume = 0.85; } catch(e) {}

            // forsøg at afspille med det samme; vis popup EFTER lyden er færdig
            var builtSVG = null;
            try { builtSVG = sessionStorage.getItem('builtFishSVG'); } catch(e) {}

            // Forbered afsluttende 'godt klaret' lyd (Jeppe)
            var congratsAudio = null;
            try {
                congratsAudio = new Audio(encodeURI('audio/voicertool_audio_Jeppe_09.12.2025_at_10_25_05_on_December_9th_2025.mp3'));
                congratsAudio.preload = 'auto';
                congratsAudio.volume = 0.9;
            } catch(e) { congratsAudio = null; }

            function playCongrats() {
                if (!congratsAudio) return;
                try {
                    congratsAudio.currentTime = 0;
                    congratsAudio.play().catch(function() {
                        // hvis autoplay blokeret, afspil ved næste brugerhandling
                        var tryOnce = function() {
                            try { congratsAudio.play().catch(function(){}); } catch(e) {}
                            window.removeEventListener('click', tryOnce);
                            window.removeEventListener('touchstart', tryOnce);
                        };
                        window.addEventListener('click', tryOnce, { once: true });
                        window.addEventListener('touchstart', tryOnce, { once: true });
                    });
                } catch(e) { /* ignore */ }
            }

            function showFishPopup(svgString) {
                if (!svgString) return;
                try {
                    // ryd storage så vi ikke viser det igen
                    try { sessionStorage.removeItem('builtFishSVG'); } catch(e) {}

                    // opret overlay (ingen hvid boks, vis SVG direkte)
                    var overlay = document.createElement('div');
                    overlay.style.position = 'fixed';
                    overlay.style.left = '0';
                    overlay.style.top = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.display = 'flex';
                    overlay.style.alignItems = 'center';
                    overlay.style.justifyContent = 'center';
                    overlay.style.background = 'rgba(0,0,0,0.6)';
                    overlay.style.zIndex = '10000';

                    // svg container uden ekstra baggrund
                    var svgWrap = document.createElement('div');
                    svgWrap.innerHTML = svgString;
                    svgWrap.style.display = 'inline-block';
                    svgWrap.style.maxWidth = '78vw';
                    svgWrap.style.maxHeight = '78vh';
                    svgWrap.style.boxSizing = 'border-box';
                    svgWrap.style.padding = '12px';

                    // lille luk-knap (rund) i hjørnet af overlay
                    var closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '&times;';
                    closeBtn.setAttribute('aria-label','Luk');
                    closeBtn.style.position = 'fixed';
                    closeBtn.style.right = '22px';
                    closeBtn.style.top = '22px';
                    closeBtn.style.width = '42px';
                    closeBtn.style.height = '42px';
                    closeBtn.style.borderRadius = '50%';
                    closeBtn.style.border = 'none';
                    closeBtn.style.background = 'rgba(255,255,255,0.9)';
                    closeBtn.style.color = '#111';
                    closeBtn.style.fontSize = '20px';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';

                    overlay.appendChild(svgWrap);
                    document.body.appendChild(overlay);
                    document.body.appendChild(closeBtn);

                    var autoCloseTimer = null;
                    function removePopup() {
                        try { overlay.remove(); } catch(e) {}
                        try { closeBtn.remove(); } catch(e) {}
                        try { if (autoCloseTimer) clearTimeout(autoCloseTimer); } catch(e) {}
                        // Afspil afsluttende 'godt klaret' lyd når popup lukkes
                        try { playCongrats(); } catch(e) {}
                    }
                    closeBtn.addEventListener('click', removePopup);
                    overlay.addEventListener('click', function(e){ if (e.target === overlay) removePopup(); });

                    // pop/zoom animation
                    svgWrap.animate([{ transform: 'scale(.85)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
                    // auto-luk efter 5000ms (5s) for hurtigere børnevenligt flow
                    try { autoCloseTimer = setTimeout(removePopup, 5000); } catch(e) {}
                } catch(e) { try{ console.warn('Kunne ikke vise fisk-popup', e); }catch(_){} }
            }

            audio.play().then(function(){
                // når afspilning er startet, vis popup kort tid efter starten (hurtigere feedback)
                try {
                    setTimeout(function(){ showFishPopup(builtSVG); }, 2000);
                } catch(e) { showFishPopup(builtSVG); }
            }).catch(function() {
                // hvis autoplay blokeret, vis kontroller hvis vi bruger et audio-element
                if (audioEl) {
                    try { audioEl.style.display = 'block'; } catch(e) {}
                }
                // afspil ved næste brugerhandling (klik/touch); når brugeren spiller, vis popup efter ended
                var playOnGesture = function() {
                    try {
                        audio.play().then(function(){
                            // vis popup hurtigt efter brugerstart
                            try { setTimeout(function(){ showFishPopup(builtSVG); }, 400); } catch(e) { showFishPopup(builtSVG); }
                        }).catch(function(){
                            // hvis play stadig fejler, vis popup med det samme (bedste fallback)
                            showFishPopup(builtSVG);
                        });
                    } catch(e) { showFishPopup(builtSVG); }
                    window.removeEventListener('click', playOnGesture);
                    window.removeEventListener('touchstart', playOnGesture);
                };
                window.addEventListener('click', playOnGesture, { once: true });
                window.addEventListener('touchstart', playOnGesture, { once: true });
            });
        }
    } catch (e) {
        // ignorer fejl
    }
});