function initCardList() {

    seedCards(18);

    let cards = document.querySelectorAll(".pokemon_card");
    const modal = document.getElementById("pokemonModal");
    if (!cards.length || !modal) return;

    const modalBg = modal.querySelector(".pokemon_modal_bg");
    const modalCloseBtn = modal.querySelector(".modal_close");

    const modalImg = modal.querySelector(".modal_img");
    const modalNo = modal.querySelector(".modal_no");
    const modalName = modal.querySelector(".modal_name");

    cards.forEach(card => {
        const typeChips = card.querySelectorAll(".type_chip");

        if (typeChips.length >= 1) {
            const color1 = getComputedStyle(typeChips[0]).backgroundColor;

            card.style.setProperty("--type-color-1", color1);

            card.style.setProperty("--type-color", color1);
        }

        if (typeChips.length >= 2) {
            card.style.setProperty(
                "--type-color-2",
                getComputedStyle(typeChips[1]).backgroundColor
            );
            card.classList.add("dual-type");
        }

        card.addEventListener("click", () => {
            openModalFromCard(card);
        });
    });

    function openModalFromCard(card) {
        const img = card.querySelector(".pokemon_img img");
        const no = card.querySelector(".pokemon_no").textContent;
        const name = card.querySelector(".pokemon_name").textContent;
        const types = card.querySelectorAll(".type_chip");

        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modalNo.textContent = no;
        modalName.textContent = name;

        const modalTypesDetail = modal.querySelector(".modal_types_detail");

        // 초기화
        modalTypesDetail.innerHTML = "";

        // 카드에 있는 타입 칩 그대로 복사
        types.forEach(type => {
            modalTypesDetail.appendChild(type.cloneNode(true));
        });

        const modalContent = modal.querySelector(".pokemon_modal_content");

        // 초기화
        modalContent.classList.remove("dual-type");
        modalContent.style.removeProperty("--type-color-1");
        modalContent.style.removeProperty("--type-color-2");

        // 카드에 이미 세팅된 값 재사용
        const cardColor1 = getComputedStyle(card).getPropertyValue("--type-color-1");
        const cardColor2 = getComputedStyle(card).getPropertyValue("--type-color-2");

        // 단일 타입
        if (types.length === 1) {
            modalContent.style.setProperty("--type-color", cardColor1);
            modalContent.style.removeProperty("--type-color-2");
        }

        // 듀얼 타입
        if (types.length >= 2) {
            modalContent.classList.add("dual-type");
            modalContent.style.setProperty("--type-color-1", cardColor1);
            modalContent.style.setProperty("--type-color-2", cardColor2);
        }

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    modalCloseBtn.addEventListener("click", closeModal);
    modalBg.addEventListener("click", closeModal);
}

function seedCards(count = 18) {
    const list = document.getElementById("card_list");
    if (!list) return;

    const cards = list.querySelectorAll(".pokemon_card");
    if (!cards.length || cards.length >= count) return;

    const baseCard = cards[0];

    for (let i = cards.length; i < count; i++) {
        const clone = baseCard.cloneNode(true);

        // 혹시 모를 중복 id 제거
        clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));

        // 번호 / 이름 변경
        const noEl = clone.querySelector(".pokemon_no");
        const nameEl = clone.querySelector(".pokemon_name");

        if (noEl) noEl.textContent = `도감번호 ${String(i + 1).padStart(4, "0")}`;
        if (nameEl) nameEl.textContent = `Sample ${i + 1}`;

        // 타입 랜덤 생성
        const types = ["fire", "water", "grass", "electric", "bug", "normal"];

        const typeWrap = clone.querySelector(".pokemon_types");
        typeWrap.innerHTML = "";

        // 첫 번째 타입
        const t1 = types[Math.floor(Math.random() * types.length)];
        const chip1 = document.createElement("span");
        chip1.className = `type_chip ${t1}`;
        chip1.textContent = t1;
        typeWrap.appendChild(chip1);

        // 확률 듀얼 타입
        if (Math.random() > 0.5) {
            let t2;
            do {
                t2 = types[Math.floor(Math.random() * types.length)];
            } while (t2 === t1);

            const chip2 = document.createElement("span");
            chip2.className = `type_chip ${t2}`;
            chip2.textContent = t2;
            typeWrap.appendChild(chip2);
        }

        list.appendChild(clone);
    }

}
