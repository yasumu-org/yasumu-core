import {
  Commands,
  type StartSmtpServerCommand,
} from '@/core/common/commands.js';
import type { YasumuWorkspace } from '../../YasumuWorkspace.js';
import type { Callback } from '@/externals/index.js';
import { YasumuEvents } from '@/core/common/events.js';

export class YasumuSmtp {
  /**
   * Creates Yasumu smtp server controller
   * @param workspace The parent Yasumu workspace instance
   */
  public constructor(public readonly workspace: YasumuWorkspace) {}

  /**
   * Register a handler for new emails
   * @param handler The handler to register
   * @returns The unsubscribe function
   */
  public async onUpdate(handler: Callback) {
    return this.workspace.yasumu.events.listen(YasumuEvents.NewEmail, handler);
  }

  /**
   * Fetch all emails from the smtp server
   */
  public async fetch() {
    return this.workspace.send(Commands.GetEmails, {});
  }

  /**
   * Clear all emails from the smtp server
   */
  public async clear() {
    return this.workspace.send(Commands.ClearEmails, {});
  }

  /**
   * Start the smtp server
   * @param options The options for the smtp server
   */
  public async start(options: StartSmtpServerCommand) {
    await this.workspace.send(Commands.StartSmtpServer, options);
  }

  /**
   * Stop the smtp server
   */
  public async stop() {
    await this.workspace.send(Commands.StopSmtpServer, {});
  }

  /**
   * Whether the smtp server is running
   * @returns True if the smtp server is running
   */
  public async isRunning() {
    return this.workspace.send(Commands.IsSmtpServerRunning, {});
  }
}
