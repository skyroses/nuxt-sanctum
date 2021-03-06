/**
 * @todo Cookie Scheme
 */

import { NuxtApp, useRouter } from 'nuxt/app';
import { Router } from 'vue-router';
import { AxiosRequestConfig } from 'axios';
import { IncomingMessage, ServerResponse } from 'h3';
import { defaultOptions, ModuleOptions } from '../../options';
import { TokenScheme, TokenSchemeOptions } from '../schemes';
import { sha256 } from '../utils';
import { User } from '../types';
import { Storage } from './storage';
import { RequestHandler } from './request';
import { Fingerprint } from './fingerprint';

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
    // @ts-ignore
    this.req = nuxt?.ssrContext?.event.req;
    // @ts-ignore
    this.res = nuxt?.ssrContext?.event.res;

    this.router = useRouter();

    this.storage = new Storage(nuxt, options).initStore();
    this.requestHandler = new RequestHandler(this);
    this.scheme = this.makeScheme(options.tokenScheme);
    this.fingerprint = new Fingerprint(this);
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
    if (this.options.fingerprint?.enabled) {
      const fingerprint = await this.fingerprint.generate();
      this.storage.store.setFingerprint(fingerprint);
    }

    return this.scheme.refreshToken();
  }

  async login (payload: any) {
    await this.scheme.login(payload);
    await this.redirectTo('afterLogin');
  }

  async logout () {
    await this.redirectTo('afterLogout');
    await this.scheme.logout();
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
