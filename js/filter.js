// filter.js (MODULE)

/* 필터 상태 */
let selectedRegion = "all";
let selectedTypes = [];
let onFilterChange = null;

let searchKeyword = "";


/* 외부에서 상태 읽기 */
export function getFilterState() {
    return {
        region: selectedRegion,
        types: [...selectedTypes],
        keyword: searchKeyword
    };
}

/* 필터 변경 콜백 등록 */
export function setFilterChangeHandler(handler) {
    onFilterChange = handler;
}

/* 내부 공통 호출 */
function notifyFilterChange() {
    if (typeof onFilterChange === "function") {
        onFilterChange(getFilterState());
    }
}

/* 상세 필터 토글 */
export function initFilterToggle() {
    const toggleBtns = document.querySelectorAll(".filter_toggle_btn");
    const detailArea = document.querySelector(".filter_detail");
    const pcBtn = document.querySelector(".pc_only");
    const mobileBtn = document.querySelector(".mobile_only");

    if (!detailArea || !toggleBtns.length) return;

    toggleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const isOpen = detailArea.classList.toggle("open");

            toggleBtns.forEach(b => {
                const icon = b.querySelector("i");
                if (icon) icon.classList.toggle("rotated", isOpen);
            });

            // 모바일 전용 처리
            if (window.innerWidth <= 768) {
                if (pcBtn) pcBtn.style.display = isOpen ? "none" : "inline-flex";
                if (mobileBtn) mobileBtn.style.display = isOpen ? "flex" : "none";

                if (isOpen) {
                    const header = document.querySelector("header");
                    const headerHeight = header ? header.offsetHeight : 0;

                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            const filterTop =
                                detailArea.getBoundingClientRect().top + window.scrollY;

                            window.scrollTo({
                                top: filterTop - headerHeight - 12,
                                behavior: "smooth"
                            });
                        }, 50);
                    });
                }
            }
        });
    });
}

/* 지방 필터 */
export function initRegionFilter() {
    const regionButtons = document.querySelectorAll(".region_chip");

    regionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const region = button.dataset.region;
            const isActive = button.classList.contains("active");

            regionButtons.forEach(btn => btn.classList.remove("active"));

            if (isActive) {
                selectedRegion = "all";
                document
                    .querySelector('.region_chip[data-region="all"]')
                    ?.classList.add("active");
            } else {
                button.classList.add("active");
                selectedRegion = region;
            }

            notifyFilterChange();
        });
    });
}

/* 타입 필터 */
export function initTypeFilter() {
    const typeButtons = document.querySelectorAll(".type_chip");

    typeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.type;

            button.classList.toggle("active");

            if (button.classList.contains("active")) {
                if (!selectedTypes.includes(type)) {
                    selectedTypes.push(type);
                }
            } else {
                selectedTypes = selectedTypes.filter(t => t !== type);
            }

            notifyFilterChange();
        });
    });
}

/* 검색 필터 (이름) */
export function initSearchFilter() {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;

    // 입력할 때마다 즉시 반영
    searchInput.addEventListener("input", (e) => {
        searchKeyword = e.target.value
            .trim()
            .toLowerCase();

        notifyFilterChange();
    });
}

/* 초기화 */
export function initResetButton() {
    const resetBtn = document.querySelector(
        ".filter_actions .action_btn:not(.primary)"
    );
    if (!resetBtn) return;

    resetBtn.addEventListener("click", () => {
        selectedRegion = "all";
        selectedTypes = [];

        document
            .querySelectorAll(".region_chip")
            .forEach(btn => btn.classList.remove("active"));

        document
            .querySelector('.region_chip[data-region="all"]')
            ?.classList.add("active");

        document
            .querySelectorAll(".type_chip")
            .forEach(btn => btn.classList.remove("active"));

        const searchInput = document.getElementById("search");
        if (searchInput) searchInput.value = "";

        searchKeyword = "";

        notifyFilterChange();
    });
}
