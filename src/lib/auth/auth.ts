export interface AuthToken {
  userId: string;
  email: string;
  name: string;
}

export const verifyTokenClient = (token: string): AuthToken | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
};
