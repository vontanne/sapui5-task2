sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("ui5learning.controller.Main", {
      onInit() {
        const booksModel = new JSONModel({
          books: [
            {
              ID: "1",
              Name: "Roadside Picnic",
              Author: "Arkady and Boris Strugatsky",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1972, 6, 1),
              AvailableQuantity: 12
            },
            {
              ID: "2",
              Name: "Hard to Be a God",
              Author: "Arkady and Boris Strugatsky",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1964, 0, 1),
              AvailableQuantity: 7
            },
            {
              ID: "3",
              Name: "Modern Operating Systems",
              Author: "Andrew S. Tanenbaum and Herbert Bos",
              Genre: "Computer Science",
              ReleaseDate: new Date(2022, 9, 14),
              AvailableQuantity: 5
            },
            {
              ID: "4",
              Name: "Dune",
              Author: "Frank Herbert",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1965, 7, 1),
              AvailableQuantity: 20
            },
            {
              ID: "5",
              Name: "Real World OCaml",
              Author: "Yaron Minsky and Anil Madhavapeddy",
              Genre: "Computer Science",
              ReleaseDate: new Date(2022, 9, 13),
              AvailableQuantity: 8
            },
            {
              ID: "6",
              Name: "Foundation and Empire",
              Author: "Isaac Asimov",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1952, 0, 1),
              AvailableQuantity: 15
            },
            {
              ID: "7",
              Name: "2001: A Space Odyssey",
              Author: "Arthur C. Clarke",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1968, 5, 1),
              AvailableQuantity: 0
            },
            {
              ID: "8",
              Name: "The Time Machine",
              Author: "H. G. Wells",
              Genre: "Science Fiction",
              ReleaseDate: new Date(1895, 4, 7),
              AvailableQuantity: 10
            }
          ]
        });

        this.getView().setModel(booksModel, "books");
      }
    });
  }
);
