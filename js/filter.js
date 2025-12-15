// filter.js
console.log('filter.js loaded');

let selectedRegion = 'all';
let selectedTypes = [];

/* 지방 필터 (단일 + 토글) */
function initRegionFilter() {
    const regionButtons = document.querySelectorAll('.region_chip');

    regionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const region = button.dataset.region;
            const isActive = button.classList.contains('active');

            // 모두 비활성화
            regionButtons.forEach(btn => btn.classList.remove('active'));

            if (isActive) {
                // 다시 클릭 → 선택 해제
                selectedRegion = 'all';

                // 전체 버튼 다시 활성화
                document
                    .querySelector('.region_chip[data-region="all"]')
                    .classList.add('active');
            } else {
                // 새로운 지방 선택
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

            // UI 토글
            button.classList.toggle('active');

            if (button.classList.contains('active')) {
                // 추가
                if (!selectedTypes.includes(type)) {
                    selectedTypes.push(type);
                }
            } else {
                // 제거
                selectedTypes = selectedTypes.filter(t => t !== type);
            }

            console.log('선택된 타입:', selectedTypes);
        });
    });
}

/* 초기화 버튼 */
function initResetButton() {
    const resetBtn = document.querySelector('.action_btn:not(.primary)');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', () => {
        selectedRegion = 'all';
        selectedTypes = [];

        document
            .querySelectorAll('.region_chip')
            .forEach(btn => btn.classList.remove('active'));

        document
            .querySelector('.region_chip[data-region="all"]')
            .classList.add('active');

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


