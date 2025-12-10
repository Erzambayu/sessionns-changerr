"use strict";
(() => {
  // src/shared/constants/storageKeys.ts
  var STORAGE_KEYS = {
    SESSIONS: "sessions",
    ACTIVE_SESSIONS: "activeSessions",
    VIEW_MODE: "viewMode"
  };

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

  // src/background/handlers/cookie.handler.ts
  var CookieHandler = class {
    async getCookiesForDomain(domain) {
      try {
        const stores = await chrome.cookies.getAllCookieStores();
        const allCookies = [];
        // Handle localhost with port
        const cleanDomain = domain.split(":")[0];

        for (const store of stores) {
          const cookies = await chrome.cookies.getAll({ storeId: store.id });
          const domainCookies = cookies.filter((cookie) => {
            // Match exact domain or subdomains
            return cookie.domain === cleanDomain ||
              cookie.domain.endsWith("." + cleanDomain) ||
              (cleanDomain === "localhost" && cookie.domain === "localhost");
          });
          allCookies.push(...domainCookies);
        }
        return allCookies;
      } catch (error) {
        console.error("Error getting cookies for domain:", domain, error);
        return [];
      }
    }
    async clearCookiesForDomain(domain) {
      const cookies = await this.getCookiesForDomain(domain);
      const clearPromises = cookies.map(async (cookie) => {
        try {
          const url = this.buildCookieUrl(cookie, domain);
          await chrome.cookies.remove({
            url: url,
            name: cookie.name,
            storeId: cookie.storeId
          });
        } catch (error) {
          console.warn("Failed to remove cookie:", cookie.name, error);
        }
      });
      await Promise.all(clearPromises);
    }
    async restoreCookies(cookies, domain) {
      if (!cookies || !Array.isArray(cookies)) {
        console.error("Invalid cookies array provided:", cookies);
        return;
      }
      if (!domain) {
        console.error("Invalid domain provided for cookie restoration");
        return;
      }
      console.log(`Restoring ${cookies.length} cookies for domain: ${domain}`);
      let successCount = 0;
      let failureCount = 0;

      // Restore cookies sequentially to avoid potential race conditions with same-name cookies
      for (const cookie of cookies) {
        if (!cookie || !cookie.name) {
          console.warn("Skipping invalid cookie:", cookie);
          failureCount++;
          continue;
        }
        try {
          const cookieDetails = this.prepareCookieForRestore(cookie, domain);

          // Fix for hostOnly cookies: if a cookie is hostOnly, we must NOT supply the domain.
          // Chrome API infers hostOnly=true if domain is omitted.
          // If we supply a domain (even the correct one), it might be treated as a domain cookie (hostOnly=false).
          if (cookie.hostOnly) {
            delete cookieDetails.domain;
          }

          await chrome.cookies.set(cookieDetails);
          successCount++;
        } catch (error) {
          failureCount++;
          console.warn(`Failed to restore cookie: ${cookie.name}`, error);
        }
      }
      console.log(`Cookie restoration complete - Success: ${successCount}, Failed: ${failureCount}`);
    }
    buildCookieUrl(cookie, fallbackDomain) {
      const protocol = cookie.secure ? "https" : "http";
      let domain = cookie.domain;
      if (domain.startsWith(".")) {
        domain = domain.slice(1);
      }
      // Handle localhost case
      if (!domain && fallbackDomain) {
        domain = fallbackDomain.split(":")[0];
      }
      if (!domain) {
        // Fallback to the requested domain if cookie domain is missing
        domain = fallbackDomain.split(":")[0];
      }
      const path = cookie.path || "/";
      return `${protocol}://${domain}${path}`;
    }
    prepareCookieForRestore(cookie, fallbackDomain) {
      const url = this.buildCookieUrl(cookie, fallbackDomain);
      const cookieDetails = {
        url,
        name: cookie.name,
        value: cookie.value,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        storeId: cookie.storeId
      };

      if (cookie.domain) {
        cookieDetails.domain = cookie.domain;
      }

      if (!cookie.session && cookie.expirationDate) {
        cookieDetails.expirationDate = cookie.expirationDate;
      }
      if (cookie.sameSite && cookie.sameSite !== "unspecified") {
        cookieDetails.sameSite = cookie.sameSite;
      }
      if (cookie.partitionKey) {
        cookieDetails.partitionKey = cookie.partitionKey;
      }
      return cookieDetails;
    }
  };

  // src/background/services/storageData.service.ts
  async function extractStorageData() {
    try {
      // Exclude WhatsApp from storage extraction to prevent issues with large data
      if (window.location.hostname.includes("whatsapp.com")) {
        return { localStorage: {}, sessionStorage: {}, indexedDB: {} };
      }

      const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      const serialize = async (obj) => {
        if (!obj) return obj;
        if (obj instanceof Blob || obj instanceof File) {
          const base64 = await blobToBase64(obj);
          return { __type: "Blob", data: base64, type: obj.type };
        }
        if (obj instanceof ArrayBuffer) {
          const blob = new Blob([obj]);
          const base64 = await blobToBase64(blob);
          return { __type: "ArrayBuffer", data: base64 };
        }
        if (obj instanceof Uint8Array) {
          const blob = new Blob([obj]);
          const base64 = await blobToBase64(blob);
          return { __type: "Uint8Array", data: base64 };
        }
        if (Array.isArray(obj)) {
          return Promise.all(obj.map(serialize));
        }
        if (typeof obj === "object") {
          const newObj = {};
          for (const k in obj) {
            newObj[k] = await serialize(obj[k]);
          }
          return newObj;
        }
        return obj;
      };

      const localStorageData = {};
      const sessionStorageData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value !== null) {
            localStorageData[key] = value;
          }
        }
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          if (value !== null) {
            sessionStorageData[key] = value;
          }
        }
      }

      const indexedDBData = {};
      try {
        const dbs = await indexedDB.databases();
        for (const dbInfo of dbs) {
          if (!dbInfo.name) continue;

          // Skip potentially huge/problematic databases if needed, but for now try to capture all
          // with better serialization.

          const db = await new Promise((resolve, reject) => {
            const req = indexedDB.open(dbInfo.name);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
            req.onblocked = () => reject(new Error("Blocked"));
            // Add timeout
            setTimeout(() => reject(new Error("Timeout opening DB")), 3000);
          });

          const dbData = { version: db.version, stores: {} };
          const tx = db.transaction(db.objectStoreNames, "readonly");

          for (const storeName of db.objectStoreNames) {
            // Optimization: Skip known huge stores for WhatsApp to prevent hang/crash
            // These stores typically contain message history/media which can be GBs.
            if (window.location.hostname.includes("whatsapp.com") &&
              (storeName === "msgs" || storeName === "message" || storeName === "chat" || storeName === "model-storage")) {
              console.log(`Skipping heavy store: ${storeName}`);
              continue;
            }

            const store = tx.objectStore(storeName);
            const schema = {
              keyPath: store.keyPath,
              autoIncrement: store.autoIncrement,
              indexes: []
            };
            for (const indexName of store.indexNames) {
              const idx = store.index(indexName);
              schema.indexes.push({
                name: indexName,
                keyPath: idx.keyPath,
                unique: idx.unique,
                multiEntry: idx.multiEntry
              });
            }

            const records = await new Promise((resolve, reject) => {
              const req = store.getAll();
              req.onsuccess = () => resolve(req.result);
              req.onerror = () => reject(req.error);
            });

            let keys = undefined;
            if (!store.keyPath) {
              keys = await new Promise((resolve, reject) => {
                const req = store.getAllKeys();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
              });
            }

            const serializedRecords = [];
            for (let i = 0; i < records.length; i++) {
              const key = keys ? await serialize(keys[i]) : undefined;
              const value = await serialize(records[i]);
              serializedRecords.push({ key, value });
            }

            dbData.stores[storeName] = {
              schema,
              records: serializedRecords
            };
          }
          db.close();
          indexedDBData[dbInfo.name] = dbData;
        }
      } catch (e) {
        console.warn("IndexedDB export failed or not supported:", e);
      }

      return {
        localStorage: localStorageData,
        sessionStorage: sessionStorageData,
        indexedDB: indexedDBData
      };
    } catch (error) {
      console.error("Error extracting storage data:", error);
      return { localStorage: {}, sessionStorage: {}, indexedDB: {} };
    }
  }
  async function injectStorageData(localData, sessionData, indexedDBData) {
    try {
      const base64ToBlob = async (base64, type) => {
        const res = await fetch(base64);
        const blob = await res.blob();
        return type ? new Blob([blob], { type }) : blob;
      };

      const deserialize = async (obj) => {
        if (obj && typeof obj === "object") {
          if (obj.__type === "Blob") {
            return await base64ToBlob(obj.data, obj.type);
          }
          if (obj.__type === "ArrayBuffer") {
            const blob = await base64ToBlob(obj.data);
            return await blob.arrayBuffer();
          }
          if (obj.__type === "Uint8Array") {
            const blob = await base64ToBlob(obj.data);
            const buf = await blob.arrayBuffer();
            return new Uint8Array(buf);
          }
          if (Array.isArray(obj)) {
            return Promise.all(obj.map(deserialize));
          }
          const newObj = {};
          for (const k in obj) {
            newObj[k] = await deserialize(obj[k]);
          }
          return newObj;
        }
        return obj;
      };

      localStorage.clear();
      sessionStorage.clear();
      if (localData) {
        Object.entries(localData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }
      if (sessionData) {
        Object.entries(sessionData).forEach(([key, value]) => {
          sessionStorage.setItem(key, value);
        });
      }

      if (indexedDBData) {
        for (const [dbName, dbData] of Object.entries(indexedDBData)) {
          await new Promise((resolve) => {
            const req = indexedDB.deleteDatabase(dbName);
            req.onsuccess = resolve;
            req.onerror = resolve;
            req.onblocked = resolve;
          });

          if (!dbData.stores) continue;

          // Pre-deserialize all data for this database to avoid await inside transaction
          const preparedStores = {};
          for (const [storeName, storeData] of Object.entries(dbData.stores)) {
            const records = [];
            for (const record of storeData.records) {
              const val = await deserialize(record.value);
              const key = record.key ? await deserialize(record.key) : undefined;
              records.push({ key, val });
            }
            preparedStores[storeName] = records;
          }

          await new Promise((resolve, reject) => {
            const req = indexedDB.open(dbName, dbData.version);
            req.onupgradeneeded = (e) => {
              const db = e.target.result;
              for (const [storeName, storeData] of Object.entries(dbData.stores)) {
                const schema = storeData.schema;
                // Check if store exists before creating (though we deleted DB, good practice)
                if (!db.objectStoreNames.contains(storeName)) {
                  const store = db.createObjectStore(storeName, {
                    keyPath: schema.keyPath,
                    autoIncrement: schema.autoIncrement
                  });
                  for (const idx of schema.indexes) {
                    store.createIndex(idx.name, idx.keyPath, {
                      unique: idx.unique,
                      multiEntry: idx.multiEntry
                    });
                  }
                }
              }
            };
            req.onsuccess = (e) => {
              const db = e.target.result;
              const tx = db.transaction(db.objectStoreNames, "readwrite");

              for (const [storeName, records] of Object.entries(preparedStores)) {
                if (!db.objectStoreNames.contains(storeName)) continue;
                const store = tx.objectStore(storeName);
                for (const record of records) {
                  try {
                    if (record.key !== undefined) {
                      store.put(record.val, record.key);
                    } else {
                      store.put(record.val);
                    }
                  } catch (err) {
                    console.warn(`Failed to put record in ${storeName}:`, err);
                  }
                }
              }

              tx.oncomplete = () => {
                db.close();
                resolve();
              };
              tx.onerror = (err) => {
                db.close();
                // Don't reject entire promise, just log error to allow other DBs to proceed
                console.error(`Transaction error for ${dbName}:`, err);
                resolve();
              };
            };
            req.onerror = (e) => {
              console.error(`Failed to open DB ${dbName}:`, e);
              resolve();
            };
          });
        }
      }
      return true;
    } catch (error) {
      console.error("Error injecting storage data:", error);
      return false;
    }
  }
  async function clearServiceWorkersAndCache() {
    try {
      // 1. Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Service Worker unregistered:', registration.scope);
        }
      }

      // 2. Delete Cache Storage
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
          console.log('Cache deleted:', key);
        }
      }
      return true;
    } catch (error) {
      console.error("Error clearing SW/Cache:", error);
      return false;
    }
  }

  async function clearStorage() {
    try {
      localStorage.clear();
      sessionStorage.clear();

      // Clear Service Workers and Cache (Inlined for script injection context)
      try {
        // 1. Unregister Service Workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('Service Worker unregistered:', registration.scope);
          }
        }

        // 2. Delete Cache Storage
        if ('caches' in window) {
          const keys = await caches.keys();
          for (const key of keys) {
            await caches.delete(key);
            console.log('Cache deleted:', key);
          }
        }
      } catch (e) {
        console.warn("Error clearing SW/Cache:", e);
      }

      try {
        const dbs = await indexedDB.databases();
        for (const dbInfo of dbs) {
          if (dbInfo.name) {
            await new Promise((resolve) => {
              const req = indexedDB.deleteDatabase(dbInfo.name);
              req.onsuccess = resolve;
              req.onerror = resolve;
              req.onblocked = resolve;
            });
          }
        }
      } catch (e) {
        console.warn("Failed to clear IndexedDB:", e);
      }
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  }

  // src/background/handlers/storage.handler.ts
  var StorageHandler = class {
    async getStorageData(tabId) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: extractStorageData
        });
        return results?.[0]?.result || { localStorage: {}, sessionStorage: {}, indexedDB: {} };
      } catch (error) {
        console.error("Error getting storage data:", error);
        return { localStorage: {}, sessionStorage: {}, indexedDB: {} };
      }
    }
    async restoreStorageData(tabId, data) {
      if (!tabId) {
        throw new ExtensionError("Invalid tab ID for restoring storage data");
      }
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: injectStorageData,
          args: [data.localStorage || {}, data.sessionStorage || {}, data.indexedDB || {}]
        });
        if (!results || results.length === 0 || results[0].result !== true) {
          throw new ExtensionError("Failed to inject storage data into the page");
        }
      } catch (error) {
        throw new ExtensionError(`Failed to restore storage data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    async clearStorageData(tabId) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: clearStorage
        });
      } catch (error) {
        throw new ExtensionError(`Failed to clear storage data: ${error}`);
      }
    }
  };

  // src/background/handlers/session.handler.ts
  var SessionHandler = class {
    constructor() {
      this.cookieHandler = new CookieHandler();
      this.storageHandler = new StorageHandler();
    }
    async getCurrentSession(domain, tabId) {
      try {
        const [cookies, storageData] = await Promise.all([
          this.cookieHandler.getCookiesForDomain(domain),
          this.storageHandler.getStorageData(tabId)
        ]);
        return {
          cookies,
          localStorage: storageData.localStorage,
          sessionStorage: storageData.sessionStorage,
          indexedDB: storageData.indexedDB
        };
      } catch (error) {
        throw new ExtensionError(`Failed to get current session: ${error}`);
      }
    }
    async switchToSession(sessionData, tabId) {
      if (!sessionData || !tabId) {
        throw new ExtensionError("Invalid session data or tab ID");
      }
      const { domain, cookies, localStorage: localStorage2, sessionStorage: sessionStorage2, indexedDB: indexedDB2 } = sessionData;
      if (!domain) {
        throw new ExtensionError("Missing domain in session data");
      }

      // Helper for timeout
      const withTimeout = (promise, ms = 5000, name = "Operation") => {
        return Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error(`${name} timed out after ${ms}ms`)), ms))
        ]);
      };

      try {
        // Clear existing data first (usually fast, but good to be safe)
        await this.cookieHandler.clearCookiesForDomain(domain);
        await this.storageHandler.clearStorageData(tabId);

        // Restore data with timeout
        // We treat timeout as a "soft error" - we proceed to reload anyway because partial data might be enough
        // and we don't want the UI to hang.
        try {
          await withTimeout(Promise.all([
            this.cookieHandler.restoreCookies(cookies, domain),
            this.storageHandler.restoreStorageData(tabId, {
              localStorage: localStorage2,
              sessionStorage: sessionStorage2,
              indexedDB: indexedDB2
            })
          ]), 2000, "Session Restore"); // 2 seconds timeout
        } catch (error) {
          console.warn("Session restore timed out or failed, proceeding to reload anyway:", error);
        }

      } catch (error) {
        // If clearing failed, we still try to reload, but log the error
        console.error("Error during session switch preparation:", error);
        throw new ExtensionError(`Failed to switch session: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        // ALWAYS reload the tab, no matter what happens
        try {
          await chrome.tabs.reload(tabId);
        } catch (reloadError) {
          console.error("Failed to reload tab:", reloadError);
        }
      }
    }
    async clearSession(domain, tabId) {
      try {
        await Promise.all([
          this.cookieHandler.clearCookiesForDomain(domain),
          this.storageHandler.clearStorageData(tabId)
        ]);
        await chrome.tabs.reload(tabId);
      } catch (error) {
        throw new ExtensionError(`Failed to clear session: ${error}`);
      }
    }
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



  // src/background/services/message.service.ts
  var MessageService = class {
    constructor() {
      this.sessionHandler = new SessionHandler();
    }
    handleMessage(message, _, sendResponse) {
      if (!message || typeof message !== "object" || !message.action) {
        sendResponse({ success: false, error: "Invalid message format" });
        return true;
      }
      this.processMessage(message, sendResponse).catch((error) => {
        const errorMessage = handleError(error, "MessageService.handleMessage");
        sendResponse({ success: false, error: errorMessage });
      });
      return true;
    }
    async processMessage(message, sendResponse) {
      try {
        switch (message.action) {
          case MESSAGE_ACTIONS.GET_CURRENT_SESSION:
            await this.handleGetCurrentSession(message, sendResponse);
            break;
          case MESSAGE_ACTIONS.SWITCH_SESSION:
            await this.handleSwitchSession(message, sendResponse);
            break;
          case MESSAGE_ACTIONS.CLEAR_SESSION:
            await this.handleClearSession(message, sendResponse);
            break;
          case MESSAGE_ACTIONS.CLEAR_SESSIONS:
            await this.handleClearSessions(message, sendResponse);
            break;
          case MESSAGE_ACTIONS.EXPORT_SESSIONS:
            await this.handleExportSessions(message, sendResponse);
            break;
          case MESSAGE_ACTIONS.IMPORT_SESSIONS:
            await this.handleImportSessions(message, sendResponse);
            break;
          default:
            sendResponse({ success: false, error: `Unknown action: ${message.action}` });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        sendResponse({ success: false, error: errorMessage });
      }
    }
    async handleGetCurrentSession(message, sendResponse) {
      const sessionData = await this.sessionHandler.getCurrentSession(message.domain, message.tabId);
      sendResponse({ success: true, data: sessionData });
    }
    async handleSwitchSession(message, sendResponse) {
      await this.sessionHandler.switchToSession(message.sessionData, message.tabId);
      sendResponse({ success: true });
    }
    async handleClearSession(message, sendResponse) {
      await this.sessionHandler.clearSession(message.domain, message.tabId);
      sendResponse({ success: true });
    }
    async handleClearSessions(message, sendResponse) {
      const { clearOption, domain } = message;
      if (clearOption === "current") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          await this.sessionHandler.clearSession(domain, tab.id);
          // Note: The popup handles removing it from storage, but we can double check or just let popup handle it.
          // The original code removed it from storage here too. Let's keep it for safety.
          const sessions = await this.getStoredSessions();
          const updatedSessions = sessions.filter((s) => s.domain !== domain);
          await this.saveStoredSessions(updatedSessions);
        }
      } else if (clearOption === "all") {
        await this.saveStoredSessions([]);
        await this.saveActiveSessionsMap({});
      }
      sendResponse({ success: true });
    }
    async handleExportSessions(message, sendResponse) {
      const { exportOption, domain } = message;
      const sessions = await this.getStoredSessions();
      let sessionsToExport = sessions;
      if (exportOption === "current") {
        sessionsToExport = sessions.filter((s) => s.domain === domain);
      }
      const exportData = {
        version: "1.0",
        exportDate: (/* @__PURE__ */ new Date()).toISOString(),
        sessions: sessionsToExport
      };
      sendResponse({ success: true, data: JSON.stringify(exportData, null, 2) });
    }
    async handleImportSessions(message, sendResponse) {
      const { data } = message;
      const importData = JSON.parse(data);
      if (!importData || !importData.sessions || !Array.isArray(importData.sessions)) {
        throw new Error("Invalid import data format");
      }
      const currentSessions = await this.getStoredSessions();
      const importedSessions = importData.sessions;
      // Generate new IDs for imported sessions to avoid collisions
      const sessionsWithNewIds = importedSessions.map((session) => ({
        ...session,
        id: crypto.randomUUID()
      }));
      const mergedSessions = [...currentSessions, ...sessionsWithNewIds];
      await this.saveStoredSessions(mergedSessions);
      sendResponse({ success: true });
    }
    async getStoredSessions() {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SESSIONS);
      return result[STORAGE_KEYS.SESSIONS] || [];
    }
    async saveStoredSessions(sessions) {
      await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions });
    }
    async getActiveSessionsMap() {
      const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_SESSIONS);
      return result[STORAGE_KEYS.ACTIVE_SESSIONS] || {};
    }
    async saveActiveSessionsMap(activeSessions) {
      await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_SESSIONS]: activeSessions });
    }
  };

  // src/background/index.ts
  var messageService = new MessageService();
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    return messageService.handleMessage(message, sender, sendResponse);
  });
})();
