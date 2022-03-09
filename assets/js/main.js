const url = "https://api.planfact.io/api/v1/operationcategories";
import apiKey from "../../apiKey.json" assert { type: "json" };

const headers = {
    "Content-Type": "application/json",
    "X-ApiKey": apiKey.apiKey
};

let operationChilds = document.getElementById("operationChilds");
let selectArticleCategory_CREATE = document.getElementById("selectArticleCategory_CREATE");
let selectArticleCategory_EDIT = document.getElementById("selectArticleCategory_EDIT");
let activeCategory = null;
let activeCreateArticle = null;
let activeEditArticle = null;

let accountingArticles = null;
let categoryTypes = new Map([
    [4432214, "Income"],
    [4432221, "Outcome"],
    [4432174, "Assets"],
    [4432197, "Liabilities"],
    [4432209, "Capital"]
]);

/* JSON ARTICLES */

async function getArticlesJSON() { // Получение всех статей
    let response = await fetch(url, {
        method: 'GET',
        headers: headers
    });
    if (response.ok) {
        let json = await response.json();
        console.log(json);
        return json.data.items;
    } else {
        alert("Ошибка HTTP: " + response.status);
        return null;
    }
}

async function getArticleJSON(id) { // Получение одной статьи по id
    let response = await fetch(url + '/' + id, {
        method: 'GET',
        headers: headers
    });
    if (response.ok) {
        let json = await response.json();
        return json;
    } else {
        alert("Ошибка HTTP: " + response.status);
        return null;
    }
}

async function postArticleJSON(title, operationCategoryType, parentOperationCategoryId, activityType = "Operating") { // Добавление новой статьи
    let data = { "title": title, "operationCategoryType": operationCategoryType, "parentOperationCategoryId": parentOperationCategoryId, "activityType": activityType };
    let response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let json = await response.json();
        console.log(json);
        return json;
    } else {
        alert("Ошибка HTTP: " + response.status);
        return null;
    }
}

async function putArticleJSON(id, title, operationCategoryType, parentOperationCategoryId, activityType = "Operating") { // Изменение существующей статьи
    let data = { "title": title, "operationCategoryType": operationCategoryType, "parentOperationCategoryId": parentOperationCategoryId, "activityType": activityType };
    let response = await fetch(url + '/' + id, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let json = await response.json();
        console.log(json);
        return json;
    } else {
        alert("Ошибка HTTP: " + response.status);
        return null;
    }
}

async function deleteArticleJSON(id) { // Удаление статьи по id
    let response = await fetch(url + '/' + id, {
        method: 'DELETE',
        headers: headers
    });
    if (response.ok) {
        let json = await response.json();
        console.log(json);
        return json;
    } else {
        alert("Ошибка HTTP: " + response.status);
        return null;
    }
}

/* GET ARTICLES */

async function reloadArticles(parentId) { // Выводим на экран статьи, принадлежащие текущему типу
    accountingArticles = await getArticlesJSON();
    if (accountingArticles != null) {
        operationChilds.innerHTML = "";
        makeActiveCategory(parentId);
        makeArticlesTree(parentId, accountingArticles);
    }
}

function makeActiveCategory(id) { // Делаем выбранный тип статей активным
    if (activeCategory != null) activeCategory.classList.remove("active");
    activeCategory = document.getElementById("operationCategory" + id);
    activeCategory.classList.add("active");
}

function makeArticlesTree(parentId, articles, nesting = 0, parentNode = operationChilds) { // Рекурсивно выводим все статьи одного типа
    for (let item in articles) {
        let article = articles[item];
        if (article.parentOperationCategoryId == parentId) {
            let id = article.operationCategoryId;
            let operationNode = document.createElement("div");
            operationNode.classList.add("operationWrap");
            let html = '<div class="d-flex align-items-start"><h5 class="me-auto">';
            for (let i = 0; i < nesting; i++) {
                html += "&#9679;";
            }
            html += article.title + "</h5>";
            html += '<button id="edit' + id + '" onclick="editArticleMenu(' + id + ')">Редактировать</button><button id="delete' + id + '" onclick="deleteArticle(' + id + ')">Удалить</button></div>';
            operationNode.innerHTML = html;
            operationNode = parentNode.appendChild(operationNode);

            makeArticlesTree(id, articles, nesting + 1, operationNode);
        }
    }
}

/* CREATE ARTICLE */

async function reloadCreateSelect(parentId) { // Сетапим форму создания статьи
    accountingArticles = await getArticlesJSON();
    if (accountingArticles != null) {
        while (selectArticleCategory_CREATE.options.length > 1) selectArticleCategory_CREATE.remove(1); // Удаляем все пункты кроме первого
        makeActiveCreateArticle(parentId);
        makeSelectCreateArticleCategory(parentId, accountingArticles);
    }
}

function makeActiveCreateArticle(id) {  // В форме создания делаем ранее выбранный тип активным
    if (activeCreateArticle != null) activeCreateArticle.classList.remove("active");
    activeCreateArticle = document.getElementById("createArticle" + id);
    activeCreateArticle.classList.add("active");
}

function makeSelectCreateArticleCategory(parentId, articles, nesting = 0) { // Создаём в select пункты со всеми категориями статей
    for (let item in articles) {
        let article = articles[item];
        if (article.parentOperationCategoryId == parentId) {
            let newOption = document.createElement('option');
            let html = '';
            for (let i = 0; i < nesting; i++) {
                html += "-";
            }
            html = article.title;
            newOption.innerHTML = html;
            newOption.id = "createOption" + article.operationCategoryId;
            selectArticleCategory_CREATE.appendChild(newOption);
            makeSelectCreateArticleCategory(article.operationCategoryId, articles, nesting + 1);
        }
    }
}

async function createArticle() { // Создание статьи
    let title = document.getElementById('selectArticleTitle_CREATE').value;
    if (title == '') {
        alert('Укажите название статьи!');
        return;
    }

    let categoryId = parseInt(activeCreateArticle.id.substring("createArticle".length));
    let categoryType = categoryTypes.get(categoryId);
    if (categoryType === undefined) {
        alert('Некорректный тип статьи!');
        return;
    }

    let parentId = parseInt((selectArticleCategory_CREATE.options[selectArticleCategory_CREATE.selectedIndex].id).substring("createOption".length));
    if (parentId == 0) parentId = categoryId;

    let answer = await postArticleJSON(title, categoryType, parentId);
    if (answer != null) {
        if (answer.isSuccess) {
            alert("Статья успешно добавлена!");
            window.location.reload();
        }
        else {
            alert("Ошибка при добавлении статьи: " + answer.errorMessage);
            return;
        }
    }
}

// EDIT ARTICLE

async function reloadEditSelect(parentId) { // Сетапим форму редактирования статьи
    accountingArticles = await getArticlesJSON();
    if (accountingArticles != null) {
        while (selectArticleCategory_EDIT.options.length > 1) selectArticleCategory_EDIT.remove(1); // Удаляем все пункты кроме первого
        makeActiveEditArticle(parentId);
        makeSelectEditArticleCategory(parentId, accountingArticles);
    }
}

function makeActiveEditArticle(id) { // Делаем выбранным нужный тип статьи 
    if (activeEditArticle != null) activeEditArticle.classList.remove("active");
    activeEditArticle = document.getElementById("editArticle" + id);
    activeEditArticle.classList.add("active");
}

function makeSelectEditArticleCategory(parentId, articles, nesting = 0) { // Создаём в select пункты со всеми категориями статей
    for (let item in articles) {
        let article = articles[item];
        if (article.parentOperationCategoryId == parentId) {
            let newOption = document.createElement('option');
            let html = '';
            for (let i = 0; i < nesting; i++) {
                html += "-";
            }
            html = article.title;
            newOption.innerHTML = html;
            newOption.id = "editOption" + article.operationCategoryId;
            selectArticleCategory_EDIT.appendChild(newOption);
            makeSelectEditArticleCategory(article.operationCategoryId, articles, nesting + 1);
        }
    }
}

async function editArticle(articleId) { // Изменяем статью
    let title = document.getElementById('selectArticleTitle_EDIT').value;
    if (title == '') {
        alert('Укажите название статьи!');
        return;
    }

    let categoryId = parseInt(activeEditArticle.id.substring("editArticle".length));
    let categoryType = categoryTypes.get(categoryId);
    if (categoryType === undefined) {
        alert('Некорректный тип статьи!');
        return;
    }

    let parentId = parseInt((selectArticleCategory_EDIT.options[selectArticleCategory_EDIT.selectedIndex].id).substring("editOption".length));
    if (parentId == 0) parentId = categoryId;

    let answer = await putArticleJSON(articleId, title, categoryType, parentId);
    if (answer != null) {
        if (answer.isSuccess) {
            alert("Статья успешно отредактирована!");
            window.location.reload();
        }
        else {
            alert("Ошибка при редактировании статьи: " + answer.errorMessage);
            return;
        }
    }
}

// DELETE ARTICLE

async function deleteArticle(id) { // Удаляем статью
    let isConfirm = confirm("Вы уверены?");
    if (isConfirm) {
        let answer = await deleteArticleJSON(id);
        if (answer != null) {
            if (answer.isSuccess) {
                alert("Статья успешно удалена!");
                window.location.reload();
            }
            else {
                alert("Ошибка при удалении статьи: " + answer.errorMessage);
                return;
            }
        }
    }
}

// MODALS

async function createArticleMenu() { // Открытие формы создания статьи
    let id = parseInt(activeCategory.id.substring("operationCategory".length));
    reloadCreateSelect(id);
    document.getElementById('createArticleModal').style.display = 'flex';
}

async function editArticleMenu(articleId) { // Открытие формы редактирования статьи
    let article = await getArticleJSON(articleId); // Получаем редактируемую статью
    if (article != null) {
        if (!article.isSuccess) {
            alert("Такой статьи не существует!");
            return;
        }
    }

    document.getElementById('selectArticleTitle_EDIT').value = article.data.title; // В поле ввода пишем название изменяемой статьи

    let category = article.data.operationCategoryType;
    let parent = "editOption" + article.data.parentOperationCategoryId;
    let categoryId;
    for (let key of categoryTypes.keys()) { // Находим id одного из 5 типов, к которому принадлежит статья
        let value = categoryTypes.get(key);
        if (value == category) categoryId = key;
    }

    let select = document.getElementById('selectArticleCategory_EDIT');
    await reloadEditSelect(categoryId);
    for (let i = 0; i < select.length; i++) {
        if (select.options[i].id == parent) {
            select.value = select.options[i].value; // Делаем выбранной категорию изменяемой статьи
            break;
        }
    }

    document.getElementById('btnEditArticle').onclick = function () { editArticle(articleId); }; // Назначаем обработчик изменения статьи на кнопку "Сохранить"
    document.getElementById('editArticleModal').style.display = 'flex';
}

window.onload = function () {
    window.reloadArticles = reloadArticles;
    window.reloadCreateSelect = reloadCreateSelect;
    window.reloadEditSelect = reloadEditSelect;
    window.createArticleMenu = createArticleMenu;
    window.editArticleMenu = editArticleMenu;
    window.createArticle = createArticle;
    window.editArticle = editArticle;
    window.deleteArticle = deleteArticle;
    reloadArticles(4432214);
};