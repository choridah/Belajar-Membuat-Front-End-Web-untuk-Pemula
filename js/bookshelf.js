const bookshelfs = [];
const RENDER_EVENT = "render-bookshelf";

document.addEventListener("DOMContentLoaded", function () {
 
    const submitForm = document.getElementById("form");
 
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBookshelf();
        alert("Book added");
    });

    //membuat web app menampilkan data dari localStorage
    if(isStorageExist()){
        loadDataFromStorage();
    }
});

function addBookshelf() {
    const textTitleBookshelf = document.getElementById("titleBook").value;
    const author = document.getElementById("author").value;
    const timestamp = document.getElementById("year").value;
  
    const generatedID = generateId();
    const bookshelfObject = generateBookshelfObject(generatedID, textTitleBookshelf, author, timestamp, false);
    bookshelfs.push(bookshelfObject);
   
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookshelfObject(id, titleBook, author, timestamp, isCompleted) {
    return {
        id,
        titleBook,
        author,
        timestamp,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {

    const uncompletedBookshelfList = document.getElementById("bookshelfs");
    uncompletedBookshelfList.innerHTML = "";
    const completedBookshelfList = document.getElementById("completed-bookshelfs");
    completedBookshelfList.innerHTML = "";
    
    for(bookshelfItem of bookshelfs){
        const bookshelfElement = makeBookshelf(bookshelfItem);
        if(bookshelfItem.isCompleted == false)
            uncompletedBookshelfList.append(bookshelfElement);
        else
            completedBookshelfList.append(bookshelfElement);
    }
});

function makeBookshelf(bookshelfObject) {
    const textTitleBook = document.createElement("h2");
    textTitleBook.innerText = bookshelfObject.titleBook;
    const textAuthor = document.createElement("h4");
    textAuthor.innerText = bookshelfObject.author;
    const textTimestamp = document.createElement("p");
    textTimestamp.innerText = bookshelfObject.timestamp;
    const textContainer = document.createElement("div");
    textContainer.classList.add("inner")
    textContainer.append(textTitleBook, textAuthor, textTimestamp);
  
    const container = document.createElement("div");
    container.classList.add("item", "shadow")

    container.append(textContainer);
    container.setAttribute("id", `bookshelf-${bookshelfObject.id}`);
  
    if(bookshelfObject.isCompleted){
        const undoButton = document.createElement("button");
        undoButton.setAttribute("class", "undo-button");
        undoButton.innerText = "Undo";
        undoButton.addEventListener("click", function () {
            let messege = "Was this book returned to the 'Not Finished Reading' shelf?";
            if (confirm(messege) == true) {
                undoTitleBookFromCompleted(bookshelfObject.id);
            }
        });
   
        const trashButton = document.createElement("button");
        trashButton.setAttribute("class", "trash-button");
        trashButton.innerText = "Remove";
        trashButton.addEventListener("click", function () {
            let messege = "Are you sure to delete it?";
            if (confirm(messege) == true) {
                removeTitleBookFromCompleted(bookshelfObject.id);
            } 
        });
   
        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement("button");
        checkButton.setAttribute("class", "check-button");
        checkButton.innerText = "Checklist";

        const trashButtonYet = document.createElement("button");
        trashButtonYet.setAttribute("class", "trash-button");
        trashButtonYet.innerText = "Remove";
        trashButtonYet.addEventListener("click", function () {
            let messege = "Are you sure to delete it?";
            if (confirm(messege) == true) {
                removeTitleBookFromUncompleted(bookshelfObject.id);
            } 
        });

        checkButton.addEventListener("click", function () {
            let messege = "Have you finished it?";
            if (confirm(messege) == true) {
                addTitleBookToCompleted(bookshelfObject.id);
            }
        });
        container.append(checkButton, trashButtonYet);
    }
   
    return container;
}

function addTitleBookToCompleted(bookId) {
 
    const bookshelfTarget = findBookshelf(bookId);
    if(bookshelfTarget == null) return;
    bookshelfTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function findBookshelf(bookId){
    for(bookshelfItem of bookshelfs){
        if(bookshelfItem.id === bookId){
            return bookshelfItem
        }
    }
    return null
}

function removeTitleBookFromCompleted(bookId) {
    const bookshelfTarget = findBookshelfIndex(bookId);
    if(bookshelfTarget === -1) return;
    bookshelfs.splice(bookshelfTarget, 1);
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTitleBookFromUncompleted(bookId) {
    const bookshelfTargetYet = findBookshelfIndex(bookId);
    if(bookshelfTargetYet === -1) return;
    bookshelfs.splice(bookshelfTargetYet, 1);
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}
function undoTitleBookFromCompleted(bookId){
    const bookshelfTarget = findBookshelf(bookId);
    if(bookshelfTarget == null) return;
   
   
    bookshelfTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookshelfIndex(bookId) {
    for(index in bookshelfs){
        if(bookshelfs[index].id === bookId){
            return index
        }
    }
    return -1
}

const SAVED_EVENT = "saved-bookshelf";
const STORAGE_KEY = "BOOKSHELF_APPS";

function saveData() {
    if(isStorageExist()){
        const parsed = JSON.stringify(bookshelfs);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() /* boolean */ {
  if(typeof(Storage) === undefined){
      alert("Browser kamu tidak mendukung local storage");
      return false
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if(data !== null){
        for(book of data){
            bookshelfs.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchBook = document.getElementById("formItem");
searchBook.addEventListener('submit', function(event){
    document.getElementById("listBook").innerHTML = '';
    const keywordSearch = document.getElementById("keyword").value;
    event.preventDefault();
    const keywordTitle = keywordSearch.toLowerCase();
    for (let bookshelfItem of bookshelfs) {
        const titleBook = bookshelfItem.titleBook.toLowerCase();
        const author = bookshelfItem.author.toLowerCase();
        if(titleBook.includes(keywordTitle) || author.includes(keywordTitle)){
            const bookshelfElement = makeBookshelf(bookshelfItem);
            document.getElementById("listBook").append(bookshelfElement);
        }
    }
});

