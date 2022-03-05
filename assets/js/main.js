const url = "https://api.planfact.io/api/v1/operationcategories";
import apiKey from "../../apiKey.json" assert { type: "json" };
const options = {
    headers: {
        "Accept": "application/json",
        "X-ApiKey": apiKey.apiKey
    }
};

// let operationCategories = document.getElementById("operationCategories");
let operationChilds = document.getElementById("operationChilds");
let activeCategory = null;

// 4432174 Активы 4432214 Доходы 4432209 Капитал 4432197 Обязательства 4432221 Расходы
// 1. Получить json со всеми категориями операций
// 2. Для каждой категории проверить, является ли первоначальная категория родительской.
// 3. Если да, то вывести её и рекурсивно найти все её дочерние категории.

async function getOperationChilds(parentId) {
    operationChilds.innerHTML = "";
    makeActive(parentId);

    let response = await fetch(url, options);
    if (response.ok) {
        let json = await response.json();
        let data = json.data;
        console.log(data);

        makeOperationTree(parentId, data.items);
    } else {
        alert("Ошибка HTTP: " + response.status);
    }
}

function makeActive(id) {
    if (activeCategory != null) activeCategory.classList.remove("active");
    activeCategory = document.getElementById("operationCategory" + id);
    activeCategory.classList.add("active");
}

function makeOperationTree(parentId, categories, nesting = 0, parentNode = operationChilds) {
    for (let item in categories) {
        if (categories[item].parentOperationCategoryId == parentId) { // && categories[item].activityType != 0
            let operationNode = document.createElement("p");
            operationNode.classList.add("operationWrap");
            let html = "<h5>";
            for (let i = 0; i < nesting; i++) {
                html += "&#9679;";
            }
            html += categories[item].title + "</h5>";
            operationNode.innerHTML = html;
            operationNode = parentNode.appendChild(operationNode);

            makeOperationTree(categories[item].operationCategoryId, categories, nesting + 1, operationNode);
        }
    }
}

window.onload = function () {
    window.getOperationChilds = getOperationChilds;
    getOperationChilds(4432214);
};