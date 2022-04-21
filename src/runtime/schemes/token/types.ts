import { AxiosRequestConfig } from 'axios';

export interface TokenSchemeOptions {
    endpoints: {
        login: AxiosRequestConfig;
        user: AxiosRequestConfig;
        refresh?: AxiosRequestConfig | false;
        logout?: AxiosRequestConfig | false;
    },
    user: {
        property?: string | false;
    },
    token: {
        prefix?: string | false;
        property: string;
        headerName?: string;
        expiredAtProperty?: string | false;
    },
    refreshToken?: {
        property: string | false;
    }
};
