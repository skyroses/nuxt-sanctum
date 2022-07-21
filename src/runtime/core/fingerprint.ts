import { getProp, isValidIP, sha256 } from '../utils';
import { Auth } from './auth';

export class Fingerprint {
  constructor (
    private auth: Auth
  ) { }

  async generate (): Promise<string | null> {
    if (process.server) {
      return this.server();
    }

    return await this.client();
  }

  private async client () {
    if (!this.auth.options.fingerprint?.ipService) {
      return null;
    }

    const options = this.auth.options.fingerprint.ipService;

    const { data } = await this.auth.request(options.endpoint);

    const userAgent = navigator.userAgent;
    const ip = getProp(data, options.property) as string;

    if (!userAgent) {
      return null;
    }

    if (!ip && !isValidIP(ip)) {
      return null;
    }

    return this.hash(ip, userAgent);
  }

  private server () {
    const userAgent = this.auth.req.headers['user-agent'];
    const ip = String(this.auth.req.headers['x-forwarded-for'] || this.auth.req.socket.remoteAddress);

    if (!userAgent) {
      return null;
    }

    if (!ip && !isValidIP(ip)) {
      return null;
    }

    return this.hash(ip, userAgent);
  }

  private hash (ip: string, userAgent: string) {
    return sha256([
      ip,
      userAgent
    ].join('|'));
  }
}
