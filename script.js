// Initialize Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{ lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// SVG Setup
const lines = document.querySelectorAll('.draw-line');
lines.forEach(line => {
    const length = line.getTotalLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
});

// Split Text
const splitTexts = document.querySelectorAll('.split-title, .intro-desc');
splitTexts.forEach(el => new SplitType(el, { types: 'words, chars' }));

// Preloader & Intro Sequence
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    let counter = { val: 0 };
    tl.to(counter, {
        val: 100,
        duration: 2,
        ease: "power2.out",
        onUpdate: function() {
            document.querySelector('.loader-counter').textContent = Math.round(counter.val).toString().padStart(3, '0');
        }
    }, 0)
    .to('.draw-line', {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: "power2.inOut",
        stagger: 0.2
    }, 0)
    .to('.loader-content', { opacity: 0, duration: 0.5 }, "+=0.2")
    .to('.panel-left', { xPercent: -100, duration: 1.2, ease: "power4.inOut" }, "reveal")
    .to('.panel-right', { xPercent: 100, duration: 1.2, ease: "power4.inOut" }, "reveal")
    .from('.zoom-text', { scale: 0.8, opacity: 0, duration: 1.5, ease: "power4.out" }, "reveal+=0.5")
    .from('.zoom-bg', { scale: 1, filter: 'blur(0px) brightness(1)', duration: 1.5, ease: "power4.out" }, "reveal+=0.5");
});

// Cursor
const cursor = document.getElementById('cursor');
const cursorText = document.getElementById('cursor-text');
let mouseX = 0, mouseY = 0, cx = 0, cy = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
});
gsap.ticker.add(() => {
    cx += (mouseX - cx) * 0.15; cy += (mouseY - cy) * 0.15;
    cursor.style.transform = `translate(${cx - 6}px, ${cy - 6}px)`;
    cursorText.style.transform = `translate(${cx}px, ${cy}px)`;
});

document.querySelectorAll('.hover-target').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        document.body.classList.add('cursor-hover');
        cursorText.textContent = e.currentTarget.dataset.hover || '';
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        cursorText.textContent = '';
    });
});

const magnets = document.querySelectorAll('.magnetic');
magnets.forEach(magnet => {
    magnet.addEventListener('mousemove', (e) => {
        const rect = magnet.getBoundingClientRect();
        const strength = magnet.dataset.strength || 20;
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * strength;
        gsap.to(magnet, { x, y, duration: 0.5, ease: 'power3.out' });
    });
    magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    });
});

// Hero Zoom through text on scroll
gsap.to('.zoom-text', {
    scale: 30, // massive scale to plunge "through" the letter
    opacity: 0,
    ease: 'power2.in',
    scrollTrigger: {
        trigger: '.hero-zoom',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: true
    }
});

// Split Intro Reveals
gsap.from('.split-title .char', {
    scrollTrigger: { trigger: '.split-intro', start: 'top 60%' },
    y: 100, opacity: 0, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.02
});
gsap.from('.intro-desc .word', {
    scrollTrigger: { trigger: '.split-intro', start: 'top 50%' },
    y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.01
});

// Horizontal Gallery
const hTrack = document.querySelector('.cinema-track');
let mm = gsap.matchMedia();

mm.add("(min-width: 769px)", () => {
    gsap.to(hTrack, {
        x: () => -(hTrack.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
            trigger: '.cinema-gallery',
            pin: true,
            scrub: 1,
            end: () => "+=" + (hTrack.scrollWidth - window.innerWidth)
        }
    });
    
    // Animate clip paths of the images inside horizontal scroll
    gsap.utils.toArray('.mask-reveal').forEach(mask => {
        gsap.to(mask, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            scrollTrigger: {
                trigger: mask,
                containerAnimation: ScrollTrigger.getAll()[ScrollTrigger.getAll().length-1],
                start: 'left 80%',
                end: 'left 20%',
                scrub: true
            }
        });
    });
});

// 3D Perspective Stack
const pCards = gsap.utils.toArray('.p-card');
pCards.forEach((card, i) => {
    if (i !== pCards.length - 1) {
        gsap.to(card, {
            scale: 0.85,
            rotationX: 10,
            y: -50,
            opacity: 0.5,
            scrollTrigger: {
                trigger: card,
                start: "top 15%",
                endTrigger: pCards[i + 1],
                end: "top 20%",
                scrub: true
            }
        });
    }
});
