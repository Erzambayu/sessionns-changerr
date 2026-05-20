"use strict";
(() => {
  // src/shared/utils/domain.ts
  function extractDomain(hostname) {
    return hostname.replace(/^www\./, "");
  }
  function getDomainFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const domain = extractDomain(urlObj.hostname);
      const isLocalhost = domain === "localhost" || domain.startsWith("127.");
      const port = urlObj.port;
      if (isLocalhost && port) {
        return `${domain}:${port}`;
      }
      return domain;
    } catch (_) {
      console.error("Invalid URL:", url);
      return "";
    }
  }

  // src/shared/utils/errorHandling.ts
  var ExtensionError = class extends Error {
    constructor(message, code) {
      super(message);
      this.code = code;
      this.name = "ExtensionError";
    }
  };
  function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    if (error instanceof ExtensionError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  }

  // src/popup/utils/constants.ts
  var CSS_CLASSES = {
    SHOW: "show",
    LOADING: "loading",
    ACTIVE: "active",
    SESSION_ITEM: "session-item",
    SESSION_BTN: "action-btn",
    NO_SESSIONS: "empty-state"
  };
  var UI_TEXT = {
    NO_SESSIONS: "No sessions saved for this site",
    UNNAMED_SESSION: "Unnamed Session",
    LAST_USED: "Last used:",
    LOADING: "Loading...",
    SAVE_SUCCESS: "Session saved successfully",
    SWITCH_SUCCESS: "Session switched successfully",
    DELETE_SUCCESS: "Session deleted successfully"
  };

  // src/popup/components/loadingManager.ts
  var LoadingManager = class {
    constructor() {
      this.isLoading = false;
    }
    showLoading() {
      if (!this.isLoading) {
        document.body.classList.add(CSS_CLASSES.LOADING);
        this.isLoading = true;
      }
    }
    hideLoading() {
      if (this.isLoading) {
        document.body.classList.remove(CSS_CLASSES.LOADING);
        this.isLoading = false;
      }
    }
    async withLoading(operation) {
      try {
        this.showLoading();
        return await operation();
      } finally {
        this.hideLoading();
      }
    }
  };

  // src/popup/utils/dom.ts
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  function getElementByIdSafe(id) {
    const element = document.getElementById(id);
    if (!element) {
      // console.warn(`Element not found with id: ${id}`); // Suppress warning for optional elements
      return null;
    }
    return element;
  }

  // src/popup/components/modalManager.ts
  var ModalManager = class {
    constructor() {
      this.modals = {
        save: getElementByIdSafe("saveModal"),
        rename: getElementByIdSafe("renameModal"),
        delete: getElementByIdSafe("deleteModal"),
        error: getElementByIdSafe("errorModal"),
        about: getElementByIdSafe("aboutModal"),
        newSessionConfirm: getElementByIdSafe("newSessionConfirmModal"),
        clearSession: getElementByIdSafe("clearSessionModal"),
        exportImport: getElementByIdSafe("exportImportModal"),
        replaceConfirm: getElementByIdSafe("replaceConfirmModal"),
        pinSetup: getElementByIdSafe("pinSetupModal"),
        pinVerify: getElementByIdSafe("pinVerifyModal"),
        securitySettings: getElementByIdSafe("securitySettingsModal")
      };
      this.inputs = {
        sessionName: getElementByIdSafe("sessionName"),
        sessionOrder: getElementByIdSafe("sessionOrder"),
        newSessionName: getElementByIdSafe("newSessionName"),
        newSessionOrder: getElementByIdSafe("newSessionOrder"),
        importFileInput: getElementByIdSafe("importFileInput"),
        pinSetupInput: getElementByIdSafe("pinSetupInput"),
        pinConfirmInput: getElementByIdSafe("pinConfirmInput"),
        pinVerifyInput: getElementByIdSafe("pinVerifyInput")
      };
      this.setupEventListeners();
      this.setupTabSystem();
    }
    setupEventListeners() {
      const closeButtons = [
        { id: "closeSaveModal", modal: "save" },
        { id: "cancelSave", modal: "save" },
        { id: "closeRenameModal", modal: "rename" },
        { id: "cancelRename", modal: "rename" },
        { id: "closeDeleteModal", modal: "delete" },
        { id: "cancelDelete", modal: "delete" },
        { id: "closeErrorModal", modal: "error" },
        { id: "closeErrorModalBtn", modal: "error" },
        { id: "closeAboutModal", modal: "about" },
        { id: "closeAboutModalBtn", modal: "about" },
        { id: "closeNewSessionConfirmModal", modal: "newSessionConfirm" },
        { id: "cancelNewSession", modal: "newSessionConfirm" },
        { id: "closeClearSessionModal", modal: "clearSession" },
        { id: "cancelClearSession", modal: "clearSession" },
        { id: "closeExportImportModal", modal: "exportImport" },
        { id: "closeExportImportModalBtn", modal: "exportImport" },
        { id: "closeReplaceConfirmModal", modal: "replaceConfirm" },
        { id: "cancelReplaceConfirm", modal: "replaceConfirm" },
        { id: "closePinSetupModal", modal: "pinSetup" },
        { id: "cancelPinSetup", modal: "pinSetup" },
        { id: "closePinVerifyModal", modal: "pinVerify" },
        { id: "cancelPinVerify", modal: "pinVerify" },
        { id: "closeSecuritySettingsModal", modal: "securitySettings" },
        { id: "closeSecuritySettingsBtn", modal: "securitySettings" }
      ];
      closeButtons.forEach(({ id, modal }) => {
        const el = getElementByIdSafe(id);
        if (el) el.addEventListener("click", () => this.hide(modal));
      });
      if (this.inputs.importFileInput) {
        this.inputs.importFileInput.addEventListener("change", () => {
          const importBtn = getElementByIdSafe("importBtn");
          if (importBtn) importBtn.disabled = !this.inputs.importFileInput.files || this.inputs.importFileInput.files.length === 0;
        });
      }
      if (this.inputs.sessionName) {
        this.inputs.sessionName.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const btn = getElementByIdSafe("confirmSave");
            if (btn) btn.click();
          }
        });
      }
      if (this.inputs.newSessionName) {
        this.inputs.newSessionName.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const btn = getElementByIdSafe("confirmRename");
            if (btn) btn.click();
          }
        });
      }
      if (this.inputs.pinSetupInput) {
        this.inputs.pinSetupInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); const btn = getElementByIdSafe("confirmPinSetup"); if (btn) btn.click(); }
        });
      }
      if (this.inputs.pinConfirmInput) {
        this.inputs.pinConfirmInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); const btn = getElementByIdSafe("confirmPinSetup"); if (btn) btn.click(); }
        });
      }
      if (this.inputs.pinVerifyInput) {
        this.inputs.pinVerifyInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); const btn = getElementByIdSafe("confirmPinVerify"); if (btn) btn.click(); }
        });
      }
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.hideVisible();
        }
        if (e.key === "Enter") {
          if (this.isVisible("delete")) {
            e.preventDefault();
            const btn = getElementByIdSafe("confirmDelete");
            if (btn) btn.click();
          }
          if (this.isVisible("error")) {
            e.preventDefault();
            const btn = getElementByIdSafe("closeErrorModal");
            if (btn) btn.click();
          }
        }
      });
      Object.entries(this.modals).forEach(([key, modal]) => {
        if (modal) {
          modal.addEventListener("click", (e) => {
            if (e.target === modal) this.hide(key);
          });
        }
      });
    }
    showSaveModal(defaultName = "Unnamed Session", order) {
      if (this.inputs.sessionName) this.inputs.sessionName.value = defaultName;
      if (this.inputs.sessionOrder) this.inputs.sessionOrder.value = order.toString();
      this.show("save");
      if (this.inputs.sessionName) {
        this.inputs.sessionName.focus();
        this.inputs.sessionName.select();
      }
    }
    showRenameModal(currentName, currentOrder) {
      if (this.inputs.newSessionName) this.inputs.newSessionName.value = currentName;
      if (this.inputs.newSessionOrder) this.inputs.newSessionOrder.value = currentOrder.toString();
      this.show("rename");
      if (this.inputs.newSessionName) {
        this.inputs.newSessionName.focus();
        this.inputs.newSessionName.select();
      }
    }
    showDeleteModal(sessionName) {
      const deleteSessionNameEl = document.getElementById("deleteSessionName");
      if (deleteSessionNameEl) {
        deleteSessionNameEl.textContent = sessionName;
      }
      this.show("delete");
      if (this.modals.delete) this.modals.delete.focus();
    }
    showErrorModal(message) {
      const errorMessageEl = document.getElementById("errorMessage");
      if (errorMessageEl) {
        errorMessageEl.textContent = message;
      }
      this.show("error");
      if (this.modals.error) this.modals.error.focus();
    }
    showAboutModal() {
      this.show("about");
      if (this.modals.about) this.modals.about.focus();
    }
    showNewSessionConfirmModal() {
      this.show("newSessionConfirm");
      if (this.modals.newSessionConfirm) this.modals.newSessionConfirm.focus();
    }
    getSaveModalInput() {
      return {
        name: this.inputs.sessionName ? this.inputs.sessionName.value.trim() : "",
        order: this.inputs.sessionOrder ? this.inputs.sessionOrder.value : "0"
      };
    }
    getRenameModalInput() {
      return {
        name: this.inputs.newSessionName ? this.inputs.newSessionName.value.trim() : "",
        order: this.inputs.newSessionOrder ? this.inputs.newSessionOrder.value : "0"
      };
    }
    hideSaveModal() {
      this.hide("save");
    }
    hideRenameModal() {
      this.hide("rename");
    }
    hideDeleteModal() {
      this.hide("delete");
    }
    hideErrorModal() {
      this.hide("error");
    }
    hideAboutModal() {
      this.hide("about");
    }
    hideNewSessionConfirmModal() {
      this.hide("newSessionConfirm");
    }
    hideClearSessionModal() {
      this.hide("clearSession");
    }
    hideExportImportModal() {
      this.hide("exportImport");
    }
    hideReplaceConfirmModal() {
      this.hide("replaceConfirm");
    }
    // PIN Modal Methods
    showPinSetupModal() {
      if (this.inputs.pinSetupInput) this.inputs.pinSetupInput.value = "";
      if (this.inputs.pinConfirmInput) this.inputs.pinConfirmInput.value = "";
      const errorEl = document.getElementById("pinSetupError");
      if (errorEl) errorEl.textContent = "";
      this.show("pinSetup");
      if (this.inputs.pinSetupInput) this.inputs.pinSetupInput.focus();
    }
    hidePinSetupModal() {
      this.hide("pinSetup");
    }
    showPinVerifyModal() {
      if (this.inputs.pinVerifyInput) this.inputs.pinVerifyInput.value = "";
      const errorEl = document.getElementById("pinVerifyError");
      if (errorEl) errorEl.textContent = "";
      this.show("pinVerify");
      if (this.inputs.pinVerifyInput) this.inputs.pinVerifyInput.focus();
    }
    hidePinVerifyModal() {
      this.hide("pinVerify");
    }
    showSecuritySettingsModal() {
      this.show("securitySettings");
      if (this.modals.securitySettings) this.modals.securitySettings.focus();
    }
    hideSecuritySettingsModal() {
      this.hide("securitySettings");
    }
    getPinSetupInput() {
      return {
        pin: this.inputs.pinSetupInput ? this.inputs.pinSetupInput.value : "",
        confirm: this.inputs.pinConfirmInput ? this.inputs.pinConfirmInput.value : ""
      };
    }
    getPinVerifyInput() {
      return this.inputs.pinVerifyInput ? this.inputs.pinVerifyInput.value : "";
    }
    showPinSetupError(message) {
      const errorEl = document.getElementById("pinSetupError");
      if (errorEl) errorEl.textContent = message;
    }
    showPinVerifyError(message) {
      const errorEl = document.getElementById("pinVerifyError");
      if (errorEl) errorEl.textContent = message;
    }
    showClearSessionModal() {
      this.show("clearSession");
      if (this.modals.clearSession) this.modals.clearSession.focus();
    }
    showExportImportModal() {
      this.show("exportImport");
      if (this.modals.exportImport) this.modals.exportImport.focus();
      if (this.inputs.importFileInput) this.inputs.importFileInput.value = "";
      const importBtn = getElementByIdSafe("importBtn");
      if (importBtn) importBtn.disabled = true;
    }
    showReplaceConfirmModal(sessionName) {
      const replaceSessionNameEl = document.getElementById("replaceSessionName");
      if (replaceSessionNameEl) {
        replaceSessionNameEl.textContent = sessionName;
      }
      this.show("replaceConfirm");
      if (this.modals.replaceConfirm) this.modals.replaceConfirm.focus();
    }
    getClearSessionOption() {
      // Updated to use radio buttons
      const radio = document.querySelector('input[name="clearOption"]:checked');
      return radio ? radio.value : "current";
    }
    getExportOption() {
      // Updated to use radio buttons
      const radio = document.querySelector('input[name="exportOption"]:checked');
      return radio ? radio.value : "current";
    }
    getExportFormat() {
      const radio = document.querySelector('input[name="exportFormat"]:checked');
      return radio ? radio.value : "json";
    }
    setupTabSystem() {
      const exportTabBtn = document.getElementById("exportTabBtn");
      const importTabBtn = document.getElementById("importTabBtn");
      const exportTab = document.getElementById("exportTab");
      const importTab = document.getElementById("importTab");
      if (exportTabBtn && importTabBtn && exportTab && importTab) {
        exportTabBtn.addEventListener("click", () => {
          exportTabBtn.classList.add("active");
          importTabBtn.classList.remove("active");
          exportTab.classList.add("active");
          importTab.classList.remove("active");
        });
        importTabBtn.addEventListener("click", () => {
          importTabBtn.classList.add("active");
          exportTabBtn.classList.remove("active");
          importTab.classList.add("active");
          exportTab.classList.remove("active");
        });
      }
    }
    getImportFile() {
      return this.inputs.importFileInput && this.inputs.importFileInput.files && this.inputs.importFileInput.files.length > 0 ? this.inputs.importFileInput.files[0] : null;
    }
    hideAllModals() {
      this.hideVisible();
      if (this.inputs.sessionName) this.inputs.sessionName.value = "";
      if (this.inputs.sessionOrder) this.inputs.sessionOrder.value = "";
      if (this.inputs.newSessionName) this.inputs.newSessionName.value = "";
      if (this.inputs.newSessionOrder) this.inputs.newSessionOrder.value = "";
      if (this.inputs.importFileInput) this.inputs.importFileInput.value = "";
    }
    isVisible(modalKey) {
      return this.modals[modalKey]?.classList.contains(CSS_CLASSES.SHOW) || false;
    }
    hideVisible() {
      Object.entries(this.modals).forEach(([key, modal]) => {
        if (modal && modal.classList.contains(CSS_CLASSES.SHOW)) {
          this.hide(key);
        }
      });
    }
    show(modalKey) {
      const m = this.modals[modalKey];
      if (!m) return;
      this._lastFocus = document.activeElement;
      m.classList.add(CSS_CLASSES.SHOW);
      m.setAttribute("aria-hidden", "false");
      // basic focus trap
      this._activeKey = modalKey;
      this._trapHandler = (e) => {
        if (e.key !== "Tab") return;
        const focusables = m.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      m.addEventListener("keydown", this._trapHandler);
    }
    hide(modalKey) {
      const m = this.modals[modalKey];
      if (!m) return;
      m.classList.remove(CSS_CLASSES.SHOW);
      m.setAttribute("aria-hidden", "true");
      if (this._activeKey === modalKey && this._trapHandler) {
        m.removeEventListener("keydown", this._trapHandler);
        this._trapHandler = null;
        this._activeKey = null;
      }
      // restore focus
      if (this._lastFocus && typeof this._lastFocus.focus === "function") {
        try { this._lastFocus.focus(); } catch (_) {}
      }
    }
  };

  // src/shared/utils/date.ts
  function formatDate(timestamp) {
    if (!timestamp || Number.isNaN(Number(timestamp))) return "—";
    const d = new Date(Number(timestamp));
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // src/popup/components/sessionList.ts
  var SessionList = class {
    constructor(container) {
      this.container = container;
      if (this.container) {
        this.container.addEventListener("click", this.handleClick.bind(this));
        this.container.addEventListener("keydown", (e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          const item = e.target.closest(`.${CSS_CLASSES.SESSION_ITEM}`);
          if (!item) return;
          if (e.target.closest(`.${CSS_CLASSES.SESSION_BTN}`)) return;
          e.preventDefault();
          if (this.onSessionClick) this.onSessionClick(item.dataset.sessionId);
        });
      } else {
        console.error("SessionList: container element not found");
      }
    }
    setEventHandlers(handlers) {
      this.onSessionClick = handlers.onSessionClick;
      this.onRenameClick = handlers.onRenameClick;
      this.onDeleteClick = handlers.onDeleteClick;
      this.onDuplicateClick = handlers.onDuplicateClick;
    }
    render(sessions, activeSessions, currentDomain, searchQuery = "") {
      if (!this.container) {
        console.error("SessionList: Cannot render, container is null");
        return;
      }
      let domainSessions = sessions.filter((s) => s.domain === currentDomain).sort((a, b) => (a.order || 0) - (b.order || 0));

      // Apply search filter
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        domainSessions = domainSessions.filter(s => (s.name || "").toLowerCase().includes(lowerQuery));
      }

      const activeSessionId = activeSessions[currentDomain];
      if (domainSessions.length === 0) {
        if (searchQuery) {
          this.container.replaceChildren();
          const wrap = document.createElement("div");
          wrap.className = "empty-state";
          const p = document.createElement("p");
          p.textContent = `No sessions found matching "${searchQuery}"`;
          wrap.appendChild(p);
          this.container.appendChild(wrap);
        } else {
          this.renderEmptyState();
        }
        // sync count footer too
        const countEl = document.getElementById("sessionCount");
        if (countEl) countEl.textContent = "0 sessions";
        return;
      }
      this.renderSessions(domainSessions, activeSessionId);
    }

    renderEmptyState() {
      this.container.replaceChildren();
      const wrap = document.createElement("div");
      wrap.className = "empty-state";
      const icon = document.createElement("div");
      icon.className = "empty-icon";
      icon.textContent = "·";
      icon.setAttribute("aria-hidden", "true");
      const p = document.createElement("p");
      p.textContent = UI_TEXT.NO_SESSIONS;
      const btn = document.createElement("button");
      btn.id = "createFirstSessionBtnList";
      btn.className = "btn btn-primary btn-sm";
      btn.textContent = "Save current session";
      btn.addEventListener("click", () => {
        const saveBtn = document.getElementById("saveBtn");
        if (saveBtn) saveBtn.click();
      });
      wrap.append(icon, p, btn);
      this.container.appendChild(wrap);
    }
    renderSessions(sessions, activeSessionId) {
      // DOM building (no innerHTML for user-controlled data) → safe against
      // attribute-injection from imported session names / domains.
      const frag = document.createDocumentFragment();
      sessions.forEach((session) => {
        const isActive = session.id === activeSessionId;
        const item = document.createElement("div");
        item.className = `${CSS_CLASSES.SESSION_ITEM}${isActive ? " " + CSS_CLASSES.ACTIVE : ""}`;
        item.dataset.sessionId = session.id;
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-label", `Switch to session ${session.name}`);

        // info column
        const info = document.createElement("div");
        info.className = "session-info";
        const nameRow = document.createElement("div");
        nameRow.className = "session-name";
        const fav = document.createElement("img");
        fav.className = "session-favicon";
        fav.alt = "";
        fav.width = 16;
        fav.height = 16;
        fav.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(session.domain || "")}&sz=32`;
        nameRow.appendChild(fav);
        const badge = document.createElement("span");
        badge.className = "session-badge";
        badge.textContent = `#${Number.isFinite(session.order) ? session.order : "?"}`;
        nameRow.appendChild(badge);
        const nameTxt = document.createElement("span");
        nameTxt.className = "session-name-text";
        nameTxt.textContent = session.name || UI_TEXT.UNNAMED_SESSION;
        nameRow.appendChild(nameTxt);
        if (isActive) {
          const dot = document.createElement("span");
          dot.className = "active-dot";
          dot.setAttribute("aria-label", "active");
          dot.title = "Active session";
          nameRow.appendChild(dot);
        }
        info.appendChild(nameRow);
        const meta = document.createElement("div");
        meta.className = "session-meta";
        meta.textContent = `${UI_TEXT.LAST_USED} ${formatDate(session.lastUsed)}`;
        info.appendChild(meta);

        // actions
        const actions = document.createElement("div");
        actions.className = "session-actions";
        const mkBtn = (action, label, icon) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = `${CSS_CLASSES.SESSION_BTN} ${action}-btn`;
          b.dataset.action = action;
          b.dataset.sessionId = session.id;
          b.title = label;
          b.setAttribute("aria-label", `${label} ${session.name}`);
          b.textContent = icon;
          return b;
        };
        actions.appendChild(mkBtn("duplicate", "Duplicate", "⎘"));
        actions.appendChild(mkBtn("rename", "Edit", "✎"));
        actions.appendChild(mkBtn("delete", "Delete", "✕"));

        item.appendChild(info);
        item.appendChild(actions);
        frag.appendChild(item);
      });
      this.container.replaceChildren(frag);

      // Update session count in footer
      const countEl = document.getElementById("sessionCount");
      if (countEl) {
        const n = sessions.length;
        countEl.textContent = `${n} session${n !== 1 ? "s" : ""}`;
      }
    }
    handleClick(e) {
      const target = e.target;
      const btn = target.closest(`.${CSS_CLASSES.SESSION_BTN}`);

      if (btn) {
        e.stopPropagation();
        const action = btn.dataset.action;
        const sessionId = btn.dataset.sessionId;
        if (!sessionId) return;
        if (action === "rename" && this.onRenameClick) {
          this.onRenameClick(sessionId);
        } else if (action === "delete" && this.onDeleteClick) {
          this.onDeleteClick(sessionId);
        } else if (action === "duplicate" && this.onDuplicateClick) {
          this.onDuplicateClick(sessionId);
        }
        return;
      }
      const sessionItem = target.closest(`.${CSS_CLASSES.SESSION_ITEM}`);
      if (sessionItem && this.onSessionClick) {
        const sessionId = sessionItem.dataset.sessionId;
        if (sessionId) {
          this.onSessionClick(sessionId);
        }
      }
    }
  };

  // src/popup/utils/defaultValue.ts
  var storedSessionDefaultValue = {
    cookies: [],
    localStorage: {},
    sessionStorage: {},
    indexedDB: {}
  };

  // src/shared/constants/messages.ts
  var MESSAGE_ACTIONS = {
    GET_CURRENT_SESSION: "getCurrentSession",
    SWITCH_SESSION: "switchSession",
    CLEAR_SESSION: "clearSession",
    CLEAR_SESSIONS: "clearSessions",
    EXPORT_SESSIONS: "exportSessions",
    IMPORT_SESSIONS: "importSessions",
    AUTO_REFRESH_SESSION: "autoRefreshSession"
  };

  // src/shared/constants/storageKeys.ts
  var STORAGE_KEYS = {
    SESSIONS: "sessions",
    ACTIVE_SESSIONS: "activeSessions",
    PIN_HASH: "pinHash",
    PIN_SALT: "pinSalt",
    PIN_ENABLED: "pinEnabled",
    PIN_VERSION: "pinVersion"
  };

  // src/shared/utils/idGenerator.ts
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // src/shared/utils/validation.ts
  function validateSessionName(name) {
    const trimmed = name.trim();
    return trimmed || "Unnamed Session";
  }

  // src/popup/services/chromeApi.service.ts
  var ChromeApiService = class {
    async getCurrentTab() {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        throw new Error("No active tab found");
      }
      return tabs[0];
    }
    async sendMessage(message, timeoutMs = 30000) {
      return new Promise((resolve) => {
        let settled = false;
        const finish = (resp) => { if (!settled) { settled = true; resolve(resp); } };
        const timer = setTimeout(() => {
          finish({ success: false, error: "Background did not respond in time. The page may be busy or unresponsive." });
        }, timeoutMs);
        try {
          chrome.runtime.sendMessage(message, (response) => {
            clearTimeout(timer);
            if (chrome.runtime.lastError) {
              console.error("Chrome runtime error:", chrome.runtime.lastError);
              finish({
                success: false,
                error: chrome.runtime.lastError.message || "Could not establish connection. Receiving end does not exist."
              });
            } else if (!response) {
              finish({ success: false, error: "No response received from background script" });
            } else {
              finish(response);
            }
          });
        } catch (error) {
          clearTimeout(timer);
          console.error("Error sending message:", error);
          finish({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
      });
    }
    async getStorageData(keys) {
      return chrome.storage.local.get(keys);
    }
    async setStorageData(data) {
      return chrome.storage.local.set(data);
    }
  };

  // src/popup/services/popup.service.ts
  var PopupService = class {
    constructor() {
      this.chromeApi = new ChromeApiService();
      this.state = {
        currentDomain: "",
        currentTab: {},
        sessions: [],
        activeSessions: {},
        currentRenameSessionId: "",
        currentDeleteSessionId: ""
      };
    }
    async initialize() {
      try {
        this.state.currentTab = await this.chromeApi.getCurrentTab();
        if (!this.state.currentTab.url) {
          throw new ExtensionError("Unable to get current tab URL");
        }
        this.state.currentDomain = getDomainFromUrl(this.state.currentTab.url);
        await this.loadStorageData();
        return { ...this.state };
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.initialize"));
      }
    }
    async saveCurrentSession(name, order) {
      try {
        const validatedName = validateSessionName(name);
        const response = await this.chromeApi.sendMessage({
          action: MESSAGE_ACTIONS.GET_CURRENT_SESSION,
          domain: this.state.currentDomain,
          tabId: this.state.currentTab.id
        });
        if (!response.success) {
          throw new ExtensionError(response.error || "Failed to get current session");
        }
        const storedSession = response.data ?? storedSessionDefaultValue;
        const domainSessions = this.state.sessions.filter((s) => s.domain === this.state.currentDomain);
        const autoNext = domainSessions.length > 0 ? Math.max(...domainSessions.map((s) => s.order || 0)) + 1 : 1;
        if (order === void 0 || order === "" || order === null) {
          order = autoNext;
        } else {
          const parsed = parseInt(order, 10);
          order = Number.isFinite(parsed) ? parsed : autoNext;
        }

        // Auto-increment orders if collision
        this.state.sessions.forEach((s) => {
          if (s.domain === this.state.currentDomain && typeof order === "number" && s.order >= order) {
            s.order++;
          }
        });
        const newSession = {
          ...storedSession,
          id: generateId(),
          name: validatedName,
          order,
          domain: this.state.currentDomain,
          createdAt: Date.now(),
          lastUsed: Date.now()
        };
        this.state.sessions.push(newSession);
        this.state.activeSessions[this.state.currentDomain] = newSession.id;
        await this.saveStorageData();
        return newSession;
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.saveCurrentSession"));
      }
    }
    async switchToSession(sessionId) {
      if (!sessionId) {
        console.error("Invalid session ID provided");
        throw new ExtensionError("Invalid session ID");
      }
      try {
        console.log(`Attempting to switch to session: ${sessionId}`);
        const session = this.state.sessions.find((s) => s.id === sessionId);
        if (!session) {
          console.error(`Session not found: ${sessionId}`);
          throw new ExtensionError("Session not found");
        }
        if (!this.state.currentTab.id) {
          console.error("No active tab ID available");
          throw new ExtensionError("No active tab available");
        }
        console.log(`Sending switch session message for domain: ${this.state.currentDomain}, tab: ${this.state.currentTab.id}`);
        const response = await this.chromeApi.sendMessage({
          action: MESSAGE_ACTIONS.SWITCH_SESSION,
          sessionData: session,
          tabId: this.state.currentTab.id
        });
        if (!response) {
          console.error("No response received from background script");
          throw new ExtensionError("No response received from background script");
        }
        if (!response.success) {
          console.error("Background script reported error:", response.error);
          throw new ExtensionError(response.error || "Failed to switch session");
        }
        console.log(`Successfully switched to session: ${sessionId}`);
        this.state.activeSessions[this.state.currentDomain] = sessionId;
        session.lastUsed = Date.now();
        await this.saveStorageData();
        console.log("Session state updated and saved");
      } catch (error) {
        console.error("Error in switchToSession:", error);
        throw new ExtensionError(handleError(error, "PopupService.switchToSession"));
      }
    }
    async createNewSession() {
      try {
        const response = await this.chromeApi.sendMessage({
          action: MESSAGE_ACTIONS.CLEAR_SESSION,
          domain: this.state.currentDomain,
          tabId: this.state.currentTab.id
        });
        if (!response.success) {
          throw new ExtensionError(response.error || "Failed to clear session");
        }
        delete this.state.activeSessions[this.state.currentDomain];
        await this.saveStorageData();
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.createNewSession"));
      }
    }
    async renameSession(sessionId, newName, newOrder) {
      try {
        const session = this.state.sessions.find((s) => s.id === sessionId);
        if (!session) {
          throw new ExtensionError("Session not found");
        }
        const oldOrder = session.order;
        session.name = validateSessionName(newName);

        if (newOrder !== void 0 && newOrder !== "" && oldOrder !== parseInt(newOrder, 10)) {
          const nOrder = parseInt(newOrder, 10);
          if (!isNaN(nOrder)) {
            if (nOrder < oldOrder) {
              this.state.sessions.forEach((s) => {
                if (s.id !== sessionId && s.domain === this.state.currentDomain && s.order >= nOrder && s.order < oldOrder) {
                  s.order++;
                }
              });
            } else if (nOrder > oldOrder) {
              this.state.sessions.forEach((s) => {
                if (s.id !== sessionId && s.domain === this.state.currentDomain && s.order <= nOrder && s.order > oldOrder) {
                  s.order--;
                }
              });
            }
            session.order = nOrder;
          }
        }
        await this.saveStorageData();
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.renameSession"));
      }
    }
    async replaceSession(sessionId) {
      try {
        const session = this.state.sessions.find((s) => s.id === sessionId);
        if (!session) {
          throw new ExtensionError("Session not found");
        }
        const response = await this.chromeApi.sendMessage({
          action: MESSAGE_ACTIONS.GET_CURRENT_SESSION,
          domain: this.state.currentDomain,
          tabId: this.state.currentTab.id
        });
        if (!response.success) {
          throw new ExtensionError(response.error || "Failed to get current session");
        }
        const storedSession = response.data ?? storedSessionDefaultValue;
        session.cookies = storedSession.cookies;
        session.localStorage = storedSession.localStorage;
        session.sessionStorage = storedSession.sessionStorage;
        session.indexedDB = storedSession.indexedDB;
        session.lastUsed = Date.now();
        this.state.activeSessions[this.state.currentDomain] = sessionId;
        await this.saveStorageData();
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.replaceSession"));
      }
    }
    async duplicateSession(sessionId) {
      try {
        const session = this.state.sessions.find((s) => s.id === sessionId);
        if (!session) {
          throw new ExtensionError("Session not found");
        }
        const domainSessions = this.state.sessions.filter((s) => s.domain === session.domain);
        const maxOrder = domainSessions.length > 0 ? Math.max(...domainSessions.map((s) => s.order || 0)) : 0;
        const newSession = {
          ...session,
          id: generateId(),
          name: session.name + " (copy)",
          order: maxOrder + 1,
          createdAt: Date.now(),
          lastUsed: Date.now()
        };
        this.state.sessions.push(newSession);
        await this.saveStorageData();
        return newSession;
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.duplicateSession"));
      }
    }
    async deleteSession(sessionId) {
      try {
        const sessionToDelete = this.state.sessions.find((s) => s.id === sessionId);
        if (!sessionToDelete) {
          throw new ExtensionError("Session not found");
        }
        const deletedOrder = sessionToDelete.order;
        const deletedDomain = sessionToDelete.domain;
        this.state.sessions = this.state.sessions.filter((s) => s.id !== sessionId);
        this.state.sessions.forEach((s) => {
          if (s.domain === deletedDomain && s.order > deletedOrder) {
            s.order--;
          }
        });
        if (this.state.activeSessions[this.state.currentDomain] === sessionId) {
          delete this.state.activeSessions[this.state.currentDomain];
        }
        await this.saveStorageData();
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.deleteSession"));
      }
    }
    getSession(sessionId) {
      return this.state.sessions.find((s) => s.id === sessionId);
    }
    getState() {
      return { ...this.state };
    }
    setState(newState) {
      this.state = { ...this.state, ...newState };
    }
    async loadStorageData() {
      try {
        const result = await this.chromeApi.getStorageData([
          STORAGE_KEYS.SESSIONS,
          STORAGE_KEYS.ACTIVE_SESSIONS
        ]);
        this.state.sessions = result[STORAGE_KEYS.SESSIONS] || [];
        this.state.activeSessions = result[STORAGE_KEYS.ACTIVE_SESSIONS] || {};
      } catch (error) {
        console.error("Error loading storage data:", error);
        this.state.sessions = [];
        this.state.activeSessions = {};
      }
    }
    async saveStorageData() {
      await this.chromeApi.setStorageData({
        [STORAGE_KEYS.SESSIONS]: this.state.sessions,
        [STORAGE_KEYS.ACTIVE_SESSIONS]: this.state.activeSessions
      });
    }
    async autoRefreshActiveSession() {
      try {
        const activeSessionId = this.state.activeSessions[this.state.currentDomain];
        if (!activeSessionId) {
          console.log("[Auto Refresh] No active session for this domain, skipping refresh");
          return null;
        }
        const session = this.state.sessions.find((s) => s.id === activeSessionId);
        if (!session) {
          console.log("[Auto Refresh] Active session not found in storage");
          return null;
        }
        // Check if session was auto-refreshed recently (within 5 minutes)
        const REFRESH_COOLDOWN = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        if (session.lastRefreshed && (now - session.lastRefreshed) < REFRESH_COOLDOWN) {
          console.log("[Auto Refresh] Session was refreshed recently, skipping");
          return null;
        }
        console.log(`[Auto Refresh] Refreshing session "${session.name}" for ${this.state.currentDomain}`);
        const response = await this.chromeApi.sendMessage({
          action: MESSAGE_ACTIONS.AUTO_REFRESH_SESSION,
          domain: this.state.currentDomain,
          tabId: this.state.currentTab.id,
          sessionId: activeSessionId
        });
        if (response.success) {
          // Update local state with fresh refresh timestamp
          session.lastRefreshed = Date.now();
          await this.saveStorageData();
          console.log("[Auto Refresh] Session refreshed successfully");
          return response.data;
        } else {
          console.warn("[Auto Refresh] Failed to refresh session:", response.error);
          return null;
        }
      } catch (error) {
        console.error("[Auto Refresh] Error refreshing session:", error);
        return null;
      }
    }
    // PIN Security Functions — PBKDF2 (200K iter, random per-install salt, AES-fit key)
    // Backward compat: legacy SHA-256 hashes (no salt stored) auto-upgrade on next successful verify.
    async hashPin(pin, saltB64) {
      const enc = new TextEncoder();
      const salt = saltB64 ? this._b64ToBytes(saltB64) : crypto.getRandomValues(new Uint8Array(16));
      const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(pin), { name: "PBKDF2" }, false, ["deriveBits"]
      );
      const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 2e5, hash: "SHA-256" },
        keyMaterial,
        256
      );
      const hashB64 = this._bytesToB64(new Uint8Array(bits));
      const finalSaltB64 = saltB64 || this._bytesToB64(salt);
      return { hash: hashB64, salt: finalSaltB64 };
    }
    async _legacyHashPin(pin) {
      const data = new TextEncoder().encode(pin + "session_switcher_salt");
      const buf = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    _bytesToB64(bytes) {
      let s = "";
      for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s);
    }
    _b64ToBytes(b64) {
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    async setupPin(pin) {
      try {
        if (pin.length < 4 || pin.length > 6) {
          throw new Error("PIN must be 4-6 digits");
        }
        if (!/^\d+$/.test(pin)) {
          throw new Error("PIN must contain only numbers");
        }
        const { hash, salt } = await this.hashPin(pin);
        await this.chromeApi.setStorageData({
          [STORAGE_KEYS.PIN_HASH]: hash,
          [STORAGE_KEYS.PIN_SALT]: salt,
          [STORAGE_KEYS.PIN_VERSION]: 2,
          [STORAGE_KEYS.PIN_ENABLED]: true
        });
        return true;
      } catch (error) {
        console.error("Error setting up PIN:", error);
        throw error;
      }
    }
    async verifyPin(pin) {
      try {
        const result = await this.chromeApi.getStorageData([
          STORAGE_KEYS.PIN_HASH,
          STORAGE_KEYS.PIN_SALT,
          STORAGE_KEYS.PIN_VERSION
        ]);
        const storedHash = result[STORAGE_KEYS.PIN_HASH];
        const storedSalt = result[STORAGE_KEYS.PIN_SALT];
        const version = result[STORAGE_KEYS.PIN_VERSION] || 1;
        if (!storedHash) return false;
        if (version >= 2 && storedSalt) {
          const { hash } = await this.hashPin(pin, storedSalt);
          return this._safeEqual(hash, storedHash);
        }
        // Legacy v1: SHA-256(pin + static salt). Verify, and on success silently upgrade.
        const legacy = await this._legacyHashPin(pin);
        const ok = this._safeEqual(legacy, storedHash);
        if (ok) {
          try {
            const { hash, salt } = await this.hashPin(pin);
            await this.chromeApi.setStorageData({
              [STORAGE_KEYS.PIN_HASH]: hash,
              [STORAGE_KEYS.PIN_SALT]: salt,
              [STORAGE_KEYS.PIN_VERSION]: 2
            });
          } catch (_) {}
        }
        return ok;
      } catch (error) {
        console.error("Error verifying PIN:", error);
        return false;
      }
    }
    _safeEqual(a, b) {
      if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
      return diff === 0;
    }
    async isPinEnabled() {
      try {
        const result = await this.chromeApi.getStorageData([STORAGE_KEYS.PIN_ENABLED]);
        return result[STORAGE_KEYS.PIN_ENABLED] === true;
      } catch (error) {
        return false;
      }
    }
    async isPinSetup() {
      try {
        const result = await this.chromeApi.getStorageData([STORAGE_KEYS.PIN_HASH]);
        return !!result[STORAGE_KEYS.PIN_HASH];
      } catch (error) {
        return false;
      }
    }
    async togglePinEnabled(enabled) {
      try {
        await this.chromeApi.setStorageData({
          [STORAGE_KEYS.PIN_ENABLED]: enabled
        });
      } catch (error) {
        console.error("Error toggling PIN:", error);
        throw error;
      }
    }
    async removePin() {
      try {
        await this.chromeApi.setStorageData({
          [STORAGE_KEYS.PIN_HASH]: null,
          [STORAGE_KEYS.PIN_SALT]: null,
          [STORAGE_KEYS.PIN_VERSION]: null,
          [STORAGE_KEYS.PIN_ENABLED]: false
        });
      } catch (error) {
        console.error("Error removing PIN:", error);
        throw error;
      }
    }
    async clearSessions(clearOption) {
      try {
        if (clearOption === "current") {
          this.state.sessions = this.state.sessions.filter((s) => s.domain !== this.state.currentDomain);
          delete this.state.activeSessions[this.state.currentDomain];
          const response = await this.chromeApi.sendMessage({
            action: MESSAGE_ACTIONS.CLEAR_SESSION,
            domain: this.state.currentDomain,
            tabId: this.state.currentTab.id
          });
          if (!response.success) {
            throw new ExtensionError(response.error || "Failed to clear current session");
          }
        } else if (clearOption === "all") {
          this.state.sessions = [];
          this.state.activeSessions = {};
        }
        await this.saveStorageData();
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.clearSessions"));
      }
    }
    exportSessions(exportOption) {
      try {
        let sessionsToExport = [];
        if (exportOption === "current") {
          sessionsToExport = this.state.sessions.filter((s) => s.domain === this.state.currentDomain);
        } else if (exportOption === "all") {
          sessionsToExport = [...this.state.sessions];
        }
        const exportData = {
          sessions: sessionsToExport,
          exportDate: (/* @__PURE__ */ new Date()).toISOString(),
          version: "1.0.0"
        };
        return JSON.stringify(exportData, null, 2);
      } catch (error) {
        throw new ExtensionError(handleError(error, "PopupService.exportSessions"));
      }
    }
    async importSessions(file) {
      return new Promise(async (resolve, reject) => {
        try {
          let jsonContent;

          // Check if file is ZIP
          if (file.name.endsWith('.zip')) {
            if (typeof JSZip === "undefined") {
              throw new Error("JSZip library not loaded");
            }
            const zip = await JSZip.loadAsync(file);
            // Find the JSON file inside ZIP
            const jsonFile = zip.file("sessions-backup.json") || zip.file(/\.json$/i)[0];
            if (!jsonFile) {
              throw new Error("No JSON file found in ZIP archive");
            }
            jsonContent = await jsonFile.async("string");
          } else {
            // Read as plain text (JSON)
            jsonContent = await new Promise((res, rej) => {
              const reader = new FileReader();
              reader.onload = (e) => res(e.target?.result);
              reader.onerror = () => rej(new Error("Error reading file"));
              reader.readAsText(file);
            });
          }

          if (typeof jsonContent !== "string") {
            throw new Error("Invalid file content");
          }

          const importData = JSON.parse(jsonContent);
          if (!importData.sessions || !Array.isArray(importData.sessions)) {
            throw new Error("Invalid import data format");
          }

          const importedSessions = importData.sessions.map((s) => ({
            ...s,
            id: generateId() // Regenerate IDs to avoid conflicts
          }));
          this.state.sessions.push(...importedSessions);
          await this.saveStorageData();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }
  };

  // Reusable toast notification — class-based + announces via #toastLive aria-live region
  function showToast(message, type = "success") {
    const liveEl = document.getElementById("toastLive");
    if (liveEl) {
      // toggle to ensure SR re-announces even repeated msgs
      liveEl.textContent = "";
      setTimeout(() => { liveEl.textContent = message; }, 30);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-in"));
    setTimeout(() => {
      toast.classList.remove("toast-in");
      setTimeout(() => toast.remove(), 220);
    }, 2500);
  }

  // src/popup/index.ts
  document.addEventListener("DOMContentLoaded", async () => {
    let popupService;
    let modalManager;
    let loadingManager;
    let sessionList;
    let currentSearchQuery = "";

    // Initialize core services first with error handling
    try {
      popupService = new PopupService();
      modalManager = new ModalManager();
      loadingManager = new LoadingManager();

      const sessionsListEl = getElementByIdSafe("sessionsList");
      if (!sessionsListEl) {
        console.error("Critical: sessionsList element not found in DOM");
        document.body.innerHTML = `
          <div class="app-container" style="height: auto; min-height: 200px; justify-content: center;">
            <div class="empty-state">
              <div class="empty-icon">⚠️</div>
              <p>Extension failed to load. Please reinstall.</p>
            </div>
          </div>
        `;
        return;
      }
      sessionList = new SessionList(sessionsListEl);
    } catch (initError) {
      console.error("Critical initialization error:", initError);
      document.body.innerHTML = `
        <div class="app-container" style="height: auto; min-height: 200px; justify-content: center;">
          <div class="empty-state">
            <div class="empty-icon">❌</div>
            <p>Extension failed to initialize. Error: ${initError.message || 'Unknown error'}</p>
          </div>
        </div>
      `;
      return;
    }

    // Initialize UI
    try {
      const state = await popupService.initialize();

      // Check if current domain is WhatsApp and disable functionality if so
      if (state.currentDomain.includes("whatsapp.com")) {
        document.body.innerHTML = `
          <div class="app-container" style="height: auto; min-height: 200px; justify-content: center;">
            <div class="empty-state">
              <div class="empty-icon">🚫</div>
              <p>Session Switcher is disabled for WhatsApp Web to prevent performance issues.</p>
            </div>
          </div>
        `;
        return;
      }

      const currentSiteEl = document.getElementById("currentSite");
      if (currentSiteEl) {
        currentSiteEl.textContent = state.currentDomain;
        currentSiteEl.title = state.currentDomain;
      }
      // populate version from manifest
      try {
        const m = chrome.runtime.getManifest();
        const v = document.getElementById("aboutVersion");
        if (v && m && m.version) v.textContent = `v${m.version}`;
      } catch (_) {}

      // Firefox MV3: <all_urls> is opt-in. Surface a banner so users can grant it.
      try {
        const isFirefox = typeof navigator !== "undefined" && /firefox|gecko/i.test(navigator.userAgent);
        if (isFirefox && chrome.permissions && typeof chrome.permissions.contains === "function") {
          const granted = await new Promise((resolve) => {
            try {
              chrome.permissions.contains({ origins: ["<all_urls>"] }, (ok) => resolve(!!ok));
            } catch (_) { resolve(true); }
          });
          if (!granted) {
            const main = document.querySelector(".app-content") || document.body;
            const banner = document.createElement("div");
            banner.className = "ff-permission-banner";
            banner.setAttribute("role", "alert");
            banner.style.cssText = "margin:8px 12px;padding:10px 12px;border:1px solid #d97706;background:#fef3c7;color:#7c2d12;border-radius:6px;font-size:12px;display:flex;flex-direction:column;gap:8px;";
            banner.innerHTML = '<div><strong>Firefox:</strong> grant site access so sessions can be read/restored on every domain.</div><button id="grantAllUrlsBtn" class="btn btn-primary btn-sm" style="align-self:flex-start;">Grant access</button>';
            main.parentNode.insertBefore(banner, main);
            const btn = banner.querySelector("#grantAllUrlsBtn");
            btn?.addEventListener("click", () => {
              try {
                chrome.permissions.request({ origins: ["<all_urls>"] }, (ok) => {
                  if (ok) banner.remove();
                });
              } catch (e) { console.warn("permission request failed:", e); }
            });
          }
        }
      } catch (e) { console.warn("[FF perm check] skipped:", e); }

      renderSessionList();

      // Auto refresh active session in background (non-blocking)
      popupService.autoRefreshActiveSession().then((result) => {
        if (result) {
          console.log("[Auto Refresh] Session updated at:", new Date(result.refreshedAt).toLocaleString());
          // Reload session list to reflect updated lastUsed time
          popupService.loadStorageData().then(() => renderSessionList());
        }
      }).catch((err) => {
        console.warn("[Auto Refresh] Background refresh failed:", err);
      });
    } catch (error) {
      console.error("Failed to initialize popup:", error);
      if (modalManager) {
        modalManager.showErrorModal("Failed to initialize extension. Please try reloading.");
      } else {
        document.body.innerHTML = `
          <div class="app-container" style="height: auto; min-height: 200px; justify-content: center;">
            <div class="empty-state">
              <div class="empty-icon">❌</div>
              <p>Failed to initialize extension. Please try reloading.</p>
            </div>
          </div>
        `;
      }
      return;
    }

    // Search functionality
    const searchInput = document.getElementById("searchSessions");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value;
        renderSessionList();
      });
    }

    // Menu Dropdown
    const menuBtn = document.getElementById("menuBtn");
    const menuDropdown = document.getElementById("menuDropdown");
    if (menuBtn && menuDropdown) {
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = menuDropdown.classList.toggle("show");
        menuBtn.setAttribute("aria-expanded", String(open));
      });
      document.addEventListener("click", () => {
        if (menuDropdown.classList.contains("show")) {
          menuDropdown.classList.remove("show");
          menuBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
    // Quick switcher trigger button
    const qsTrigger = document.getElementById("quickSwitcherTrigger");
    if (qsTrigger) {
      qsTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        // Defer: qsOpen defined after; bind via dispatched event
        document.dispatchEvent(new CustomEvent("__open_quickswitcher"));
      });
    }

    // Create first session button (in empty state)
    const createFirstBtn = document.getElementById("createFirstSessionBtn");
    if (createFirstBtn) {
      createFirstBtn.addEventListener("click", () => {
        const state = popupService.getState();
        const nextOrder = state.sessions.filter((s) => s.domain === state.currentDomain).length + 1;
        modalManager.showSaveModal("Unnamed Session", nextOrder);
      });
    }

    function renderSessionList() {
      const state = popupService.getState();
      sessionList.render(state.sessions, state.activeSessions, state.currentDomain, currentSearchQuery);
    }

    // Button Listeners
    const btnHandlers = [
      {
        id: "saveBtn", handler: () => {
          const state = popupService.getState();
          const nextOrder = state.sessions.filter((s) => s.domain === state.currentDomain).length + 1;
          modalManager.showSaveModal("Unnamed Session", nextOrder);
        }
      },
      { id: "newSessionBtn", handler: () => modalManager.showNewSessionConfirmModal() },
      { id: "clearSessionBtn", handler: () => modalManager.showClearSessionModal() },
      { id: "exportImportBtn", handler: () => modalManager.showExportImportModal() },
      { id: "aboutBtn", handler: () => modalManager.showAboutModal() },
      {
        id: "securityBtn",
        handler: async () => {
          // Update toggle state based on current settings
          const pinEnabled = await popupService.isPinEnabled();
          const pinSetup = await popupService.isPinSetup();
          const toggle = document.getElementById("pinEnabledToggle");
          const pinActions = document.getElementById("pinActions");
          const noPinMessage = document.getElementById("noPinMessage");
          if (toggle) toggle.checked = pinEnabled;
          if (pinActions) pinActions.style.display = pinSetup ? "flex" : "none";
          if (noPinMessage) noPinMessage.style.display = pinSetup ? "none" : "block";
          modalManager.showSecuritySettingsModal();
        }
      },

      // Modal Confirm Actions
      {
        id: "confirmSave", handler: async () => {
          const input = modalManager.getSaveModalInput();
          if (!input.name) return;
          await loadingManager.withLoading(async () => {
            try {
              await popupService.saveCurrentSession(input.name, input.order);
              modalManager.hideSaveModal();
              renderSessionList();
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Save Session"));
            }
          });
        }
      },
      {
        id: "confirmRename", handler: async () => {
          const input = modalManager.getRenameModalInput();
          const state = popupService.getState();
          if (!input.name || !state.currentRenameSessionId) return;
          await loadingManager.withLoading(async () => {
            try {
              await popupService.renameSession(state.currentRenameSessionId, input.name, input.order);
              modalManager.hideRenameModal();
              renderSessionList();
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Rename Session"));
            }
          });
        }
      },
      {
        id: "replaceSessionBtn", handler: async () => {
          if (!await requirePin("Update session with current data")) return;
          const state = popupService.getState();
          const session = popupService.getSession(state.currentRenameSessionId);
          if (session) {
            modalManager.hideRenameModal();
            modalManager.showReplaceConfirmModal(session.name);
          }
        }
      },
      {
        id: "confirmReplaceSession", handler: async () => {
          const state = popupService.getState();
          if (!state.currentRenameSessionId) return;
          await loadingManager.withLoading(async () => {
            try {
              await popupService.replaceSession(state.currentRenameSessionId);
              modalManager.hideReplaceConfirmModal();
              renderSessionList();
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Replace Session"));
            }
          });
        }
      },
      {
        id: "confirmDelete", handler: async () => {
          const state = popupService.getState();
          if (!state.currentDeleteSessionId) return;
          await loadingManager.withLoading(async () => {
            try {
              await popupService.deleteSession(state.currentDeleteSessionId);
              modalManager.hideDeleteModal();
              renderSessionList();
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Delete Session"));
            }
          });
        }
      },
      {
        id: "confirmNewSession", handler: async () => {
          await loadingManager.withLoading(async () => {
            try {
              await popupService.createNewSession();
              modalManager.hideNewSessionConfirmModal();
              renderSessionList();
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Create New Session"));
            }
          });
        }
      },
      {
        id: "confirmClearSession", handler: async () => {
          const option = modalManager.getClearSessionOption();
          if (!await requirePin(option === "all" ? "Clear ALL sessions" : "Clear sessions for this site")) return;
          await loadingManager.withLoading(async () => {
            try {
              await popupService.clearSessions(option);
              modalManager.hideClearSessionModal();
              renderSessionList();
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Clear Sessions"));
            }
          });
        }
      },
      {
        id: "exportBtn", handler: async () => {
          if (!await requirePin("Export session data")) return;
          try {
            const option = modalManager.getExportOption();
            const format = modalManager.getExportFormat();
            const json = popupService.exportSessions(option);
            const dateStr = new Date().toISOString().slice(0, 10);

            if (format === "zip") {
              // Export as ZIP using JSZip
              if (typeof JSZip === "undefined") {
                throw new Error("JSZip library not loaded");
              }
              const zip = new JSZip();
              zip.file("sessions-backup.json", json);
              const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `sessions-backup-${dateStr}.zip`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } else {
              // Export as JSON
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `sessions-backup-${dateStr}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
            showToast("Backup downloaded — contains plaintext credentials", "info");
          } catch (error) {
            modalManager.showErrorModal(handleError(error, "Export Sessions"));
          }
        }
      },
      {
        id: "importBtn", handler: async () => {
          const file = modalManager.getImportFile();
          if (!file) return;
          await loadingManager.withLoading(async () => {
            try {
              await popupService.importSessions(file);
              modalManager.hideExportImportModal();
              renderSessionList();
              // Show success notification
              showToast("✅ Import berhasil! Data telah di-restore.");
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Import Sessions"));
            }
          });
        }
      }
    ];

    // PIN Security Handlers
    const pinEnabledToggle = document.getElementById("pinEnabledToggle");
    if (pinEnabledToggle) {
      pinEnabledToggle.addEventListener("change", async (e) => {
        const isEnabled = e.target.checked;
        const pinSetup = await popupService.isPinSetup();
        if (isEnabled && !pinSetup) {
          // Need to setup PIN first
          e.target.checked = false;
          modalManager.hideSecuritySettingsModal();
          modalManager.showPinSetupModal();
        } else {
          await popupService.togglePinEnabled(isEnabled);
        }
      });
    }

    const confirmPinSetupBtn = document.getElementById("confirmPinSetup");
    if (confirmPinSetupBtn) {
      confirmPinSetupBtn.addEventListener("click", async () => {
        const { pin, confirm } = modalManager.getPinSetupInput();
        if (!pin) {
          modalManager.showPinSetupError("Please enter a PIN");
          return;
        }
        if (pin.length < 4 || pin.length > 6) {
          modalManager.showPinSetupError("PIN must be 4-6 digits");
          return;
        }
        if (!/^\d+$/.test(pin)) {
          modalManager.showPinSetupError("PIN must contain only numbers");
          return;
        }
        if (pin !== confirm) {
          modalManager.showPinSetupError("PINs do not match");
          return;
        }
        try {
          await popupService.setupPin(pin);
          modalManager.hidePinSetupModal();
          showToast("🔐 PIN set successfully!");
        } catch (error) {
          modalManager.showPinSetupError(error.message || "Failed to set PIN");
        }
      });
    }

    // Pending session ID for PIN verification
    let pendingSessionId = null;
    // Generic PIN gate — returns Promise<bool>. Reuses pinVerifyModal.
    let pendingPinResolver = null;
    async function requirePin(reasonText) {
      const enabled = await popupService.isPinEnabled();
      if (!enabled) return true;
      // If a previous unrelated request is still pending, cancel it (resolve false).
      if (pendingPinResolver) {
        try { pendingPinResolver(false); } catch (_) {}
        pendingPinResolver = null;
      }
      const reasonEl = document.getElementById("pinVerifyReason");
      if (reasonEl) reasonEl.textContent = reasonText || "";
      pendingSessionId = null; // ensure switch-flow code path doesn't trigger
      modalManager.showPinVerifyModal();
      return new Promise((resolve) => {
        pendingPinResolver = resolve;
      });
    }

    const confirmPinVerifyBtn = document.getElementById("confirmPinVerify");
    if (confirmPinVerifyBtn) {
      confirmPinVerifyBtn.addEventListener("click", async () => {
        const pin = modalManager.getPinVerifyInput();
        if (!pin) {
          modalManager.showPinVerifyError("Please enter your PIN");
          return;
        }
        const isValid = await popupService.verifyPin(pin);
        if (!isValid) {
          modalManager.showPinVerifyError("Incorrect PIN");
          return;
        }
        modalManager.hidePinVerifyModal();
        // Path A: generic gate via requirePin()
        if (pendingPinResolver) {
          const r = pendingPinResolver;
          pendingPinResolver = null;
          r(true);
          return;
        }
        // Path B: switch-flow
        if (pendingSessionId) {
          const sid = pendingSessionId;
          pendingSessionId = null;
          await loadingManager.withLoading(async () => {
            try {
              await popupService.switchToSession(sid);
              renderSessionList();
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Switch Session"));
            }
          });
        }
      });
    }
    // Resolve gate as false on close
    [
      "closePinVerifyModal", "cancelPinVerify"
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", () => {
        if (pendingPinResolver) { const r = pendingPinResolver; pendingPinResolver = null; r(false); }
        pendingSessionId = null;
      });
    });

    const changePinBtn = document.getElementById("changePinBtn");
    if (changePinBtn) {
      changePinBtn.addEventListener("click", () => {
        modalManager.hideSecuritySettingsModal();
        modalManager.showPinSetupModal();
      });
    }

    const removePinBtn = document.getElementById("removePinBtn");
    if (removePinBtn) {
      removePinBtn.addEventListener("click", async () => {
        try {
          await popupService.removePin();
          const toggle = document.getElementById("pinEnabledToggle");
          const pinActions = document.getElementById("pinActions");
          const noPinMessage = document.getElementById("noPinMessage");
          if (toggle) toggle.checked = false;
          if (pinActions) pinActions.style.display = "none";
          if (noPinMessage) noPinMessage.style.display = "block";
          showToast("🔓 PIN removed", "error");
        } catch (error) {
          modalManager.showErrorModal("Failed to remove PIN");
        }
      });
    }

    // Session event handlers (with PIN check)
    sessionList.setEventHandlers({
      onSessionClick: async (sessionId) => {
        const pinEnabled = await popupService.isPinEnabled();
        if (pinEnabled) {
          pendingSessionId = sessionId;
          const reasonEl = document.getElementById("pinVerifyReason");
          if (reasonEl) reasonEl.textContent = "Switch session";
          modalManager.showPinVerifyModal();
        } else {
          await loadingManager.withLoading(async () => {
            try {
              await popupService.switchToSession(sessionId);
              renderSessionList();
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Switch Session"));
            }
          });
        }
      },
      onRenameClick: async (sessionId) => {
        if (!await requirePin("Edit session")) return;
        const session = popupService.getSession(sessionId);
        if (session) {
          popupService.setState({ currentRenameSessionId: sessionId });
          modalManager.showRenameModal(session.name, session.order);
        }
      },
      onDeleteClick: async (sessionId) => {
        if (!await requirePin("Delete session")) return;
        const session = popupService.getSession(sessionId);
        if (session) {
          popupService.setState({ currentDeleteSessionId: sessionId });
          modalManager.showDeleteModal(session.name);
        }
      },
      onDuplicateClick: async (sessionId) => {
        if (!await requirePin("Duplicate session")) return;
        await loadingManager.withLoading(async () => {
          try {
            await popupService.duplicateSession(sessionId);
            renderSessionList();
            showToast("Session duplicated", "success");
          } catch (error) {
            modalManager.showErrorModal(handleError(error, "Duplicate Session"));
          }
        });
      }
    });

    btnHandlers.forEach(({ id, handler }) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", handler);
    });

    // ============================================================
    // Quick Switcher (Ctrl/Cmd+K) — cross-domain fuzzy search
    // ============================================================
    const qsModal = document.getElementById("quickSwitcherModal");
    const qsInput = document.getElementById("quickSwitcherInput");
    const qsResults = document.getElementById("quickSwitcherResults");
    let qsActiveIdx = 0;
    let qsRows = [];

    function fuzzyScore(needle, haystack) {
      if (!needle) return 1;
      const n = needle.toLowerCase();
      const h = haystack.toLowerCase();
      if (h.includes(n)) return 100 - h.indexOf(n);
      // subsequence match
      let hi = 0, score = 0;
      for (let i = 0; i < n.length; i++) {
        const idx = h.indexOf(n[i], hi);
        if (idx === -1) return 0;
        score += 10 - Math.min(9, idx - hi);
        hi = idx + 1;
      }
      return score;
    }
    function renderQsResults(query) {
      const state = popupService.getState();
      const all = state.sessions.slice();
      const ranked = all
        .map((s) => ({ s, score: fuzzyScore(query, `${s.name} ${s.domain}`) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
      qsResults.replaceChildren();
      qsRows = [];
      qsActiveIdx = 0;
      if (ranked.length === 0) {
        const empty = document.createElement("div");
        empty.className = "qs-empty";
        empty.textContent = query ? `No matches for "${query}"` : "Start typing to search.";
        qsResults.appendChild(empty);
        return;
      }
      ranked.forEach(({ s }, i) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "qs-row";
        row.setAttribute("role", "option");
        row.dataset.sessionId = s.id;
        row.dataset.domain = s.domain || "";
        const dot = document.createElement("span");
        dot.className = "qs-dot";
        dot.style.background = colorFromString(s.domain || "");
        const main = document.createElement("div");
        main.className = "qs-main";
        const name = document.createElement("div");
        name.className = "qs-name";
        name.textContent = s.name || UI_TEXT.UNNAMED_SESSION;
        const sub = document.createElement("div");
        sub.className = "qs-sub";
        sub.textContent = s.domain || "—";
        main.append(name, sub);
        const right = document.createElement("span");
        right.className = "qs-tag";
        right.textContent = `#${Number.isFinite(s.order) ? s.order : "?"}`;
        if (s.domain === state.currentDomain) {
          const here = document.createElement("span");
          here.className = "qs-here";
          here.textContent = "here";
          right.before(here);
        }
        row.append(dot, main, right);
        if (i === 0) row.classList.add("qs-active");
        row.addEventListener("mouseenter", () => setQsActive(i));
        row.addEventListener("click", () => qsCommit());
        qsResults.appendChild(row);
        qsRows.push({ el: row, session: s });
      });
    }
    function colorFromString(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
      const hue = Math.abs(h) % 360;
      return `hsl(${hue}, 65%, 55%)`;
    }
    function setQsActive(idx) {
      if (qsRows.length === 0) return;
      qsActiveIdx = (idx + qsRows.length) % qsRows.length;
      qsRows.forEach((r, i) => r.el.classList.toggle("qs-active", i === qsActiveIdx));
      qsRows[qsActiveIdx].el.scrollIntoView({ block: "nearest" });
    }
    async function qsCommit() {
      const row = qsRows[qsActiveIdx];
      if (!row) return;
      const session = row.session;
      const state = popupService.getState();
      qsClose();
      // PIN gate
      if (!await requirePin(`Switch to "${session.name}"`)) return;
      if (session.domain === state.currentDomain) {
        // same domain → just switch in place
        await loadingManager.withLoading(async () => {
          try {
            await popupService.switchToSession(session.id);
            renderSessionList();
            showToast(`Switched to "${session.name}"`, "success");
          } catch (error) {
            modalManager.showErrorModal(handleError(error, "Switch Session"));
          }
        });
        return;
      }
      // Cross-domain: open new tab to that domain, after loaded inject session via background
      try {
        const newTab = await chrome.tabs.create({ url: `https://${session.domain}/`, active: true });
        // wait for tab to reach 'complete' (one-shot)
        await new Promise((resolve) => {
          const listener = (tabId, info) => {
            if (tabId === newTab.id && info.status === "complete") {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve();
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
          // safety timeout
          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }, 8000);
        });
        const resp = await new Promise((res) => {
          chrome.runtime.sendMessage({
            action: MESSAGE_ACTIONS.SWITCH_SESSION,
            sessionData: session,
            tabId: newTab.id
          }, res);
        });
        if (resp && resp.success) {
          showToast(`Opened "${session.name}" in new tab`, "success");
          // self-close popup window
          window.close();
        } else {
          modalManager.showErrorModal(`Failed to apply session: ${resp && resp.error || "unknown"}`);
        }
      } catch (e) {
        modalManager.showErrorModal(handleError(e, "Quick Switch"));
      }
    }
    function qsOpen() {
      if (!qsModal) return;
      qsInput.value = "";
      renderQsResults("");
      qsModal.classList.add(CSS_CLASSES.SHOW);
      setTimeout(() => qsInput.focus(), 30);
    }
    function qsClose() {
      if (!qsModal) return;
      qsModal.classList.remove(CSS_CLASSES.SHOW);
    }
    if (qsInput) {
      qsInput.addEventListener("input", () => renderQsResults(qsInput.value.trim()));
      qsInput.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setQsActive(qsActiveIdx + 1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setQsActive(qsActiveIdx - 1); }
        else if (e.key === "Enter") { e.preventDefault(); qsCommit(); }
        else if (e.key === "Escape") { e.preventDefault(); qsClose(); }
      });
    }
    if (qsModal) {
      qsModal.addEventListener("click", (e) => { if (e.target === qsModal) qsClose(); });
    }
    // Hook trigger button via custom event (button bound earlier in init)
    document.addEventListener("__open_quickswitcher", () => qsOpen());
    document.addEventListener("keydown", (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (qsModal && qsModal.classList.contains(CSS_CLASSES.SHOW)) qsClose(); else qsOpen();
      }
      // "/" focuses search bar
      if (e.key === "/" && document.activeElement && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        const search = document.getElementById("searchSessions");
        if (search) { e.preventDefault(); search.focus(); }
      }
      // Number keys 1-9 → switch to nth session in current list
      if (!mod && /^[1-9]$/.test(e.key) && document.activeElement && document.activeElement.tagName !== "INPUT") {
        const idx = parseInt(e.key, 10) - 1;
        const items = document.querySelectorAll(`.${CSS_CLASSES.SESSION_ITEM}`);
        if (items[idx]) { e.preventDefault(); items[idx].click(); }
      }
    });
  });
})();
