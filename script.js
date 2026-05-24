/**
 * Horbach Asset Guide — Landing Page Scripts
 */

(function () {
    'use strict';

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============================================
    // Navbar scroll effect (transparent → solid)
    // ============================================
    const navbar = document.querySelector('.navbar');

    function onScroll() {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
            navbar.style.padding = '12px 0';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.padding = '16px 0';
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ============================================
    // Smooth scroll for anchor links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // Contact Form Handling
    // ============================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            const btnText = btn.querySelector('.btn-text');
            const btnLoader = btn.querySelector('.btn-loader');
            const action = contactForm.getAttribute('action');

            // Check if Formspree is configured
            if (action.includes('YOUR_FORM_ID')) {
                alert('Please configure your Formspree form ID in the HTML action attribute.');
                return;
            }

            // Show loading state
            btn.disabled = true;
            btnText.hidden = true;
            btnLoader.hidden = false;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(action, {
                    method: 'POST',
                    body: formData,
                    headers: { Accept: 'application/json' },
                });

                if (response.ok) {
                    contactForm.reset();
                    showToast('Message sent! We will get back to you within 24 hours.', 'success');
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Something went wrong');
                }
            } catch (err) {
                showToast(err.message || 'Failed to send. Please try again.', 'error');
            } finally {
                btn.disabled = false;
                btnText.hidden = false;
                btnLoader.hidden = true;
            }
        });
    }

    // ============================================
    // Toast Notification
    // ============================================
    function showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: ${type === 'success' ? '#3d7a3d' : '#8b3a3a'};
            color: #fff;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 0.95rem;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 9999;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            text-align: center;
            max-width: 90vw;
        `;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Remove after 4s
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // ============================================
    // Intersection Observer for scroll animations
    // ============================================
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.about-card, .service-item, .info-card').forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }

    // ============================================
    // Client Tabs
    // ============================================
    const clientTabs = document.querySelectorAll('.clients-tab');
    const clientPanels = document.querySelectorAll('.clients-panel');

    clientTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            clientTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            clientPanels.forEach(p => {
                p.classList.toggle('active', p.dataset.panel === target);
            });
        });
    });

    // ============================================
    // Reviews Carousel (swipe + drag + auto)
    // ============================================
    const track = document.getElementById('reviewsTrack');
    const dotsContainer = document.getElementById('reviewsDots');
    const prevBtn = document.querySelector('.reviews-prev');
    const nextBtn = document.querySelector('.reviews-next');
    const carousel = document.getElementById('reviewsCarousel');

    if (track && carousel) {
        const cards = track.querySelectorAll('.review-card');
        const total = cards.length;
        const isMobile = window.innerWidth < 640;
        const perView = isMobile ? 1 : 2;
        const maxIndex = Math.max(0, total - perView);
        let current = 0;
        let autoInterval;

        // Create dots
        const dotCount = maxIndex + 1;
        for (let i = 0; i < dotCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'dot' + (i === 0 ? ' active' : '');
            btn.setAttribute('aria-label', `Go to review ${i + 1}`);
            btn.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(btn);
        }
        const dots = dotsContainer.querySelectorAll('.dot');

        function updateDots() {
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        function goTo(index) {
            current = Math.max(0, Math.min(index, maxIndex));
            const percent = current * (100 / perView);
            track.style.transform = `translateX(-${percent}%)`;
            updateDots();
            resetAuto();
        }

        function next() {
            goTo(current >= maxIndex ? 0 : current + 1);
        }

        function prev() {
            goTo(current <= 0 ? maxIndex : current - 1);
        }

        prevBtn.addEventListener('click', prev);
        nextBtn.addEventListener('click', next);

        // Touch / swipe support
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none';
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const percent = current * (100 / perView) - (diff / carousel.offsetWidth) * 100;
            track.style.transform = `translateX(-${percent}%)`;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = '';
            const diff = currentX - startX;
            if (diff < -50) next();
            else if (diff > 50) prev();
            else goTo(current);
            currentX = 0;
        }, { passive: true });

        // Mouse drag support
        carousel.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            track.style.transition = 'none';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
            const diff = currentX - startX;
            const percent = current * (100 / perView) - (diff / carousel.offsetWidth) * 100;
            track.style.transform = `translateX(-${percent}%)`;
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = '';
            const diff = currentX - startX;
            if (diff < -50) next();
            else if (diff > 50) prev();
            else goTo(current);
            currentX = 0;
        });

        // Auto-rotate every 6s
        function startAuto() {
            autoInterval = setInterval(next, 6000);
        }
        function resetAuto() {
            clearInterval(autoInterval);
            startAuto();
        }
        startAuto();

        // Pause on hover
        carousel.addEventListener('mouseenter', () => clearInterval(autoInterval));
        carousel.addEventListener('mouseleave', startAuto);
    }

    // ============================================
    // Retirement Calculator
    // ============================================
    const calcInputs = {
        age: document.getElementById('calcAge'),
        retire: document.getElementById('calcRetire'),
        salary: document.getElementById('calcSalary'),
        years: document.getElementById('calcYears'),
        desired: document.getElementById('calcDesired'),
        saving: document.getElementById('calcSaving'),
        returnRate: document.getElementById('calcReturn'),
    };

    const calcDisplays = {
        age: document.getElementById('valAge'),
        retire: document.getElementById('valRetire'),
        salary: document.getElementById('valSalary'),
        years: document.getElementById('valYears'),
        desired: document.getElementById('valDesired'),
        saving: document.getElementById('valSaving'),
        returnRate: document.getElementById('valReturn'),
    };

    const calcResults = {
        state: document.getElementById('resState'),
        gap: document.getElementById('resGap'),
        private: document.getElementById('resPrivate'),
        total: document.getElementById('resTotal'),
        barState: document.getElementById('barState'),
        barPrivate: document.getElementById('barPrivate'),
        barGap: document.getElementById('barGap'),
        insight: document.getElementById('calcInsight'),
    };

    function formatEuro(n) {
        return '€' + Math.round(n).toLocaleString('de-DE');
    }

    function calculatePension() {
        const age = parseInt(calcInputs.age.value, 10);
        const retireAge = parseInt(calcInputs.retire.value, 10);
        const salary = parseInt(calcInputs.salary.value, 10);
        const yearsDe = parseInt(calcInputs.years.value, 10);
        const desired = parseInt(calcInputs.desired.value, 10);
        const saving = parseInt(calcInputs.saving.value, 10);
        const returnRate = parseFloat(calcInputs.returnRate.value) / 100;

        const yearsToRetire = Math.max(0, retireAge - age);
        const annualSalary = salary * 12;

        // German state pension (simplified Rentenpunkte model)
        // 1 Rentenpunkt ≈ €38.50/month at standard retirement age
        // Average salary ≈ €43,142/year (2024)
        const avgSalary = 43142;
        const rentenpunktValue = 38.50;
        const pointsPerYear = annualSalary / avgSalary;
        const totalPoints = yearsDe * pointsPerYear;

        // Access factor: 1.0 at 67, -0.3% per month early, +0.5% per month late
        const standardRetireAge = 67;
        const monthsDiff = (retireAge - standardRetireAge) * 12;
        let accessFactor = 1.0;
        if (monthsDiff < 0) {
            accessFactor = 1.0 + (monthsDiff * 0.003); // 0.3% penalty per month early
        } else if (monthsDiff > 0) {
            accessFactor = 1.0 + (monthsDiff * 0.005); // 0.5% bonus per month late
        }
        accessFactor = Math.max(0.7, Math.min(1.3, accessFactor));

        const monthlyState = totalPoints * rentenpunktValue * accessFactor;

        // Private savings future value (monthly compounding)
        const months = yearsToRetire * 12;
        const monthlyRate = returnRate / 12;
        let portfolioValue = 0;
        if (monthlyRate > 0 && months > 0) {
            portfolioValue = saving * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        } else if (months > 0) {
            portfolioValue = saving * months;
        }

        // 4% withdrawal rule for monthly income
        const monthlyPrivate = portfolioValue * 0.04 / 12;

        const totalIncome = monthlyState + monthlyPrivate;
        const gap = Math.max(0, desired - totalIncome);

        // Update result cards
        calcResults.state.textContent = formatEuro(monthlyState);
        calcResults.gap.textContent = formatEuro(gap);
        calcResults.private.textContent = formatEuro(monthlyPrivate);
        calcResults.total.textContent = formatEuro(totalIncome);

        // Update bar chart (percentage of desired income)
        const pctState = Math.min(100, (monthlyState / desired) * 100);
        const pctPrivate = Math.min(100 - pctState, (monthlyPrivate / desired) * 100);
        const pctGap = Math.max(0, 100 - pctState - pctPrivate);

        calcResults.barState.style.width = pctState + '%';
        calcResults.barPrivate.style.width = pctPrivate + '%';
        calcResults.barGap.style.width = pctGap + '%';

        // Update insight
        const insight = calcResults.insight;
        if (gap <= 0) {
            insight.textContent = 'Great! Your projected income meets your retirement goal. You are on track for a comfortable retirement in Germany.';
            insight.classList.remove('warning');
        } else if (gap < desired * 0.25) {
            insight.textContent = `You are close! A small gap of ${formatEuro(gap)}/month remains. Increasing your monthly savings by even €50–100 could close it.`;
            insight.classList.add('warning');
        } else {
            insight.textContent = `Your pension gap is ${formatEuro(gap)}/month. Consider raising your monthly savings, delaying retirement, or booking a free call to explore Riester / Rürup options.`;
            insight.classList.add('warning');
        }

        // Update display labels
        calcDisplays.age.textContent = age;
        calcDisplays.retire.textContent = retireAge;
        calcDisplays.salary.textContent = formatEuro(salary);
        calcDisplays.years.textContent = yearsDe;
        calcDisplays.desired.textContent = formatEuro(desired);
        calcDisplays.saving.textContent = formatEuro(saving);
        calcDisplays.returnRate.textContent = (returnRate * 100).toFixed(1) + '%';
    }

    if (calcInputs.age) {
        Object.values(calcInputs).forEach(input => {
            input.addEventListener('input', calculatePension);
        });
        // Initial calculation
        calculatePension();
    }

    // ============================================
    // Calendly Widget (lazy load)
    // ============================================
    const calendlyWidget = document.getElementById('calendly-widget');

    if (calendlyWidget) {
        // TODO: Replace with your actual Calendly URL, e.g.:
        // const calendlyUrl = 'https://calendly.com/horbach-asset-guide/15min';
        const calendlyUrl = 'https://calendly.com/YOUR_CALENDLY_LINK';

        // If you have a real Calendly link, uncomment below to embed the widget
        /*
        const iframe = document.createElement('iframe');
        iframe.src = `${calendlyUrl}?embed_type=Inline&hide_gdpr_banner=1`;
        iframe.width = '100%';
        iframe.height = '600';
        iframe.frameBorder = '0';
        iframe.title = 'Calendly Scheduling';
        calendlyWidget.innerHTML = '';
        calendlyWidget.appendChild(iframe);
        */
    }
})();
