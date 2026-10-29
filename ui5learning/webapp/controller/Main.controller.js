"use strict";

sap.ui.define(
  [
    "ui5learning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/m/Dialog",
    "sap/m/MessageBox",
    "sap/m/Button",
    "sap/m/Text"
  ],
  (...modules) => {
    const [
      BaseController,
      JSONModel,
      Filter,
      FilterOperator,
      FilterType,
      Dialog,
      MessageBox,
      Button,
      Text
    ] = modules;

    return BaseController.extend("ui5learning.controller.Main", {
      onInit() {
        const view = this.getView();
        const booksModel = this.getModel("books");

        view.setModel(
          new JSONModel({
            titleFilter: "",
            selectedGenre: "",
            hasSelection: false,
            genres: []
          }),
          "view"
        );

        view.setBusy(true);
        booksModel.dataLoaded().then(() => {
          if (view.isDestroyed()) {
            return;
          }

          view.setBusy(false);

          if (!Array.isArray(booksModel.getProperty("/books"))) {
            MessageBox.error(
              this.getResourceBundle().getText("booksLoadError")
            );
            return;
          }

          this._updateGenres();
          this.byId("booksToolbar").setEnabled(true);
        });
      },

      onFilter() {
        const table = this.byId("booksTable");
        const viewModel = this.getModel("view");
        // const title = this.byId("titleFilterInput").getValue().trim();
        const title = viewModel.getProperty("/titleFilter").trim();
        //  const genre = this.byId("genreFilterSelect").getSelectedKey();
        const genre = viewModel.getProperty("/selectedGenre");
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

        table.removeSelections(true, true);
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
          AvailableQuantity: null
        };

        booksModel.setProperty("/books", [...books, newBook]);
        this._resetFilters();
      },

      onSelectionChange() {
        const table = this.byId("booksTable");
        const viewModel = this.getModel("view");
        const hasSelection = table.getSelectedContexts().length > 0;

        viewModel.setProperty("/hasSelection", hasSelection);
      },

      onDeleteRecord() {
        const message = new Text(this.createId("deleteConfirmationText"), {
          text: "{i18n>deleteConfirmationMessage}"
        });

        const yesButton = new Button(this.createId("confirmDeleteButton"), {
          text: "{i18n>deleteConfirmationYes}",
          type: "Emphasized"
        });

        const noButton = new Button(this.createId("cancelDeleteButton"), {
          text: "{i18n>deleteConfirmationNo}"
        });

        const dialog = new Dialog(this.createId("deleteConfirmationDialog"), {
          type: "Message",
          state: "Warning",
          title: "{i18n>deleteConfirmationTitle}",
          content: message,
          ariaDescribedBy: message,
          initialFocus: noButton,
          beginButton: yesButton,
          endButton: noButton,
          afterClose: () => dialog.destroy()
        });

        yesButton.attachPress(() => {
          this._deleteSelectedBooks();
          dialog.close();
        });

        noButton.attachPress(() => dialog.close());

        this.getView().addDependent(dialog);
        dialog.open();
      },

      _deleteSelectedBooks() {
        const table = this.byId("booksTable");
        const selectedContexts = table.getSelectedContexts();

        const selectedBooks = new Set(
          selectedContexts.map((context) => context.getObject())
        );
        const booksModel = this.getModel("books");
        const books = booksModel.getProperty("/books");
        const remainingBooks = books.filter((book) => !selectedBooks.has(book));

        table.removeSelections(true, true);
        booksModel.setProperty("/books", remainingBooks);
        this._updateGenres();
      },

      /* Fragment-based dialog implementation
      onDeleteRecord() {
        const table = this.byId("booksTable");

        if (table.getSelectedContexts().length === 0) {
          return;
        }

        if (!this._deleteConfirmationPromise) {
          this._deleteConfirmationPromise = this.loadFragment({
            name: "ui5learning.view.DeleteConfirmation"
          });
        }

        this._deleteConfirmationPromise.then((dialog) => {
          dialog.open();
        });
      },

      onConfirmDelete() {
        const dialog = this.byId("deleteConfirmationDialog");
        const table = this.byId("booksTable");
        const selectedContexts = table.getSelectedContexts();

        if (selectedContexts.length === 0) {
          dialog.close();
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

        dialog.close();
      },

      onCancelDelete() {
        this.byId("deleteConfirmationDialog").close();
      },
      */

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
        this.onSelectionChange();
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

        const allGenresText = this.getResourceBundle().getText("allGenres");
        const viewModel = this.getModel("view");

        // const selectedGenre = this.byId("genreFilterSelect").getSelectedKey();
        const selectedGenre = viewModel.getProperty("/selectedGenre");

        viewModel.setProperty("/genres", [
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
        const viewModel = this.getModel("view");

        viewModel.setProperty("/titleFilter", "");
        viewModel.setProperty("/selectedGenre", "");

        this.onFilter();
      }
    });
  }
);
