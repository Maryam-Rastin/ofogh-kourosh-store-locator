import { html } from "@webjsdev/core";
import { stores } from "../data/stores.ts";

export default function Home() {
  return html`
    <main class="page-shell">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <span class="eyebrow"> WEBJS × LEAFLET </span>

          <h1 id="page-title">Find an Ofogh Kourosh store near you.</h1>

          <p id="hero-description">
            Explore ${stores.length} Ofogh Kourosh locations and find a nearby
            store on the interactive map.
          </p>
        </div>

        <div class="hero-actions">
          <div class="toggle-area">
            <button id="theme-toggle" class="mode-button" type="button">
              🌙 Dark
            </button>

            <button id="lang-toggle" class="mode-button" type="button">
              FA
            </button>
          </div>
          <div class="hero-stat" aria-label="Store count">
            <strong>${stores.length}</strong>

            <span id="hero-stat-label"> locations </span>
          </div>
        </div>
      </section>

      <section class="locator-card" aria-label="Store locator">
        <store-map></store-map>
      </section>

      <footer class="site-footer">
        <span id="footer-title"> Ofogh Kourosh Store Locator </span>

        <span id="footer-built"> Built with WebJs + Leaflet </span>
      </footer>
    </main>

    <script>
      (() => {
        const root = document.documentElement;

        const translations = {
          en: {
            title: "Find an Ofogh Kourosh store near you.",

            description:
              "Explore ${stores.length} Ofogh Kourosh locations and find a nearby store on the interactive map.",

            locations: "locations",

            footerTitle: "Ofogh Kourosh Store Locator",

            footerBuilt: "Built with WebJs + Leaflet",

            dark: "🌙 Dark",

            light: "☀️ Light",
          },

          fa: {
            title: "یک فروشگاه افق کوروش در نزدیکی خود پیدا کنید.",

            description:
              "در میان ${stores.length} شعبه افق کوروش جستجو کنید و نزدیک‌ترین فروشگاه را روی نقشه پیدا کنید.",

            locations: "شعبه",

            footerTitle: "مسیریاب فروشگاه‌های افق کوروش",

            footerBuilt: "ساخته شده با WebJs و Leaflet",

            dark: "🌙 تاریک",

            light: "☀️ روشن",
          },
        };

        const getLanguage = () => {
          return root.lang === "fa" ? "fa" : "en";
        };

        const updatePage = () => {
          const language = getLanguage();
          const theme = root.dataset.theme === "dark" ? "dark" : "light";

          const t = translations[language];

          const title = document.querySelector("#page-title");

          const description = document.querySelector("#hero-description");

          const statLabel = document.querySelector("#hero-stat-label");

          const footerTitle = document.querySelector("#footer-title");

          const footerBuilt = document.querySelector("#footer-built");

          const themeButton = document.querySelector("#theme-toggle");

          const languageButton = document.querySelector("#lang-toggle");

          if (title) {
            title.textContent = t.title;
          }

          if (description) {
            description.textContent = t.description;
          }

          if (statLabel) {
            statLabel.textContent = t.locations;
          }

          if (footerTitle) {
            footerTitle.textContent = t.footerTitle;
          }

          if (footerBuilt) {
            footerBuilt.textContent = t.footerBuilt;
          }

          if (themeButton) {
            themeButton.textContent = theme === "dark" ? t.light : t.dark;

            themeButton.setAttribute(
              "aria-label",
              language === "fa"
                ? "تغییر حالت روشن و تاریک"
                : "Toggle dark mode",
            );
          }

          if (languageButton) {
            languageButton.textContent = language === "fa" ? "EN" : "FA";

            languageButton.setAttribute(
              "aria-label",
              language === "fa" ? "Switch to English" : "تغییر زبان به انگلیسی",
            );
          }

          document.title =
            language === "fa"
              ? "افق کوروش — پیدا کردن فروشگاه"
              : "Ofogh Kourosh — Store Locator";
        };

        const initialize = () => {
          updatePage();

          document
            .querySelector("#theme-toggle")
            ?.addEventListener("click", () => {
              const nextTheme =
                root.dataset.theme === "dark" ? "light" : "dark";

              root.dataset.theme = nextTheme;

              localStorage.setItem("theme", nextTheme);

              updatePage();
            });

          document
            .querySelector("#lang-toggle")
            ?.addEventListener("click", () => {
              const nextLanguage = root.lang === "fa" ? "en" : "fa";

              root.lang = nextLanguage;

              root.dir = nextLanguage === "fa" ? "rtl" : "ltr";

              localStorage.setItem("language", nextLanguage);

              updatePage();

              window.dispatchEvent(
                new CustomEvent("app-language-change", {
                  detail: nextLanguage,
                }),
              );
            });
        };

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initialize, {
            once: true,
          });
        } else {
          initialize();
        }
      })();
    </script>
  `;
}
