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
    "sap/m/Text",
    "sap/ui/core/date/UI5Date"
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
      Text,
      UI5Date
    ] = modules;

    return BaseController.extend("ui5learning.controller.Main", {
      onInit() {
        const view = this.getView();
        const booksModel = this.getModel("books");
        const viewModel = new JSONModel({
          titleFilter: "",
          selectedGenre: "",
          hasSelection: false,
          genres: [],
          booksLoaded: false
        });

        view.setModel(viewModel, "view");

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
          viewModel.setProperty("/booksLoaded", true);
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
              value1: title
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

        table.removeSelections(true, true);
        table.getBinding("items").filter(filters, FilterType.Application);
      },

      async onAddRecord() {
        const viewModel = this.getModel("view");

        viewModel.setProperty("/newBook", {
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: null,
          AvailableQuantity: null
        });
        viewModel.setProperty("/maxReleaseDate", UI5Date.getInstance());

        // Keep the pending load, so a double click does not load the dialog twice
        if (!this._addBookDialog) {
          this._addBookDialog = this.loadFragment({
            name: "ui5learning.view.AddBookDialog"
          });
        }

        const dialog = await this._addBookDialog;
        dialog.open();
      },

      onConfirmAddBook() {
        const fields = [
          "newBookNameInput",
          "newBookAuthorInput",
          "newBookGenreInput",
          "newBookReleaseDatePicker",
          "newBookQuantityInput"
        ].map((id) => this.byId(id));

        const invalidFields = fields.filter(
          (field) => !this._validateField(field)
        );

        if (invalidFields.length > 0) {
          return;
        }

        const viewModel = this.getModel("view");
        const booksModel = this.getModel("books");
        const books = booksModel.getProperty("/books");
        const draft = viewModel.getProperty("/newBook");
        const maxId = Math.max(0, ...books.map((book) => Number(book.ID)));

        const newBook = {
          ID: String(maxId + 1),
          Name: draft.Name.trim(),
          Author: draft.Author.trim(),
          Genre: draft.Genre.trim(),
          ReleaseDate: draft.ReleaseDate,
          AvailableQuantity: draft.AvailableQuantity
        };

        booksModel.setProperty("/books", [...books, newBook]);
        this._updateGenres();
        this._resetFilters();

        this.byId("addBookDialog").close();
      },

      onCancelAddBook() {
        this.byId("addBookDialog").close();
      },

      onAddBookDialogAfterClose() {
        this.byId("addBookDialog").destroy();
        this._addBookDialog = null;
      },

      onFieldChange(event) {
        this._validateField(event.getSource());
      },

      _validateField(field) {
        const errorText = this._getFieldError(field);

        field.setValueState(errorText ? "Error" : "None");
        field.setValueStateText(errorText);

        return !errorText;
      },

      _getFieldError(field) {
        const value = field.getValue();

        if (!value.trim()) {
          return this.getResourceBundle().getText("requiredFieldError");
        }

        const type = field.getBinding("value").getType();

        try {
          type.validateValue(type.parseValue(value, "string"));
        } catch (error) {
          return error.message;
        }

        if (field.isA("sap.m.DatePicker") && !field.isValidValue()) {
          return this.getResourceBundle().getText("futureDateError");
        }

        return "";
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
          endButton: noButton
        });

        yesButton.attachPress(() => {
          this._deleteSelectedBooks();
          dialog.close();
        });

        noButton.attachPress(() => dialog.close());
        dialog.attachAfterClose(() => dialog.destroy());

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
        const editButton = event.getSource();
        const context = editButton.getBindingContext("books");
        const booksModel = this.getModel("books");
        const title = context.getProperty("Name");

        this._getTitleInput(editButton).setValueState("None");
        booksModel.setProperty("DraftTitle", title, context);
        booksModel.setProperty("EditMode", true, context);
      },

      onSaveTitle(event) {
        const saveButton = event.getSource();

        if (!this._validateField(this._getTitleInput(saveButton))) {
          return;
        }

        const table = this.byId("booksTable");
        const context = saveButton.getBindingContext("books");
        const booksModel = this.getModel("books");
        const title = context.getProperty("DraftTitle").trim();

        booksModel.setProperty("Name", title, context);
        booksModel.setProperty("EditMode", false, context);

        table.getBinding("items").refresh(true);
        this.onSelectionChange();
      },

      _getTitleInput(button) {
        const row = button.getParent().getParent();
        const isInput = (control) => control.isA("sap.m.Input");

        return row.findAggregatedObjects(true, isInput)[0];
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
