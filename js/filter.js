// filter.js
// 필터 UI + 선택 값 콘솔 확인

let selectedRegion = 'all';
let selectedTypes = [];

document.addEventListener('DOMContentLoaded', () => {
    initFilterUI();
});

function initFilterUI() {
    setupRegionFilter();
    setupTypeFilter();
}

/* 지방 필터 (단일 선택) */
function setupRegionFilter() {
    const regionButtons = document.querySelectorAll(
        '.filter_region .filter_chip'
    );

    regionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // UI 처리
            regionButtons.forEach(btn =>
                btn.classList.remove('active')
            );
            button.classList.add('active');

            // 값 저장
            selectedRegion = button.dataset.region;

            // 콘솔 확인
            console.log('선택된 지방:', selectedRegion);
        });
    });
}

/* 타입 필터 (다중 선택) */
function setupTypeFilter() {
    const typeButtons = document.querySelectorAll(
        '.filter_type .filter_chip'
    );

    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;

            // UI 토글
            button.classList.toggle('active');

            // 값 처리
            if (button.classList.contains('active')) {
                selectedTypes.push(type);
            } else {
                selectedTypes = selectedTypes.filter(t => t !== type);
            }

            // 콘솔 확인
            console.log('선택된 타입:', selectedTypes);
        });
    });
}
