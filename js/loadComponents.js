async function loadComponent(id, path) {
    const response = await fetch(path);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

// 컴포넌트 로드
loadComponent("header", "components/header.html");
loadComponent("filter", "components/filter.html");
loadComponent("card-list", "components/card-list.html");
loadComponent("footer", "components/footer.html");
