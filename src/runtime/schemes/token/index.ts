import { AxiosRequestConfig } from 'axios';
import { Auth } from '../../core/auth';
import { getProp } from '../../utils';
import { Scheme } from '../scheme';
import { SanctumAuthResponse, User } from '../../types';
import { TokenSchemeOptions } from './types';

export class TokenScheme extends Scheme {
  constructor (
    protected auth: Auth,
    public options: TokenSchemeOptions
  ) {
    super();
  }

  async login (payload: any) {
    const endpoint = this.options.endpoints?.login;

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
    const endpoint = this.options.endpoints?.logout;

    if (!endpoint) {
      return;
    }

    this.reset();

    return this.auth.request(endpoint);
  }

  updateToken (response: SanctumAuthResponse) {
    const expiredAt = String(this.options.token.expiredAtProperty);

    this.token = <string>getProp(response.data, this.options.token.property);
    this.auth.storage.store.setExpiredAt(new Date(<string>getProp(response.data, expiredAt)));
  }

  async fetchUser () {
    const response = await this.auth.request(this.options.endpoints!.user);
    this.auth.user = getProp(response.data, this.options.user?.property) as User;
  }

  clearToken (): void {
    this.token = null;
  }

  reset (): void {
    this.clearToken();
    this.auth.storage.store.setUser(null);
  }

  async refreshToken () {
    if (process.client) {
      return;
    }

    const endpoint = this.options.endpoints?.refresh;

    if (!endpoint) {
      return;
    }

    this.reset();

    try {
      const response = await this.tokenRequest(endpoint);

      if (!response) {
        return;
      }

      if (process.server && !this.auth.res.writableEnded) {
        this.auth.res.setHeader('set-cookie', response.headers['set-cookie'] ?? []);
      }

      await this.fetchUser();
    } catch (e) {}
  }

  check () {
    return {
      tokenExpired: this.expiredAt ? Date.now() >= this.expiredAt.getTime() : false
    };
  }

  get token () {
    return this.auth.storage.store.token;
  }

  set token (value: string | null) {
    this.auth.storage.store.setToken(value);
  }

  get expiredAt () {
    const date = this.auth.storage.store.expired_at;

    if (date instanceof String) {
      return new Date(date);
    }

    return this.auth.storage.store.expired_at;
  }

  private async tokenRequest (endpoint: AxiosRequestConfig) {
    const response = await this.auth.request(endpoint);

    this.updateToken(response);

    return response;
  }
}

export * from './types';
