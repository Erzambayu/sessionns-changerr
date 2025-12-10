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
        replaceConfirm: getElementByIdSafe("replaceConfirmModal")
      };
      this.inputs = {
        sessionName: getElementByIdSafe("sessionName"),
        sessionOrder: getElementByIdSafe("sessionOrder"),
        newSessionName: getElementByIdSafe("newSessionName"),
        newSessionOrder: getElementByIdSafe("newSessionOrder"),
        importFileInput: getElementByIdSafe("importFileInput")
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
        { id: "cancelReplaceConfirm", modal: "replaceConfirm" }
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
      if (this.modals[modalKey]) this.modals[modalKey].classList.add(CSS_CLASSES.SHOW);
    }
    hide(modalKey) {
      if (this.modals[modalKey]) this.modals[modalKey].classList.remove(CSS_CLASSES.SHOW);
    }
  };

  // src/shared/utils/date.ts
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString(undefined, {
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
      this.container.addEventListener("click", this.handleClick.bind(this));
    }
    setEventHandlers(handlers) {
      this.onSessionClick = handlers.onSessionClick;
      this.onRenameClick = handlers.onRenameClick;
      this.onDeleteClick = handlers.onDeleteClick;
    }
    render(sessions, activeSessions, currentDomain, searchQuery = "") {
      let domainSessions = sessions.filter((s) => s.domain === currentDomain).sort((a, b) => a.order - b.order);

      // Apply search filter
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        domainSessions = domainSessions.filter(s => s.name.toLowerCase().includes(lowerQuery));
      }

      const activeSessionId = activeSessions[currentDomain];
      if (domainSessions.length === 0) {
        if (searchQuery) {
          this.container.innerHTML = `<div class="empty-state"><p>No sessions found matching "${escapeHtml(searchQuery)}"</p></div>`;
        } else {
          this.renderEmptyState();
        }
        return;
      }
      this.renderSessions(domainSessions, activeSessionId);
    }

    renderEmptyState() {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>${UI_TEXT.NO_SESSIONS}</p>
          <button id="createFirstSessionBtnList" class="btn btn-primary btn-sm">Save Current Session</button>
        </div>`;

      // Add listener for the button in empty state
      const btn = document.getElementById("createFirstSessionBtnList");
      if (btn) {
        btn.addEventListener("click", () => {
          const saveBtn = document.getElementById("saveBtn");
          if (saveBtn) saveBtn.click();
        });
      }
    }
    renderSessions(sessions, activeSessionId) {
      // Removed grid view support for cleaner UI
      const sessionsHtml = sessions.map((session) => {
        const isActive = session.id === activeSessionId;
        const lastUsed = formatDate(session.lastUsed);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${session.domain}&sz=32`;

        return `
        <div class="${CSS_CLASSES.SESSION_ITEM} ${isActive ? CSS_CLASSES.ACTIVE : ""}" data-session-id="${session.id}">
          <div class="session-info">
            <div class="session-name">
              <img src="${faviconUrl}" alt="" style="width: 16px; height: 16px; margin-right: 8px; border-radius: 2px;">
              <span class="session-badge">#${session.order}</span> 
              ${escapeHtml(session.name)}
            </div>
            <div class="session-meta">${UI_TEXT.LAST_USED} ${lastUsed}</div>
          </div>
          <div class="session-actions">
            <button class="${CSS_CLASSES.SESSION_BTN} rename-btn" data-action="rename" data-session-id="${session.id}" title="Edit">
              ✏️
            </button>
            <button class="${CSS_CLASSES.SESSION_BTN} delete-btn" data-action="delete" data-session-id="${session.id}" title="Delete">
              🗑️
            </button>
          </div>
        </div>
      `;
      }).join("");
      this.container.innerHTML = sessionsHtml;

      // Update session count in footer
      const countEl = document.getElementById("sessionCount");
      if (countEl) {
        countEl.textContent = `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`;
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
    IMPORT_SESSIONS: "importSessions"
  };

  // src/shared/constants/storageKeys.ts
  var STORAGE_KEYS = {
    SESSIONS: "sessions",
    ACTIVE_SESSIONS: "activeSessions",
    VIEW_MODE: "viewMode"
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
    async sendMessage(message) {
      return new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Chrome runtime error:", chrome.runtime.lastError);
              resolve({
                success: false,
                error: chrome.runtime.lastError.message || "Could not establish connection. Receiving end does not exist."
              });
            } else if (!response) {
              console.error("No response received from background script");
              resolve({
                success: false,
                error: "No response received from background script"
              });
            } else {
              resolve(response);
            }
          });
        } catch (error) {
          console.error("Error sending message:", error);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
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
        currentDeleteSessionId: "",
        viewMode: "list"
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
        if (order === void 0 || order === "") {
          order = domainSessions.length > 0 ? Math.max(...domainSessions.map((s) => s.order || 0)) + 1 : 1;
        } else {
          order = parseInt(order, 10);
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
          STORAGE_KEYS.ACTIVE_SESSIONS,
          STORAGE_KEYS.VIEW_MODE
        ]);
        this.state.sessions = result[STORAGE_KEYS.SESSIONS] || [];
        this.state.activeSessions = result[STORAGE_KEYS.ACTIVE_SESSIONS] || {};
        this.state.viewMode = result[STORAGE_KEYS.VIEW_MODE] || "list";
      } catch (error) {
        console.error("Error loading storage data:", error);
        this.state.sessions = [];
        this.state.activeSessions = {};
        this.state.viewMode = "list";
      }
    }
    async saveStorageData() {
      await this.chromeApi.setStorageData({
        [STORAGE_KEYS.SESSIONS]: this.state.sessions,
        [STORAGE_KEYS.ACTIVE_SESSIONS]: this.state.activeSessions,
        [STORAGE_KEYS.VIEW_MODE]: this.state.viewMode
      });
    }
    async setViewMode(mode) {
      this.state.viewMode = mode;
      await this.saveStorageData();
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
          const response = await this.chromeApi.sendMessage({
            action: MESSAGE_ACTIONS.CLEAR_SESSION,
            domain: this.state.currentDomain,
            tabId: this.state.currentTab.id
          });
          if (!response.success) {
            throw new ExtensionError(response.error || "Failed to clear current session");
          }
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
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const content = e.target?.result;
            if (typeof content !== "string") {
              throw new Error("Invalid file content");
            }
            const importData = JSON.parse(content);
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
        };
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(file);
      });
    }
  };

  // src/popup/index.ts
  document.addEventListener("DOMContentLoaded", async () => {
    const popupService = new PopupService();
    const modalManager = new ModalManager();
    const loadingManager = new LoadingManager();
    const sessionList = new SessionList(getElementByIdSafe("sessionsList"));
    let currentSearchQuery = "";

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
      renderSessionList();
    } catch (error) {
      console.error("Failed to initialize popup:", error);
      modalManager.showErrorModal("Failed to initialize extension. Please try reloading.");
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
        menuDropdown.classList.toggle("show");
      });
      document.addEventListener("click", () => {
        menuDropdown.classList.remove("show");
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

    // Event Handlers
    sessionList.setEventHandlers({
      onSessionClick: async (sessionId) => {
        await loadingManager.withLoading(async () => {
          try {
            await popupService.switchToSession(sessionId);
            renderSessionList();
            // Optional: Show success toast
          } catch (error) {
            modalManager.showErrorModal(handleError(error, "Switch Session"));
          }
        });
      },
      onRenameClick: (sessionId) => {
        const session = popupService.getSession(sessionId);
        if (session) {
          popupService.setState({ currentRenameSessionId: sessionId });
          modalManager.showRenameModal(session.name, session.order);
        }
      },
      onDeleteClick: (sessionId) => {
        const session = popupService.getSession(sessionId);
        if (session) {
          popupService.setState({ currentDeleteSessionId: sessionId });
          modalManager.showDeleteModal(session.name);
        }
      }
    });

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
        id: "replaceSessionBtn", handler: () => {
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
        id: "exportBtn", handler: () => {
          try {
            const option = modalManager.getExportOption();
            const json = popupService.exportSessions(option);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sessions-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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
            } catch (error) {
              modalManager.showErrorModal(handleError(error, "Import Sessions"));
            }
          });
        }
      }
    ];

    btnHandlers.forEach(({ id, handler }) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", handler);
    });
  });
})();
