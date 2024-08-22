
export const feralAuthenticationServiceUrl = {
    v0: import.meta.env.VITE_AUTH_SERVICE_V0_BASE_URL,
};

export const views = {
    public: {
        name: 'Public',
        path: '/',
    },
    login:  {
        name: 'Login',
        path: '/login',
    },
    dashboard:  {
        name: 'Dashboard',
        path: '/dashboard',
    },
    admin:  {
        name: 'Admin',
        path: '/admin',
    },
};
