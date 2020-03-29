import { Injectable } from '@nestjs/common';
import { Connection, r } from 'rethinkdb-ts';
import { ICall, ICallInput, ICallLog, ICallRecording } from './dto/call.interface';
import { CommonEvent } from './events/common.event';
import { RecordWebhook } from './webhooks/record.webhook.interface';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { PathLike } from "fs";
import { InputWebhook } from './webhooks/input.webhook.interface';
import { Readable } from 'stream';
const Nexmo = require('nexmo');

@Injectable()
export class VonageService {
  private async getConnection(): Promise<Connection> {
    return r.connect({
      host: process.env.RETHINKDB_HOST,
      port: parseInt(process.env.RETHINKDB_PORT),
      db: 'helpbor'
    });
  }

  private getNexmoClient(): any {
    return new Nexmo({
      apiKey: process.env.NEXMO_API_KEY,
      apiSecret: process.env.NEXMO_API_SECRET,
      applicationId: process.env.NEXMO_APPLICATION_ID,
      privateKey: './private.key',
    }, {});
  }

  async insertCall(call: ICall): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const rConn = await this.getConnection();

      const result = await r.table('calls').insert(call, {
        returnChanges: false,
        conflict: 'replace'
      }).run(rConn);

      rConn.close();

      if (result.errors > 0) {
        const errMsg = `[ERROR] insertCall() - Failed to persist call with ${result.errors} errors:\n${result.first_error}`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve();
    });
  }

  async appendLog2Call(conversation: string, log: ICallLog): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const rConn = await this.getConnection();

      const result = await r.table('calls')
        .get(conversation)
        .update(call => {
          return {
            logs: call('logs').default([]).append(log)
          };
        }, {
          returnChanges: false
        })
        .run(rConn);

      rConn.close();

      if (result.errors > 0) {
        const errMsg = `[ERROR] appendLog2Call() - Failed to persist call log with ${result.errors} errors:\n${result.first_error}`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve();
    });
  }

  async completeCall(event: CommonEvent, log: ICallLog): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const rConn = await this.getConnection();

      const result = await r.table('calls')
        .get(event.conversation_uuid)
        .update(call => {
          return {
            logs: call('logs').default([]).append(log),
            endTime: r.now(),
            duration: parseInt(event.duration, 10)
          };
        }, {
            returnChanges: false
        })
        .run(rConn);

      rConn.close();

      if (result.errors > 0) {
        const errMsg = `[ERROR] completeCall() - Failed to persist call completion with ${result.errors} errors:\n${result.first_error}`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve();
    });
  }

  async appendRecordToCall(context: string, recordHook: RecordWebhook, log: ICallLog): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const tempFile = await this.createTemporaryFile();
      const nexmoFile = await  this.downloadNexmoFile(recordHook.recording_url, tempFile.path);

      fs.readFile(nexmoFile, async (err, recFile: Buffer) => {
        if (err) {
          const errMsg = `[ERROR] appendRecordToCall() - Failed to read temporary file:\n${err}`;
          console.error(errMsg);
          reject(errMsg);
          return;
        }

        let recording: ICallRecording = {
          startTime: r.ISO8601(recordHook.start_time),
          endTime: r.ISO8601(recordHook.end_time),
          uuid: recordHook.recording_uuid,
          url: recordHook.recording_url,
          size: recordHook.size,
          binary: recFile,
          context: context
        };

        await this.persistRecording(recordHook.conversation_uuid, recording, log);
        tempFile.cleanupCallback();
        resolve();
      });
    });
  }

  private async createTemporaryFile(): Promise<{path: string, fd: number, cleanupCallback: () => {}}> {
    return new Promise(async (resolve, reject) => {
      tmp.file((err: null | Error, path: string, fd: number, cleanupCallback: () => {}) => {
        if (err) {
          console.error(`[ERROR] createTemporaryFile() - Failed to create a temporary file:\n`, err);
          reject(err);
          return;
        }

        console.log(`[DEBUG] createTemporaryFile() - temporary file: `, path);
        console.log(`[DEBUG] createTemporaryFile() - temporary filedescriptor: `, fd);

        resolve({
          path: path,
          fd: fd,
          cleanupCallback: cleanupCallback
        });
      });
    });
  }

  private async downloadNexmoFile(recordingURL, targetFile: PathLike | number): Promise<PathLike | number> {
    return new Promise(async (resolve, reject) => {
      const nexmo = this.getNexmoClient();

      nexmo.files.save(recordingURL, targetFile, (err: NodeJS.ErrnoException | null, file: PathLike | number) => {
        if (err) {
          console.error(`[ERROR] downloadNexmoFile() - Failed to download and save file from nexmo:\n`, err);
          reject(err);
          return;
        }

        resolve(file);
      });
    });
  }

  private async persistRecording(conversationUUID: string, recording: ICallRecording, log: ICallLog): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const rConn = await this.getConnection();

      const result = await r.table('calls')
        .get(conversationUUID)
        .update(call => {
          return {
            logs: call('logs').default([]).append(log),
            recordings: call('recordings').default([]).append(recording)
          };
        }, {
          returnChanges: false
        })
        .run(rConn);

      rConn.close();

      if (result.errors > 0) {
        const errMsg = `[ERROR] appendRecordToCall() - Failed to persist call recording with ${result.errors} errors:\n${result.first_error}`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve();
    });
  }

  async appendInputToCall(context: string, inputHook: InputWebhook, log: ICallLog): Promise<void> {
    const input: ICallInput = {
      uuid: inputHook.uuid,
      context: context,
      input: inputHook.dtmf
    };

    return new Promise(async (resolve, reject) => {
      const rConn = await this.getConnection();

      const result = await r.table('calls')
        .get(inputHook.conversation_uuid)
        .update(call => {
          return {
            logs: call('logs').default([]).append(log),
            inputs: call('inputs').default([]).append(input)
          };
        }, {
          returnChanges: false
        })
        .run(rConn);

      rConn.close();

      if (result.errors > 0) {
        const errMsg = `[ERROR] appendInputToCall() - Failed to persist call input with ${result.errors} errors:\n${result.first_error}`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve();
    });
  }

  async getRecordingFromDatabase(conversationUUID: string, context: string): Promise<Buffer> {
    return new Promise<Buffer>(async (resolve, reject) => {
      const rConn = await this.getConnection();
      let result;

      try {
        result = await r.table('calls')
          .get(conversationUUID)("recordings")
          .filter(r.row("context").eq(context))
          .nth(-1)
          .run(rConn);
      } catch (e) {
        const errMsg = `[ERROR] Failed to query recording from database:\n${e}`;
        console.error(errMsg);
        reject(errMsg);
      }

      if (result && result.binary) {
        resolve(Buffer.from(result.binary));
      } else {
        resolve(null);
      }
    });
  }

  async getInputsFromDatabase(conversationUUID: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const rConn = await this.getConnection();
      let result;

      try {
        result = await r.table('calls')
          .get(conversationUUID)('inputs')
          .run(rConn);
      } catch (e) {
        const errMsg = `[ERROR] Failed to query recording from database:\n${e}`;
        console.error(errMsg);
        reject(errMsg);
      }

      let inputs = {};

      if (result && result.length > 0) {
        for (const input of result) {
          inputs[input.context] = input.input;
        }

        resolve(inputs);
      } else {
        resolve({});
      }
    });
  }
}
