const isDev = import.meta.env.DEV;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logError = (message: string, error?: any): void => {
  if (isDev) {
    console.error(message, error);
  }
};
