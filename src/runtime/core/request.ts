import { AxiosError, AxiosRequestConfig } from 'axios';
import requrl from 'requrl';
import { SanctumAuthResponse } from '../types';
import { Auth } from './auth';

export class RequestHandler {
  constructor (
    protected auth: Auth
  ) {
    auth.axios.interceptors.request.use(config => this.onRequest(config as any), error => this.onError(error));
  }

  onRequest (config: AxiosRequestConfig<any>) {
    if (this.auth.token) {
      config.headers.common[this.auth.scheme.options.token.headerName] = String(`${this.auth.scheme.options.token.prefix ?? 'Bearer'} ${this.auth.token}`).trim();
    }

    return config;
  }

  onError (error: AxiosError) {
    if (this.auth.options.onError) {
      this.auth.options.onError(error);
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
      endpoint.data = {
        ...endpoint.data,
        [this.auth.options.fingerprint.property]: this.auth.storage.store.fingerprint
      };
    }

    if (process.server) {
      if (!endpoint.baseURL) {
        endpoint.baseURL = requrl(this.auth.req);
      }

      endpoint.headers = { ...endpoint.headers, 'User-Agent': this.auth?.req.headers['user-agent'] };
    }

    return await this.auth.axios.request(endpoint);
  }
}
