"use strict";
(() => {
  // src/shared/constants/storageKeys.ts
  var STORAGE_KEYS = {
    SESSIONS: "sessions",
    ACTIVE_SESSIONS: "activeSessions"
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
    // Accept tabId so we only read from the tab's specific cookie store,
    // preventing accidental reads from incognito / other profile stores.
    async getCookiesForDomain(domain, tabId) {
      try {
        const cleanDomain = domain.split(":")[0];
        // Resolve the exact cookie store used by the target tab
        let storeId = "0"; // default store fallback
        if (tabId) {
          try {
            const tab = await chrome.tabs.get(tabId);
            if (tab.cookieStoreId) storeId = tab.cookieStoreId;
          } catch (e) {
            console.warn("[Cookies] Could not get tab cookieStoreId, using default store:", e);
          }
        }
        const cookies = await chrome.cookies.getAll({ storeId });
        // Fix B2: Include apex/parent-domain cookies (e.g. `.google.com` cookies must
        // also restore for `accounts.google.com`). Match if:
        //   - cookie domain == cleanDomain (exact host)
        //   - cookie domain == ".cleanDomain" or "cleanDomain" suffix matches (subdomain of stored)
        //   - cleanDomain is a subdomain of the cookie's apex (e.g. cleanDomain="accounts.google.com",
        //     cookieDomain=".google.com"  → must include)
        //   - localhost edge
        return cookies.filter((cookie) => {
          const cd = cookie.domain.replace(/^\./, "");
          if (cd === cleanDomain) return true;
          if (cleanDomain === "localhost" && cd === "localhost") return true;
          // Cookie set on a parent domain → applies to subdomain `cleanDomain`
          if (cleanDomain.endsWith("." + cd)) return true;
          // Stored cookie itself a subdomain of the queried cleanDomain (legacy behavior)
          if (cd.endsWith("." + cleanDomain)) return true;
          return false;
        });
      } catch (error) {
        console.error("Error getting cookies for domain:", domain, error);
        return [];
      }
    }
    async clearCookiesForDomain(domain, tabId) {
      const cookies = await this.getCookiesForDomain(domain, tabId);
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
    async restoreCookies(cookies, domain, tabId) {
      if (!cookies || !Array.isArray(cookies)) {
        console.error("Invalid cookies array provided:", cookies);
        return;
      }
      if (!domain) {
        console.error("Invalid domain provided for cookie restoration");
        return;
      }
      // B4: write to the TARGET tab's cookie store, not the store the cookie
      // was captured from (which may be a different profile, e.g. incognito).
      let targetStoreId = "0";
      if (tabId) {
        try {
          const tab = await chrome.tabs.get(tabId);
          if (tab.cookieStoreId) targetStoreId = tab.cookieStoreId;
        } catch (e) {
          console.warn("[Cookies] Could not get tab cookieStoreId for restore, using default store:", e);
        }
      }
      console.log(`Restoring ${cookies.length} cookies for domain: ${domain} (store: ${targetStoreId})`);
      let successCount = 0;
      let failureCount = 0;
      let skippedCount = 0;
      // Fix #1: 5-second per-cookie timeout to prevent hanging on slow/stuck cookies
      const COOKIE_TIMEOUT = 5000;

      // Restore cookies sequentially to avoid race conditions with same-name cookies
      for (const cookie of cookies) {
        if (!cookie || !cookie.name) {
          console.warn("Skipping invalid cookie:", cookie);
          skippedCount++;
          continue;
        }
        try {
          const cookieDetails = this.prepareCookieForRestore(cookie, domain);
          cookieDetails.storeId = targetStoreId;

          // Fix for hostOnly cookies: if a cookie is hostOnly, we must NOT supply the domain.
          // Chrome API infers hostOnly=true if domain is omitted.
          if (cookie.hostOnly) {
            delete cookieDetails.domain;
          }

          // Set with individual timeout so one stuck cookie can't block the entire restore
          await Promise.race([
            chrome.cookies.set(cookieDetails),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Cookie set timeout")), COOKIE_TIMEOUT)
            )
          ]);
          successCount++;
        } catch (error) {
          failureCount++;
          console.warn(`Failed to restore cookie: ${cookie.name}`, error.message);
        }
      }
      console.log(`Cookie restoration complete - Success: ${successCount}, Failed: ${failureCount}, Skipped: ${skippedCount}`);
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
  // NOTE: extractStorageData / injectStorageData run in the page's MAIN world via
  // chrome.scripting.executeScript — they do NOT have access to outer-scope variables.
  // All caps/regex/host lists must live inside the function body.
  async function extractStorageData() {
    try {
      const host = (window.location.hostname || "").toLowerCase();
      const isHeavyHost = host && [
        "whatsapp.com","web.whatsapp.com",
        "instagram.com","www.instagram.com",
        "facebook.com","www.facebook.com","messenger.com",
        "twitter.com","x.com",
        "tiktok.com","www.tiktok.com",
        "discord.com",
        "youtube.com","www.youtube.com","music.youtube.com",
        "linkedin.com","www.linkedin.com",
        "reddit.com","www.reddit.com"
      ].some((h) => host === h || host.endsWith("." + h));
      const HEAVY_STORE_REGEX = /(cache|blob|media|attachment|thumbnail|image|video|asset|preview|_idb_kv)/i;
      const MAX_RECORDS_PER_STORE = 800;
      const MAX_VALUE_BYTES = 256 * 1024;
      const MAX_TOTAL_IDB_BYTES = 8 * 1024 * 1024;
      let idbBytesUsed = 0;

      // WhatsApp: legacy full-skip behavior
      if (host.includes("whatsapp.com")) {
        return { localStorage: {}, sessionStorage: {}, indexedDB: {}, _heavy: true };
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
          if (obj.size > MAX_VALUE_BYTES) return { __type: "BlobSkipped", size: obj.size, mime: obj.type };
          const base64 = await blobToBase64(obj);
          return { __type: "Blob", data: base64, type: obj.type };
        }
        if (obj instanceof ArrayBuffer) {
          if (obj.byteLength > MAX_VALUE_BYTES) return { __type: "ArrayBufferSkipped", size: obj.byteLength };
          const blob = new Blob([obj]);
          const base64 = await blobToBase64(blob);
          return { __type: "ArrayBuffer", data: base64 };
        }
        if (obj instanceof Uint8Array) {
          if (obj.byteLength > MAX_VALUE_BYTES) return { __type: "Uint8ArraySkipped", size: obj.byteLength };
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
      // Heavy hosts: skip IDB entirely. Cookies + localStorage carry auth.
      if (isHeavyHost) {
        return {
          localStorage: localStorageData,
          sessionStorage: sessionStorageData,
          indexedDB: indexedDBData,
          _heavy: true
        };
      }

      try {
        const dbs = (typeof indexedDB.databases === "function") ? await indexedDB.databases() : [];
        outer: for (const dbInfo of dbs) {
          if (!dbInfo.name) continue;
          if (idbBytesUsed > MAX_TOTAL_IDB_BYTES) {
            console.warn("[Extract] IDB total byte cap reached, skipping remaining DBs");
            break;
          }

          let db;
          try {
            db = await new Promise((resolve, reject) => {
              const req = indexedDB.open(dbInfo.name);
              req.onsuccess = () => resolve(req.result);
              req.onerror = () => reject(req.error);
              req.onblocked = () => reject(new Error("Blocked"));
              setTimeout(() => reject(new Error("Timeout opening DB")), 2500);
            });
          } catch (e) {
            console.warn(`[Extract] Skip DB ${dbInfo.name}:`, e.message || e);
            continue;
          }

          const dbData = { version: db.version, stores: {} };

          for (const storeName of db.objectStoreNames) {
            // Skip cache-like stores by name
            if (HEAVY_STORE_REGEX.test(storeName)) {
              console.log(`[Extract] Skipping cache-like store: ${dbInfo.name}/${storeName}`);
              continue;
            }
            try {
              const tx = db.transaction([storeName], "readonly");
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

              // Count first to bail on huge stores
              const count = await new Promise((resolve, reject) => {
                const req = store.count();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
                setTimeout(() => reject(new Error("count timeout")), 1500);
              });
              if (count > MAX_RECORDS_PER_STORE) {
                console.log(`[Extract] Skip oversized store ${dbInfo.name}/${storeName}: ${count} records`);
                dbData.stores[storeName] = { schema, records: [], _skipped: true, _count: count };
                continue;
              }

              const records = await new Promise((resolve, reject) => {
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
                setTimeout(() => reject(new Error("getAll timeout")), 4000);
              });

              let keys = undefined;
              if (!store.keyPath) {
                keys = await new Promise((resolve, reject) => {
                  const req = store.getAllKeys();
                  req.onsuccess = () => resolve(req.result);
                  req.onerror = () => reject(req.error);
                  setTimeout(() => reject(new Error("getAllKeys timeout")), 1500);
                });
              }

              const serializedRecords = [];
              for (let i = 0; i < records.length; i++) {
                if (idbBytesUsed > MAX_TOTAL_IDB_BYTES) {
                  console.warn("[Extract] IDB total cap reached mid-store, truncating");
                  break;
                }
                const key = keys ? await serialize(keys[i]) : undefined;
                const value = await serialize(records[i]);
                const rec = { key, value };
                try { idbBytesUsed += JSON.stringify(rec).length; } catch (_) {}
                serializedRecords.push(rec);
              }

              dbData.stores[storeName] = { schema, records: serializedRecords };
            } catch (e) {
              console.warn(`[Extract] Failed store ${dbInfo.name}/${storeName}:`, e.message || e);
              continue;
            }
          }
          try { db.close(); } catch (_) {}
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

          await new Promise((resolve, _reject) => {
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
  async function clearStorage() {
    try {
      try { localStorage.clear(); } catch (e) { console.warn("localStorage.clear failed", e); }
      try { sessionStorage.clear(); } catch (e) { console.warn("sessionStorage.clear failed", e); }

      // Unregister Service Workers + caches (best-effort, bounded)
      try {
        if ('serviceWorker' in navigator) {
          const regs = await Promise.race([
            navigator.serviceWorker.getRegistrations(),
            new Promise((res) => setTimeout(() => res([]), 1500))
          ]);
          await Promise.allSettled(regs.map((r) => r.unregister()));
        }
        if ('caches' in window) {
          const keys = await Promise.race([
            caches.keys(),
            new Promise((res) => setTimeout(() => res([]), 1500))
          ]);
          await Promise.allSettled(keys.map((k) => caches.delete(k)));
        }
      } catch (e) {
        console.warn("Error clearing SW/Cache:", e);
      }

      // IndexedDB: best-effort, per-DB timeout. deleteDatabase blocks if any
      // connection is still open on the page — we'd rather skip than hang.
      try {
        const dbs = (typeof indexedDB.databases === "function") ? await indexedDB.databases() : [];
        for (const dbInfo of dbs) {
          if (!dbInfo.name) continue;
          await new Promise((resolve) => {
            let done = false;
            const finish = () => { if (!done) { done = true; resolve(); } };
            try {
              const req = indexedDB.deleteDatabase(dbInfo.name);
              req.onsuccess = finish;
              req.onerror = finish;
              req.onblocked = finish;
            } catch (_) {
              finish();
            }
            // hard cap per DB
            setTimeout(finish, 1500);
          });
        }
      } catch (e) {
        console.warn("Failed to clear IndexedDB:", e);
      }
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return true; // soft-success — caller still proceeds to reload
    }
  }

  // src/background/handlers/storage.handler.ts
  // Helper: race executeScript so a frozen page can't hang the popup forever.
  function withTimeoutBg(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms))
    ]);
  }
  var StorageHandler = class {
    async getStorageData(tabId) {
      try {
        const results = await withTimeoutBg(
          chrome.scripting.executeScript({
            target: { tabId },
            func: extractStorageData
          }),
          15000,
          "Extract storage"
        );
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
        const results = await withTimeoutBg(
          chrome.scripting.executeScript({
            target: { tabId },
            func: injectStorageData,
            args: [data.localStorage || {}, data.sessionStorage || {}, data.indexedDB || {}]
          }),
          15000,
          "Restore storage"
        );
        if (!results || results.length === 0 || results[0].result !== true) {
          throw new ExtensionError("Failed to inject storage data into the page");
        }
      } catch (error) {
        throw new ExtensionError(`Failed to restore storage data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    async clearStorageData(tabId) {
      try {
        await withTimeoutBg(
          chrome.scripting.executeScript({
            target: { tabId },
            func: clearStorage
          }),
          10000,
          "Clear storage"
        );
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
          this.cookieHandler.getCookiesForDomain(domain, tabId),
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

      const withTimeout = (promise, ms, name) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error(`${name} timed out after ${ms}ms`)), ms))
        ]);
      };

      try {
        // Clear cookies and storage in parallel — independent, both bounded.
        // Each gets its own timeout so a stuck IDB clear can't block cookie clear.
        await Promise.allSettled([
          withTimeout(this.cookieHandler.clearCookiesForDomain(domain, tabId), 10000, "Clear cookies"),
          withTimeout(this.storageHandler.clearStorageData(tabId), 10000, "Clear storage")
        ]);

        // Restore. Cookie restore and storage restore are independent — run in parallel
        // with a generous total budget. Soft-fail (log) so the reload still happens
        // even if one path is slow on heavy sites like Instagram.
        try {
          await withTimeout(
            Promise.allSettled([
              this.cookieHandler.restoreCookies(cookies, domain, tabId),
              this.storageHandler.restoreStorageData(tabId, {
                localStorage: localStorage2,
                sessionStorage: sessionStorage2,
                indexedDB: indexedDB2
              })
            ]),
            15000,
            "Session restore"
          );
        } catch (error) {
          console.warn("[Switch] Session restore exceeded budget, proceeding to reload:", error);
        }

      } catch (error) {
        console.error("Error during session switch preparation:", error);
        // Don't throw — we still want to reload so the user sees something.
      } finally {
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
          this.cookieHandler.clearCookiesForDomain(domain, tabId),
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
    AUTO_REFRESH_SESSION: "autoRefreshSession"
  };



  // src/background/services/message.service.ts
  var MessageService = class {
    constructor() {
      this.sessionHandler = new SessionHandler();
    }
    handleMessage(message, sender, sendResponse) {
      // Security: only accept messages from this extension's own pages (popup).
      // Reject anything from content scripts or web pages.
      if (!sender || sender.id !== chrome.runtime.id) {
        sendResponse({ success: false, error: "Unauthorized sender" });
        return true;
      }
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
          case MESSAGE_ACTIONS.AUTO_REFRESH_SESSION:
            await this.handleAutoRefreshSession(message, sendResponse);
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
    async handleAutoRefreshSession(message, sendResponse) {
      try {
        const { domain, tabId, sessionId } = message;
        if (!domain || !tabId || !sessionId) {
          sendResponse({ success: false, error: "Missing required parameters" });
          return;
        }
        // Verify tab is in a complete state — refreshing mid-redirect captures partial data
        try {
          const tab = await chrome.tabs.get(tabId);
          if (tab.status !== "complete") {
            sendResponse({ success: false, error: "Tab not ready (status: " + tab.status + ")" });
            return;
          }
        } catch (e) {
          sendResponse({ success: false, error: "Could not verify tab state" });
          return;
        }
        // Get current session data from the page
        const sessionData = await this.sessionHandler.getCurrentSession(domain, tabId);
        // Get stored sessions and find the one to update
        const sessions = await this.getStoredSessions();
        const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
        if (sessionIndex === -1) {
          sendResponse({ success: false, error: "Session not found" });
          return;
        }
        // Fix B1: Sanity guard — refuse to overwrite a session if the captured state
        // looks like the user has been logged out. Three signals:
        //   1. captured cookies are empty but stored session had cookies
        //   2. cookie count dropped >70% vs stored
        //   3. captured localStorage empty vs stored had data
        // If any signal fires, abort the refresh and let the user manually re-save.
        const stored = sessions[sessionIndex];
        const storedCookieCount = (stored.cookies || []).length;
        const freshCookieCount = (sessionData.cookies || []).length;
        const storedLsKeys = Object.keys(stored.localStorage || {}).length;
        const freshLsKeys = Object.keys(sessionData.localStorage || {}).length;
        const looksLoggedOut =
          (storedCookieCount > 0 && freshCookieCount === 0) ||
          (storedCookieCount > 5 && freshCookieCount < storedCookieCount * 0.3) ||
          (storedLsKeys > 0 && freshLsKeys === 0 && freshCookieCount === 0);
        if (looksLoggedOut) {
          console.warn(
            `[Auto Refresh] Aborted for "${stored.name}" — stored=${storedCookieCount}c/${storedLsKeys}ls, fresh=${freshCookieCount}c/${freshLsKeys}ls. Likely logged out.`
          );
          sendResponse({ success: false, error: "Auto-refresh aborted: looks like the session is logged out. Saved data preserved." });
          return;
        }
        // Update the session with fresh data
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          cookies: sessionData.cookies,
          localStorage: sessionData.localStorage,
          sessionStorage: sessionData.sessionStorage,
          indexedDB: sessionData.indexedDB,
          lastRefreshed: Date.now()
        };
        await this.saveStoredSessions(sessions);
        console.log(`[Auto Refresh] Session "${sessions[sessionIndex].name}" refreshed for ${domain}`);
        sendResponse({ success: true, data: { refreshedAt: Date.now() } });
      } catch (error) {
        console.error("Error in auto refresh session:", error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
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

  // Fix #3: Storage monitoring — unlimitedStorage is intentionally kept because sessions
  // contain full cookie sets, localStorage, sessionStorage, and IndexedDB which can be
  // several MB per domain. Regular storage (~5 MB) is insufficient for power users.
  async function checkStorageUsage() {
    try {
      const usage = await chrome.storage.local.getBytesInUse(null);
      const usageMB = usage / 1024 / 1024;
      const QUOTA_WARNING_MB = 50;
      if (usageMB > QUOTA_WARNING_MB) {
        console.warn(`[Storage] Usage: ${usageMB.toFixed(2)} MB — consider removing unused sessions to free space.`);
      } else {
        console.log(`[Storage] Usage: ${usageMB.toFixed(2)} MB`);
      }
      return usage;
    } catch (e) {
      console.warn("[Storage] Could not check storage usage:", e);
      return 0;
    }
  }

  // ============================================================
  // Action badge: show jumlah saved session for current tab's domain
  // ============================================================
  function extractDomainBg(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if ((host === "localhost" || host.startsWith("127.")) && u.port) {
        return `${host}:${u.port}`;
      }
      return host;
    } catch (_) {
      return "";
    }
  }
  async function updateBadgeForTab(tab) {
    if (!tab || !tab.id || !tab.url) {
      // Only clear THIS tab's badge if we know its id. Clearing without tabId
      // wipes badges on every tab (onUpdated fires for chrome:// etc).
      if (tab && tab.id) {
        try { await chrome.action.setBadgeText({ tabId: tab.id, text: "" }); } catch (_) {}
      }
      return;
    }
    if (!/^https?:/i.test(tab.url)) {
      try { await chrome.action.setBadgeText({ tabId: tab.id, text: "" }); } catch (_) {}
      return;
    }
    try {
      const domain = extractDomainBg(tab.url);
      const result = await chrome.storage.local.get(STORAGE_KEYS.SESSIONS);
      const sessions = result[STORAGE_KEYS.SESSIONS] || [];
      const count = sessions.filter((s) => s.domain === domain).length;
      const text = count > 0 ? (count > 99 ? "99+" : String(count)) : "";
      await chrome.action.setBadgeText({ tabId: tab.id, text });
      await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#d97706" });
      if (chrome.action.setBadgeTextColor) {
        try { await chrome.action.setBadgeTextColor({ tabId: tab.id, color: "#fef3c7" }); } catch (_) {}
      }
    } catch (e) {
      console.warn("[Badge] Update failed:", e);
    }
  }
  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    try { const tab = await chrome.tabs.get(tabId); updateBadgeForTab(tab); } catch (_) {}
  });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" || changeInfo.url) updateBadgeForTab(tab);
  });
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== "local" || !changes[STORAGE_KEYS.SESSIONS]) return;
    try {
      const tabs = await chrome.tabs.query({ active: true });
      for (const t of tabs) updateBadgeForTab(t);
    } catch (_) {}
  });
  // Initial badge paint on service worker startup
  (async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true });
      for (const t of tabs) updateBadgeForTab(t);
    } catch (_) {}
  })();

  // src/background/index.ts
  var messageService = new MessageService();
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    return messageService.handleMessage(message, sender, sendResponse);
  });
  // Run storage health check on service worker startup
  checkStorageUsage();
})();
