import {
  WebComponent,
  html
} from '@webjsdev/core';

import {
  stores,
  type Store,
  type StoreType
} from '../data/stores.ts';

const MAP_CENTER: [number, number] = [
  35.6892,
  51.3890
];

export class StoreMap extends WebComponent({}) {
  private map: any = null;
  private markers: any[] = [];

  private filteredStores: Store[] = stores;

  private searchTerm = '';

  private activeType: StoreType | 'All' = 'All';

  private leaflet: any = null;

  private language: 'en' | 'fa' = 'en';

  private translations = {
    en: {
      locations: 'LOCATIONS',
      chooseStore: 'Choose a store',
      search: 'Search by city or name…',
      fitAll: 'Fit all',
      locateMe: 'Locate me',
      atlasLocations: 'Ofogh Kourosh locations',
      mapData:
        'Map data © OpenStreetMap contributors',
      noStores: 'No stores found',
      tryAnother:
        'Try another city, name, or filter.',
      youAreHere: 'You are here',

      types: {
        All: 'All',
        Flagship: 'Flagship',
        Express: 'Express',
        Pickup: 'Pickup'
      }
    },

    fa: {
      locations: 'شعب',
      chooseStore: 'یک فروشگاه انتخاب کنید',
      search: 'جست‌وجو بر اساس شهر یا نام…',
      fitAll: 'نمایش همه',
      locateMe: 'موقعیت من',
      atlasLocations: 'شعب افق کوروش',
      mapData:
        'داده‌های نقشه © مشارکت‌کنندگان OpenStreetMap',
      noStores: 'فروشگاهی پیدا نشد',
      tryAnother:
        'شهر، نام یا فیلتر دیگری را امتحان کنید.',
      youAreHere: 'شما اینجا هستید',

      types: {
        All: 'همه',
        Flagship: 'فروشگاه اصلی',
        Express: 'اکسپرس',
        Pickup: 'تحویل'
      }
    }
  };

  private get t() {
    return this.translations[this.language];
  }

  render() {
    const types = [
      'All',
      'Flagship',
      'Express',
      'Pickup'
    ] as const;

    return html`
      <div class="locator-grid">

        <aside class="store-panel">

          <div class="panel-heading">
            <div>
              <p class="panel-kicker">
                ${this.t.locations}
              </p>

              <h2>
                ${this.t.chooseStore}
              </h2>
            </div>

            <span class="result-count">
              ${this.filteredStores.length}
            </span>
          </div>

          <label class="search-box">
            <span class="sr-only">
              ${this.t.search}
            </span>

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              ></circle>

              <path
                d="m20 20-4-4"
              ></path>
            </svg>

            <input
              id="store-search"
              type="search"
              placeholder=${this.t.search}
              value=${this.searchTerm}
              autocomplete="off"
            />
          </label>

          <div
            class="filter-row"
            role="group"
            aria-label="Filter by store type"
          >
            ${types.map(
              (type) => html`
                <button
                  class="filter-chip ${
                    this.activeType === type
                      ? 'is-active'
                      : ''
                  }"
                  data-type=${type}
                  aria-pressed=${
                    this.activeType === type
                  }
                >
                  ${this.t.types[type]}
                </button>
              `
            )}
          </div>

          <div
            class="store-list"
            id="store-list"
          >
            ${
              this.filteredStores.length
                ? this.filteredStores.map(
                    (store) => html`
                      <button
                        class="store-item"
                        data-store-id=${store.id}
                      >
                        <span
                          class="store-icon"
                          aria-hidden="true"
                        >
                          ${store.name.charAt(0)}
                        </span>

                        <span class="store-info">
                          <strong>
                            ${store.name}
                          </strong>

                          <span>
                            ${store.city}
                            ·
                            ${
                              this.t.types[
                                store.type
                              ]
                            }
                          </span>

                          <small>
                            ${store.address}
                          </small>
                        </span>

                        <span
                          class="arrow"
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </button>
                    `
                  )
                : html`
                    <div class="empty-state">
                      <strong>
                        ${this.t.noStores}
                      </strong>

                      <span>
                        ${this.t.tryAnother}
                      </span>
                    </div>
                  `
            }
          </div>

        </aside>

        <div class="map-panel">

          <div class="map-toolbar">
            <button
              class="map-control"
              id="fit-map"
              type="button"
            >
              ${this.t.fitAll}
            </button>

            <button
              class="map-control map-control-primary"
              id="locate-me"
              type="button"
            >
              ${this.t.locateMe}
            </button>
          </div>

          <div
            id="map"
            class="map-canvas"
            aria-label="Interactive store map"
          ></div>

          <div class="map-caption">
            <span>
              <i class="legend-dot"></i>
              ${this.t.atlasLocations}
            </span>

            <span>
              ${this.t.mapData}
            </span>
          </div>

        </div>

      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    const savedLanguage =
      localStorage.getItem('language');

    this.language =
      savedLanguage === 'fa'
        ? 'fa'
        : 'en';

    window.addEventListener(
      'app-language-change',
      this.handleLanguageChange
    );

    this.setup().catch((error) => {
      console.error(
        'Leaflet setup failed:',
        error
      );
    });
  }

  disconnectedCallback() {
    window.removeEventListener(
      'app-language-change',
      this.handleLanguageChange
    );

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    super.disconnectedCallback();
  }

  private handleLanguageChange = (
    event: Event
  ) => {
    const language =
      (
        event as
          CustomEvent<'en' | 'fa'>
      ).detail;

    this.setLanguage(language);
  };

  private async setup() {
    if (this.map) return;

    /*
     * IMPORTANT:
     * Do NOT call this.render() here.
     *
     * WebJs already handles the component render.
     * We only initialize Leaflet using the
     * existing #map element.
     */

    const module =
      await import('leaflet');

    this.leaflet =
      module.default ?? module;

    // Wait until the SSR/hydrated DOM is available.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    this.initializeMap();
    this.bindUI();
  }

  private initializeMap() {
    const L = this.leaflet;

    if (!L) {
      console.error(
        'Leaflet module was not loaded.'
      );
      return;
    }

    const mapElement =
      this.querySelector<HTMLElement>('#map');

    if (!mapElement) {
      console.error(
        'Map element #map was not found.'
      );
      return;
    }

    /*
     * Tehran is the initial map position.
     */
    this.map = L.map(
      mapElement,
      {
        zoomControl: false,
        scrollWheelZoom: true
      }
    ).setView(
      MAP_CENTER,
      11
    );

    L.control
      .zoom({
        position:
          'bottomright'
      })
      .addTo(this.map);

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,

        attribution:
          '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.map);

    this.refreshMarkers();

    /*
     * Leaflet sometimes calculates its size
     * before the container has completely settled.
     * invalidateSize() fixes that case.
     */
    requestAnimationFrame(() => {
      this.map?.invalidateSize();
    });
  }

  private refreshMarkers() {
    if (!this.map || !this.leaflet) {
      return;
    }

    const L = this.leaflet;

    this.markers.forEach(
      (marker) => marker.remove()
    );

    this.markers = [];

    this.filteredStores.forEach(
      (store) => {

        const marker =
          L.marker([
            store.latitude,
            store.longitude
          ]).addTo(this.map);

        marker.bindPopup(
          this.popupHTML(store),
          {
            maxWidth: 300
          }
        );

        marker.on(
          'click',
          () =>
            this.highlightStore(
              store.id
            )
        );

        this.markers.push(marker);
      }
    );
  }

  private popupHTML(store: Store) {
    return `
      <article class="map-popup">

        <span class="popup-type">
          ${this.t.types[store.type]}
        </span>

        <h3>
          ${store.name}
        </h3>

        <p>
          ${store.address},
          ${store.city}
        </p>

        <div class="popup-meta">
          <span>
            ${store.hours}
          </span>

          <span>
            ${store.phone}
          </span>
        </div>

      </article>
    `;
  }

  private bindUI() {
    const search =
      this.querySelector<HTMLInputElement>(
        '#store-search'
      );

    search?.addEventListener(
      'input',
      () => {
        this.searchTerm =
          search.value
            .trim()
            .toLowerCase();

        this.applyFilters();
      }
    );

    this.querySelectorAll<HTMLButtonElement>(
      '[data-type]'
    ).forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            this.activeType =
              button.dataset.type as
                | StoreType
                | 'All';

            this.applyFilters();
          }
        );
      }
    );

    this.querySelectorAll<HTMLButtonElement>(
      '[data-store-id]'
    ).forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            const id =
              Number(
                button.dataset.storeId
              );

            this.focusStore(id);
            this.highlightStore(id);
          }
        );
      }
    );

    this.querySelector(
      '#fit-map'
    )?.addEventListener(
      'click',
      () =>
        this.fitVisibleStores()
    );

    this.querySelector(
      '#locate-me'
    )?.addEventListener(
      'click',
      () =>
        this.locateUser()
    );
  }

  private renderStoreList() {
    const list =
      this.querySelector<HTMLElement>(
        '#store-list'
      );

    const count =
      this.querySelector<HTMLElement>(
        '.result-count'
      );

    if (!list) return;

    if (count) {
      count.textContent =
        String(
          this.filteredStores.length
        );
    }

    list.innerHTML =
      this.filteredStores.length
        ? this.filteredStores
            .map(
              (store) => `
                <button
                  class="store-item"
                  data-store-id="${store.id}"
                >
                  <span
                    class="store-icon"
                    aria-hidden="true"
                  >
                    ${store.name.charAt(0)}
                  </span>

                  <span class="store-info">

                    <strong>
                      ${store.name}
                    </strong>

                    <span>
                      ${store.city}
                      ·
                      ${
                        this.t.types[
                          store.type
                        ]
                      }
                    </span>

                    <small>
                      ${store.address}
                    </small>

                  </span>

                  <span
                    class="arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </button>
              `
            )
            .join('')
        : `
          <div class="empty-state">
            <strong>
              ${this.t.noStores}
            </strong>

            <span>
              ${this.t.tryAnother}
            </span>
          </div>
        `;

    this.bindUI();
  }

  private applyFilters() {
    this.filteredStores =
      stores.filter(
        (store) => {
          const matchesType =
            this.activeType === 'All' ||
            store.type ===
              this.activeType;

          const haystack =
            `${store.name} ${store.city} ${store.address}`
              .toLowerCase();

          return (
            matchesType &&
            haystack.includes(
              this.searchTerm
            )
          );
        }
      );

    this.renderStoreList();
    this.refreshMarkers();
  }

  private focusStore(id: number) {
    const store =
      stores.find(
        (item) =>
          item.id === id
      );

    if (
      !store ||
      !this.map
    ) {
      return;
    }

    this.map.flyTo(
      [
        store.latitude,
        store.longitude
      ],
      15,
      {
        duration: 0.8
      }
    );

    const markerIndex =
      this.filteredStores.findIndex(
        (item) =>
          item.id === id
      );

    this.markers[
      markerIndex
    ]?.openPopup();
  }

  private highlightStore(id: number) {
    this.querySelectorAll(
      '.store-item'
    ).forEach(
      (item) =>
        item.classList.remove(
          'is-selected'
        )
    );

    this.querySelector(
      `[data-store-id="${id}"]`
    )?.classList.add(
      'is-selected'
    );
  }

  private fitVisibleStores() {
    if (
      !this.map ||
      !this.leaflet ||
      !this.filteredStores.length
    ) {
      return;
    }

    const bounds =
      this.leaflet.latLngBounds(
        this.filteredStores.map(
          (store) => [
            store.latitude,
            store.longitude
          ]
        )
      );

    this.map.fitBounds(
      bounds,
      {
        padding: [
          32,
          32
        ]
      }
    );
  }

  private locateUser() {
    if (
      !navigator.geolocation ||
      !this.map
    ) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        const {
          latitude,
          longitude
        } = position.coords;

        this.map.flyTo(
          [
            latitude,
            longitude
          ],
          14,
          {
            duration: 0.8
          }
        );

        this.leaflet
          .circleMarker(
            [
              latitude,
              longitude
            ],
            {
              radius: 8,
              color: '#ffffff',
              weight: 3,
              fillColor: '#c62828',
              fillOpacity: 1
            }
          )
          .addTo(this.map)
          .bindPopup(
            this.t.youAreHere
          )
          .openPopup();
      },

      () => {
        window.alert(
          this.language === 'fa'
            ? 'دسترسی به موقعیت مکانی امکان‌پذیر نبود. لطفاً دسترسی Location را در مرورگر فعال کنید.'
            : 'Location access was not available. Please enable it in your browser.'
        );
      }
    );
  }

  private setLanguage(
    language: 'en' | 'fa'
  ) {
    this.language =
      language;

    const search =
      this.querySelector<HTMLInputElement>(
        '#store-search'
      );

    if (search) {
      search.placeholder =
        this.t.search;
    }

    const kicker =
      this.querySelector<HTMLElement>(
        '.panel-kicker'
      );

    if (kicker) {
      kicker.textContent =
        this.t.locations;
    }

    const heading =
      this.querySelector<HTMLElement>(
        '.panel-heading h2'
      );

    if (heading) {
      heading.textContent =
        this.t.chooseStore;
    }

    const filterRow =
      this.querySelector<HTMLElement>(
        '.filter-row'
      );

    if (filterRow) {
      filterRow.setAttribute(
        'aria-label',
        language === 'fa'
          ? 'فیلتر بر اساس نوع فروشگاه'
          : 'Filter by store type'
      );
    }

    this.querySelectorAll<HTMLButtonElement>(
      '[data-type]'
    ).forEach(
      (button) => {
        const type =
          button.dataset.type as
            | 'All'
            | 'Flagship'
            | 'Express'
            | 'Pickup';

        button.textContent =
          this.t.types[type];
      }
    );

    const fitButton =
      this.querySelector(
        '#fit-map'
      );

    if (fitButton) {
      fitButton.textContent =
        this.t.fitAll;
    }

    const locateButton =
      this.querySelector(
        '#locate-me'
      );

    if (locateButton) {
      locateButton.textContent =
        this.t.locateMe;
    }

    const map =
      this.querySelector(
        '#map'
      );

    if (map) {
      map.setAttribute(
        'aria-label',
        language === 'fa'
          ? 'نقشه تعاملی فروشگاه‌ها'
          : 'Interactive store map'
      );
    }

    const caption =
      this.querySelector(
        '.map-caption'
      );

    if (caption) {
      caption.innerHTML = `
        <span>
          <i class="legend-dot"></i>
          ${this.t.atlasLocations}
        </span>

        <span>
          ${this.t.mapData}
        </span>
      `;
    }

    this.renderStoreList();
    this.refreshMarkers();
  }
}

StoreMap.register('store-map');