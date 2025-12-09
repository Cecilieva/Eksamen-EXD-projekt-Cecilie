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

            // playCongrats returnerer en Promise der resolves når lyden er afspillet
            function playCongrats() {
                return new Promise((resolve) => {
                    if (!congratsAudio) { resolve(); return; }
                    var settled = false;
                    function done() { if (settled) return; settled = true; try { congratsAudio.removeEventListener('ended', onEnded); } catch(e){} resolve(); }
                    function onEnded() { done(); }
                    try {
                        congratsAudio.currentTime = 0;
                        congratsAudio.addEventListener('ended', onEnded);
                        var playPromise = congratsAudio.play();
                        if (playPromise && typeof playPromise.then === 'function') {
                            playPromise.then(function() {
                                // started successfully; wait for ended event
                            }).catch(function() {
                                // autoplay blokeret - bind one-time gesture to try to play
                                var tryOnce = function() {
                                    try {
                                        var p = congratsAudio.play();
                                        if (p && typeof p.then === 'function') {
                                            p.catch(function(){});
                                        }
                                    } catch(e) {}
                                    window.removeEventListener('click', tryOnce);
                                    window.removeEventListener('touchstart', tryOnce);
                                };
                                window.addEventListener('click', tryOnce, { once: true });
                                window.addEventListener('touchstart', tryOnce, { once: true });
                                // fallback: hvis der ikke kommer nogen brugerhandling, fortsæt efter 3s
                                setTimeout(done, 3000);
                            });
                        } else {
                            // play() ikke tilgængelig eller synkron — fallback
                            setTimeout(done, 0);
                        }
                    } catch(e) { done(); }
                });
            }

            // Smooth redirect: fade to black over `fadeMs` then navigate
            function smoothRedirect(url, fadeMs) {
                try {
                    fadeMs = typeof fadeMs === 'number' ? fadeMs : 600;
                    var f = document.createElement('div');
                    f.style.position = 'fixed';
                    f.style.left = '0';
                    f.style.top = '0';
                    f.style.width = '100%';
                    f.style.height = '100%';
                    f.style.background = '#000';
                    f.style.opacity = '0';
                    f.style.zIndex = '11000';
                    f.style.transition = 'opacity ' + fadeMs + 'ms ease';
                    document.body.appendChild(f);
                    // force reflow then start fade
                    void f.offsetWidth;
                    f.style.opacity = '1';
                    setTimeout(function() { try { window.location.href = url; } catch(e) { window.location.href = url; } }, fadeMs);
                } catch(e) { try { window.location.href = url; } catch(_) {} }
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

                    // brug eksisterende dekorativt billede `gul_cirkel_spidse_takker.gif` som stjerne bag fisken
                    var starImg = document.createElement('img');
                    starImg.src = 'image/gul_cirkel_spidse_takker.gif';
                    starImg.alt = '';
                    // placer stjernen centreret og bagved fiskens SVG
                    starImg.style.position = 'absolute';
                    starImg.style.left = '50%';
                    starImg.style.top = '50%';
                    starImg.style.transform = 'translate(-50%, -50%)';
                    // Gør stjernen mere dominerende så popup føles storslået
                    starImg.style.width = '85vmin';
                    starImg.style.maxWidth = '85vw';
                    starImg.style.maxHeight = '85vh';
                    starImg.style.objectFit = 'contain';
                    starImg.style.opacity = '0.95';
                    starImg.style.zIndex = '1000';

                    // svg container uden ekstra baggrund (placeres foran stjernen)
                    var svgWrap = document.createElement('div');
                    svgWrap.innerHTML = svgString;
                    // Gør fisken mindre så stjernen skinner igennem
                    svgWrap.style.display = 'inline-block';
                    svgWrap.style.width = '48vmin';
                    svgWrap.style.maxWidth = '68vw';
                    svgWrap.style.maxHeight = '68vh';
                    svgWrap.style.boxSizing = 'border-box';
                    svgWrap.style.padding = '8px';
                    // Sørg for at selve <svg> elementet skalerer til containeren,
                    // ellers kan SVG'ens egne width/height-attributter forskubbe layoutet.
                    try {
                        var innerSvg = svgWrap.querySelector('svg');
                        if (innerSvg) {
                            try { innerSvg.removeAttribute('width'); } catch(e) {}
                            try { innerSvg.removeAttribute('height'); } catch(e) {}
                            innerSvg.style.width = '100%';
                            innerSvg.style.height = 'auto';
                            innerSvg.style.display = 'block';
                            innerSvg.style.maxWidth = '100%';
                        }
                    } catch(e) {}
                    svgWrap.style.position = 'relative';
                    svgWrap.style.zIndex = '1001';

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

                    // append stjernen først (bagved), så fisken ovenpå
                    overlay.appendChild(starImg);
                    overlay.appendChild(svgWrap);
                    document.body.appendChild(overlay);
                    document.body.appendChild(closeBtn);

                    var autoCloseTimer = null;
                    var navigationScheduled = false;
                    function removePopup() {
                        try { overlay.remove(); } catch(e) {}
                        try { closeBtn.remove(); } catch(e) {}
                        try { if (autoCloseTimer) clearTimeout(autoCloseTimer); } catch(e) {}
                        // Afspil afsluttende 'godt klaret' lyd når popup lukkes,
                        // og naviger til index.html 2s efter lyden er færdig.
                        if (navigationScheduled) return;
                        navigationScheduled = true;
                        try {
                            playCongrats().then(function() {
                                setTimeout(function() { smoothRedirect('index.html', 600); }, 2000);
                            }).catch(function() {
                                // hvis noget går galt, naviger efter 2s
                                setTimeout(function() { smoothRedirect('index.html', 600); }, 2000);
                            });
                        } catch(e) {
                            setTimeout(function() { smoothRedirect('index.html', 600); }, 2000);
                        }
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
    }
});