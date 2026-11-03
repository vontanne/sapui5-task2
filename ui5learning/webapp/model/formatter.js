sap.ui.define([], () => {
  "use strict";

  const isTemporalSupported = typeof Temporal !== "undefined";

  return {
    publishedYear(releaseDate) {
      if (!releaseDate) {
        return "";
      }

      // I switched to Temporal.PlainDate to avoid time-zone shifts
      // that can make new Date() show the wrong year.
      const year = isTemporalSupported
        ? Temporal.PlainDate.from(releaseDate).year
        : releaseDate.slice(0, 4);

      return this.getResourceBundle().getText("publishedYear", [year]);
    }
  };
});
