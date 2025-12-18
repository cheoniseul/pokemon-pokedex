// card-list.js (MODULE)

import {
    fetchPokemonList,
    fetchPokemonDetail,
    fetchPokemonSpecies
} from "./api.js";
import { getFilterState } from "./filter.js";

/* 한글 캐시 */
const speciesCache = new Map();

/* 특성 한글 캐시 */
const abilityCache = new Map();

/* 타입 한글 매핑 */
const TYPE_KO = {
    normal: "노말",
    fire: "불꽃",
    water: "물",
    electric: "전기",
    grass: "풀",
    ice: "얼음",
    fighting: "격투",
    poison: "독",
    ground: "땅",
    flying: "비행",
    psychic: "에스퍼",
    bug: "벌레",
    rock: "바위",
    ghost: "고스트",
    dragon: "드래곤",
    dark: "악",
    steel: "강철",
    fairy: "페어리"
};

/* species 한글 데이터 + 캐싱 */
async function getKoreanSpecies(pokemonId) {
    if (speciesCache.has(pokemonId)) {
        return speciesCache.get(pokemonId);
    }

    const species = await fetchPokemonSpecies(pokemonId);

    const nameKo =
        species.names.find(n => n.language.name === "ko")?.name ?? "";

    const descKo =
        species.flavor_text_entries
            .find(f => f.language.name === "ko")
            ?.flavor_text
            ?.replace(/\n|\f/g, " ")
        ?? "";

    const genusKo =
        species.genera.find(g => g.language.name === "ko")?.genus ?? "";

    const genderRate = species.gender_rate;

    const result = { nameKo, descKo, genusKo, genderRate };
    speciesCache.set(pokemonId, result);
    return result;
}

async function getKoreanAbility(abilityUrl) {
    // ability ID 추출
    const id = abilityUrl.split("/").filter(Boolean).pop();

    if (abilityCache.has(id)) {
        return abilityCache.get(id);
    }

    const ability = await fetch(`https://pokeapi.co/api/v2/ability/${id}`)
        .then(r => r.json());

    const nameKo =
        ability.names.find(n => n.language.name === "ko")?.name ?? "";

    abilityCache.set(id, nameKo);
    return nameKo;
}

/* 상태 */
const PAGE_SIZE = 18;
let currentPokemonId = null;
let isPaging = false;

/* 외부 진입점 */
export function initCardList() {
    loadPage(1);
    bindModalClose();
}

/* 페이지 로드 */
async function loadPage(page) {
    const offset = (page - 1) * PAGE_SIZE;
    const { results } = await fetchPokemonList(PAGE_SIZE, offset);

    const details = await Promise.all(
        results.map(async (p) => {
            const detail = await fetchPokemonDetail(p.url);
            const ko = await getKoreanSpecies(detail.id);
            return {
                ...detail,
                ...ko
            };
        })
    );

    const filtered = applyFilter(details);
    renderCards(filtered);
}

/* 필터 */
function applyFilter(list) {
    const { types, keyword } = getFilterState();

    return list.filter(p => {
        if (types.length) {
            const pTypes = p.types.map(t => t.type.name);
            if (!types.every(t => pTypes.includes(t))) return false;
        }
        if (keyword && !p.nameKo.includes(keyword)) return false;
        return true;
    });
}

/* 카드 렌더 */
function renderCards(list) {
    const container = document.getElementById("card_list");
    if (!container) return;
    container.innerHTML = "";

    list.forEach(p => {
        const card = document.createElement("article");
        card.className = "pokemon_card";
        card.dataset.id = p.id;

        card.innerHTML = `
      <div class="pokemon_img">
        <img src="${p.sprites.other["official-artwork"].front_default}" alt="${p.nameKo}">
      </div>
      <div class="pokemon_info">
        <span class="pokemon_no">도감번호 ${String(p.id).padStart(4, "0")}</span>
        <h3 class="pokemon_name">${p.nameKo}</h3>
        <div class="pokemon_types">
          ${p.types.map(t => `
            <span class="type_chip ${t.type.name}">
              ${TYPE_KO[t.type.name]}
            </span>
          `).join("")}
        </div>
      </div>
    `;

        /* 카드 hover용 타입 색 변수 */
        const chips = card.querySelectorAll(".type_chip");
        if (chips[0]) {
            const c1 = getComputedStyle(chips[0]).backgroundColor;
            card.style.setProperty("--type-color", c1);
            card.style.setProperty("--type-color-1", c1);
        }
        if (chips[1]) {
            const c2 = getComputedStyle(chips[1]).backgroundColor;
            card.style.setProperty("--type-color-2", c2);
            card.classList.add("dual-type");
        }

        card.addEventListener("click", () => openModal(p));
        container.appendChild(card);
    });
}

/* 모달 열기 */
async function openModal(p) {
    const modal = document.getElementById("pokemonModal");
    if (!modal) return;

    currentPokemonId = p.id;

    modal.querySelector(".modal_img").src =
        p.sprites.other["official-artwork"].front_default;
    modal.querySelector(".modal_img").alt = p.nameKo;
    modal.querySelector(".modal_no").textContent =
        `도감번호 ${String(p.id).padStart(4, "0")}`;
    modal.querySelector(".modal_name").textContent = p.nameKo;

    modal.querySelector(".modal_summary").textContent = p.descKo;
    modal.querySelector(".modal_species").textContent = p.genusKo;
    modal.querySelector(".modal_height").textContent = `${p.height / 10} m`;
    modal.querySelector(".modal_weight").textContent = `${p.weight / 10} kg`;

    modal.querySelector(".modal_gender").textContent =
        p.genderRate < 0
            ? "무성"
            : `♂ ${(8 - p.genderRate) * 12.5}% / ♀ ${p.genderRate * 12.5}%`;

    const abilityEl = modal.querySelector(".modal_abilities");

    const abilityNamesKo = await Promise.all(
        p.abilities.map(a => getKoreanAbility(a.ability.url))
    );

    abilityEl.textContent = abilityNamesKo.join(", ");

    /* 타입 */
    const typeArea = modal.querySelector(".modal_types_detail");
    typeArea.innerHTML = "";

    p.types.forEach(t => {
        const chip = document.createElement("span");
        chip.className = `type_chip ${t.type.name}`;
        chip.textContent = TYPE_KO[t.type.name];
        typeArea.appendChild(chip);
    });

    /* 타입바 */
    const modalContent = modal.querySelector(".pokemon_modal_content");
    modalContent.classList.remove("dual-type");
    modalContent.style.removeProperty("--type-color-2");

    if (typeArea.children[0]) {
        modalContent.style.setProperty(
            "--type-color",
            getComputedStyle(typeArea.children[0]).backgroundColor
        );
    }
    if (typeArea.children[1]) {
        modalContent.classList.add("dual-type");
        modalContent.style.setProperty(
            "--type-color-1",
            getComputedStyle(typeArea.children[0]).backgroundColor
        );
        modalContent.style.setProperty(
            "--type-color-2",
            getComputedStyle(typeArea.children[1]).backgroundColor
        );
    }

    await renderEvolution(p.id);

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    updatePagingUI();
}

/* 모달 닫기 */
function bindModalClose() {
    const modal = document.getElementById("pokemonModal");
    if (!modal) return;

    const closeBtn = modal.querySelector(".modal_close");
    const bg = modal.querySelector(".pokemon_modal_bg");

    const close = () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    closeBtn?.addEventListener("click", close);
    bg?.addEventListener("click", close);
}

/* 진화 과정 */
async function renderEvolution(id) {
    const wrap = document.querySelector(".evolution_list");
    if (!wrap) return;
    wrap.innerHTML = "";

    const species = await fetchPokemonSpecies(id);
    const evoData = await fetch(species.evolution_chain.url).then(r => r.json());

    let cur = evoData.chain;
    while (cur) {
        const pid = Number(cur.species.url.split("/").slice(-2, -1)[0]);
        const detail = await fetchPokemonDetail(`https://pokeapi.co/api/v2/pokemon/${pid}`);
        const ko = await getKoreanSpecies(pid);

        const item = document.createElement("div");
        item.className = "evolution_item";
        item.innerHTML = `
      <img src="${detail.sprites.front_default}" alt="${ko.nameKo}">
      <span>${ko.nameKo}</span>
    `;

        item.addEventListener("click", () =>
            openModal({ ...detail, ...ko })
        );

        wrap.appendChild(item);
        cur = cur.evolves_to[0];
    }
}

/* 모달 페이징 */
function updatePagingUI() {
    const modal = document.getElementById("pokemonModal");
    if (!modal) return;

    const prevBtn = modal.querySelector(".modal_nav.prev");
    const nextBtn = modal.querySelector(".modal_nav.next");

    prevBtn.disabled = currentPokemonId <= 1;

    prevBtn.onclick = () => moveModal(currentPokemonId - 1);
    nextBtn.onclick = () => moveModal(currentPokemonId + 1);
}

async function moveModal(id) {
    if (isPaging || id < 1) return;
    isPaging = true;
    try {
        const detail = await fetchPokemonDetail(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const ko = await getKoreanSpecies(id);
        await openModal({ ...detail, ...ko });
    } finally {
        isPaging = false;
    }
}
