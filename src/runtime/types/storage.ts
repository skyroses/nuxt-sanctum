import { Store } from 'pinia';
import { User } from './user';

export interface StorageOptions {
    user: User;
    loggedIn: boolean;
    token: string;
    expired_at?: Date;
    fingerprint: string;
    ip: string;
};

export interface StorageActions {
    setUser: (user: User) => void;
    setLoggedIn: (status: boolean) => void;
    setToken: (token?: string) => void;
    setExpiredAt: (expired_at?: string | Date) => void;
    setFingerprint: (fingerprint: string) => void;
    setIPAddress: (ip: string) => void;
};

export type AuthStore = Store<string, StorageOptions, {}, StorageActions>;
