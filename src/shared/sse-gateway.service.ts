import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

/**
 * SseClient is a class that represents a client connected to the SSE gateway.
 *
 * @property {Response} response - The response object.
 * @property {string} channel - The channel the client is subscribed to.
 * @property {Date} createdAt - The date the client connected.
 */
interface SseClient {
  response: Response;
  channel: string;
  createdAt: Date;
}

@Injectable()
export class SseGatewayService {
  private readonly logger = new Logger(SseGatewayService.name);
  private readonly clients = new Map<string, SseClient>();

  /**
   * Adds a client to the SSE gateway.
   *
   * @param {Response} response - The response object.
   * @param {string} channel - The channel the client is subscribed to.
   * @returns {string} The client ID.
   */
  addClient(response: Response, channel: string): string {
    const clientId = `client_${channel}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');

    this.clients.set(clientId, {
      response,
      channel,
      createdAt: new Date(),
    });

    this.logger.log(
      `SSE client connected: ${clientId}, channel: ${channel}, total: ${this.clients.size}`,
    );

    response.on('close', () => {
      this.removeClient(clientId);
    });

    this.send(clientId, 'connected', { clientId, channel });

    return clientId;
  }

  /**
   * Removes a client from the SSE gateway.
   *
   * @param {string} clientId - The ID of the client to remove.
   */
  removeClient(clientId: string): void {
    if (this.clients.has(clientId)) {
      this.clients.delete(clientId);
      this.logger.log(
        `SSE client disconnected: ${clientId}, total: ${this.clients.size}`,
      );
    }
  }

  /**
   * Sends a message to a client.
   *
   * @param {string} clientId - The ID of the client to send the message to.
   * @param {string} event - The event to send.
   * @param {any} data - The data to send.
   */
  send(clientId: string, event: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      client.response.write(message);
    } catch (error) {
      this.logger.error(
        `Failed to send message to client ${clientId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.removeClient(clientId);
    }
  }

  /**
   * Broadcasts a message to all clients in a channel.
   *
   * @param {string} event - The event to send.
   * @param {any} data - The data to send.
   * @param {string} channel - The channel to broadcast to.
   */
  broadcast(event: string, data: any, channel: string): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const [clientId, client] of this.clients.entries()) {
      if (client.channel !== channel) continue;

      try {
        client.response.write(message);
      } catch (error) {
        this.logger.error(
          `Failed to broadcast to client ${clientId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        this.removeClient(clientId);
      }
    }
  }

  /**
   * Gets the client count.
   *
   * @param {string} [channel] - Optional channel to filter by. If provided, returns the count for that channel only.
   * @returns {number} The client count.
   */
  getClientCount(channel?: string): number {
    if (channel) {
      let count = 0;
      for (const client of this.clients.values()) {
        if (client.channel === channel) {
          count++;
        }
      }
      return count;
    }
    return this.clients.size;
  }
}
