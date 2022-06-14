/**
 * @todo Cookie Scheme
 */

import requrl from 'requrl';
import { NuxtApp, useRouter } from 'nuxt/app';
import { Router } from 'vue-router';
import { AxiosRequestConfig } from 'axios';
import { IncomingMessage, ServerResponse } from 'h3';
import { defaultOptions, ModuleOptions } from '../../options';
import { TokenScheme } from '../schemes';
import { sha256 } from '../utils';
import { useAuth } from '../composables/useAuth';
import { SanctumAuthResponse, User } from '../types';
import { Storage } from './storage';

export class Auth {
  public storage: Storage;
  public scheme: TokenScheme;
  public router: Router;
  public req: IncomingMessage;
  public res: ServerResponse;

  constructor (
    public nuxt: NuxtApp,
    public options: ModuleOptions & { moduleName: string }
  ) {
    // @ts-ignore
    this.req = nuxt?.ssrContext?.req;
    // @ts-ignore
    this.res = nuxt?.ssrContext?.res;

    this.router = useRouter();

    this.storage = new Storage(nuxt, options).initStore();
    this.scheme = this.makeScheme();
  }

  get user (): User {
    return this.storage.store.user;
  }

  set user (payload: User) {
    this.storage.store.setUser(payload);
  }

  get loggedIn (): boolean {
    return this.storage.store.loggedIn;
  }

  get token (): string {
    return this.storage.store.token;
  }

  get axios () {
    return this.nuxt.$axios;
  }

  async run () {
    try {
      if (process.server && this.options.fingerprint.enabled) {
        const fingerprint = this.generateFingerprint();
        this.storage.store.setFingerprint(fingerprint);
      }

      await this.scheme.refreshToken();
    } catch (error) {
      Promise.reject(error);
    }
  }

  async login (payload: any) {
    await this.scheme.login(payload);
    await this.redirectTo('afterLogin');
  }

  async logout () {
    await this.redirectTo('afterLogout');
    await this.scheme.logout();
  }

  async request (endpoint: AxiosRequestConfig): Promise<SanctumAuthResponse> {
    if (!this.axios) {
      console.error(
        `[${this.options.moduleName}] Axios module not found`
      );

      return;
    }

    endpoint.baseURL = this.options.baseURL;

    if (this.options.fingerprint.enabled && this.storage.store.fingerprint) {
      endpoint.data = {
        ...endpoint.data,
        [this.options.fingerprint.property]: this.storage.store.fingerprint
      };
    }

    if (process.server) {
      if (!endpoint.baseURL) {
        endpoint.baseURL = requrl(this.req);
      }

      endpoint.headers = { ...endpoint.headers, 'User-Agent': this?.req.headers['user-agent'] };
    }

    return await this.axios.request(endpoint);
  }

  async redirectTo (name: keyof typeof defaultOptions.redirects) {
    return await this.router.push(this.getRedirectRoute(name));
  }

  getRedirectRoute (name: keyof typeof defaultOptions.redirects) {
    return this.options.redirects[name];
  }

  private makeScheme () {
    return new TokenScheme(this, this.options.tokenScheme);
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
