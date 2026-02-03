import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@Injectable()
export class MqttProxyMiddleware implements NestMiddleware {
  constructor(private config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.path.startsWith('/mqtt')) return next();

    const base = `http://${this.config.get<string>('MQTT_HOST')!}:${this.config.get<string>('EMQX_API_PORT')!}`;
    const key = this.config.get<string>('EMQX_API_KEY');
    const secret = this.config.get<string>('EMQX_API_SECRET');
    if (!base || !key || !secret) {
      res.status(502).json({ message: 'EMQX proxy not configured' });
      return;
    }

    const pathWithQuery = req.originalUrl.replace(/^\/mqtt\/?/, '/') || '/';
    const url = `${base.replace(/\/$/, '')}${pathWithQuery}`;
    const body: unknown =
      req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined;
    const contentType =
      typeof req.headers['content-type'] === 'string'
        ? req.headers['content-type']
        : undefined;

    axios({
      method: req.method,
      url,
      auth: { username: key, password: secret },
      data: body,
      headers: contentType ? { 'content-type': contentType } : undefined,
      validateStatus: () => true,
    })
      .then((r) => {
        const ct =
          typeof r.headers['content-type'] === 'string'
            ? r.headers['content-type']
            : undefined;
        if (ct) res.set('Content-Type', ct);
        res.status(r.status).send(r.data as unknown);
      })
      .catch((err: unknown) => {
        const status =
          (err as { response?: { status?: number } })?.response?.status ?? 502;
        const data = (
          err as { response?: { data?: unknown }; message?: string }
        )?.response?.data ?? {
          message: (err as { message?: string })?.message ?? 'Unknown error',
        };
        res.status(typeof status === 'number' ? status : 502).json(data);
      });
  }
}
