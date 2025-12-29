// card-list.js (MODULE)

import {
    fetchPokemonList,
    fetchPokemonDetail,
    fetchPokemonSpecies
} from "./api.js";

import { getFilterState, setFilterChangeHandler } from "./filter.js";

import { openModal, initPokemonModal } from "./pokemon-modal.js";

/* 한글 캐시 */
const speciesCache = new Map();

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

// 지역 매핑
const REGION_RANGE = {
    kanto: [1, 151],
    johto: [152, 251],
    hoenn: [252, 386],
    sinnoh: [387, 493],
    unova: [494, 649],
    kalos: [650, 721],
    alola: [722, 809],
    galar: [810, 898],
    hisui: [899, 905],
    paldea: [906, 1025]
};

/* 전체 도감 캐시 (검색용) */
let allPokemonCache = [];
let isSearchMode = false;

/* species 한글 데이터 + 캐싱 */
async function getKoreanSpecies(speciesUrl) {
    if (!speciesUrl) return null;

    // 캐시 키를 speciesUrl로
    if (speciesCache.has(speciesUrl)) {
        return speciesCache.get(speciesUrl);
    }

    try {
        // url로 species 요청 (api.js가 url도 받게 됐으니까)
        const species = await fetchPokemonSpecies(speciesUrl);

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
        speciesCache.set(speciesUrl, result);
        return result;
    } catch (e) {
        return null;
    }
}

/* 상태 */
const PAGE_SIZE = 18;

/* 무한 스크롤 상태 */
let currentPage = 1;
let isLoading = false;
let hasMore = true;

/* 외부 진입점 */
export async function initCardList() {
    initScrollTopButton();
    initPokemonModal();

    // 필터 변경 연결
    setFilterChangeHandler(() => {
        resetAndReloadByFilter();
    });

    // 전체 도감 preload
    await preloadAllPokemon();

    // 첫 페이지 렌더 (캐시에서)
    renderCards(allPokemonCache.slice(0, PAGE_SIZE), false);
    currentPage = 2;

    // 무한 스크롤 시작
    updateObserverUI()
    initInfiniteScroll();
}

/* 페이지 로드 */
async function loadPage(page) {
    if (isLoading || !hasMore) return;
    isLoading = true;

    const start = (page - 1) * PAGE_SIZE;
    const end = page * PAGE_SIZE;
    const slice = allPokemonCache.slice(start, end);

    // 더 이상 가져올 게 없으면 종료
    if (!slice.length) {
        hasMore = false;
        isLoading = false;
        updateObserverUI()
        return;
    }

    // 일반 모드에서만 무한 스크롤 렌더
    if (!isSearchMode) {
        renderCards(slice, true); // append
    }

    currentPage++;
    isLoading = false;

    // 이번 페이지가 "마지막 페이지"였으면 hasMore=false
    if (end >= allPokemonCache.length) {
        hasMore = false;
    }
    updateObserverUI()
}

/* 카드 렌더 */
function renderCards(list, append = false) {
    const container = document.getElementById("card_list");
    if (!container) return;

    if (!append) container.innerHTML = "";

    list.forEach(p => {
        const card = document.createElement("article");
        card.className = "pokemon_card";
        card.dataset.id = p.dexNo;

        card.innerHTML = `
      <div class="pokemon_img">
        <img src="${p.sprites.other["official-artwork"].front_default}" alt="${p.nameKo}">
      </div>
      <div class="pokemon_info">
        <span class="pokemon_no">도감번호 ${String(p.dexNo).padStart(4, "0")}</span>
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

        card.addEventListener("click", () => openModal(p));

        /* 먼저 DOM에 붙인다 */
        container.appendChild(card);

        /* 그 다음 프레임에 색을 읽어서 변수 세팅 */
        requestAnimationFrame(() => {
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
        });
    });
}

// 무한 스크롤
function initInfiniteScroll() {
    const observerTarget = document.getElementById("scrollObserver");
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !isLoading && hasMore && !isSearchMode) {
                loadPage(currentPage);
            }
        },
        { rootMargin: "200px" }
    );

    observer.observe(observerTarget);
}

// 스크롤 끝 지점
function updateObserverUI() {
    const wrap = document.getElementById("scrollObserver");
    const text = wrap?.querySelector(".loading_text");
    if (!wrap || !text) return;

    // 필터/검색 모드 + 더 불러올 게 있으면 숨김
    if (isSearchMode && hasMore) {
        wrap.style.display = "none";
        return;
    }

    wrap.style.display = "block";
    text.textContent = hasMore ? "불러오는 중..." : "모든 포켓몬을 불러왔어요.";
}

// 맨 위로 버튼
function initScrollTopButton() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            btn.classList.add("show");
        } else {
            btn.classList.remove("show");
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// 검색 필터
function resetAndReloadByFilter() {
    const { keyword, types, region } = getFilterState();

    const isFiltering =
        keyword.length > 0 ||
        types.length > 0 ||
        region !== "all";

    isSearchMode = isFiltering;

    const container = document.getElementById("card_list");
    if (container) container.innerHTML = "";

    const filtered = allPokemonCache.filter(p => {
        if (region !== "all") {
            const range = REGION_RANGE[region];
            if (!range) return false;

            const [min, max] = range;
            if (p.dexNo < min || p.dexNo > max) return false;
        }

        if (types.length) {
            const pTypes = p.types.map(t => t.type.name);
            if (!types.every(t => pTypes.includes(t))) return false;
        }

        if (
            keyword &&
            !p.nameKo.toLowerCase().includes(keyword.toLowerCase())
        ) return false;

        return true;
    });

    renderCards(filtered.slice(0, PAGE_SIZE), false);

    hasMore = !isSearchMode;
    currentPage = 2;
    updateObserverUI()
}

function getIdFromUrl(url) {
    return Number(url.split("/").filter(Boolean).pop());
}

async function preloadAllPokemon() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.style.display = "flex";

    const { results } = await fetchPokemonList(2000, 0);

    const all = await Promise.all(
        results.map(async (p) => {
            const detail = await fetchPokemonDetail(p.url);

            const speciesUrl = detail.species?.url;
            const speciesId = speciesUrl ? getIdFromUrl(speciesUrl) : null;

            // 전국도감(종) 범위만
            if (!speciesId || speciesId > 1025) return null;

            const ko = await getKoreanSpecies(speciesUrl);
            if (!ko) return null;

            return {
                ...detail,
                ...ko,
                dexNo: speciesId,
            };
        })
    );

    // 폼 중복 제거 (같은 dexNo 하나만)
    const map = new Map();
    all.filter(Boolean).forEach((poke) => {
        if (!map.has(poke.dexNo)) map.set(poke.dexNo, poke);
    });

    allPokemonCache = [...map.values()].sort((a, b) => a.dexNo - b.dexNo);

    if (overlay) overlay.style.display = "none";
}

export { getKoreanSpecies, TYPE_KO };