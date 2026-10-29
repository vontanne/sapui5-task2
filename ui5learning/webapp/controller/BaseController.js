sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
  "use strict";

  return Controller.extend("ui5learning.controller.BaseController", {
    getModel(modelName) {
      const viewModel = this.getView().getModel(modelName);
      return viewModel || this.getOwnerComponent().getModel(modelName);
    },

    getResourceBundle() {
      return this.getModel("i18n").getResourceBundle();
    }
  });
});
