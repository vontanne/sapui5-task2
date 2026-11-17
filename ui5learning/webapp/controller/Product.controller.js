sap.ui.define(["ui5learning/controller/BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("ui5learning.controller.Product", {
    onInit() {
      const router = this.getOwnerComponent().getRouter();
      const productRoute = router.getRoute("RouteProduct");

      productRoute.attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched(event) {
      const productId = event.getParameter("arguments").productId;

      this.getView().bindElement({
        path: `/Products(${productId})`,
        model: "demoV2",
        parameters: { expand: "Supplier" }
      });
    }
  });
});
