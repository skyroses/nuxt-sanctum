import { AxiosRequestConfig } from 'axios';
import { Auth } from '../../core/auth';
import { getProp } from '../../utils';
import { Scheme } from '../scheme';
import { SanctumAuthResponse } from '../../types';
import { TokenSchemeOptions } from './types';

export class TokenScheme extends Scheme {
  constructor (
    protected auth: Auth,
    protected options: TokenSchemeOptions
  ) {
    super();
  }

  async login (payload: any) {
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

  logout () {
    const endpoint = this.options.endpoints.logout;

    if (!endpoint) {
      return;
    }

    this.reset();

    return this.request(endpoint);
  }

  updateToken (response: SanctumAuthResponse) {
    this.token = <string>getProp(response.data, this.options.token.property);
    this.expiredAt = new Date(<string>getProp(response.data, this.options.token.expiredAtProperty));
    this.auth.axios.setToken(this.token, String(this.options.token.prefix ?? 'Bearer'));
  }

  async fetchUser () {
    const response = await this.request(this.options.endpoints.user);

    this.auth.user = getProp(response.data, this.options.user.property);
  }

  clearToken (): void {
    this.auth.axios.setHeader(this.options.token.headerName, null);
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
      const response = await this.tokenRequest(endpoint);

      if (process.server) {
        this.auth.res.setHeader('set-cookie', response.headers['set-cookie'] ?? []);
      }

      if (!response) {
        return;
      }

      await this.fetchUser();
    } catch (e) {}
  }

  request (endpoint: AxiosRequestConfig) {
    this.options.token.prefix ??= 'Bearer';

    if (this.token) {
      this.auth.axios.setToken(this.token, this.options.token.prefix);
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
