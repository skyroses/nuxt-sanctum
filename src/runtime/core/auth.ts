/**
 * @todo Cookie Scheme
 */

import { NuxtApp } from 'nuxt/app';
import { NuxtAxiosInstance } from '@nuxtjs-alt/axios';
import { AxiosRequestConfig } from 'axios';
import { IncomingMessage, ServerResponse } from 'h3';
import { defaultOptions, ModuleOptions } from '../../options';
import { TokenScheme } from '../schemes';
import { sha256 } from '../utils';
import { useAuth } from '../composables/useAuth';
import { Storage } from './storage';

export class Auth {
  public req: IncomingMessage;
  public res: ServerResponse;
  public storage: Storage;
  public scheme: TokenScheme;
  public axios: NuxtAxiosInstance;

  constructor (
    public nuxt: NuxtApp,
    public options: ModuleOptions & { moduleName: string }
  ) {
    this.axios = nuxt.$axios;

    // @ts-ignore
    this.req = nuxt?.ssrContext?.req;
    // @ts-ignore
    this.res = nuxt?.ssrContext?.res;

    this.storage = new Storage(nuxt, options).initStore();
    this.scheme = this.makeScheme();
  }

  get user (): any {
    return this.storage.store.user;
  }

  set user (payload: any) {
    this.storage.store.setUser(payload);
  }

  get loggedIn (): boolean {
    return this.storage.store.loggedIn;
  }

  get token (): string {
    return this.storage.store.token;
  }

  async run () {
    try {
      if (process.server) {
        const fingerprint = this.generateFingerprint();
        this.storage.store.setFingerprint(fingerprint);
      }

      await this.scheme.refreshToken();
    } catch (e) {
      console.log(e);
    }
  }

  async login (payload: any) {
    await this.scheme.login(payload);
    return await useRouter().push(this.options.redirects.afterLogin);
  }

  async logout () {
    await this.scheme.logout();
    return await useRouter().push(this.options.redirects.afterLogout);
  }

  async request (endpoint: AxiosRequestConfig) {
    if (!this.axios) {
      console.error(
        `[${this.options.moduleName}] Axios module not found`
      );

      return;
    }

    if (process.server) {
      if (endpoint.baseURL === '') {
        // @ts-ignore
        endpoint.baseURL = requrl(this.req);
      }

      endpoint.headers = { ...endpoint.headers, 'User-Agent': this?.req.headers['user-agent'] };
    }

    try {
      return await this.axios.request(endpoint);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async redirectTo (name: keyof typeof defaultOptions.redirects) {
    const to = this.options.redirects[name];

    if (process.server) {
      return await navigateTo(to);
    }

    // @ts-ignore
    return await this.nuxt.$router.push(to);
  }

  private makeScheme () {
    return new TokenScheme(this, this.axios, this.options.tokenScheme);
  }

  private generateFingerprint () {
    if (process.client) {
      return null;
    }

    const userAgent = this.req.headers['user-agent'];
    const ip = this.req.headers['x-forwarded-for'] || this.req.socket.remoteAddress;

    return sha256([
      ip,
      userAgent
    ].join('|'));
  }
}

export { useAuth };
