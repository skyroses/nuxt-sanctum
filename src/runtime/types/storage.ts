import { Store } from 'pinia';
import { User } from './user';

export interface StorageOptions {
    user: User | null;
    loggedIn: boolean;
    token: string | null;
    expired_at?: Date | null;
    fingerprint?: string | null;
    ip: string;
};

export interface StorageActions {
    setUser: (user: User | null) => void;
    setLoggedIn: (status: boolean) => void;
    setToken: (token?: string | null) => void;
    setExpiredAt: (expired_at?: string | Date) => void;
    setFingerprint: (fingerprint: string) => void;
    setIPAddress: (ip: string) => void;
};

export type AuthStore = Store<string, StorageOptions, {}, StorageActions>;
