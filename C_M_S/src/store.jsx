import { createStore } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';

// Define the roles as 'admin', 'faculty', 'student'
const roles = ['admin', 'faculty', 'student'];

// Create the authentication store using Zustand
const useAuthStore = createStore()(
    devtools(
        (set) => ({
            accessToken: undefined,
            accessTokenData: undefined,
            refreshToken: undefined,
            login: (token, tokenData) => set(() => ({
                accessToken: token,
                accessTokenData: tokenData,
            })),
            logout: () => set(() => ({
                accessToken: undefined,
                accessTokenData: undefined,
                refreshToken: undefined,
            })),
        }),
        {
            name: 'auth-store',
            enabled: !import.meta.env.PROD, // Devtools enabled in development
        }
    )
);

export default useAuthStore;
