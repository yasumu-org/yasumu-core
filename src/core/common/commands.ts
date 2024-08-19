import type { InvokeArgs } from '@/externals/index.js';
import type { YasumuMail } from '../api/workspace/modules/smtp/types.js';

export const Commands = {
  // Workspace
  GetCurrentWorkspace: 'get_current_workspace',
  SetCurrentWorkspace: 'set_current_workspace',
  ClearCurrentWorkspaceSession: 'clear_current_workspace_session',
  // Http
  GetLocalAddress: 'get_local_address',
  // Smtp
  StartSmtpServer: 'start_smtp_server',
  StopSmtpServer: 'stop_smtp_server',
  GetEmails: 'get_emails',
  ClearEmails: 'clear_emails',
  IsSmtpServerRunning: 'is_smtp_server_running',
} as const;

export type Commands = (typeof Commands)[keyof typeof Commands];

export type CommandInvocation<T extends InvokeArgs = {}, R = void> = [T, R];
export type InferCommandArguments<T extends CommandInvocation> = T[0];
export type InferCommandResult<T extends CommandInvocation> = T[1];

export interface SetCurrentWorkspaceCommand {
  path: string;
}

export interface StartSmtpServerCommand {
  port: number;
}

export interface CommandsInvocationMap {
  [Commands.GetCurrentWorkspace]: CommandInvocation<{}, string | null>;
  [Commands.SetCurrentWorkspace]: CommandInvocation<
    SetCurrentWorkspaceCommand,
    void
  >;
  [Commands.ClearCurrentWorkspaceSession]: CommandInvocation<{}, void>;
  [Commands.GetLocalAddress]: CommandInvocation<{}, string>;
  [Commands.StartSmtpServer]: CommandInvocation<StartSmtpServerCommand, void>;
  [Commands.StopSmtpServer]: CommandInvocation<{}, void>;
  [Commands.GetEmails]: CommandInvocation<{}, YasumuMail[]>;
  [Commands.ClearEmails]: CommandInvocation<{}, void>;
  [Commands.IsSmtpServerRunning]: CommandInvocation<{}, boolean>;
}
