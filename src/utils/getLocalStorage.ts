const getLocalStorageKey = (promptId: string) => `prompt_access_${promptId}`;

const checkLocalStorageAccess = (promptId: string) => {
  try {
    return !!localStorage.getItem(getLocalStorageKey(promptId));
  } catch {
    return false;
  }
};

const setLocalStorageAccess = (promptId: string, decryptedContent: string) => {
  try {
    localStorage.setItem(getLocalStorageKey(promptId), decryptedContent);
    return true;
  } catch {
    return false;
  }
};

export { checkLocalStorageAccess, setLocalStorageAccess };
