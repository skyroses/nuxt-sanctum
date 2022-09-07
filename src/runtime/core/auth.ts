/**
 * @todo Cookie Scheme
 */

import { Router } from 'vue-router';
import { AxiosRequestConfig } from 'axios';
import { IncomingMessage, ServerResponse } from 'h3';
import { NuxtApp } from '#app/nuxt';
import { defaultOptions, ModuleOptions } from '../../options';
import { TokenScheme, TokenSchemeOptions } from '../schemes';
import { User } from '../types';
import { Storage } from './storage';
import { RequestHandler } from './request';
import { Fingerprint } from './fingerprint';
import { useRouter, useRequestEvent } from '#imports';

export class Auth {
  public storage: Storage;
  public scheme: TokenScheme;
  public router: Router;
  public req: IncomingMessage;
  public res: ServerResponse;
  public requestHandler: RequestHandler;
  protected fingerprint: Fingerprint;

  constructor (
    public nuxt: NuxtApp,
    public options: ModuleOptions & { moduleName: string }
  ) {
    this.req = useRequestEvent()?.req;
    this.res = useRequestEvent()?.res;

    this.router = useRouter();

    this.requestHandler = new RequestHandler(this);
    this.scheme = this.makeScheme(options.tokenScheme);
    this.fingerprint = new Fingerprint(this);

    this.storage = new Storage(nuxt, options).initStore();
  }

  get user () {
    return this.storage.store.user;
  }

  set user (payload: User | null) {
    this.storage.store.setUser(payload);
  }

  get loggedIn (): boolean {
    return this.storage.store.loggedIn;
  }

  get token () {
    return this.storage.store.token;
  }

  get axios () {
    return this.nuxt.$axios;
  }

  async run () {
    let fingerprint: string | null;

    if (this.options.fingerprint?.enabled &&
      !this.storage.store.fingerprint &&
      (fingerprint = await this.fingerprint.generate())
    ) {
      this.storage.store.setFingerprint(fingerprint);
    }

    return this.scheme.refreshToken();
  }

  async login (payload: any) {
    const response = await this.scheme.login(payload);
    this.redirectTo('afterLogin');

    return response;
  }

  async logout () {
    const response = await this.scheme.logout();
    this.redirectTo('afterLogout');

    return response;
  }

  request (endpoint: AxiosRequestConfig) {
    return this.requestHandler.send(endpoint);
  }

  async redirectTo (name: keyof typeof defaultOptions.redirects) {
    return await this.router.push(this.getRedirectRoute(name));
  }

  getRedirectRoute (name: keyof typeof defaultOptions.redirects) {
    return this.options.redirects[name];
  }

  private makeScheme (options: TokenSchemeOptions) {
    return new TokenScheme(this, options);
  }
}
