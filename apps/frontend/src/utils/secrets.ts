const SECRET_PREFIX = 'studyflow_secret_';

export const saveLocalSecret = (key: 'openai' | 'github', value: string) => {
  try {
    const encoded = btoa(`sf::${value}`);
    localStorage.setItem(`${SECRET_PREFIX}${key}`, encoded);
  } catch (_e) {}
};

export const loadLocalSecret = (key: 'openai' | 'github'): string | null => {
  try {
    const raw = localStorage.getItem(`${SECRET_PREFIX}${key}`);
    if (!raw) return null;
    const decoded = atob(raw);
    return decoded.startsWith('sf::') ? decoded.slice(4) : null;
  } catch (_e) {
    return null;
  }
};
