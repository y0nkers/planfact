const url = "https://api.planfact.io/api/v1/operationcategories";
import apiKey from "../../apiKey.json" assert { type: "json" };
const getOptions = {
    method: 'GET',
    headers: {
        "Content-Type": "application/json",
        "X-ApiKey": apiKey.apiKey
    }
};

const postOptions = {

};

// let operationCategories = document.getElementById("operationCategories");
let operationChilds = document.getElementById("operationChilds");
let accountingArticles = null;
let activeCategory = null;
let activeArticle = null;
let selectArticleCategory = document.getElementById("selectArticleCategory");

// 4432174 Активы 4432214 Доходы 4432209 Капитал 4432197 Обязательства 4432221 Расходы
// 1. Получить json со всеми категориями операций
// 2. Для каждой категории проверить, является ли первоначальная категория родительской.
// 3. Если да, то вывести её и рекурсивно найти все её дочерние категории.

async function getArticlesJSON() {
    let response = await fetch(url, getOptions);
    if (response.ok) {
        let json = await response.json();
        console.log(json.data);
        return json.data.items;
    } else {
        alert("Ошибка HTTP: " + response.status);
        return null;
    }
}

async function postArticlesJSON() {
    let title = "test2";
    let operationCategoryType = "Income";
    let activityType = "Operating";
    let parentOperationCategoryId = 4432214;
    let data = { "title": title, "operationCategoryType": operationCategoryType, "activityType": activityType, "parentOperationCategoryId": parentOperationCategoryId};
    //console.log(JSON.stringify(data));
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-ApiKey": apiKey.apiKey
        },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let json = await response.json();
        console.log(json);
    } else {
        alert("Ошибка HTTP: " + response.status);
    }
}

async function reloadArticles(parentId) {
    accountingArticles = await getArticlesJSON();
    if (accountingArticles != null) {
        operationChilds.innerHTML = "";
        makeActiveCategory(parentId);
        makeOperationTree(parentId, accountingArticles);
    }
}

function makeActiveCategory(id) {
    if (activeCategory != null) activeCategory.classList.remove("active");
    activeCategory = document.getElementById("operationCategory" + id);
    activeCategory.classList.add("active");
}

function makeOperationTree(parentId, categories, nesting = 0, parentNode = operationChilds) {
    for (let item in categories) {
        if (categories[item].parentOperationCategoryId == parentId) { // && categories[item].activityType != 0
            let operationNode = document.createElement("p");
            operationNode.classList.add("operationWrap");
            let html = '<h5 class="d-inline-block">';
            for (let i = 0; i < nesting; i++) {
                html += "&#9679;";
            }
            html += categories[item].title + "</h5>";
            html += '<h5 class="text-end">Редактировать</h5><h5 class="text-end">Удалить </h5>';
            operationNode.innerHTML = html;
            operationNode = parentNode.appendChild(operationNode);

            makeOperationTree(categories[item].operationCategoryId, categories, nesting + 1, operationNode);
        }
    }
}

async function reloadSelect(parentId) {
    accountingArticles = await getArticlesJSON();
    if (accountingArticles != null) {
        while (selectArticleCategory.options.length > 1) selectArticleCategory.remove(1); // Удаляем все пункты кроме первого
        makeActiveArticle(parentId);
        makeSelectArticleCategory(parentId, accountingArticles);
    }
}

function makeActiveArticle(id) {
    if (activeArticle != null) activeArticle.classList.remove("active");
    activeArticle = document.getElementById("createArticle" + id);
    activeArticle.classList.add("active");
}

function makeSelectArticleCategory(parentId, categories, nesting = 0) {
    for (let item in categories) {
        if (categories[item].parentOperationCategoryId == parentId) {
            let newOption = document.createElement('option');
            let html = '';
            for (let i = 0; i < nesting; i++) {
                html += "&#9679;";
            }
            html = categories[item].title;
            newOption.innerHTML = html;
            newOption.id = "option" + categories[item].operationCategoryId;
            selectArticleCategory.appendChild(newOption);
            makeSelectArticleCategory(categories[item].operationCategoryId, categories, nesting + 1);
        }
    }
}
// console.log(document.getElementById('selectArticleCategory').options[document.getElementById('selectArticleCategory').selectedIndex].id);
async function btnCreateArticle() {
    document.getElementById('createArticleModal').style.display = 'flex';
    let id = activeCategory.id.substring("operationCategory".length);
    reloadSelect(id);
}


window.onload = function () {
    window.reloadArticles = reloadArticles;
    window.btnCreateArticle = btnCreateArticle;
    window.reloadSelect = reloadSelect;
    reloadArticles(4432214);
    //postArticlesJSON();
};