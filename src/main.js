/**
 * Schneider Weisse Brauhaus - Premium Website Script
 * Visual style and animations redesigned based on tbpub.ru reference.
 * Integrated with Lenis, GSAP, ScrollTrigger and custom Canvas preloader.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Force scroll position to 0 on startup and disable browser scroll restoration
  if ('history' in window) {
    window.history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Determine language based on document lang
  const isEn = document.documentElement.lang === 'en';

  // Global elements
  const preloader = document.getElementById('preloader');
  const siteHeader = document.getElementById('site-header');

  /* ==========================================================================
     1. CANVAS PRELOADER (Smoke & floating gold particles)
     ========================================================================== */
  const canvas = document.getElementById('preloader-canvas');
  const ctx = canvas.getContext('2d');
  
  let animationFrameId;
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particles Setup
  const particles = [];
  const particleCount = 70;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.8,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.6 + 0.2
    });
  }

  // Smoke Setup
  const smokeClouds = [];
  const smokeCount = 12;
  for (let i = 0; i < smokeCount; i++) {
    smokeClouds.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.1,
      r: Math.random() * 180 + 120,
      opacity: Math.random() * 0.12 + 0.04
    });
  }

  function drawPreloader() {
    ctx.clearRect(0, 0, width, height);

    // Deep graphite/dark background
    const bgGrad = ctx.createRadialGradient(width/2, height/2, 20, width/2, height/2, width);
    bgGrad.addColorStop(0, '#0e0c0b');
    bgGrad.addColorStop(1, '#050505');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Render smoke
    smokeClouds.forEach(cloud => {
      ctx.beginPath();
      const grad = ctx.createRadialGradient(cloud.x, cloud.y, 5, cloud.x, cloud.y, cloud.r);
      grad.addColorStop(0, `rgba(217, 120, 36, ${cloud.opacity})`); // Warm orange smoke hint
      grad.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = grad;
      ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
      ctx.fill();

      cloud.x += cloud.vx;
      cloud.y += cloud.vy;

      if (cloud.y + cloud.r < 0) {
        cloud.y = height + cloud.r;
        cloud.x = Math.random() * width;
      }
    });

    // Render particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(217, 120, 36, ${p.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#d97824';
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      p.y -= p.speed;
      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }
    });

    animationFrameId = requestAnimationFrame(drawPreloader);
  }
  
  drawPreloader();

  const logoWrap = document.querySelector('.preloader-logo-wrap');
  setTimeout(() => {
    if (logoWrap) logoWrap.classList.add('visible');
  }, 150);

  // Simulated progress loader
  const progressBar = document.getElementById('preloader-progress');
  const progressText = document.getElementById('preloader-text');
  let currentProgress = 0;
  
  const progressInterval = setInterval(() => {
    currentProgress += Math.floor(Math.random() * 9) + 3;
    if (currentProgress >= 100) {
      currentProgress = 100;
      clearInterval(progressInterval);
      endPreloader();
    }
    if (progressBar) progressBar.style.width = `${currentProgress}%`;
    if (progressText) progressText.innerText = `${currentProgress}%`;
  }, 70);

  function endPreloader() {
    setTimeout(() => {
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.filter = 'blur(30px)';
        setTimeout(() => {
          preloader.style.display = 'none';
          cancelAnimationFrame(animationFrameId);
          initGsapReveals(); // Trigger entry anims
          
          // Recalculate GSAP trigger positions now that DOM layout is completely active
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }, 800);
      }
    }, 300);
  }

  /* ==========================================================================
     2. LENIS SMOOTH INERTIAL SCROLLING
     ========================================================================== */
  let lenis;
  try {
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.05
      });

      // Force Lenis to start scroll position at 0
      lenis.scrollTo(0, { immediate: true });

      function scrollLoop(time) {
        lenis.raf(time);
        requestAnimationFrame(scrollLoop);
      }
      requestAnimationFrame(scrollLoop);

      lenis.on('scroll', ScrollTrigger.update);
      
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  } catch (e) {
    console.warn("Lenis failed to load, fallback to standard scrolling.", e);
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        
        burgerToggle.classList.remove('active');
        mobileNav.classList.remove('open');
        
        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ==========================================================================
     3. TEXT SPLITTING HELPER (For Premium Word-Mask reveals)
     ========================================================================== */
  function splitTextIntoWords(elements) {
    elements.forEach(el => {
      const text = el.innerText;
      el.innerHTML = '';
      text.split(' ').forEach(word => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.overflow = 'hidden';
        wordSpan.style.verticalAlign = 'bottom';
        wordSpan.style.paddingRight = '0.25em';
        
        const innerSpan = document.createElement('span');
        innerSpan.innerText = word;
        innerSpan.style.display = 'inline-block';
        innerSpan.className = 'split-word-inner';
        
        wordSpan.appendChild(innerSpan);
        el.appendChild(wordSpan);
      });
    });
  }

  /* ==========================================================================
     4. GSAP SCROLLTRIGGERS & REVEAL TIMELINES
     ========================================================================== */
  function initGsapReveals() {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Apply custom word splitting on major section titles
    const titlesToSplit = document.querySelectorAll('.section-title, .hero-title');
    splitTextIntoWords(titlesToSplit);

    // Hero Entry animations (Logo slide+blur, title split-words, booking CTA button scale+fade)
    const heroTl = gsap.timeline();
    
    heroTl.from('.hero-brand-logo', { 
      opacity: 0, 
      filter: 'blur(15px)',
      y: -25,
      duration: 1.5, 
      ease: 'power3.out' 
    })
    .from('#hero .split-word-inner', { 
      yPercent: 100, 
      opacity: 0, 
      stagger: 0.1, 
      duration: 1.4, 
      ease: 'power4.out' 
    }, '-=0.9')
    .from('.hero-btns', { 
      opacity: 0, 
      scale: 0.9,
      duration: 1.2, 
      ease: 'power3.out' 
    }, '-=0.8');

    // Hero Parallax Background
    gsap.to('.js-parallax-bg img', {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Sections reveals
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
      const tag = sec.querySelector('.section-tag');
      const titleWords = sec.querySelectorAll('.section-title .split-word-inner');
      const content = sec.querySelectorAll('.about-info > p, .history-info > p, .chef-info > p, .section-header > p, .about-features-small, .quote-card, .why-card, .interior-carousel-wrapper, .signature-dish');

      const secTl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      if (tag) {
        secTl.from(tag, {
          opacity: 0,
          letterSpacing: '0.1em',
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      if (titleWords.length > 0) {
        secTl.from(titleWords, {
          yPercent: 100,
          opacity: 0,
          stagger: 0.05,
          duration: 1.2,
          ease: 'power4.out'
        }, '-=0.6');
      }

      if (content.length > 0) {
        secTl.from(content, {
          opacity: 0,
          y: 30,
          filter: 'blur(10px)',
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out'
        }, '-=0.8');
      }
    });

    // Image reveal masks (slide reveal + scale out)
    const revealWraps = document.querySelectorAll('.image-reveal-wrap');
    revealWraps.forEach(wrap => {
      const mask = wrap.querySelector('.image-overlay-reveal');
      const img = wrap.querySelector('img');

      const imgTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top 75%'
        }
      });

      imgTl.to(mask, {
        xPercent: 101,
        duration: 1.4,
        ease: 'power4.inOut'
      })
      .from(img, {
        scale: 1.25,
        duration: 1.6,
        ease: 'power3.out'
      }, '-=1.0');
    });
  }

  /* ==========================================================================
     5. HERO INTERACTIVE MOUSE PARALLAX
     ========================================================================== */
  const heroSection = document.getElementById('hero');
  const heroContent = document.querySelector('.hero-content');
  const heroBg = document.querySelector('.hero-bg-wrapper img');
  
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xOffset = (clientX / innerWidth) - 0.5;
      const yOffset = (clientY / innerHeight) - 0.5;
      
      if (heroContent) {
        gsap.to(heroContent, {
          x: -xOffset * 40,
          y: -yOffset * 35,
          duration: 0.9,
          ease: 'power2.out'
        });
      }
      
      if (heroBg) {
        gsap.to(heroBg, {
          x: xOffset * 20,
          y: yOffset * 20,
          duration: 1.4,
          ease: 'power2.out'
        });
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      if (heroContent) gsap.to(heroContent, { x: 0, y: 0, duration: 1.4, ease: 'power3.out' });
      if (heroBg) gsap.to(heroBg, { x: 0, y: 0, duration: 1.8, ease: 'power3.out' });
    });
  }

  /* ==========================================================================
     6. NAVBAR SCROLL EFFECT
     ========================================================================== */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  /* ==========================================================================
     7. BURGER & MOBILE PANEL NAVIGATION
     ========================================================================== */
  const burgerToggle = document.getElementById('burger-toggle');
  const mobileNav = document.getElementById('mobile-nav-panel');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (burgerToggle && mobileNav) {
    burgerToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      burgerToggle.classList.toggle('active');
      burgerToggle.setAttribute('aria-expanded', isOpen);

      if (lenis) {
        if (isOpen) lenis.stop();
        else lenis.start();
      }

      if (isOpen && typeof gsap !== 'undefined') {
        gsap.from(mobileNavLinks, {
          opacity: 0,
          filter: 'blur(10px)',
          y: 40,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.2
        });
      }
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        burgerToggle.classList.remove('active');
        burgerToggle.setAttribute('aria-expanded', 'false');
        if (lenis) lenis.start();
      });
    });
  }

  /* ==========================================================================
     8. INTERIOR CAROUSEL
     ========================================================================== */
  const slides = document.querySelectorAll('.slide-item');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide) => {
      slide.classList.remove('active');
    });

    slides[index].classList.add('active');
    
    if (typeof gsap !== 'undefined') {
      // Slide the entire container horizontally
      gsap.to('.interior-slider', {
        xPercent: -100 * index,
        duration: 1.2,
        ease: 'power3.out'
      });

      // Scale and blur reveal on the active image for an ultra-premium feel
      gsap.fromTo(slides[index].querySelector('img'), 
        { scale: 1.15, filter: 'blur(5px)' }, 
        { scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' }
      );
    } else {
      const slider = document.querySelector('.interior-slider');
      if (slider) {
        slider.style.transform = `translateX(-${100 * index}%)`;
      }
    }
  }

  if (slides.length > 0) {
    showSlide(currentSlide);

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      });
    }

    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 6000);
  }

  /* ==========================================================================
     9. FOOD MENU DATA & DYNAMIC RENDER
     ========================================================================== */
  const menuData = {
    ru: {
      kitchen: [
        {
          name: "Свиная рулька на вертеле",
          price: "1 950 ₽",
          desc: "Фирменная рулька, томленая в&nbsp;пивной глазури TAP-7 по&nbsp;старинному баварскому рецепту. Подается с&nbsp;традиционной тушеной капустой.",
          img: "https://schneider-weisse.ru/images/dishes/1_1.jpg",
          pairing: "Рекомендуем в&nbsp;паре с&nbsp;бокалом темного, богатого Schneider Weisse TAP-6."
        },
        {
          name: "Ассорти баварских колбасок",
          price: "1 100 ₽",
          desc: "Сет из&nbsp;фирменных немецких колбасок гриль собственного приготовления. Подается со&nbsp;сладкой горчицей и&nbsp;тушеной капустой.",
          img: "https://schneider-weisse.ru/images/dishes/1_2.jpg",
          pairing: "Идеально дополняется органическим пшеничным пивом Schneider Weisse TAP-4."
        },
        {
          name: "Салат с фенхелем и яблоком",
          price: "640 ₽",
          desc: "Легкий капустный салат со&nbsp;свежим хрустящим фенхелем, спелыми зелеными яблоками и&nbsp;ароматной заправкой.",
          img: "https://schneider-weisse.ru/images/dishes/1_4.jpg",
          pairing: "Свежий салат прекрасно гармонирует со&nbsp;светлым пшеничным Schneider Weisse TAP-1."
        },
        {
          name: "Домашние мясные деликатесы",
          price: "1 250 ₽",
          desc: "Традиционное мясное ассорти: сочная буженина, нежный ростбиф и&nbsp;домашний балык. Подается с&nbsp;хреном и&nbsp;горчицей.",
          img: "https://schneider-weisse.ru/images/dishes/1.jpg",
          pairing: "Отличная закуска под&nbsp;классическое пшеничное пиво Schneider Weisse TAP-7."
        },
        {
          name: "Сырная тарелка",
          price: "2 100 ₽",
          desc: "Ассорти благородных баварских и&nbsp;европейских сыров, подается с&nbsp;натуральным медом, свежими ягодами и&nbsp;грецкими орехами.",
          img: "https://schneider-weisse.ru/images/dishes/12.jpg",
          pairing: "Изысканное сочетание с&nbsp;плотным Aventinus Eisbock или&nbsp;хмельным TAP-5."
        }
      ],
      beer: [
        {
          name: "Schneider Weisse TAP 7 Unser Original",
          price: "545 ₽",
          desc: "Классическое нефильтрованное баварское пшеничное пиво, сваренное по&nbsp;оригинальному семейному рецепту с&nbsp;1872 года. 0.5л",
          img: "https://schneider-weisse.ru/images/dishes/3.jpg",
          pairing: "Лучше всего сочетается со&nbsp;свиной рулькой на&nbsp;вертеле или&nbsp;нюрнбергскими колбасками."
        },
        {
          name: "Schneider Weisse TAP 6 Unser Aventinus",
          price: "595 ₽",
          desc: "Темный пшеничный двойной бок высокой крепости. Обладает богатым ароматом сливы, гвоздики и&nbsp;темного шоколада. 0.5л",
          img: "https://schneider-weisse.ru/images/dishes/5.jpg",
          pairing: "Отлично подчеркнет вкус благородных сыров и&nbsp;наваристых баварских супов."
        },
        {
          name: "Schneider Weisse TAP 4 Festweisse",
          price: "545 ₽",
          desc: "Праздничное золотистое пшеничное пиво с&nbsp;ярким хмелевым ароматом и&nbsp;легкими цитрусовыми нотками. 0.5л",
          img: "https://schneider-weisse.ru/images/dishes/10.jpg",
          pairing: "Подходит к&nbsp;острым горячим закускам и&nbsp;баварским колбаскам гриль."
        },
        {
          name: "Schneider Weisse TAP 1 Meine blonde Weisse",
          price: "545 ₽",
          desc: "Светлое пшеничное пиво с&nbsp;приятным свежим ароматом цветов и&nbsp;фруктов, идеальный аперитив. 0.5л",
          img: "https://schneider-weisse.ru/images/dishes/13.jpg",
          pairing: "Легкий освежающий сорт гармонирует с&nbsp;рыбой на&nbsp;гриле и&nbsp;легкими овощными салатами."
        }
      ],
      bar: [
        {
          name: "Традиционный немецкий шнапс",
          price: "480 ₽",
          desc: "Аутентичный дистиллят на&nbsp;основе груши или&nbsp;яблока, поставляемый напрямую из&nbsp;Баварии. 50мл",
          img: "https://schneider-weisse.ru/images/dishes/9.jpg",
          pairing: "Традиционно подается в&nbsp;качестве дижестива в&nbsp;завершение баварского обеда."
        },
        {
          name: "Фирменная травяная настойка",
          price: "350 ₽",
          desc: "Пряная настойка на&nbsp;основе альпийских трав, приготовленная по&nbsp;собственному рецепту шеф-повара. 50мл",
          img: "https://schneider-weisse.ru/images/dishes/14.jpg",
          pairing: "Идеально подходит для&nbsp;улучшения пищеварения после&nbsp;сытных мясных блюд."
        }
      ],
      kids: [
        {
          name: "Детские мини-сосиски",
          price: "450 ₽",
          desc: "Нежные молочные сосиски гриль с&nbsp;картофельным пюре в&nbsp;форме смайлика и&nbsp;томатным соусом.",
          img: "https://schneider-weisse.ru/images/dishes/12.jpg",
          pairing: "Подается с&nbsp;натуральным яблочным или&nbsp;мультифруктовым соком."
        },
        {
          name: "Куриные наггетсы с фри",
          price: "420 ₽",
          desc: "Хрустящие домашние наггетсы из&nbsp;филе цыпленка с&nbsp;золотистым картофелем и&nbsp;нежным сырным соусом.",
          img: "https://schneider-weisse.ru/images/dishes/1_1.jpg",
          pairing: "Прекрасный выбор для&nbsp;юных гостей в&nbsp;паре с&nbsp;молочным коктейлем."
        }
      ],
      specials: [
        {
          name: "Летний салат с уткой",
          price: "780 ₽",
          desc: "Хрустящие листья салата с&nbsp;утиной грудкой конфи, спелым яблоком и&nbsp;легким соусом из&nbsp;свежих лесных ягод.",
          img: "https://schneider-weisse.ru/images/dishes/1_4.jpg",
          pairing: "Спелое утиное мясо раскрывается в&nbsp;сочетании с&nbsp;хмельным пивом TAP-4 Festweisse."
        },
        {
          name: "Баварский фирменный бургер",
          price: "890 ₽",
          desc: "Стейк из&nbsp;мраморной говядины на&nbsp;гриле, карамелизированный лук, сыр чеддер и&nbsp;соус на&nbsp;пиве TAP-7.",
          img: "https://schneider-weisse.ru/images/dishes/1_2.jpg",
          pairing: "Превосходно сочетается с&nbsp;бокалом классического пива TAP-7 Unser Original."
        }
      ]
    },
    en: {
      kitchen: [
        {
          name: "Pork Knuckle on a Spit",
          price: "1,950 ₽",
          desc: "Signature pork knuckle baked in TAP-7 beer glaze according to an old Munich recipe. Served with traditional sauerkraut.",
          img: "https://schneider-weisse.ru/images/dishes/1_1.jpg",
          pairing: "We recommend pairing with a glass of dark, rich Schneider Weisse TAP-6."
        },
        {
          name: "Assorted Bavarian Sausages",
          price: "1,100 ₽",
          desc: "A selection of premium German grilled sausages made in-house. Served with sweet mustard and stewed cabbage.",
          img: "https://schneider-weisse.ru/images/dishes/1_2.jpg",
          pairing: "Perfectly complemented by organic wheat beer Schneider Weisse TAP-4."
        },
        {
          name: "Fennel & Green Apple Salad",
          price: "640 ₽",
          desc: "Crisp fresh fennel and sweet green apples dressed with a light herb-citrus vinaigrette. Very refreshing.",
          img: "https://schneider-weisse.ru/images/dishes/1_4.jpg",
          pairing: "This fresh salad pairs wonderfully with light wheat Schneider Weisse TAP-1."
        },
        {
          name: "Assorted Homemade Cold Cuts",
          price: "1,250 ₽",
          desc: "Traditional cold meat board: juicy baked pork, tender roast beef and homemade balyk. Served with horseradish and mustard.",
          img: "https://schneider-weisse.ru/images/dishes/1.jpg",
          pairing: "Excellent appetizer paired with the classic wheat beer Schneider Weisse TAP-7."
        },
        {
          name: "Bavarian Cheese Platter",
          price: "2,100 ₽",
          desc: "A selection of premium Bavarian and European cheeses, served with natural honey, fresh forest berries and walnuts.",
          img: "https://schneider-weisse.ru/images/dishes/12.jpg",
          pairing: "An exquisite combo with robust Aventinus Eisbock or hoppy TAP-5."
        }
      ],
      beer: [
        {
          name: "Schneider Weisse TAP 7 Unser Original",
          price: "545 ₽",
          desc: "The classic wheat beer brewed according to Georg I Schneider's original recipe of 1872. Unfiltered and full-bodied. 0.5L",
          img: "https://schneider-weisse.ru/images/dishes/3.jpg",
          pairing: "Pairs best with pork knuckle on a spit or Nuremberg sausages."
        },
        {
          name: "Schneider Weisse TAP 6 Unser Aventinus",
          price: "595 ₽",
          desc: "A dark and complex wheat doppelbock with rich notes of plum, chocolate, and a warming alcoholic body. 0.5L",
          img: "https://schneider-weisse.ru/images/dishes/5.jpg",
          pairing: "Excellent enhancer for premium cheeses and rich Bavarian soups."
        },
        {
          name: "Schneider Weisse TAP 4 Festweisse",
          price: "545 ₽",
          desc: "Festive golden wheat beer with a pronounced hop aroma and fresh citrus notes. 0.5L",
          img: "https://schneider-weisse.ru/images/dishes/10.jpg",
          pairing: "Goes great with spicy hot appetizers and Bavarian grilled sausages."
        },
        {
          name: "Schneider Weisse TAP 1 Meine blonde Weisse",
          price: "545 ₽",
          desc: "Pale wheat beer with a pleasant fresh aroma of flowers and fruits, an ideal aperitif. 0.5L",
          img: "https://schneider-weisse.ru/images/dishes/13.jpg",
          pairing: "Light refreshing brew matches grilled fish and fresh garden salads."
        }
      ],
      bar: [
        {
          name: "Traditional German Schnapps",
          price: "480 ₽",
          desc: "Authentic pear or apple distillate imported directly from Bavaria. 50ml",
          img: "https://schneider-weisse.ru/images/dishes/9.jpg",
          pairing: "Traditionally served as a digestif to round up your Bavarian lunch."
        },
        {
          name: "House Herbal Bitter Infusion",
          price: "350 ₽",
          desc: "Spicy herbal bitter made with Alpine herbs according to the Chef's own secret recipe. 50ml",
          img: "https://schneider-weisse.ru/images/dishes/14.jpg",
          pairing: "Perfect for improving digestion after rich meat main courses."
        }
      ],
      kids: [
        {
          name: "Children's Mini-Sausages",
          price: "450 ₽",
          desc: "Tender milk sausages grilled, served with potato mash in a smiley shape and tomato ketchup.",
          img: "https://schneider-weisse.ru/images/dishes/12.jpg",
          pairing: "Served with organic apple or multi-fruit juice."
        },
        {
          name: "Chicken Nuggets with French Fries",
          price: "420 ₽",
          desc: "Crispy homemade chicken breast nuggets with golden fries and mild cheese dipping sauce.",
          img: "https://schneider-weisse.ru/images/dishes/1_1.jpg",
          pairing: "Perfect choice for kids, pairs nicely with a sweet milkshake."
        }
      ],
      specials: [
        {
          name: "Summer Salad with Duck",
          price: "780 ₽",
          desc: "Crisp mixed leaves with duck breast confit, ripe apple and a light wild berry sauce.",
          img: "https://schneider-weisse.ru/images/dishes/1_4.jpg",
          pairing: "Tender duck meat pairs beautifully with the hoppy TAP-4 Festweisse."
        },
        {
          name: "Bavarian Signature Burger",
          price: "890 ₽",
          desc: "Grilled marble beef patty, caramelized onions, cheddar cheese and a rich sauce infused with TAP-7 beer.",
          img: "https://schneider-weisse.ru/images/dishes/1_2.jpg",
          pairing: "Pairs excellently with a glass of classic TAP-7 Unser Original."
        }
      ]
    }
  };

  const menuGrid = document.getElementById('menu-grid-items');
  const filterBtns = document.querySelectorAll('.menu-filter-btn');

  function renderMenu(category) {
    const lang = isEn ? 'en' : 'ru';
    const items = menuData[lang][category] || [];
    
    if (typeof gsap !== 'undefined' && menuGrid.children.length > 0) {
      gsap.to(menuGrid.children, {
        opacity: 0,
        y: -15,
        filter: 'blur(5px)',
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => populateAndFadeIn()
      });
    } else {
      populateAndFadeIn();
    }

    function populateAndFadeIn() {
      menuGrid.innerHTML = '';
      
      items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'menu-card glass-card';
        card.innerHTML = `
          <div class="menu-card-img-wrap">
            <img src="${item.img}" alt="${item.name}" class="menu-card-img" loading="lazy">
          </div>
          <div class="menu-card-content">
            <div class="menu-card-header">
              <h3 class="menu-card-title font-display">${item.name}</h3>
              <span class="menu-card-price font-display">${item.price}</span>
            </div>
            <p class="menu-card-desc">${item.desc}</p>
            <div class="menu-card-actions">
              <button class="btn btn-secondary btn-card-details" data-index="${index}">
                <span>${isEn ? 'Details' : 'Подробнее'}</span>
              </button>
            </div>
          </div>
        `;
        menuGrid.appendChild(card);
      });

      const detailBtns = menuGrid.querySelectorAll('.btn-card-details');
      detailBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.currentTarget.getAttribute('data-index');
          openDishModal(items[index]);
        });
      });

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(menuGrid.children, 
          { opacity: 0, y: 30, filter: 'blur(10px)', scale: 0.96 },
          { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
        );
      }
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const category = e.currentTarget.getAttribute('data-category');
      renderMenu(category);
    });
  });

  if (menuGrid) {
    renderMenu('kitchen');
  }

  /* ==========================================================================
     10. DISH DETAIL MODAL WINDOW
     ========================================================================== */
  const dishModal = document.getElementById('dish-modal');
  const modalCloseBtn = dishModal ? dishModal.querySelector('.modal-close') : null;

  function openDishModal(dish) {
    if (!dishModal) return;
    
    dishModal.querySelector('.modal-img').src = dish.img;
    dishModal.querySelector('.modal-img').alt = dish.name;
    dishModal.querySelector('.modal-title').innerText = dish.name;
    dishModal.querySelector('.modal-price').innerText = dish.price;
    dishModal.querySelector('.modal-desc').innerText = dish.desc;
    dishModal.querySelector('.modal-pairing-text').innerText = dish.pairing;

    const modalTag = dishModal.querySelector('.modal-tag');
    const modalPairTitle = dishModal.querySelector('.modal-pairing-title');
    const modalBookBtn = dishModal.querySelector('.modal-book-btn');

    if (isEn) {
      if (modalTag) modalTag.innerText = "Signature Choice";
      if (modalPairTitle) modalPairTitle.innerText = "Perfect Beer Pairing:";
      if (modalBookBtn) {
        modalBookBtn.innerText = "Book Table";
        modalBookBtn.href = "#booking";
      }
    } else {
      if (modalTag) modalTag.innerText = "Фирменное блюдо";
      if (modalPairTitle) modalPairTitle.innerText = "Идеальное пивное сопровождение:";
      if (modalBookBtn) {
        modalBookBtn.innerText = "Забронировать стол";
        modalBookBtn.href = "#booking";
      }
    }

    dishModal.classList.add('open');
    if (lenis) lenis.stop();

    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.modal-container', 
        { scale: 0.92, opacity: 0, filter: 'blur(10px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power4.out' }
      );
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      dishModal.classList.remove('open');
      if (lenis) lenis.start();
    });

    dishModal.addEventListener('click', (e) => {
      if (e.target === dishModal) {
        dishModal.classList.remove('open');
        if (lenis) lenis.start();
      }
    });
  }

  /* ==========================================================================
     11. DEDICATED FULLSCREEN BOOKING MODAL
     ========================================================================== */
  const bookingModal = document.getElementById('booking-modal');
  const bookingModalClose = document.getElementById('booking-modal-close');
  const openBookingBtns = document.querySelectorAll('.js-open-booking');

  openBookingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!bookingModal) return;
      
      bookingModal.classList.add('open');
      if (lenis) lenis.stop();

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(bookingModal.querySelector('.modal-container'), 
          { scale: 0.92, opacity: 0, filter: 'blur(10px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power4.out' }
        );
      }
    });
  });

  if (bookingModalClose && bookingModal) {
    bookingModalClose.addEventListener('click', () => {
      bookingModal.classList.remove('open');
      if (lenis) lenis.start();
    });

    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal || e.target.classList.contains('modal-container')) {
        bookingModal.classList.remove('open');
        if (lenis) lenis.start();
      }
    });
  }

  /* ==========================================================================
     12. GALLERY LIGHTBOX & MASONRY
     ========================================================================== */
  const galleryItems = document.querySelectorAll('.masonry-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
  
  let currentImgIndex = 0;
  const galleryImagesData = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-img-title');
    galleryImagesData.push({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || 'Schneider Weisse Gallery',
      caption: caption ? caption.textContent.trim() : 'Atmosphere'
    });

    item.addEventListener('click', () => {
      currentImgIndex = index;
      openLightbox(index);
    });
  });

  function openLightbox(index) {
    if (!lightbox) return;
    const data = galleryImagesData[index];
    if (lightboxImg) {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
    }
    if (lightboxCaption) lightboxCaption.innerText = data.caption;
    
    lightbox.classList.add('open');
    if (lenis) lenis.stop();

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(lightboxImg, 
        { scale: 0.95, opacity: 0, filter: 'blur(5px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }
      );
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('open');
      if (lenis) lenis.start();
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });

    if (lightboxNext) {
      lightboxNext.addEventListener('click', () => {
        currentImgIndex = (currentImgIndex + 1) % galleryImagesData.length;
        openLightbox(currentImgIndex);
      });
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', () => {
        currentImgIndex = (currentImgIndex - 1 + galleryImagesData.length) % galleryImagesData.length;
        openLightbox(currentImgIndex);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!lightbox || !lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
      if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
    });
  }

  /* ==========================================================================
     13. TABLE BOOKING FORM SUBMISSION
     ========================================================================== */
  const bookingForm = document.getElementById('contact-booking-form');
  const successMessage = document.getElementById('booking-success-message');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Booking form submit handler triggered.');

      const nameInput = document.getElementById('booking-name');
      const phoneInput = document.getElementById('booking-phone');
      const guestsInput = document.getElementById('booking-guests');
      const dateInput = document.getElementById('booking-date');
      const timeInput = document.getElementById('booking-time');
      const commentInput = document.getElementById('booking-text');
      const agreeDataInput = document.getElementById('booking-agree-data');
      const agreePromoInput = document.getElementById('booking-agree-promo');

      console.log('Retrieved DOM input values:', {
        name: nameInput ? nameInput.value : null,
        phone: phoneInput ? phoneInput.value : null,
        guests: guestsInput ? guestsInput.value : null,
        date: dateInput ? dateInput.value : null,
        time: timeInput ? timeInput.value : null,
        comment: commentInput ? commentInput.value : null,
        agreeData: agreeDataInput ? agreeDataInput.checked : null,
        agreePromo: agreePromoInput ? agreePromoInput.checked : null
      });

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const guests = guestsInput ? guestsInput.value.trim() : '';
      const date = dateInput ? dateInput.value : '';
      const time = timeInput ? timeInput.value : '';
      const comment = commentInput ? commentInput.value.trim() : '';
      
      const agreeData = agreeDataInput ? agreeDataInput.checked : false;
      const agreePromo = agreePromoInput ? agreePromoInput.checked : false;

      // Check fields programmatically
      if (!name || !phone || !guests || !date || !time) {
        console.warn('Form validation failed: missing required inputs.');
        alert(isEn ? 'Please fill in all required fields.' : 'Пожалуйста, заполните все обязательные поля.');
        return;
      }

      if (!agreeData) {
        console.warn('Form validation failed: user did not consent to data processing.');
        alert(isEn 
          ? 'You must consent to personal data processing to proceed.' 
          : 'Вы должны согласиться на обработку персональных данных для продолжения.');
        return;
      }

      console.log('Form validation passed successfully.');

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>${isEn ? 'Processing...' : 'Отправка...'}</span>`;

      const payload = { name, phone, guests, date, time, comment, agreePromo };
      console.log('Sending request to /api/sendTelegram with payload:', payload);

      // Real fetch call to secure server API endpoint
      fetch('/api/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        console.log('Server responded with HTTP status code:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Parsed server response JSON data:', data);
        if (data.success) {
          console.log('Booking request completed successfully.');
          submitBtn.style.display = 'none';
          
          if (successMessage) {
            const successText = successMessage.querySelector('p');
            if (successText) {
              successText.innerHTML = isEn 
                ? 'Thank you! Your request has been sent. We will contact you to confirm your booking.' 
                : 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами для подтверждения бронирования.';
            }
            
            successMessage.classList.remove('hidden');
            
            if (typeof gsap !== 'undefined') {
              gsap.fromTo(successMessage, 
                { opacity: 0, y: 15, filter: 'blur(5px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }
              );
            }
          }
          
          bookingForm.reset();
          
          // Auto-close booking modal after a success delay (4.5s)
          setTimeout(() => {
            if (bookingModal) {
              bookingModal.classList.remove('open');
              if (lenis) lenis.start();
            }
            // Reset button display for future bookings
            setTimeout(() => {
              if (successMessage) successMessage.classList.add('hidden');
              submitBtn.style.display = 'flex';
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }, 600);
          }, 3500);
        } else {
          console.error('Server returned booking error:', data.error);
          alert(isEn ? 'Error sending request: ' + data.error : 'Ошибка отправки заявки: ' + data.error);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      })
      .catch(error => {
        console.error('Fetch connection error:', error);
        alert(isEn ? 'Connection error, please try again.' : 'Ошибка сети, попробуйте еще раз.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      });
    });
  }
});

// Refresh ScrollTrigger calculations after all resources (fonts, images) are fully loaded
window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
});
