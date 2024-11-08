const getAccessKey = (promptId: string) => `prompt_access_status_${promptId}`;

const checkStoredAccess = (promptId: string): boolean => {
  try {
    return localStorage.getItem(getAccessKey(promptId)) === 'true';
  } catch {
    return false;
  }
};

const setStoredAccess = (promptId: string) => {
  try {
    localStorage.setItem(getAccessKey(promptId), 'true');
  } catch (error) {
    console.error('Failed to save access status:', error);
  }
};

export { checkStoredAccess, setStoredAccess, getAccessKey };