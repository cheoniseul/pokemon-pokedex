// filter.js
console.log('filter.js loaded');

let selectedRegion = 'all';
let selectedTypes = [];

/* 상세 필터 열기 / 닫기 */
function initFilterToggle() {
    const toggleBtns = document.querySelectorAll('.filter_toggle_btn');
    const detailArea = document.querySelector('.filter_detail');
    const pcBtn = document.querySelector('.pc_only');
    const mobileBtn = document.querySelector('.mobile_only');

    if (!detailArea || !toggleBtns.length) return;

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isOpen = detailArea.classList.toggle('open');

            // 아이콘 회전 동기화
            toggleBtns.forEach(b => {
                const icon = b.querySelector('i');
                if (icon) icon.classList.toggle('rotated', isOpen);
            });

            // 모바일 전용 버튼 전환
            if (window.innerWidth <= 768) {
                if (pcBtn) pcBtn.style.display = isOpen ? 'none' : 'inline-flex';
                if (mobileBtn) mobileBtn.style.display = isOpen ? 'flex' : 'none';
            }

            // 열릴 때만 자동 스크롤
            if (isOpen && window.innerWidth <= 768) {
                setTimeout(() => {
                    const offset = 80;
                    const y =
                        detailArea.getBoundingClientRect().top +
                        window.pageYOffset -
                        offset;

                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });
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
