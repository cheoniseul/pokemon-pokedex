import {
  initFilterToggle,
  initRegionFilter,
  initTypeFilter,
  initResetButton,
  initSearchFilter
} from "./filter.js";

import { initCardList } from "./card-list.js";

/* 컴포넌트 로드 */
async function loadComponent(id, path) {
    const response = await fetch(path);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

/* 전체 초기화 */
async function loadAllComponents() {
    console.log("loadAllComponents start");

    // header
    await loadComponent("header", "components/header.html");

    // filter
    await loadComponent("filter", "components/filter.html");
    initFilterToggle();
    initRegionFilter();
    initTypeFilter();
    initResetButton();
    initSearchFilter();

    // card list (HTML only)
    await loadComponent("card-list", "components/card-list.html");
    console.log("card-list HTML loaded");

    // 카드 리스트 로직 시작
    initCardList();
    console.log("initCardList called");

    // footer
    await loadComponent("footer", "components/footer.html");
}

// 실행
loadAllComponents();
