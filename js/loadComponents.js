import { fetchPokemonList, fetchPokemonDetail } from "./api.js";
import {
  initFilterToggle,
  initRegionFilter,
  initTypeFilter,
  initResetButton,
  initSearchFilter
} from "./filter.js";

import { setFilterChangeHandler } from "./filter.js";

import { initCardList } from "./card-list.js";

/* 컴포넌트 로드 */
async function loadComponent(id, path) {
    const response = await fetch(path);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

setFilterChangeHandler((filterState) => {
    // filterState = { region, types }
    reloadPokemonCards(filterState);
});


/* 카드 데이터 로드 (API) */
async function loadPokemonCards() {
    const cardListEl = document.getElementById("card_list");
    if (!cardListEl) return;

    const { results } = await fetchPokemonList(60);

    for (const pokemon of results) {
        const detail = await fetchPokemonDetail(pokemon.url);

        const card = document.createElement("article");
        card.className = "pokemon_card";
        card.dataset.id = detail.id;

        card.innerHTML = `
            <div class="pokemon_img">
                <img src="${detail.sprites.other["official-artwork"].front_default}" alt="${detail.name}">
            </div>

            <div class="pokemon_info">
                <span class="pokemon_no">도감번호 ${String(detail.id).padStart(4, "0")}</span>
                <h3 class="pokemon_name">${detail.name}</h3>

                <div class="pokemon_types">
                    ${detail.types.map(t => `
                        <span class="type_chip ${t.type.name}">
                            ${t.type.name}
                        </span>
                    `).join("")}
                </div>
            </div>
        `;

        cardListEl.appendChild(card);
    }
}

/* 전체 초기화 */
async function loadAllComponents() {
    // header
    await loadComponent("header", "components/header.html");

    // filter
    await loadComponent("filter", "components/filter.html");
    initFilterToggle();
    initRegionFilter();
    initTypeFilter();
    initResetButton();
    initSearchFilter();

    // card list (HTML)
    await loadComponent("card-list", "components/card-list.html");

    // 카드 HTML 로드 후 API 실행
    await loadPokemonCards();

    // 카드 클릭 / 모달 로직 초기화
    initCardList();

    // footer
    await loadComponent("footer", "components/footer.html");
}

// 실제 실행
loadAllComponents();
