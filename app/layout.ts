import { html, asset } from "@webjsdev/core";
import "../components/store-map.ts";

export const metadata = {
  title: "Ofogh Kourosh — Store Locator",
  description: "A responsive store locator built with WebJs and Leaflet.",
};

export default function Layout({ children }: { children: unknown }) {
  return html`
    <!DOCTYPE html>

    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="color-scheme" content="light dark" />

        <script>
          (() => {
            try {
              const theme = localStorage.getItem("theme");

              const language = localStorage.getItem("language");

              if (theme === "light" || theme === "dark") {
                document.documentElement.dataset.theme = theme;
              } else {
                document.documentElement.dataset.theme = "light";
              }

              if (language === "en" || language === "fa") {
                document.documentElement.lang = language;

                document.documentElement.dir =
                  language === "fa" ? "rtl" : "ltr";
              }
            } catch (_) {
              document.documentElement.dataset.theme = "light";

              document.documentElement.lang = "en";

              document.documentElement.dir = "ltr";
            }
          })();
        </script>

        <link rel="stylesheet" href=${asset("/public/app.css")} />

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossorigin=""
        />
      </head>

      <body>
        ${children}
      </body>
    </html>
  `;
}
