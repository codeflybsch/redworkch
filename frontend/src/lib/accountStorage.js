const USERS_KEY = "rw_accounts";
const CURRENT_USER_KEY = "rw_current_user";

function loadJson(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJson(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredAccounts() {
  return loadJson(USERS_KEY) || [];
}

export function saveStoredAccounts(accounts) {
  saveJson(USERS_KEY, accounts);
}

export function getCurrentAccount() {
  return loadJson(CURRENT_USER_KEY);
}

export function setCurrentAccount(user) {
  saveJson(CURRENT_USER_KEY, user);
}

export function clearCurrentAccount() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
}

export function registerAccount({ name, email, password }) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!name || !normalizedEmail || !password) {
    throw new Error("Bitte Name, E-Mail und Passwort angeben.");
  }
  if (password.length < 8) {
    throw new Error("Das Passwort muss mindestens 8 Zeichen lang sein.");
  }
  const accounts = getStoredAccounts();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("Zu dieser E-Mail existiert bereits ein Konto.");
  }
  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    plan: "Business Hosting",
    createdAt: new Date().toISOString(),
  };
  const next = [...accounts, user];
  saveStoredAccounts(next);
  setCurrentAccount(user);
  return user;
}

export function loginAccount(email, password) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const accounts = getStoredAccounts();
  const user = accounts.find((account) => account.email === normalizedEmail && account.password === password);
  if (!user) {
    throw new Error("E-Mail oder Passwort ist falsch.");
  }
  setCurrentAccount(user);
  return user;
}

export function logoutAccount() {
  clearCurrentAccount();
}
