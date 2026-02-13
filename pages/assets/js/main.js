function loaderIndex() {
    const isIndex = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    const loader = document.querySelector('.loader');
    const forceHideLoader = () => {
        if (!loader) return;
        loader.style.display = 'none';
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    };
    if (!isIndex) {
        return Promise.resolve();
    }
    
    // Qui controllo se siamo su index e se sono passati almeno 10 minuti
    const loaderCooldownMs = 10 * 60 * 1000;
    const lastLoader = Number(localStorage.getItem("lastLoaderAt") || 0);
    const shouldShowLoader = !lastLoader || (Date.now() - lastLoader) >= loaderCooldownMs;
    
    if (isIndex && shouldShowLoader) {
        // Mostra preloader se sono passati almeno 10 minuti
        return new Promise((resolve) => {
            let counter = { val: 0 };
            const numberEl = document.querySelector('.hundred');
            const bg = document.querySelector('.bg');
            const nav = document.querySelector('nav');
            const footer = document.querySelector('footer');
            const logoLink = document.querySelector('.logo-link');
            const svg = document.querySelector('.hero-svg'); 
            const wedding = document.querySelector('.wedding');
            const portfolio = document.querySelector('.portfolio');
            const loader = document.querySelector('.loader');
            const revealChrome = () => {
                if (nav) {
                    nav.classList.remove("nav-rebuilding");
                    nav.style.pointerEvents = "";
                }
                if (footer) {
                    footer.style.pointerEvents = "";
                }
                if (logoLink) {
                    logoLink.style.pointerEvents = "";
                }
                if (window.gsap) {
                    gsap.set([nav, footer, logoLink], { clearProps: "opacity,visibility" });
                } else {
                    if (nav) {
                        nav.style.opacity = "1";
                        nav.style.visibility = "visible";
                    }
                    if (footer) {
                        footer.style.opacity = "1";
                        footer.style.visibility = "visible";
                    }
                    if (logoLink) {
                        logoLink.style.opacity = "1";
                        logoLink.style.visibility = "visible";
                    }
                }
            };
            
            if (!window.gsap || !numberEl || !bg || !loader) {
                forceHideLoader();
                localStorage.setItem("lastLoaderAt", String(Date.now()));
                document.body.classList.add("loader-done");
                document.body.classList.remove("loader-active");
                document.body.classList.remove("loader-pending");
                revealChrome();
                resolve();
                return;
            }
            
            document.body.classList.add("loader-pending");
            document.body.classList.add("loader-active");
            if (numberEl) {
                numberEl.textContent = "0%";
            }
            if (window.gsap && bg) {
                gsap.set(bg, { transform: "translateY(-100%)" });
            }
            const showLoader = () => {
                loader.style.display = "block";
                loader.style.opacity = "1";
                loader.style.visibility = "visible";
            };
            
            const waitForFont = () => {
                if (!document.fonts || !document.fonts.load) {
                    return Promise.resolve();
                }
                document.body.classList.add("fonts-loading");
                const fontPromise = document.fonts.load('16px "Radikal W03 Light"');
                const timeout = new Promise((res) => setTimeout(res, 1500));
                return Promise.race([fontPromise, timeout]).finally(() => {
                    document.body.classList.remove("fonts-loading");
                });
            };
            
            showLoader();
            waitForFont().then(() => {
                gsap.to(counter, {
                    val: 100,
                    duration: 3,
                    ease: "power2.out",
                    onUpdate: () => {
                        const percent = counter.val;
                        numberEl.textContent = `${Math.floor(percent)}%`;
                        gsap.set(bg, {
                            transform: `translateY(${-100 + percent}%)`
                        });
                    },
                    onComplete: () => {
                        gsap.to(".bg", {
                            duration: 1,
                            ease: "power4.inOut",
                            onComplete: () => {
                                gsap.to(numberEl, {
                                    duration: 1,
                                    autoAlpha: 0,
                                    ease: "power4.inOut"
                                });
                            gsap.set(loader, {
                                autoAlpha: 0,
                                duration: 2,
                            });
                            gsap.from([svg, footer, nav], {
                                duration: 1.2,
                                autoAlpha: 0,
                                ease: "power2.out"
                            });
                            gsap.from([wedding, portfolio], {
                                delay: 1,
                                duration: 2.3,
                                autoAlpha: 0,
                                ease: "power2.out"
                            });
                            gsap.to(".loader", {
                                duration: 0.5,
                                autoAlpha: 0
                            });
                            
                            // 🔥 Alla fine di tutto, salvo nel localStorage
                                localStorage.setItem("lastLoaderAt", String(Date.now()));
                                document.body.classList.add("loader-done");
                                document.body.classList.remove("loader-active");
                                document.body.classList.remove("loader-pending");
                                revealChrome();
                                resolve();
                            }
                        });
                    }
                });
            });
        });
        
    } else if (isIndex && !shouldShowLoader) {
        // Se è index ma non sono passati 10 minuti -> nascondi subito loader
        if (loader) {
            forceHideLoader();
        }
        document.body.classList.add("loader-done");
        document.body.classList.remove("loader-active");
        document.body.classList.remove("loader-pending");
        const nav = document.querySelector("nav");
        const footer = document.querySelector("footer");
        const logoLink = document.querySelector(".logo-link");
        if (nav) nav.classList.remove("nav-rebuilding");
        if (window.gsap) {
            gsap.set([nav, footer, logoLink], { clearProps: "opacity,visibility" });
        } else {
            if (nav) {
                nav.style.opacity = "1";
                nav.style.visibility = "visible";
            }
            if (footer) {
                footer.style.opacity = "1";
                footer.style.visibility = "visible";
            }
            if (logoLink) {
                logoLink.style.opacity = "1";
                logoLink.style.visibility = "visible";
            }
        }
        return Promise.resolve();
    }
    return Promise.resolve();
}


let direction = window.innerWidth <= 480 ? { x: -50 } : { y: -50 };

function animateTitle() {
    if (!window.gsap) return;
    if (!document.querySelector(".title")) return;
    gsap.fromTo(
        ".title",
        { autoAlpha: 0, ...direction },
        {
            duration: 1,
            autoAlpha: 1,
            x: 0,
            y: 0,
            ease: "back.out(1)"
        }
    );
}


const stickyState = {
    clickHandler: null,
    scrollHandler: null,
    tickerHandler: null,
    trigger: null
};

function teardownSticky() {
    const backToTop = document.querySelector(".backToTheTop");
    if (stickyState.clickHandler && backToTop) {
        backToTop.removeEventListener("click", stickyState.clickHandler);
    }
    if (stickyState.scrollHandler) {
        window.removeEventListener("scroll", stickyState.scrollHandler);
    }
    if (stickyState.tickerHandler && window.gsap) {
        gsap.ticker.remove(stickyState.tickerHandler);
    }
    if (stickyState.trigger) {
        stickyState.trigger.kill();
    }
    stickyState.clickHandler = null;
    stickyState.scrollHandler = null;
    stickyState.tickerHandler = null;
    stickyState.trigger = null;
}

function stickyAndBackToTheTop(scope){
    const root = scope || document;
    const backToTop = root.querySelector(".backToTheTop");
    const infosContainer = root.querySelector(".infosContainer");
    
    if (!backToTop) {
        return;
    }
    
    teardownSticky();
    
    let shown = false;
    let fixed = false;
    const smoother = window.ScrollSmoother && ScrollSmoother.get ? ScrollSmoother.get() : null;
    const getScrollY = () => smoother ? smoother.scrollTop() : window.scrollY;
    const infosOffset = infosContainer
    ? infosContainer.getBoundingClientRect().top + getScrollY()
    : 0;
    const useScrollTrigger = !!window.ScrollTrigger;
    const setY = infosContainer
    ? gsap.quickTo(infosContainer, "y", { duration: 0.2, ease: "power3.out" })
    : null;
    const baseTopPx = () => window.innerWidth * 0.188;
    const fixedTopPx = 30;
    
    stickyState.clickHandler = (event) => {
        event.preventDefault();
        if (smoother) {
            gsap.to(smoother, { scrollTop: 0, duration: 0.8, ease: "power2.out" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };
    backToTop.addEventListener("click", stickyState.clickHandler);
    
    const update = () => {
        const scrollY = getScrollY();
        const triggerPoint = window.innerHeight / 3;
        const infosOffsetValue = infosOffset;
        
        // Back to top animation
        if (scrollY > triggerPoint && !shown) {
            shown = true;
            gsap.to(backToTop, {
                duration: 0.6,
                bottom: 50,
                opacity: 1,
                ease: "power2.out",
                pointerEvents: "auto"
            });
        } else if (scrollY <= triggerPoint && shown) {
            shown = false;
            gsap.to(backToTop, {
                duration: 0.6,
                bottom: -100,
                opacity: 0,
                ease: "power2.in",
                pointerEvents: "none"
            });
        }
        
        if (!infosContainer) {
            return;
        }
        
        // InfosContainer sticky logic
        if (!useScrollTrigger && infosContainer) {
            if (scrollY >= infosOffsetValue - 10 && !fixed) {
                fixed = true;
                infosContainer.classList.add("fixed");
                gsap.fromTo(infosContainer, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
            }
        }
        
        if (fixed) {
            const desiredTop = infosOffsetValue - scrollY;
            if (desiredTop >= baseTopPx()) {
                infosContainer.classList.remove("fixed");
                setY(0);
                fixed = false;
            } else if (desiredTop > fixedTopPx) {
                setY(Math.min(desiredTop, baseTopPx()) - fixedTopPx);
            } else {
                setY(desiredTop - fixedTopPx);
                setY(0);
            }
        } else if (scrollY < infosOffsetValue - baseTopPx()) {
            setY(0);
        }
    };
    
    if (useScrollTrigger && infosContainer) {
        stickyState.trigger = ScrollTrigger.create({
            trigger: infosContainer,
            start: "top top+=10",
            onEnter: () => {
                infosContainer.classList.add("fixed");
                gsap.fromTo(infosContainer, { y: -30, opacity: 1 }, { y: 0, opacity: 1, duration: 0.4 });
                fixed = true;
            },
            onLeaveBack: () => {
                // gestione rientro nel loop update()
            }
        });
    }
    
    if (smoother) {
        stickyState.tickerHandler = update;
        gsap.ticker.add(update);
    } else {
        stickyState.scrollHandler = update;
        window.addEventListener("scroll", update);
    }
    
    update();
}

function rollingText(){
    let elements = document.querySelectorAll('.rolling-text');
    
    elements.forEach((element)=>{
        if (!element.dataset.rollingOriginal) {
            element.dataset.rollingOriginal = element.textContent;
        }
        if (element.dataset.rollingReinit === "true") {
            element.style.opacity = "0";
            element.dataset.rollingInit = "false";
            element.dataset.rollingReinit = "false";
        }
        if (element.dataset.rollingInit === "true") {
            return;
        }
        let innerText = element.dataset.rollingOriginal || element.innerText;
        element.innerHTML = "";
        
        let textContainer = document.createElement("div");
        textContainer.classList.add("block");
        
        for(let letter of innerText){
            let span = document.createElement("span");
            span.innerText = letter.trim() === "" ? "\xa0" : letter;
            span.classList.add("letter");
            textContainer.appendChild(span);
        }
        
        element.appendChild(textContainer);
        element.appendChild(textContainer.cloneNode(true));
        element.dataset.rollingInit = "true";
        if (element.style.opacity === "0") {
            requestAnimationFrame(() => {
                element.style.opacity = "";
            });
        }
    });
    elements.forEach((element) =>{
        if (element.dataset.rollingHoverBound === "true") {
            return;
        }
        element.addEventListener("click", () => {
            element.classList.add("clicked");
        });
        element.addEventListener("mouseover", ()=>{
            element.classList.remove("play");
        });
        element.dataset.rollingHoverBound = "true";
    })
}

function getCurrentLang() {
    return localStorage.getItem("lang") || "it";
}

function initLanguageSwitch() {
    const switches = document.querySelectorAll(".lang-switch");
    if (!switches.length) {
        return;
    }
    
    switches.forEach(btn => {
        if (btn.dataset.langBound === "true") {
            return;
        }
        btn.addEventListener("click", () => {
            const lang = btn.getAttribute("data-lang");
            localStorage.setItem("lang", lang);
            
            // Aggiorna la classe attiva prima del reload
            switches.forEach(el => el.classList.remove("active"));
            btn.classList.add("active");
            
            location.reload(); // Ricarichi la pagina con la nuova lingua
        });
        btn.dataset.langBound = "true";
    });
    
    // All'avvio, evidenzia la lingua corrente
    const currentLang = getCurrentLang();
    switches.forEach(btn => {
        if (btn.getAttribute("data-lang") === currentLang) {
            btn.classList.add("active");
        }
    });
}

function initReferrerAnimation() {
    const back = document.querySelector(".back");
    const infosContainer = document.querySelector(".infosContainer");
    
    if (!back) {
        return;
    }
    
    const targets = infosContainer ? [back, infosContainer] : [back];
    
    // Controlla se l'utente arriva da una delle pagine specifiche (portfolio.html o wedding.html)
    const referrer = document.referrer;
    
    // Nessuna animazione GSAP: lasciamo gestire la dissolvenza da Barba
    gsap.set(targets, { opacity: 1, x: 0, visibility: "visible" });
}


function zoomImageAlbumHover(){
    const imgs = document.querySelectorAll('.hoverImageAlbum');
    
    imgs.forEach(img => {
        const innerImg = img.querySelector("img");
        const scale = Number(img.dataset.scale) || 1.03;
        img.addEventListener('mouseenter', () => {
            if (innerImg) {
                gsap.to(innerImg, {
                    scale,
                    duration: .9,
                    ease: "power2.out"
                });
                return;
            }
            gsap.to(img, {
                backgroundSize: "107%",
                duration: .9,
                ease: "power2.out"
            });
        });
        
        img.addEventListener('mouseleave', () => {
            if (innerImg) {
                gsap.to(innerImg, {
                    scale: 1,
                    duration: .9,
                    ease: "power2.out"
                });
                return;
            }
            gsap.to(img, {
                backgroundSize: "105%",
                duration: .9,
                ease: "power2.out"
            });
        });
    });
}

function initNavFooter() {
    const host = document.querySelector('[data-barba="wrapper"]') || document.body;
    if (!document.querySelector("nav")) {
        const navMarkup = `
        <nav>
            <div class="about">
                <a href="./about.html" class="rolling-text nav-about-link">About</a>
            </div>
            <div class="language">
                <span class="lang-switch" data-lang="it">IT</span>
                <span>&mdash;</span>
                <span class="lang-switch" data-lang="en">EN</span>
            </div>
        </nav>
        `;
        host.insertAdjacentHTML("afterbegin", navMarkup);
    }
    
    const nav = document.querySelector("nav");
    if (nav) {
        nav.classList.add("nav-rebuilding");
    }
    if (!document.body.dataset.navClickBound) {
        document.addEventListener("click", (event) => {
            const link = event.target.closest("a");
            if (!link) {
                return;
            }
            const aboutLink = document.querySelector(".nav-about-link");
            if (aboutLink && aboutLink !== link) {
                aboutLink.classList.remove("nav-active");
                aboutLink.removeAttribute("aria-current");
            }
            const rollingLinks = document.querySelectorAll(".rolling-text.clicked");
            const animateOut = (els) => {
                els.forEach((el) => el.classList.add("rolling-exit"));
                clearTimeout(document.body._rollingExitTimer);
                document.body._rollingExitTimer = setTimeout(() => {
                    els.forEach((el) => {
                        el.classList.remove("clicked");
                        el.classList.remove("rolling-exit");
                    });
                }, 450);
            };
            if (link.classList.contains("rolling-text")) {
                const others = Array.from(rollingLinks).filter((el) => el !== link);
                animateOut(others);
            } else {
                animateOut(Array.from(rollingLinks));
            }
        });
        document.body.dataset.navClickBound = "true";
    }
    
    document.querySelectorAll("nav .rolling-text").forEach((element) => {
        if (!element.dataset.rollingOriginal) {
            element.dataset.rollingOriginal = element.textContent;
        }
        element.dataset.rollingReinit = "true";
    });
    
    if (!document.querySelector("footer")) {
        const footerMarkup = `
        <footer>
            <div>©<span data-current-year></span></div>
            <div class="msResponsive">
                <div class="mail">
                    <a class="hoverBottomText" href="mailto:info@andreamortelliti.it">info@andreamortelliti.it</a>
                </div>
                <div class="socials">
                    <span><a class="hoverBottomText" href="https://www.instagram.com/andreamortelliti_photography/" target="_blank" rel="noopener">IG</a> /</span>
                    <span><a class="hoverBottomText" href="https://www.facebook.com/andreamortelliti.photographer/" target="_blank" rel="noopener">FB</a> /</span>
                    <a class="hoverBottomText" href="https://www.linkedin.com/in/andrea-mortelliti-976462142/" target="_blank" rel="noopener">LI</a>
                </div>
            </div>
        </footer>
        `;
        host.insertAdjacentHTML("beforeend", footerMarkup);
    }
    
    const aboutLink = document.querySelector(".nav-about-link");
    if (aboutLink) {
        if (window.location.pathname.endsWith("about.html")) {
            aboutLink.classList.add("nav-active");
            aboutLink.setAttribute("aria-current", "page");
        } else {
            aboutLink.classList.remove("nav-active");
            aboutLink.removeAttribute("aria-current");
        }
    }
}

function initFooterYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll("[data-current-year]").forEach((el) => {
        el.textContent = year;
    });
}

function initGridOverlay() {
    const gridId = "layout-grid-overlay";
    if (document.getElementById(gridId)) {
        return;
    }
    
    const grid = document.createElement("div");
    grid.className = "grid grid-overlay";
    grid.id = gridId;
    
    for (let i = 0; i < 12; i++) {
        grid.appendChild(document.createElement("div"));
    }
    
    document.body.appendChild(grid);
    
    let toggleBtn = document.getElementById("grid-toggle-btn");
    if (!toggleBtn) {
        toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.id = "grid-toggle-btn";
        toggleBtn.className = "grid-toggle-btn";
        toggleBtn.textContent = "Grid";
        document.body.appendChild(toggleBtn);
    }
    
    const setVisible = (visible) => {
        grid.classList.toggle("grid-hidden", !visible);
        toggleBtn.classList.toggle("is-off", !visible);
        localStorage.setItem("gridVisible", visible ? "1" : "0");
    };
    
    const stored = localStorage.getItem("gridVisible");
    setVisible(stored === "1");
    
    toggleBtn.addEventListener("click", () => {
        const isHidden = grid.classList.contains("grid-hidden");
        setVisible(isHidden);
    });
}

let activeSmoothContent = null;
let smoothMediaQuery = null;

function initSmoothScroll(container) {
    const scope = container || document;
    const wrapperEl = scope.querySelector("#smooth-wrapper");
    const contentEl = scope.querySelector("#smooth-content");
    if (!wrapperEl || !contentEl) {
        return;
    }
    if (!smoothMediaQuery && window.matchMedia) {
        smoothMediaQuery = window.matchMedia("(max-width: 550px)");
        const handleViewportChange = (event) => {
            if (event.matches) {
                destroySmoothScroll();
            } else {
                initSmoothScroll(document);
            }
        };
        if (smoothMediaQuery.addEventListener) {
            smoothMediaQuery.addEventListener("change", handleViewportChange);
        } else if (smoothMediaQuery.addListener) {
            smoothMediaQuery.addListener(handleViewportChange);
        }
    }
    if (smoothMediaQuery && smoothMediaQuery.matches) {
        destroySmoothScroll();
        return;
    }
    if (!window.gsap || !window.ScrollTrigger || !window.ScrollSmoother) {
        teardownSmoothStructure();
        return;
    }
    if (ScrollSmoother.get && ScrollSmoother.get()) {
        return;
    }
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    const smoother = ScrollSmoother.create({
        wrapper: wrapperEl,
        content: contentEl,
        smooth: 0.6,
        smoothTouch: 0.05,
        effects: false,
        normalizeScroll: true
    });
    if (smoother) {
        activeSmoothContent = contentEl;
        document.documentElement.classList.add("has-smooth");
        ScrollTrigger.refresh();
        refreshSmoothHeight();
        window.addEventListener("resize", refreshSmoothHeight);
        window.addEventListener("load", refreshSmoothHeight);
    }
}

function destroySmoothScroll() {
    if (window.ScrollSmoother && ScrollSmoother.get && ScrollSmoother.get()) {
        ScrollSmoother.get().kill();
    }
    if (window.ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    }
    activeSmoothContent = null;
    document.documentElement.classList.remove("has-smooth");
}

function teardownSmoothStructure() {
    const wrapper = document.getElementById("smooth-wrapper");
    const content = document.getElementById("smooth-content");
    if (!wrapper || !content) {
        return;
    }
    Array.from(content.children).forEach((el) => {
        wrapper.parentNode.insertBefore(el, wrapper);
    });
    wrapper.remove();
    document.documentElement.classList.remove("has-smooth");
}

function refreshSmoothHeight() {
    const content = activeSmoothContent || document.getElementById("smooth-content");
    if (!content) return;
    // Reset height so 100%-height sections don't lock the previous value.
    content.style.height = "";
    const nodes = Array.from(content.querySelectorAll("*"));
    if (!nodes.length) return;
    let maxBottom = 0;
    nodes.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.position === "fixed" || style.position === "sticky") {
            return;
        }
        const rect = el.getBoundingClientRect();
        const bottom = rect.bottom + window.pageYOffset;
        if (bottom > maxBottom) maxBottom = bottom;
    });
    if (maxBottom > 0) {
        content.style.height = Math.ceil(maxBottom) + "px";
    } else {
        content.style.height = "";
    }
}

function initLazyImages() {
    let refreshQueued = false;
    const scheduleRefresh = () => {
        if (refreshQueued) return;
        refreshQueued = true;
        requestAnimationFrame(() => {
            refreshQueued = false;
            refreshSmoothHeight();
            if (window.ScrollTrigger) {
                ScrollTrigger.refresh();
            }
        });
    };
    
    const singleImages = Array.from(document.querySelectorAll(".singlePhotosGrid .singlePhotos img"));
    singleImages.forEach((img, index) => {
        img.setAttribute("decoding", "async");
        img.setAttribute("loading", index < 4 ? "eager" : "lazy");
        img.setAttribute("fetchpriority", index === 0 ? "high" : "low");
        if (img.complete) {
            scheduleRefresh();
        } else {
            img.addEventListener("load", scheduleRefresh, { once: true });
        }
    });
    
    document.querySelectorAll("img").forEach((img) => {
        if (singleImages.includes(img)) {
            return;
        }
        img.setAttribute("decoding", "async");
        img.setAttribute("loading", "lazy");
        img.setAttribute("fetchpriority", "low");
        if (img.complete) {
            scheduleRefresh();
        } else {
            img.addEventListener("load", scheduleRefresh, { once: true });
        }
    });
}

function initPhotoOrientation() {
    document.querySelectorAll('.singlePhotosGrid').forEach((grid) => {
        const images = Array.from(grid.querySelectorAll('.singlePhotos img'));
        if (!images.length) return;
        
        grid.classList.add('is-loading');
        let readyCount = 0;
        
        const done = () => {
            readyCount += 1;
            if (readyCount >= images.length) {
                grid.classList.remove('is-loading');
            }
        };
        
        images.forEach((img) => {
            const apply = () => {
                const wrap = img.closest('.singlePhotos');
                if (!wrap) {
                    done();
                    return;
                }
                
                const isLandscape = img.naturalWidth >= img.naturalHeight;
                wrap.classList.toggle('is-landscape', isLandscape);
                wrap.classList.toggle('is-portrait', !isLandscape);
                refreshSmoothHeight();
                done();
            };
            
            const handleReady = () => {
                if (img.decode) {
                    img.decode().catch(() => {}).finally(apply);
                } else {
                    apply();
                }
            };
            
            if (img.complete) handleReady();
            else img.addEventListener('load', handleReady, { once: true });
        });
    });
}

function initQuoteImageRandom() {
    const holders = Array.from(document.querySelectorAll(".quoteImage, .quoteImageResponsive"));
    if (holders.length === 0) return;
    const images = [
        
        "/wedding_albumsAndPhotos/giuseppe_veronica/3.webp",
        "/wedding_albumsAndPhotos/fabio_paola/8.webp",
        "/wedding_albumsAndPhotos/giuseppe_veronica/7.webp",
        "/wedding_albumsAndPhotos/gianluca_stefania/2.webp",
        "/wedding_albumsAndPhotos/giuseppe_veronica/5.webp",
        "/wedding_albumsAndPhotos/marco_ketevan/7.webp",
        "/wedding_albumsAndPhotos/mafama_simona/21.webp",
        "/wedding_albumsAndPhotos/luca_tosca/2.webp",
        "/wedding_albumsAndPhotos/luca_tosca/3.webp",
        "/wedding_albumsAndPhotos/andrea_rita/6.webp",
        "/wedding_albumsAndPhotos/andrea_rita/14.webp",
        "/wedding_albumsAndPhotos/andrea_rita/15.webp",
        "/wedding_albumsAndPhotos/luca_tosca/5.webp",
        "/wedding_albumsAndPhotos/gianluca_stefania/9.webp",
        "/wedding_albumsAndPhotos/marco_ketevan/8.webp",
        "/wedding_albumsAndPhotos/dario_silvana/3.webp",
        "/wedding_albumsAndPhotos/dario_silvana/4.webp"
    ];
    const last = sessionStorage.getItem("quoteImageLast");
    let picks = images.filter((src) => src !== last);
    if (picks.length === 0) picks = images.slice();
    
    const imgEls = holders.map((holder) => {
        const img = holder.querySelector("img") || (() => {
            const created = document.createElement("img");
            created.alt = "Portfolio";
            holder.appendChild(created);
            return created;
        })();
        holder.classList.remove("is-ready");
        return img;
    });
    
    const tryPick = (list) => {
        if (!list.length) {
            imgEl.src = images[0];
            return;
        }
        const index = Math.floor(Math.random() * list.length);
        const src = list[index];
        const probe = new Image();
        probe.onload = () => {
            if (probe.naturalHeight > probe.naturalWidth) {
                imgEls.forEach((img, idx) => {
                    img.src = src;
                    const holder = holders[idx];
                    const reveal = () => {
                        if (holder) holder.classList.add("is-ready");
                    };
                    if (img.complete) {
                        requestAnimationFrame(reveal);
                    } else {
                        img.addEventListener("load", reveal, { once: true });
                    }
                });
                sessionStorage.setItem("quoteImageLast", src);
            } else {
                const next = list.slice(0, index).concat(list.slice(index + 1));
                tryPick(next);
            }
        };
        probe.onerror = () => {
            const next = list.slice(0, index).concat(list.slice(index + 1));
            tryPick(next);
        };
        probe.src = src;
    };
    
    tryPick(picks);
}

function initPersistentUI() {
    initNavFooter();
    initFooterYear();
    initLanguageSwitch();
    initGridOverlay();
}

function ensureIonicons() {
    if (customElements.get("ion-icon")) {
        return;
    }
    if (document.querySelector('script[data-ionicons]')) {
        return;
    }
    const moduleScript = document.createElement("script");
    moduleScript.type = "module";
    moduleScript.src = "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js";
    moduleScript.setAttribute("data-ionicons", "module");
    
    const nomoduleScript = document.createElement("script");
    nomoduleScript.setAttribute("nomodule", "");
    nomoduleScript.src = "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js";
    nomoduleScript.setAttribute("data-ionicons", "nomodule");
    
    document.body.appendChild(moduleScript);
    document.body.appendChild(nomoduleScript);
}

function initPageScripts(container) {
    applyTranslations();
    initQuoteForm();
    if (document.querySelector("ion-icon")) {
        ensureIonicons();
    }
    initCustomSelects();
    initQuoteImageRandom();
    initSmoothScroll(container);
    initReferrerAnimation();
    rollingText();
    const nav = document.querySelector("nav");
    if (nav) {
        requestAnimationFrame(() => nav.classList.remove("nav-rebuilding"));
    }
    const footer = document.querySelector("footer");
    const logoLink = document.querySelector(".logo-link");
    if (window.gsap) {
        gsap.set([nav, footer, logoLink], { clearProps: "opacity,visibility" });
    } else {
        if (nav) {
            nav.style.opacity = "1";
            nav.style.visibility = "visible";
        }
        if (footer) {
            footer.style.opacity = "1";
            footer.style.visibility = "visible";
        }
        if (logoLink) {
            logoLink.style.opacity = "1";
            logoLink.style.visibility = "visible";
        }
    }
    stickyAndBackToTheTop(container);
    const loaderPromise = loaderIndex();
    zoomImageAlbumHover();
    initLazyImages();
    initPhotoOrientation();
    animateTitle();
    refreshSmoothHeight();
    return loaderPromise;
}

function initBarba() {
    if (!window.barba) {
        return;
    }
    const portfolioNamespaces = new Set([
        "portfolio",
        "baptism",
        "publications",
        "maternity",
        "annarita",
        "diana",
        "giulia",
        "leonardo",
        "raffaele&gabriella",
        "vogue",
        "federico&carla"
    ]);
    const setPortfolioTransition = (namespace) => {
        const isPortfolio = portfolioNamespaces.has(namespace);
        document.documentElement.classList.toggle("portfolio-transition", isPortfolio);
        document.body.classList.toggle("portfolio-transition", isPortfolio);
    };
    const parseNextDocument = (html) => {
        const parser = new DOMParser();
        return parser.parseFromString(html, "text/html");
    };
    const syncTitleAndBodyClass = (doc) => {
        const nextTitle = doc.querySelector("title");
        if (nextTitle) {
            document.title = nextTitle.textContent;
        }
        const nextBody = doc.querySelector("body");
        if (nextBody) {
            const raw = nextBody.className || "";
            const cleaned = raw
                .split(/\s+/)
                .filter((cls) => cls && cls !== "loader-pending" && cls !== "loader-active")
                .join(" ");
            document.body.className = cleaned;
        }
    };
    
    barba.init({
        transitions: [
            {
                name: "fade",
                leave({ current }) {
                    return gsap.to(current.container, { opacity: 0, duration: 0.7, ease: "power1.out" });
                },
                enter({ next }) {
                    if (next && next.container) {
                        next.container.style.visibility = "hidden";
                        applyTranslations(next.container);
                    }
                    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                    return gsap.fromTo(
                        next.container,
                        { opacity: 0 },
                        {
                            opacity: 1,
                            duration: 1.2,
                            ease: "power1.out",
                            delay: 0.15,
                            onStart: () => {
                                if (next && next.container) {
                                    next.container.style.visibility = "visible";
                                }
                            }
                        }
                    );
                }
            }
        ]
    });
    
    barba.hooks.beforeEnter((data) => {
        if (!data || !data.next || !data.next.html) return;
        const doc = parseNextDocument(data.next.html);
        syncTitleAndBodyClass(doc);
        if (data.next && data.next.namespace) {
            setPortfolioTransition(data.next.namespace);
        }
    });
    
    barba.hooks.beforeLeave(() => {
        teardownSticky();
        const nav = document.querySelector("nav");
        const footer = document.querySelector("footer");
        const logoLink = document.querySelector(".logo-link");
        if (nav) {
            nav.classList.remove("nav-rebuilding");
        }
        if (window.gsap) {
            gsap.killTweensOf([nav, footer, logoLink]);
            gsap.set([nav, footer, logoLink], { clearProps: "opacity,visibility" });
        } else {
            if (nav) {
                nav.style.opacity = "1";
                nav.style.visibility = "visible";
            }
            if (footer) {
                footer.style.opacity = "1";
                footer.style.visibility = "visible";
            }
            if (logoLink) {
                logoLink.style.opacity = "1";
                logoLink.style.visibility = "visible";
            }
        }
    });
    
    barba.hooks.afterLeave(() => {
        destroySmoothScroll();
    });
    
    barba.hooks.afterEnter((data) => {
        initPersistentUI();
        initPageScripts(data && data.next ? data.next.container : null);
    });
}

function applyTranslations(root = document) {
    const lang = getCurrentLang();
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[lang][key]) {
            el.setAttribute("placeholder", translations[lang][key]);
        }
    });
}

function initQuoteForm() {
    const form = document.getElementById("quoteForm");
    if (!form) return;
    
    const dateInput = form.querySelector("#eventDate");
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }
    
    const weddingYes = form.querySelector("#weddingPlannerYes");
    const weddingNo = form.querySelector("#weddingPlannerNo");
    const weddingDetails = form.querySelector(".weddingPlannerDetails");
    const weddingName = form.querySelector("#weddingPlannerName");
    
    const updateWeddingPlannerDetails = () => {
        const show = weddingYes && weddingYes.checked;
        if (!weddingDetails || !weddingName) return;
        
        if (show) {
            weddingDetails.classList.remove("is-hidden");
            weddingName.required = true;
        } else {
            weddingDetails.classList.add("is-hidden");
            weddingName.required = false;
            weddingName.value = "";
        }
    };
    
    if (weddingYes && weddingNo) {
        weddingYes.addEventListener("change", updateWeddingPlannerDetails);
        weddingNo.addEventListener("change", updateWeddingPlannerDetails);
        updateWeddingPlannerDetails();
    }
    
    const status = form.querySelector(".formStatus");
    const submitButton = form.querySelector("button[type=\"submit\"]");
    const defaultButtonText = submitButton ? submitButton.textContent : "";
    let statusTimer = null;
    
    const showStatus = (text, { autoHide } = {}) => {
        if (!status) return;
        status.textContent = text;
        status.classList.add("is-visible");
        if (submitButton) {
            submitButton.classList.add("is-temp-hover");
        }
        if (statusTimer) {
            clearTimeout(statusTimer);
            statusTimer = null;
        }
        if (autoHide) {
            statusTimer = setTimeout(() => {
                status.classList.remove("is-visible");
                if (submitButton) {
                    submitButton.classList.remove("is-temp-hover");
                }
            }, 3000);
        } else if (submitButton) {
            submitButton.classList.remove("is-temp-hover");
        }
    };
    
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Invio...";
        }
        if (status) {
            status.textContent = "";
            status.classList.remove("is-visible");
        }
        if (submitButton) {
            submitButton.classList.remove("is-temp-hover");
        }
        
        try {
            const formatDateIt = (value) => {
                if (!value) return "";
                const parsed = new Date(`${value}T00:00:00`);
                if (Number.isNaN(parsed.getTime())) return value;
                return parsed.toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                });
            };
            
            const formData = new FormData(form);
            const fullName = formData.get("fullName") || "";
            const eventDateRaw = formData.get("eventDate") || "";
            const eventDateIt = formatDateIt(String(eventDateRaw));
            
            const lines = [
                "Nuova richiesta preventivo",
                "",
                `Nome e cognome: ${fullName}`,
                `Email: ${formData.get("email") || ""}`,
                `Telefono: ${formData.get("phone") || ""}`,
                `Instagram: ${formData.get("ig") || ""}`,
                `Data evento: ${eventDateIt}`,
                `Orario cerimonia: ${formData.get("service") || ""}`,
                `Tipo di cerimonia: ${formData.get("ceremonyType") || ""}`,
                `Luogo cerimonia: ${formData.get("cerimony_venue") || ""}`,
                `Luogo ricevimento: ${formData.get("reception_venue") || ""}`,
                `Wedding planner: ${formData.get("weddingPlanner") || ""}`,
                `Nome wedding planner: ${formData.get("weddingPlannerName") || ""}`,
                "",
                "Cosa ti ha catturato nel mio stile?",
                String(formData.get("messageStyle") || ""),
                "",
                "Raccontami di piu!",
                String(formData.get("messageDetails") || ""),
            ];
            
            formData.set("message", lines.join("\n"));
            formData.set(
                "subject",
                `Nuova richiesta Wedding — ${fullName} — ${eventDateIt || eventDateRaw}`
            );
            
            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json",
                },
            });
            
            if (response.ok) {
                form.reset();
                showStatus("Richiesta inviata con successo.", { autoHide: true });
            } else {
                showStatus("Errore. Riprova tra poco.", { autoHide: true });
            }
        } catch (error) {
            showStatus("Errore. Riprova tra poco.", { autoHide: true });
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = defaultButtonText || "Invia";
            }
        }
    });
}

function initCustomSelects() {
    const selects = Array.from(document.querySelectorAll(".customSelect"));
    if (selects.length === 0) return;
    
    const closeAll = () => {
        selects.forEach((wrap) => {
            const optionsEl = wrap.querySelector(".customSelectOptions");
            wrap.classList.remove("is-open");
            const input = wrap.querySelector(".customSelectInput");
            if (input) input.setAttribute("aria-expanded", "false");
            if (optionsEl) {
                const currentHeight = optionsEl.getBoundingClientRect().height;
                gsap.set(optionsEl, { height: currentHeight });
                gsap.to(optionsEl, {
                    height: 0,
                    opacity: 0,
                    duration: 0.25,
                    ease: "power2.out",
                    onComplete: () => {
                        optionsEl.style.height = "0px";
                        refreshSmoothHeight();
                        if (window.ScrollTrigger) {
                            ScrollTrigger.refresh();
                        }
                    }
                });
            }
        });
    };
    
    selects.forEach((wrap) => {
        if (wrap.dataset.customSelectInit === "true") {
            return;
        }
        const input = wrap.querySelector(".customSelectInput");
        const options = wrap.querySelectorAll(".customSelectOption");
        const optionsEl = wrap.querySelector(".customSelectOptions");
        if (!input) return;
        
        input.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = !wrap.classList.contains("is-open");
            if (isOpen) {
                wrap.classList.add("is-open");
            } else {
                wrap.classList.remove("is-open");
            }
            input.setAttribute("aria-expanded", isOpen ? "true" : "false");
            if (isOpen) {
                selects.forEach((other) => {
                    if (other !== wrap) {
                        other.classList.remove("is-open");
                        const otherInput = other.querySelector(".customSelectInput");
                        if (otherInput) otherInput.setAttribute("aria-expanded", "false");
                        const otherOptions = other.querySelector(".customSelectOptions");
                        if (otherOptions) {
                            const otherHeight = otherOptions.getBoundingClientRect().height;
                            gsap.set(otherOptions, { height: otherHeight });
                            gsap.to(otherOptions, {
                                height: 0,
                                opacity: 0,
                                duration: 0.25,
                                ease: "power2.out",
                                onComplete: () => {
                                    otherOptions.style.height = "0px";
                                    refreshSmoothHeight();
                                    if (window.ScrollTrigger) {
                                        ScrollTrigger.refresh();
                                    }
                                }
                            });
                        }
                    }
                });
                if (optionsEl) {
                    optionsEl.style.height = "0px";
                    optionsEl.style.opacity = "0";
                    requestAnimationFrame(() => {
                        const targetHeight = optionsEl.scrollHeight;
                        gsap.to(optionsEl, {
                            height: targetHeight,
                            opacity: 1,
                            duration: 0.3,
                            ease: "power2.out",
                            onComplete: () => {
                                optionsEl.style.height = "auto";
                                refreshSmoothHeight();
                            }
                        });
                    });
                }
            } else if (optionsEl) {
                const currentHeight = optionsEl.getBoundingClientRect().height;
                gsap.set(optionsEl, { height: currentHeight });
                gsap.to(optionsEl, {
                    height: 0,
                    opacity: 0,
                    duration: 0.25,
                    ease: "power2.out",
                    onComplete: () => {
                        optionsEl.style.height = "0px";
                        refreshSmoothHeight();
                        if (window.ScrollTrigger) {
                            ScrollTrigger.refresh();
                        }
                    }
                });
            }
        });
        
        options.forEach((option) => {
            option.addEventListener("click", (event) => {
                event.stopPropagation();
                if (option.classList.contains("is-selected")) {
                    return;
                }
                const lang = getCurrentLang();
                const i18nKey = option.getAttribute("data-i18n");
                options.forEach((opt) => {
                    opt.classList.remove("is-selected");
                    opt.removeAttribute("aria-selected");
                    opt.disabled = false;
                });
                if (i18nKey && translations[lang] && translations[lang][i18nKey]) {
                    input.value = translations[lang][i18nKey];
                } else {
                    input.value = option.dataset.value || option.textContent.trim();
                }
                option.classList.add("is-selected");
                option.setAttribute("aria-selected", "true");
                option.disabled = true;
                wrap.classList.remove("is-open");
                input.setAttribute("aria-expanded", "false");
                if (optionsEl) {
                    const currentHeight = optionsEl.getBoundingClientRect().height;
                    gsap.set(optionsEl, { height: currentHeight });
                    gsap.to(optionsEl, {
                        height: 0,
                        opacity: 0,
                        duration: 0.25,
                        ease: "power2.out",
                        onComplete: () => {
                            optionsEl.style.height = "0px";
                            refreshSmoothHeight();
                            if (window.ScrollTrigger) {
                                ScrollTrigger.refresh();
                            }
                        }
                    });
                }
            });
        });
        wrap.dataset.customSelectInit = "true";
    });
    
    if (!document.body.dataset.customSelectBound) {
        document.addEventListener("click", closeAll);
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeAll();
        });
        document.body.dataset.customSelectBound = "true";
    }
}

// Chiamata funzioni
document.addEventListener("DOMContentLoaded", () => {
    initPersistentUI();
    const loaderPromise = initPageScripts(document.querySelector('[data-barba="container"]'));
    const ready = loaderPromise && typeof loaderPromise.then === "function"
        ? loaderPromise
        : Promise.resolve();
    ready.then(() => {
        initBarba();
    });
    const initialContainer = document.querySelector('[data-barba="container"]');
    if (initialContainer) {
        const ns = initialContainer.getAttribute("data-barba-namespace");
        if (ns) {
            const portfolioNamespaces = ["portfolio","baptism","maternity","publications","annarita","diana","giulia","leonardo","raffaele&gabriella","vogue","federico&carla"];
            document.documentElement.classList.toggle("portfolio-transition", portfolioNamespaces.includes(ns));
            document.body.classList.toggle("portfolio-transition", portfolioNamespaces.includes(ns));
        }
    }
});







// 1. Dizionario delle traduzioni
const translations = {
    it: {
        location: "Luogo",
        year: "Anno",
        artist: "Su di me",
        onMe: "Su di me",
        aboutDescription1: "Mi considero un pazzo romantico. Sono un amante della bellezza e di tutto cio che la luce riesce a illuminare e rendere perfetto.",
        aboutDescription2: "Ed è proprio questa la bellezza della fotografia, quando mente, occhio e cuore si allineano, si crea l'armonia perfetta. È un modo di vivere.",
        featured: "Pubblicato su",
        member: "Membro di",
        services: "Servizi",
        servicesWedding: "Matrimoni",
        servicesEighteen: "Diciottesimi",
        servicesBaptism: "Battesimi",
        servicesMaternity: "Maternità",
        quote: "Richiedi preventivo",
        preventive:"Richiedi preventivo",
        fullName: "Nome Cognome",
        contact: "Contatto",
        event: "Evento",
        date: "Data",
        city: "Città",
        send: "Invia",
        location: "Luogo",
        quoteIntro1: "Ogni storia d'amore è unica e merita di essere raccontata con cura.",
        quoteIntro2: "Compilando il modulo qui sotto potrete condividere con me i dettagli del vostro giorno speciale e i vostri desideri: sarà il primo passo per conoscerci e guidarvi con attenzione e sensibilita.",
        quoteIntro3: "Sarò felice di darvi tutte le informazioni sul servizio e di immaginare insieme come rendere il vostro matrimonio esattamente come lo sognate.",
        fullNameLabel: "Nome e cognome *",
        fullNamePlaceholder: "Mario Rossi",
        emailLabel: "Email *",
        emailPlaceholder: "mariorossi@gmail.com",
        phoneLabel: "Numero di telefono *",
        phonePlaceholder: "+39 1234567890",
        igLabel: "Il tuo account Instagram *",
        igPlaceholder: "@mario.rossi",
        eventDateLabel: "Data del matrimonio *",
        serviceLabel: "Orario cerimonia *",
        servicePlaceholder: "Scegli l'orario",
        serviceMorning: "Mattina",
        serviceEvening: "Sera",
        ceremonyTypeLabel: "Tipo di cerimonia *",
        ceremonyTypePlaceholder: "Scegli un tipo",
        ceremonyTypeCivil: "Civile",
        ceremonyTypeReligious: "Religiosa",
        ceremonyVenueLabel: "Luogo della cerimonia *",
        ceremonyVenuePlaceholder: "Basilica di San Giovanni, Roma",
        receptionVenueLabel: "Luogo del ricevimento *",
        receptionVenuePlaceholder: "Castello della Castelluccia, Roma",
        weddingPlannerLabel: "Hai un/a wedding planner? *",
        weddingPlannerYesLabel: "Si",
        weddingPlannerNoLabel: "No",
        weddingPlannerNameLabel: "Nome del wedding planner?",
        weddingPlannerNamePlaceholder: "Nome e cognome",
        messageStyleLabel: "Cosa ti ha colpito del mio stile fotografico?",
        messageStylePlaceholder: "Luce, colori, emozioni...",
        messageDetailsLabel: "Raccontami qualcosa in piu sul tuo matrimonio.",
        messageDetailsPlaceholder: "Cosa è importante per voi?",
        privacyLabelBefore: "Accetto l'informativa",
        privacyLabelLink: "privacy",
        privacyLabelAfter: ".",
        portfolioLabel: "portfolio",
        portfolioTitle: "portfolio",
        portfolioCrumb: "portfolio /",
        weddingLabel: "matrimoni",
        baptismsLabel: " Battesimi",
        baptismsCrumb: "Battesimi /",
        maternityLabel: " Maternità",
        maternityCrumb: "Maternità /",
        publicationsLabel: " Pubblicazioni",
        publicationsCrumb: "Pubblicazioni /",
        albumSingular: "album",
        albumsPlural: "album"
    },
    en: {
        location: "Where",
        year: "Year",
        portfolio: "Portfolio",
        artist: "About",
        onMe: "About me",
        aboutDescription1: "I consider myself a romantic madman. I am a lover of beauty and everything that light can illuminate and make perfect.",
        aboutDescription2: "And that's the beauty of photography: when mind, eye, and heart align, the perfect harmony is created. It's a way of life.",
        featured: "Featured on",
        member: "Part of",
        services: "My services",
        servicesWedding: "Wedding",
        servicesEighteen: "Eighteen",
        servicesBaptism: "Baptism",
        servicesMaternity: "Maternity",
        quote: "Request a quote",
        preventive:"Request a quote",
        fullName: "Full Name",
        contact: "Contact",
        event: "Event",
        date: "Date",
        city: "City",
        send: "Send",
        location: "Place",
        quoteIntro1: "Every love story is unique and deserves to be told with care.",
        quoteIntro2: "By filling out the form below, you can share the details of your special day and your wishes with me: it will be the first step in getting to know each other and guiding you with attention and sensitivity.",
        quoteIntro3: "I will be happy to provide you with all the information about the service and to imagine together how to make your wedding exactly as you dream it to be.",
        fullNameLabel: "Full name *",
        fullNamePlaceholder: "Mario Rossi",
        emailLabel: "Email *",
        emailPlaceholder: "mariorossi@gmail.com",
        phoneLabel: "Phone number *",
        phonePlaceholder: "+39 1234567890",
        igLabel: "Your Instagram account *",
        igPlaceholder: "@mario.rossi",
        eventDateLabel: "Wedding date *",
        serviceLabel: "Ceremony time *",
        servicePlaceholder: "Choose the time",
        serviceMorning: "Morning",
        serviceEvening: "Evening",
        ceremonyTypeLabel: "Ceremony type *",
        ceremonyTypePlaceholder: "Choose a type",
        ceremonyTypeCivil: "Civil",
        ceremonyTypeReligious: "Religious",
        ceremonyVenueLabel: "Ceremony venue *",
        ceremonyVenuePlaceholder: "Basilica di San Giovanni, Rome",
        receptionVenueLabel: "Reception venue *",
        receptionVenuePlaceholder: "Castello della Castelluccia, Rome",
        weddingPlannerLabel: "Do you have a wedding planner? *",
        weddingPlannerYesLabel: "Yes",
        weddingPlannerNoLabel: "No",
        weddingPlannerNameLabel: "Wedding planner's name?",
        weddingPlannerNamePlaceholder: "Full name",
        messageStyleLabel: "What drew you to my photographic style?",
        messageStylePlaceholder: "Light, colors, emotions...",
        messageDetailsLabel: "Tell me a bit more about your wedding.",
        messageDetailsPlaceholder: "What matters most to you?",
        privacyLabelBefore: "I accept the",
        privacyLabelLink: "privacy policy",
        privacyLabelAfter: ".",
        portfolioLabel: "portfolio",
        portfolioTitle: "portfolio",
        portfolioCrumb: "portfolio /",
        weddingLabel: "wedding",
        baptismsLabel: " Baptisms",
        baptismsCrumb: "Baptisms /",
        maternityLabel: " Maternity",
        maternityCrumb: "Maternity /",
        publicationsLabel: " Publications",
        publicationsCrumb: "Publications /",
        albumSingular: "album",
        albumsPlural: "albums",
    }
};
