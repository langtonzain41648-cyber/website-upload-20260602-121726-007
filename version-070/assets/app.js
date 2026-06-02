(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs(".menu-toggle");
        var panel = qs(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var root = qs("[data-hero]");
        if (!root) {
            return;
        }
        var slides = qsa("[data-hero-slide]", root);
        var dots = qsa("[data-hero-dot]", root);
        var prev = qs("[data-hero-prev]", root);
        var next = qs("[data-hero-next]", root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function uniqueValues(cards, name) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(name);
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort().reverse();
    }

    function fillSelect(select, values) {
        if (!select || select.options.length > 1) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var list = qs("[data-card-list]");
        if (!list) {
            return;
        }
        var cards = qsa(".movie-card", list);
        var searchInput = qs(".card-filter-input");
        var yearSelect = qs(".card-year-filter");
        var typeSelect = qs(".card-type-filter");
        var categorySelect = qs(".card-category-filter");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        fillSelect(yearSelect, uniqueValues(cards, "data-year"));
        fillSelect(typeSelect, uniqueValues(cards, "data-type"));

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function apply() {
            var query = normalize(searchInput && searchInput.value);
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var category = categorySelect ? categorySelect.value : "";

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var matched = true;
                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    matched = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    matched = false;
                }
                if (category && card.getAttribute("data-category") !== category) {
                    matched = false;
                }
                card.classList.toggle("is-filter-hidden", !matched);
            });
        }

        [searchInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function setupSearchForms() {
        qsa(".site-search, .hero-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs("input[name='q']", form);
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    window.location.href = "./movies.html";
                }
            });
        });
    }

    function setupBackToTop() {
        var button = qs(".back-to-top");
        if (!button) {
            return;
        }
        function check() {
            button.classList.toggle("is-visible", window.scrollY > 360);
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", check, { passive: true });
        check();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupSearchForms();
        setupBackToTop();
    });
})();
