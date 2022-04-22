import { NuxtAxiosInstance } from '@nuxtjs-alt/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { appendHeader } from 'h3';
import { Auth } from '../../core/auth';
import { getProp } from '../../utils';
import { Scheme } from '../scheme';
import { TokenSchemeOptions } from './types';
import { } from 'nuxt/app';

export class TokenScheme extends Scheme {
  constructor (
    protected auth: Auth,
    protected axios: NuxtAxiosInstance,
    protected options: TokenSchemeOptions
  ) {
    super();
  }

  async login (payload: any): Promise<AxiosResponse | void> {
    const endpoint = this.options.endpoints.login;

    if (!endpoint) {
      return;
    }

    this.reset();

    endpoint.data = { ...payload };

    const response = await this.tokenRequest(endpoint);

    await this.fetchUser();

    return response;
  }

  async logout (): Promise<AxiosResponse | void> {
    const endpoint = this.options.endpoints.logout;

    if (!endpoint) {
      return;
    }

    this.reset();

    return await this.request(endpoint);
  }

  updateToken (response: AxiosResponse) {
    this.token = <string>getProp(response.data, this.options.token.property);
    this.expiredAt = new Date(<string>getProp(response.data, this.options.token.expiredAtProperty));
    this.axios.setToken(this.token, String(this.options.token.prefix ?? 'Bearer'));
  }

  async fetchUser () {
    const response = await this.request(this.options.endpoints.user);

    this.auth.user = getProp(response.data, this.options.user.property);
  }

  clearToken (): void {
    this.axios.setHeader(this.options.token.headerName, null);
  }

  reset (): void {
    this.clearToken();
    this.auth.user = null;
  }

  async refreshToken () {
    if (process.client) {
      return;
    }

    const endpoint = this.options.endpoints.refresh;

    if (!endpoint) {
      return;
    }

    this.reset();

    try {
      const response = await this.tokenRequest(endpoint).then((response) => {
        if (process.server) {
          // @ts-ignore
          appendHeader(this.auth.nuxt.ssrContext.res, 'set-cookie', response.headers['set-cookie'] ?? []);
        }

        return Promise.resolve(response);
      });

      if (!response) {
        return;
      }

      await this.fetchUser();
    } catch (e) {}
  }

  request (endpoint: AxiosRequestConfig): Promise<AxiosResponse> {
    this.options.token.prefix ??= 'Bearer';

    if (this.token) {
      this.axios.setToken(this.token, this.options.token.prefix);
    }

    return this.auth.request(endpoint);
  }

  check () {
    return {
      tokenExpired: Date.now() >= this.expiredAt?.getTime()
    };
  }

  get token () {
    return this.auth.storage.store.token;
  }

  set token (value: string) {
    this.auth.storage.store.setToken(value);
  }

  get expiredAt (): Date {
    return this.auth.storage.store.expired_at;
  }

  set expiredAt (value: string | Date) {
    this.auth.storage.store.setExpiredAt(value);
  }

  private async tokenRequest (endpoint: AxiosRequestConfig) {
    const response = await this.request(endpoint);

    this.updateToken(response);

    return response;
  }
}

export * from './types';
