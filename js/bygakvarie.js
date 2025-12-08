// JS for karussel og farvevalg (Byg dit eget akvarie)
document.addEventListener('DOMContentLoaded', () => {
	const carousel = document.getElementById('fishCarousel');
	const items = carousel ? Array.from(carousel.querySelectorAll('.carousel-item')) : [];
	const prevBtn = document.querySelector('.carousel-btn.prev');
	const nextBtn = document.querySelector('.carousel-btn.next');
	let selectedItem = null;

	// Feedback audio (preload to reduce latency)
	let feedbackAudio = null;
	try {
		feedbackAudio = new Audio('audio/underwater_drip (1).wav');
		feedbackAudio.preload = 'auto';
		feedbackAudio.volume = 0.6;
	} catch (err) { feedbackAudio = null; }

	// Load SVG inline into the carousel item (replace img with inline SVG)
	function loadInlineSVGIntoItem(item) {
		if (!item || item.dataset.inline === 'true') return Promise.resolve();
		const src = item.dataset.src;
		if (!src) return Promise.resolve();
		return fetch(src)
			.then(r => r.text())
			.then(svgText => {
				item.innerHTML = svgText;
				item.dataset.inline = 'true';
			})
			.catch(err => console.warn('Kunne ikke indlæse SVG:', src, err));
	}

	// Marker et item som valgt
	function markSelected(item) {
		if (selectedItem === item) return;
		items.forEach(i => i.classList.remove('selected'));
		if (item) item.classList.add('selected');
		selectedItem = item;
	}

	// IntersectionObserver: find hvilket item er synligt (centered)
	if (items.length > 0 && 'IntersectionObserver' in window) {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
					const item = entry.target;
					markSelected(item);
					loadInlineSVGIntoItem(item);
				}
			});
		}, { root: carousel, threshold: [0.5] });
		items.forEach(item => {
			io.observe(item);
			// klik skal scrolle item i view
			item.addEventListener('click', () => { item.scrollIntoView({ behavior: 'smooth', inline: 'center' }); });
			item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.scrollIntoView({ behavior: 'smooth', inline: 'center' }); } });
		});
		// load første
		loadInlineSVGIntoItem(items[0]).then(() => { items[0].scrollIntoView(); });
	} else if (items.length > 0) {
		// Fallback: klik vælger
		items.forEach(item => {
			item.addEventListener('click', () => {
				items.forEach(i => i.classList.remove('selected'));
				item.classList.add('selected');
				loadInlineSVGIntoItem(item);
			});
		});
	}

	// Scroll-knapper: scroll en hel viewport-width (én item)
	function scrollByPage(direction) {
		if (!carousel) return;
		const offset = direction * carousel.clientWidth;
		carousel.scrollBy({ left: offset, behavior: 'smooth' });
	}
	if (prevBtn) prevBtn.addEventListener('click', () => scrollByPage(-1));
	if (nextBtn) nextBtn.addEventListener('click', () => scrollByPage(1));


	// Farvepaletter: vælg en farve først, klik derefter på en del af SVG'en for at farve præcist
	const swatches = Array.from(document.querySelectorAll('.color-swatch')).concat(Array.from(document.querySelectorAll('.palette[data-color]')));

	let activeColor = null;
	let activeIsSecondary = false;
	let activeSwatch = null;

	function clearActiveSwatch() {
		if (activeSwatch) {
			activeSwatch.classList.remove('active');
			try { activeSwatch.removeAttribute('aria-pressed'); } catch(e) {}
		}
		activeColor = null; activeIsSecondary = false; activeSwatch = null;
	}

	function applyColorToParts(parts, color, isSecondary) {
		if (!parts || parts.length === 0) return;
		parts.forEach(p => {
			try {
				p.setAttribute('fill', color);
				if (!isSecondary) p.dataset.appliedPrimary = 'true';
			} catch (err) { /* ignore */ }
		});
	}

	// Vis kort feedback ved klik (lille pop ved x/y) — fjernes automatisk
	function showFeedback(clientX, clientY, color) {
		try {
			// play short sound feedback (allowed because play happens on user click)
			try { if (feedbackAudio) { feedbackAudio.currentTime = 0; feedbackAudio.play().catch(()=>{}); } } catch(e) {}
			const el = document.createElement('div');
			el.className = 'color-feedback';
			// positionér centreret omkring klikpunkt
			el.style.left = (clientX - 18) + 'px';
			el.style.top = (clientY - 18) + 'px';
			if (color) el.style.background = color;
			document.body.appendChild(el);
			el.addEventListener('animationend', () => { try { el.remove(); } catch(e){} });
			// safety remove after 900ms
			setTimeout(() => { try { el.remove(); } catch(e){} }, 900);
		} catch (err) { /* ignore */ }
	}

	// helper: find fillable parts inside an element or group
	function partsFromElement(el) {
		if (!el) return [];
		const tag = (el.tagName || '').toLowerCase();
		if (tag === 'g') return Array.from(el.querySelectorAll('path, circle, rect, ellipse'));
		if (['path','circle','rect','ellipse'].includes(tag)) return [el];
		return [];
	}

	// Attach click handlers to SVG parts when an SVG is inlined
	function attachSvgPartListeners(item) {
		const svg = item.querySelector('svg');
		if (!svg) return;
		// make fillable elements pointer friendly and listen for clicks
		const elements = Array.from(svg.querySelectorAll('path, circle, rect, ellipse, g'));
		elements.forEach(el => {
			const noColor = el.getAttribute && el.getAttribute('data-no-color') === 'true';
			if (noColor) return;
			// pointer cursor for groups/parts
			try { el.style.cursor = 'pointer'; } catch(e) {}
		});

		svg.addEventListener('click', (e) => {
			// if no active color, do nothing here (keeps previous behavior unchanged)
			if (!activeColor) return;
			const target = e.target.closest('path, circle, rect, ellipse, g');
			if (!target) return;
			if (target.getAttribute && target.getAttribute('data-no-color') === 'true') return;
			const parts = partsFromElement(target).filter(p => p.getAttribute('data-no-color') !== 'true');
			if (parts.length === 0) return;
			applyColorToParts(parts, activeColor, activeIsSecondary);
			// vis kort feedback ved klik (pop)
			showFeedback(e.clientX, e.clientY, activeColor);
			// keep selection active so user can color multiple parts, or
			// to clear after single use uncomment next line:
			// clearActiveSwatch();
		});
	}

	swatches.forEach(swatch => {
		swatch.addEventListener('click', (e) => {
			// select / toggle active swatch
			const color = swatch.getAttribute('data-color') || swatch.dataset.color || window.getComputedStyle(swatch).backgroundColor;
			// sekundær aktiveres kun via Shift/Alt eller data-secondary på swatch
			const isSecondary = e.shiftKey || e.altKey || swatch.getAttribute('data-secondary') === 'true';
			if (activeSwatch === swatch) { clearActiveSwatch(); return; }
			clearActiveSwatch();
			activeColor = color;
			activeIsSecondary = !!isSecondary;
			activeSwatch = swatch;
			activeSwatch.classList.add('active');
			try { activeSwatch.setAttribute('aria-pressed', 'true'); } catch(e) {}
			// brief console feedback
			console.info('Farve valgt:', activeColor, 'Sekundær:', activeIsSecondary);
		});
	});

	// Observe items and attach listeners when SVGs are loaded
	if (items.length > 0 && 'MutationObserver' in window) {
		const mo = new MutationObserver((mutations) => {
			mutations.forEach(m => {
				m.addedNodes && m.addedNodes.forEach(node => {
					if (node.nodeType === 1 && node.tagName && node.tagName.toLowerCase() === 'svg') {
						const containingItem = node.closest('.carousel-item');
						if (containingItem) attachSvgPartListeners(containingItem);
					}
				});
			});
		});
		items.forEach(item => mo.observe(item, { childList: true, subtree: true }));
	}



	// Cursor hint for old .palet imgs
	document.querySelectorAll('.palet').forEach(img => img.style.cursor = 'pointer');

	// 'Færdig' knap: gå videre til akvarie.html
	const doneBtn = document.getElementById('doneButton');
	if (doneBtn) {
		doneBtn.addEventListener('click', () => {
			window.location.href = 'akvarie.html';
		});
	}
});

