/* global df */

self.csControls = self.csControls || {};

self.csControls.WebFilterManager = class WebFilterManager extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tString, "psLocalStorageKey", "");
    }

    /* -------------------- lifecycle -------------------- */

    create(tDef) {
        super.create(tDef);

        // Allow the WebApp to finish constructing before reporting
        // whether a saved filter layout already exists.
        self.setTimeout(() => {
            this.checkSavedFilters(this.psLocalStorageKey);
        }, 0);
    }

    /* -------------------- local storage -------------------- */

    checkSavedFilters(sKey) {
        try {
            const bFound = self.localStorage.getItem(sKey) !== null;
    
            this.serverAction("OnLocalStorageStatus", [
                df.fromBool(bFound)
            ]);
        } catch (oError) {
            this.reportLocalStorageError("check", oError);
        }
    }
    
    saveFilters(sKey, sFilters) {
        try {
            self.localStorage.setItem(sKey, sFilters);
    
            this.serverAction("OnLocalStorageStatus", [
                df.fromBool(true)
            ]);
        } catch (oError) {
            this.reportLocalStorageError("save", oError);
        }
    }
        
    loadSavedFilters(sKey) {
        try {
            const sFilters = self.localStorage.getItem(sKey);
            const bFound = sFilters !== null;
    
            this.serverAction("OnLocalStorageFiltersLoaded", [
                bFound ? sFilters : "",
                df.fromBool(bFound)
            ]);
        } catch (oError) {
            this.reportLocalStorageError("load", oError);
        }
    }
        
    removeSavedFilters(sKey) {
        try {
            self.localStorage.removeItem(sKey);
    
            this.serverAction("OnLocalStorageStatus", [
                df.fromBool(false)
            ]);
        } catch (oError) {
            this.reportLocalStorageError("remove", oError);
        }
    }

    /* -------------------- error handling -------------------- */

    reportLocalStorageError(sOperation, oError) {
        const sMessage = oError && oError.message
            ? oError.message
            : String(oError);

        this.serverAction("OnLocalStorageError", [
            sOperation,
            sMessage
        ]);
    }
};