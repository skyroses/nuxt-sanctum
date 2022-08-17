import { AxiosError, AxiosRequestConfig } from 'axios';
import requrl from 'requrl';
import { SanctumAuthResponse } from '../types';
import { getProp, tryParseJSON } from '../utils';
import { Auth } from './auth';

const RETRY_REQUEST_HEADER = 'X-Nuxt-Sanctum-Retry';

export class RequestHandler {
  urls: string[];

  constructor (
    protected auth: Auth
  ) {
    this.auth.axios.interceptors.request.use(this.onRequest.bind(this));
    this.auth.axios.interceptors.response.use(undefined, this.onError.bind(this));
  }

  onRequest (config: AxiosRequestConfig<any>) {
    if (this.auth.token && !config.headers[RETRY_REQUEST_HEADER]) {
      this.setToken(this.auth.token, config);
    }

    return config;
  }

  async onError (error: AxiosError<any>) {
    try {
      const { config } = error;
      const refreshTokensConfig = this.auth.options.tokenScheme.endpoints?.refresh;

      if (refreshTokensConfig && config.url === refreshTokensConfig.url) {
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !config.headers[RETRY_REQUEST_HEADER]) {
        const response = await this.auth.scheme.refreshToken();

        config.headers[RETRY_REQUEST_HEADER] = true;

        const token = <string>getProp(response.data, this.auth.scheme.options.token.property);

        if (token) {
          this.setToken(token, config);

          return this.send(config);
        }
      }
    } catch (e) {
      return Promise.reject(e);
    }

    return Promise.reject(error);
  }

  async send (endpoint: AxiosRequestConfig): Promise<SanctumAuthResponse> {
    if (!this.auth.axios) {
      console.error(
        `[${this.auth.options.moduleName}] Axios module not found`
      );

      return;
    }

    endpoint.baseURL = this.auth.options.baseURL;

    if (this.auth.options.fingerprint.enabled && this.auth.storage.store.fingerprint) {
      endpoint.data = Object.assign(
        {},
        tryParseJSON(endpoint.data),
        { [this.auth.options.fingerprint.property]: this.auth.storage.store.fingerprint }
      );
    }

    if (process.server) {
      if (!endpoint.baseURL) {
        endpoint.baseURL = requrl(this.auth.req);
      }

      endpoint.headers = { ...endpoint.headers, 'User-Agent': this.auth?.req.headers['user-agent'] };
    }

    return await this.auth.axios.request(endpoint);
  }

  private setToken (token: string, endpoint: AxiosRequestConfig) {
    if (token) {
      endpoint.headers[this.auth.scheme.options.token.headerName] = `${this.auth.scheme.options.token.prefix || 'Bearer'} ${token}`.trim();
    }
  }
}
