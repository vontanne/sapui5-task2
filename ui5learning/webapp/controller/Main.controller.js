sap.ui.define(
  [
    "ui5learning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType"
  ],
  (BaseController, JSONModel, Filter, FilterOperator, FilterType) => {
    "use strict";

    return BaseController.extend("ui5learning.controller.Main", {
      onInit() {
        const booksModel = new JSONModel({
          filterInput: "",
          selectedGenre: "",
          books: [
            {
              ID: "1",
              Name: "Roadside Picnic",
              Author: "Arkady and Boris Strugatsky",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1972, 6, 1),
              AvailableQuantity: 12,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "2",
              Name: "Hard to Be a God",
              Author: "Arkady and Boris Strugatsky",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1964, 0, 1),
              AvailableQuantity: 7,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "3",
              Name: "Modern Operating Systems",
              Author: "Andrew S. Tanenbaum and Herbert Bos",
              Genre: "Computer Science",
              ReleaseDate: new Date(2022, 9, 14),
              AvailableQuantity: 5,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "4",
              Name: "Dune",
              Author: "Frank Herbert",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1965, 7, 1),
              AvailableQuantity: 20,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "5",
              Name: "Real World OCaml",
              Author: "Yaron Minsky and Anil Madhavapeddy",
              Genre: "Computer Science",
              ReleaseDate: new Date(2022, 9, 13),
              AvailableQuantity: 8,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "6",
              Name: "Foundation and Empire",
              Author: "Isaac Asimov",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1952, 0, 1),
              AvailableQuantity: 15,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "7",
              Name: "2001: A Space Odyssey",
              Author: "Arthur C. Clarke",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1968, 5, 1),
              AvailableQuantity: 0,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "8",
              Name: "The Time Machine",
              Author: "H. G. Wells",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1895, 4, 7),
              AvailableQuantity: 10,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "9",
              Name: "Lectures on Linear Algebra",
              Author: "Israel M. Gelfand",
              Genre: "Mathematics",
              ReleaseDate: new Date(1961, 0, 1),
              AvailableQuantity: 7,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "10",
              Name: "Elementary Number Theory",
              Author: "Edmund Landau",
              Genre: "Mathematics",
              ReleaseDate: new Date(1999, 0, 1),
              AvailableQuantity: 4,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "11",
              Name: "Object-Oriented Analysis and Design with Applications",
              Author: "Grady Booch et al.",
              Genre: "Computer Science",
              ReleaseDate: new Date(2007, 3, 30),
              AvailableQuantity: 5,
              EditMode: false,
              DraftTitle: ""
            },
            {
              ID: "12",
              Name: "The Left Hand of Darkness",
              Author: "Ursula K. Le Guin",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1969, 2, 1),
              AvailableQuantity: 9,
              EditMode: false,
              DraftTitle: ""
            }
          ]
        });

        this.getView().setModel(booksModel, "books");
        this._updateGenres();
      },

      onFilter() {
        const table = this.byId("booksTable");
        const booksModel = this.getModel("books");
        // const title = this.byId("titleFilterInput").getValue().trim();
        const title = booksModel.getProperty("/filterInput").trim();
        //  const genre = this.byId("genreFilterSelect").getSelectedKey();
        const genre = booksModel.getProperty("/selectedGenre");
        const filters = [];

        if (title) {
          filters.push(
            new Filter({
              path: "Name",
              operator: FilterOperator.Contains,
              value1: title,
              caseSensitive: false
            })
          );
        }

        if (genre) {
          filters.push(
            new Filter({
              path: "Genre",
              operator: FilterOperator.EQ,
              value1: genre,
              caseSensitive: true
            })
          );
        }

        const tableFilters =
          filters.length > 0 ? [new Filter({ filters, and: true })] : [];

        table.removeSelections(true);
        table.getBinding("items").filter(tableFilters, FilterType.Application);
      },

      onAddRecord() {
        const booksModel = this.getModel("books");
        const books = booksModel.getProperty("/books");

        const newBook = {
          ID: "",
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: null,
          AvailableQuantity: null,
          EditMode: false,
          DraftTitle: ""
        };

        booksModel.setProperty("/books", [...books, newBook]);
        this._resetFilters();
      },

      onDeleteRecord() {
        const table = this.byId("booksTable");
        const selectedContexts = table.getSelectedContexts();

        if (selectedContexts.length === 0) {
          return;
        }

        const selectedBooks = new Set(
          selectedContexts.map((context) => context.getObject())
        );
        const booksModel = this.getModel("books");
        const books = booksModel.getProperty("/books");
        const remainingBooks = books.filter((book) => !selectedBooks.has(book));

        table.removeSelections(true);
        booksModel.setProperty("/books", remainingBooks);
        this._updateGenres();
      },

      onEditTitle(event) {
        const context = event.getSource().getBindingContext("books");
        const rowPath = context.getPath();
        const booksModel = this.getModel("books");
        const title = booksModel.getProperty(`${rowPath}/Name`);

        booksModel.setProperty(`${rowPath}/DraftTitle`, title);
        booksModel.setProperty(`${rowPath}/EditMode`, true);
      },

      onSaveTitle(event) {
        const table = this.byId("booksTable");
        const context = event.getSource().getBindingContext("books");
        const rowPath = context.getPath();
        const booksModel = this.getModel("books");
        const title = booksModel.getProperty(`${rowPath}/DraftTitle`);

        booksModel.setProperty(`${rowPath}/Name`, title);
        booksModel.setProperty(`${rowPath}/EditMode`, false);

        table.getBinding("items").refresh(true);
      },

      _updateGenres() {
        const booksModel = this.getModel("books");
        const books = booksModel.getProperty("/books");

        const genres = books
          .map((book) => book.Genre)
          .filter((genre) => genre !== "");

        const uniqueGenres = [...new Set(genres)].sort();

        const genreItems = uniqueGenres.map((genre) => ({
          key: genre,
          text: genre
        }));

        const allGenresText = this.getModel("i18n")
          .getResourceBundle()
          .getText("allGenres");

        // const selectedGenre = this.byId("genreFilterSelect").getSelectedKey();
        const selectedGenre = booksModel.getProperty("/selectedGenre");

        booksModel.setProperty("/genres", [
          { key: "", text: allGenresText },
          ...genreItems
        ]);

        if (selectedGenre && !uniqueGenres.includes(selectedGenre)) {
          this._resetFilters();
        }
      },

      _resetFilters() {
        // this.byId("titleFilterInput").setValue("");
        // this.byId("genreFilterSelect").setSelectedKey("");
        const booksModel = this.getModel("books");

        booksModel.setProperty("/filterInput", "");
        booksModel.setProperty("/selectedGenre", "");

        this.onFilter();
      }
    });
  }
);
