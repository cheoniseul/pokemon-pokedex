async function loadComponent(id, path) {
    const response = await fetch(path);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

// 컴포넌트 로드
async function loadAllComponents() {
    await loadComponent("header", "components/header.html");
    await loadComponent("filter", "components/filter.html");

    // filter DOM 로드
    if (window.initRegionFilter) {
        initFilterToggle();
        initRegionFilter();
        initTypeFilter();
        initResetButton();
    }

    await loadComponent("card-list", "components/card-list.html");

    // 카드 리스트 DOM 로드
    if (window.initCardList) {
        initCardList();
    }

    await loadComponent("footer", "components/footer.html");
}

loadAllComponents();

