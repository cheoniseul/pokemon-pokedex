// filter.js
console.log('filter.js loaded');

let selectedRegion = 'all';
let selectedTypes = [];

/* 상세 필터 열기 / 닫기 */
function initFilterToggle() {
    const toggleBtn = document.querySelector('.filter_toggle_btn');
    const detailArea = document.querySelector('.filter_detail');
    const icon = toggleBtn?.querySelector('i');

    if (!toggleBtn || !detailArea) return;

    toggleBtn.addEventListener('click', () => {
        detailArea.classList.toggle('open');

        if (icon) {
            icon.classList.toggle('rotated');
        }
    });
}

/* 지방 필터 (단일 선택 + 토글) */
function initRegionFilter() {
    const regionButtons = document.querySelectorAll('.region_chip');

    regionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const region = button.dataset.region;
            const isActive = button.classList.contains('active');

            regionButtons.forEach(btn => btn.classList.remove('active'));

            if (isActive) {
                selectedRegion = 'all';
                document
                    .querySelector('.region_chip[data-region="all"]')
                    ?.classList.add('active');
            } else {
                button.classList.add('active');
                selectedRegion = region;
            }

            console.log('선택된 지방:', selectedRegion);
        });
    });
}

/* 타입 필터 (다중 선택) */
function initTypeFilter() {
    const typeButtons = document.querySelectorAll('.type_chip');

    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;

            button.classList.toggle('active');

            if (button.classList.contains('active')) {
                if (!selectedTypes.includes(type)) {
                    selectedTypes.push(type);
                }
            } else {
                selectedTypes = selectedTypes.filter(t => t !== type);
            }

            console.log('선택된 타입:', selectedTypes);
        });
    });
}

/* 초기화 버튼 */
function initResetButton() {
    const resetBtn = document.querySelector('.filter_actions .action_btn:not(.primary)');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', () => {
        selectedRegion = 'all';
        selectedTypes = [];

        document
            .querySelectorAll('.region_chip')
            .forEach(btn => btn.classList.remove('active'));

        document
            .querySelector('.region_chip[data-region="all"]')
            ?.classList.add('active');

        document
            .querySelectorAll('.type_chip')
            .forEach(btn => btn.classList.remove('active'));

        const searchInput = document.getElementById('search');
        if (searchInput) searchInput.value = '';

        console.log('필터 초기화');
        console.log('지방:', selectedRegion);
        console.log('타입:', selectedTypes);
    });
}
