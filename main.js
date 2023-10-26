document.addEventListener("DOMContentLoaded", () => {
  const inputBookTitle = document.getElementById("inputBookTitle");
  const inputBookAuthor = document.getElementById("inputBookAuthor");
  const inputBookYear = document.getElementById("inputBookYear");
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");
  const inputBook = document.getElementById("inputBook");
  const searchBookTitle = document.getElementById("searchBookTitle");

  inputBook.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  const RENDER_EVENT = "render-book";

  const books = loadListBookFromLocalStorage();

  document.addEventListener(RENDER_EVENT, updateBook);

  function saveListBookToLocalStorage(books) {
    localStorage.setItem("books", JSON.stringify(books));
  }

  function saveListBookToSessionStorage(books) {
    sessionStorage.setItem("books", JSON.stringify(books));
  }

  function loadListBookFromLocalStorage() {
    const storedBooks =
      localStorage.getItem("books") || sessionStorage.getItem("books");
    return storedBooks ? JSON.parse(storedBooks) : [];
  }

  function searchBook() {
    const searchTerm = searchBookTitle.value.toLowerCase();
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm)
    );

    updateBook(filteredBooks);
  }

  document
    .getElementById("searchBook")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      searchBook();
    });

  function addBook() {
    const title = inputBookTitle.value;
    const author = inputBookAuthor.value;
    const yearInput = inputBookYear.value;
    const isComplete = inputBookIsComplete.checked;

    if (title.trim() === "") {
      return;
    }

    const year = new Date(yearInput).getFullYear();

    const newBook = {
      id: generateId(),
      title,
      author,
      year,
      isComplete,
    };

    books.push(newBook);
    saveListBookToLocalStorage(books);
    saveListBookToSessionStorage(books);
    document.dispatchEvent(new Event(RENDER_EVENT));

    inputBookTitle.value = "";
    inputBookAuthor.value = "";
    inputBookYear.value = "";
    inputBookIsComplete.checked = false;
  }

  function generateId() {
    return +new Date();
  }

  const undoButton = document.getElementById("undoButton");
  let deletedBooks = [];

  undoButton.addEventListener("click", () => {
    if (deletedBooks.length > 0) {
      const bookToUndo = deletedBooks.pop();
      books.push(bookToUndo);
      saveListBookToLocalStorage(books);
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });

  function deleteBook(bookId) {
    const bookIndex = books.findIndex((book) => book.id === bookId);
    if (bookIndex !== -1) {
      const deletedBook = books.splice(bookIndex, 1)[0];
      saveListBookToLocalStorage(books);
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  }

  function undoBook(bookId) {
    const bookIndex = books.findIndex((book) => book.id === bookId);
    if (bookIndex !== -1) {
      const bookToUndo = books[bookIndex];
      if (bookToUndo.isComplete) {
        bookToUndo.isComplete = false;
        saveListBookToLocalStorage(books);
        saveListBookToSessionStorage(books);
        document.dispatchEvent(new Event(RENDER_EVENT));
      }
    }
  }

  function completeBook(bookId) {
    const book = books.find((book) => book.id === bookId);
    if (book) {
      book.isComplete = true;
      saveListBookToLocalStorage(books);
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  }

  function updateBook(filteredBooks) {
    const incompleteBookshelfList = document.getElementById(
      "incompleteBookshelfList"
    );
    const completeBookshelfList = document.getElementById(
      "completeBookshelfList"
    );

    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    const booksToRender = filteredBooks.length > 0 ? filteredBooks : books;

    for (const book of booksToRender) {
      const bookItem = document.createElement("div");
      bookItem.classList.add(
        "book-item",
        "border",
        "border-dark",
        "rounded",
        "m-3",
        "p-3"
      );

      const titleBook = document.createElement("h3");
      titleBook.classList.add("text-primary");
      titleBook.textContent = book.title;

      const authorBook = document.createElement("p");
      authorBook.textContent = `Penulis: ${book.author}`;
      authorBook.classList.add("text-dark");

      const yearBook = document.createElement("p");
      yearBook.textContent = `Tahun: ${book.year}`;

      const actionsElement = document.createElement("div");
      actionsElement.classList.add("actions");

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Hapus";
      deleteButton.addEventListener("click", () => deleteBook(book.id));
      deleteButton.classList.add("btn", "btn-danger", "me-2");
      actionsElement.appendChild(deleteButton);

      if (!book.isComplete) {
        const completeButton = document.createElement("button");
        completeButton.textContent = "Selesai";
        completeButton.addEventListener("click", () => completeBook(book.id));
        actionsElement.appendChild(completeButton);
        completeButton.classList.add("btn", "btn-primary");
      } else if (book.isComplete) {
        const undoButton = document.createElement("button");
        undoButton.textContent = "Batal";
        undoButton.addEventListener("click", () => undoBook(book.id));
        actionsElement.appendChild(undoButton);
        undoButton.classList.add("btn", "btn-primary");
      }

      bookItem.appendChild(titleBook);
      bookItem.appendChild(authorBook);
      bookItem.appendChild(yearBook);
      bookItem.appendChild(actionsElement);

      if (book.isComplete) {
        completeBookshelfList.appendChild(bookItem);
      } else {
        incompleteBookshelfList.appendChild(bookItem);
      }
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
});
