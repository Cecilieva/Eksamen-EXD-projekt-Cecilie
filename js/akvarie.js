

document.addEventListener('DOMContentLoaded', function () {
    try {
        const shouldPlay = sessionStorage.getItem('playTada');
        if (shouldPlay === '1') {
            // clear flag immediately
            sessionStorage.removeItem('playTada');
            // prepare audio
            var audio = new Audio(encodeURI('audio/tadaa-47995.mp3'));
            audio.volume = 0.85;
            // try to play immediately
            audio.play().catch(function() {
                // if autoplay blocked, play on next user gesture (click/touch)
                var playOnGesture = function() {
                    try { audio.play().catch(function(){}); } catch(e) {}
                    window.removeEventListener('click', playOnGesture);
                    window.removeEventListener('touchstart', playOnGesture);
                };
                window.addEventListener('click', playOnGesture, { once: true });
                window.addEventListener('touchstart', playOnGesture, { once: true });
            });
        }
    } catch (e) {
        // ignore storage errors
    }
});