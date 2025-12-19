import {
  fetchPokemonDetail,
  fetchPokemonSpecies
} from "./api.js";

import { getKoreanSpecies, TYPE_KO } from "./card-list.js";

// 반드시 필요
let currentPokemonId = null;
let isPaging = false;

/* 특성 한글 캐시 */
const abilityCache = new Map();

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

/* 모달 열기 */
export async function openModal(p) {
    const modal = document.getElementById("pokemonModal");
    if (!modal || !p) return;

    currentPokemonId = p.id;

    // 안전하게 한 번만 캐싱
    const modalImg = modal.querySelector(".modal_img");
    const modalNo = modal.querySelector(".modal_no");
    const modalName = modal.querySelector(".modal_name");

    const modalSummary = modal.querySelector(".modal_summary");
    const modalSpecies = modal.querySelector(".modal_species");
    const modalHeight = modal.querySelector(".modal_height");
    const modalWeight = modal.querySelector(".modal_weight");

    const genderEl = modal.querySelector(".modal_gender");
    const abilityEl = modal.querySelector(".modal_abilities");

    const typeArea = modal.querySelector(".modal_types_detail");
    const modalContent = modal.querySelector(".pokemon_modal_content");

    if (
        !modalImg || !modalNo || !modalName ||
        !modalSummary || !modalSpecies || !modalHeight || !modalWeight ||
        !genderEl || !abilityEl || !typeArea || !modalContent
    ) return;

    // 기본 정보
    const imgSrc = p?.sprites?.other?.["official-artwork"]?.front_default || "";
    modalImg.src = imgSrc;
    modalImg.alt = p.nameKo || "";

    modalNo.textContent = `도감번호 ${String(p.id).padStart(4, "0")}`;
    modalName.textContent = p.nameKo || "";

    modalSummary.textContent = p.descKo || "";
    modalSpecies.textContent = p.genusKo || "";
    modalHeight.textContent = `${(p.height ?? 0) / 10} m`;
    modalWeight.textContent = `${(p.weight ?? 0) / 10} kg`;

    // 성별 (기호만 표시, 남/여 색상 분리)
    genderEl.classList.remove("gender-none");
    const gr = Number(p.genderRate);

    if (!Number.isFinite(gr) || gr < 0) {
        genderEl.textContent = "무성";
        genderEl.classList.add("gender-none");
    } else {
        // 기호만: 0이면 ♂만, 8이면 ♀만, 그 외(혼합)는 ♂♀ 둘 다 표시
        const hasMale = gr < 8;   // female 100%가 아니면 남성 존재
        const hasFemale = gr > 0; // male 100%가 아니면 여성 존재

        genderEl.innerHTML = `
        ${hasMale ? `<span class="gender male">♂</span>` : ""}
        ${hasFemale ? `<span class="gender female">♀</span>` : ""}
    `;
    }

    // 특성(abilities) - 실패해도 모달은 열리게
    try {
        const abilityNamesKo = await Promise.all(
            (p.abilities ?? []).map(a => getKoreanAbility(a.ability.url))
        );
        abilityEl.textContent = abilityNamesKo.join(", ");
    } catch (e) {
        abilityEl.textContent = "";
        console.warn("ability ko fetch failed:", e);
    }

    /* 타입 */
    typeArea.innerHTML = "";
    (p.types ?? []).forEach(t => {
        const typeName = t?.type?.name;
        if (!typeName) return;

        const chip = document.createElement("span");
        chip.className = `type_chip ${typeName}`;
        chip.textContent = TYPE_KO[typeName] ?? typeName;
        typeArea.appendChild(chip);
    });

    /* 타입바 */
    modalContent.classList.remove("dual-type");
    modalContent.style.removeProperty("--type-color");
    modalContent.style.removeProperty("--type-color-1");
    modalContent.style.removeProperty("--type-color-2");

    // 타입칩 스타일이 적용된 다음 색을 읽도록 rAF로 보장
    await new Promise(requestAnimationFrame);

    const chip0 = typeArea.children[0];
    const chip1 = typeArea.children[1];

    if (chip0) {
        const c1 = getComputedStyle(chip0).backgroundColor;
        modalContent.style.setProperty("--type-color", c1);
        modalContent.style.setProperty("--type-color-1", c1);
    }
    if (chip1) {
        const c2 = getComputedStyle(chip1).backgroundColor;
        modalContent.classList.add("dual-type");
        modalContent.style.setProperty("--type-color-2", c2);
    }

    // 진화 (실패해도 모달은 열리게)
    try {
        await renderEvolution(p.id);
    } catch (e) {
        console.warn("evolution render failed:", e);
    }

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    updatePagingUI();
}

export function initPokemonModal() {
  bindModalClose();
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

// NOTE: modal paging ignores current filter state
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