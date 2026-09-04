/* global df */

self.sWebModalFloatingPanel = class sWebModalFloatingPanel extends df.WebModalDialog {
    constructor(sName, oParent) {
        super(sName, oParent);

        // Existing behaviour
        this.prop(df.tBool, "pbDrawerRight", true);
        this.prop(df.tBool, "pbSlideFromRight", true); // reserved for later

        // NEW (optional) FloatByControl mode — ONLY used when set
        // Pass the DataFlex object name (long name) of the control to anchor to.
        this.prop(df.tString, "psFloatByControl", "");
        this.prop(df.tBool,   "pbNaturalWidth",  false); // true = use panel's natural width
        this.prop(df.tBool,   "pbShrinkIfNoSpace", false); // clamp height if screen is short

        // internal guard to avoid recursive resize calls
        this._inPos = false;
        this._tFollow = null;
    }

    /* -------------------- lifecycle -------------------- */

    afterRender() {
        super.afterRender();
        if (!this._eElem) return;

        // If FloatByControl is configured, use that. Otherwise keep your drawer-right baseline.
        if (this._isFloatBy()) {
            this._setupFloatBy();
            this._positionFloatBy();
        } else if (this.pbDrawerRight) {
            this._setupDrawerRight();
            this.updateDrawerHeight();
        }
    }

    afterShow() {
        df.WebModalDialog.prototype.afterShow.call(this);
        if (this._isFloatBy()) {
            this._positionFloatBy();
        } else if (this.pbDrawerRight) {
            this.updateDrawerHeight();
        }
    }

    resizeVertical() {
        df.WebModalDialog.prototype.resizeVertical.call(this);
        if (this._isFloatBy()) {
            this._positionFloatBy();
        } else if (this.pbDrawerRight) {
            this.updateDrawerHeight();
        }
    }

    onWindowResize(oEvent) {
        if (this._isFloatBy()) {
            this._positionFloatBy();
            return;
        }
        if (this.pbDrawerRight) {
            this.updateDrawerHeight();
            return;
        }
        super.onWindowResize(oEvent);
    }

    /* -------------------- public setters -------------------- */

    // React to piTop changes at runtime (drawer mode)
    set_piTop(iVal) {
        this._bHasTop = true;
        this.piTop = parseInt(iVal, 10) || 0;

        if (!this._eElem) return;

        if (this._isFloatBy()) {
            // float-by: re-position relative to anchor
            this._positionFloatBy();
        } else if (this.pbDrawerRight) {
            this._eElem.style.top = this.piTop + "px";
            this.updateDrawerHeight();
        }
    }

    // Allow changing anchor at runtime
    set_psFloatByControl(sVal) {
        if (this.psFloatByControl === sVal) return;
        this.psFloatByControl = sVal || "";

        if (!this._eElem) return;

        // switching modes? clear drawer CSS then re-init
        if (this._isFloatBy()) {
            this._teardownDrawerRight();
            this._setupFloatBy();
            this._positionFloatBy();
        } else {
            this._teardownFloatBy();
            this._setupDrawerRight();
            this.updateDrawerHeight();
        }
    }

    /* -------------------- drawer-right (baseline) -------------------- */

    _setupDrawerRight() {
        df.dom.addClass(this._eElem, "WebWin_DrawerRight");

        // Dock to the right, honor piTop
        this._eElem.style.position   = "fixed";
        this._eElem.style.top        = (this.piTop || 0) + "px";
        this._eElem.style.right      = "0px";
        this._eElem.style.left       = "auto";
        this._eElem.style.marginLeft = "0px";
        this._eElem.style.marginTop  = "0px";

        // Tell base code we manage top/left so it won't center
        this._bHasTop  = true;
        this._bHasLeft = true;

        // Disable drag/resize affordances
        this.set_pbResizable(false);
        if (this._eHeader) {
            df.dom.off("mousedown", this._eHeader, this.onStartDrag, this);
        }
    }

    _teardownDrawerRight() {
        df.dom.removeClass(this._eElem, "WebWin_DrawerRight");
        // let WebWindow decide placement again if needed
    }

    // JS height calculation: fill viewport from piTop down (your original logic)
    updateDrawerHeight() {
        if (!this._eElem || !this.pbDrawerRight || this._isFloatBy()) return;

        const iScreenHeight = df.dom.windowHeight();
        const iTop = Math.max(0, this.piTop || 0); // offset from top
        let iHeight = iScreenHeight - iTop;
        if (iHeight < 0) iHeight = 0;

        // Outer dialog
        this._eElem.style.top       = iTop + "px";
        this._eElem.style.height    = iHeight + "px";
        this._eElem.style.maxHeight = iHeight + "px";

        // WebWindow internals
        if (this._eControlWrap)  this._eControlWrap.style.height = iHeight + "px";
        if (this._eContainer)    this._eContainer.style.height   = iHeight + "px";
        if (this._eSizer)        this._eSizer.style.minHeight    = iHeight + "px";
    }

    /* -------------------- FloatByControl (optional) -------------------- */

    _isFloatBy() {
        return !!(this.psFloatByControl && this.psFloatByControl.length);
    }

    _getAnchorElem() {
        const wa = this.getWebApp();
        if (!wa || !this.psFloatByControl) return null;

        const oObj = wa.findObj(this.psFloatByControl);
        if (!oObj) return null;

        let eRef = oObj._eElem;
        if (oObj.getTooltipElem) {
            eRef = oObj.getTooltipElem() || eRef;
        }
        return eRef || null;
    }

    _setupFloatBy() {
        // Use fixed positioning for viewport-relative math
        this._eElem.style.position = "fixed";

        // we manage placement; suppress auto-centering
        this._bHasTop  = true;
        this._bHasLeft = true;

        // Follow the anchor while visible (like FloatingPanel does)
        if (this._tFollow) {
            clearInterval(this._tFollow);
            this._tFollow = null;
        }
        this._tFollow = setInterval(() => {
            if (this._eElem && this.pbVisible) {
                this._positionFloatBy();
            }
        }, 500);
    }

    _teardownFloatBy() {
        if (this._tFollow) {
            clearInterval(this._tFollow);
            this._tFollow = null;
        }
    }

    _positionFloatBy() {
        if (this._inPos || !this._eElem || !this._isFloatBy()) return;
        this._inPos = true;

        try {
            const eRef = this._getAnchorElem();
            if (!eRef) return;

            // viewport dims
            const vw = df.dom.windowWidth();
            const vh = df.dom.windowHeight();

            // requested sizes
            let iWidth  = this.piWidth;
            let iHeight = this.piHeight;

            // actual content size (for natural width/height decisions)
            const actualH = this._eElem.offsetHeight;
            const actualW = this._eElem.offsetWidth;

            // anchor rect (includes scroll)
            const r = df.sys.gui.getBoundRect(eRef);
            if (!r || (!r.top && !r.left && !r.width && !r.height)) return;

            // width: match anchor unless explicit width or natural requested
            if (iWidth <= 0 && !this.pbNaturalWidth) {
                iWidth = r.width;
            }
            if (iWidth > vw - 20) {
                iWidth = vw - 20;
            }

            // place below anchor, centered
            let top  = r.bottom;
            let left = r.left + (r.width / 2) - ((this.pbNaturalWidth ? actualW : iWidth) / 2);
            if (left < 5) left = 5;

            // if overflowing right, pin to right (10px) instead
            let right = -1;
            if (left + iWidth > vw) {
                left  = -1;
                right = 10;
            }

            // handle height / flip above if needed
            let bTop = true;
            let calcH = actualH;
            if (iHeight > calcH) calcH = iHeight;

            if (top + calcH > vh) {
                if (!this.pbShrinkIfNoSpace) {
                    top = Math.max(0, r.top - calcH);
                    bTop = false;
                }
                // clamp if still too tall
                if (top + (iHeight || calcH) > vh) {
                    if (iHeight > 0 || this.pbShrinkIfNoSpace) {
                        iHeight = vh - top - 30;
                    } else {
                        top = Math.max(0, vh - (iHeight || calcH));
                    }
                }
            }

            // apply geometry
            this._eElem.style.top    = top + "px";
            this._eElem.style.left   = (left  >= 0 ? left  + "px" : "");
            this._eElem.style.right  = (right >= 0 ? right + "px" : "");

            // size inner area using WebWindow helper so chrome math stays correct
            if (iWidth > 0) {
                this.setOuterWidth(iWidth);
            }
            if (iHeight > 0) {
                this.setOuterHeight(iHeight);
                this._eElem.style.maxHeight = "";
            } else {
                const maxH = vh - top - 30;
                this._eElem.style.maxHeight = maxH + "px";
            }

            // (no arrow visuals in ModalDialog; just keep class hooks if needed)
            df.dom.toggleClass(this._eElem, "WebWin_FloatBelow", bTop);
            df.dom.toggleClass(this._eElem, "WebWin_FloatAbove", !bTop);

        } finally {
            this._inPos = false;
        }
    }

    /* -------------------- center suppression -------------------- */

    centerWindow() {
        // never auto-center when we control placement
        if (this._isFloatBy() || this.pbDrawerRight) return;
        super.centerWindow();
    }
};
