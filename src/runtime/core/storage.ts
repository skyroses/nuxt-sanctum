import { NuxtApp } from 'nuxt/app';
import { defineStore, Pinia } from 'pinia';
import { ModuleOptions } from '../../options';
import { AuthStore } from '..';
import { User } from '../types';

export class Storage {
  public store: AuthStore;

  // eslint-disable-next-line no-useless-constructor
  constructor (
    protected nuxt: NuxtApp,
    protected options: ModuleOptions & { moduleName: string }
  ) {}

  initStore () {
    // @ts-ignore
    const pinia: Pinia = this.nuxt.$pinia;

    this.store = defineStore(String(this.options.pinia!.namespace), {
      state: () => ({
        user: null,
        loggedIn: false,
        token: null,
        expired_at: null,
        fingerprint: null,
        ip: ''
      }),
      actions: {
        setUser (user: User | null) {
          this.user = user;
          this.loggedIn = !!user;
        },
        setLoggedIn (status: boolean) {
          this.loggedIn = status;
        },
        setToken (token?: string | null) {
          this.token = token;
        },
        setExpiredAt (expiredAt?: string | Date | null) {
          if (expiredAt instanceof String) {
            this.expired_at = new Date(expiredAt);
            return;
          }

          this.expired_at = expiredAt;
        },
        setFingerprint (fingerprint: string | null) {
          this.fingerprint = fingerprint;
        },
        setIPAddress (ip: string) {
          this.ip = ip;
        }
      }
    })(pinia);

    return this;
  }
};
