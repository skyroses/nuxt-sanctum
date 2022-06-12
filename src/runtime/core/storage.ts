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

    this.store = defineStore(this.options.pinia.namespace, {
      state: () => ({
        user: null,
        loggedIn: false,
        token: null,
        expired_at: null,
        fingerprint: null,
        ip: null
      }),
      actions: {
        setUser (user: User) {
          this.user = user;
          this.loggedIn = !!user;
        },
        setLoggedIn (status: boolean) {
          this.loggedIn = status;
        },
        setToken (token?: string) {
          this.token = token;
        },
        setExpiredAt (expiredAt?: string | Date) {
          if (expiredAt instanceof String) {
            this.expired_at = new Date(expiredAt);
            return;
          }

          this.expired_at = expiredAt;
        },
        setFingerprint (fingerprint: string) {
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
