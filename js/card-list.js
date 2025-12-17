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
    const modalTypes = modal.querySelector(".modal_types");

    cards.forEach(card => {
        const typeChips = card.querySelectorAll(".type_chip");

        if (typeChips.length >= 1) {
            card.style.setProperty(
                "--type-color-1",
                getComputedStyle(typeChips[0]).backgroundColor
            );
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

        modalTypes.innerHTML = "";
        types.forEach(type => modalTypes.appendChild(type.cloneNode(true)));

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.remove("active");
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

        // 카드 구분용 텍스트 변경 (선택)
        const noEl = clone.querySelector(".pokemon_no");
        const nameEl = clone.querySelector(".pokemon_name");

        if (noEl) noEl.textContent = String(i + 1).padStart(3, "0");
        if (nameEl) nameEl.textContent = `Sample ${i + 1}`;

        list.appendChild(clone);
    }
}
