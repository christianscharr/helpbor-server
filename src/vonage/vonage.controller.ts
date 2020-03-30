import { Body, Controller, Get, Header, Param, Post, Query, Res } from '@nestjs/common';
import { AnswerWebhook } from './webhooks/answer.webhook.interface';
import { InputWebhook } from './webhooks/input.webhook.interface';
import * as nccoDE from './ncco/de.ncco';
import * as nccoEN from './ncco/en.ncco';
import { CommonEvent } from './events/common.event';
import { VonageService } from './vonage.service';
import { r } from 'rethinkdb-ts';
import { EventStatus } from './events/eventstatus.enum';
import { ICallLog } from './dto/call.interface';
import { RecordWebhook } from './webhooks/record.webhook.interface';
import { Readable } from 'stream';
import { Response } from 'express';
import { ApiService } from '../api/api.service';
import { IRequest, RequestCountry, RequestStatus, RequestType } from '../api/dto/request.interface';

@Controller('vonage')
export class VonageController {
  private readonly ncco = {
    de: nccoDE,
    en: nccoEN
  }

  constructor(
    private readonly vonageService: VonageService,
    private readonly apiService: ApiService
  ) {}

  @Post('events')
  @Header('Cache-Control', 'none')
  async getEvents(@Body() event: CommonEvent): Promise<void> {
    switch(event.status) {
      case EventStatus.started:
        await this.handleStartedEvent(event);
        break;
      case EventStatus.completed:
        await this.handleCompletedEvent(event);
        break;
      default:
        await this.handleCommonEvent(event);
        break;
    }
  }

  @Get('answer')
  @Header('Cache-Control', 'none')
  getAnswer(@Query() query: AnswerWebhook): any {
    console.log(`[Answer] ${query.uuid} - from ${query.from} to ${query.to} - conversation ${query.conversation_uuid}`);
    return [
      ...this.ncco.en.nccoWelcome,
      ...this.ncco.en.nccoLanguage,
      ...this.ncco.de.nccoWelcome,
      ...this.ncco.de.nccoLanguage,
      {
        action: 'input',
        eventUrl: [`${process.env.HELPBOR_HOST}/vonage/language`],
        eventMethod: 'POST',
        submitOnHash: false,
        timeOut: 10,
        maxDigits: 1
      }
    ];
  }

  @Post('language')
  @Header('Cache-Control', 'none')
  async postLanguage(@Body() input: InputWebhook): Promise<any> {
    const logMsg = `[Input: language] ${input.uuid} - timedOut: ${input.timed_out} | Input: ${input.dtmf} | conversation ${input.conversation_uuid}`;
    console.log(logMsg);

    return new Promise<any>(async (resolve, reject) => {
      if (input.timed_out || input.dtmf.length < 1) {
        resolve([
          ...this.ncco.en.nccoWelcome,
          ...this.ncco.en.nccoLanguage,
          ...this.ncco.de.nccoWelcome,
          ...this.ncco.de.nccoLanguage,
          {
            action: 'input',
            eventUrl: [`${process.env.HELPBOR_HOST}/vonage/language`],
            eventMethod: 'POST',
            submitOnHash: false,
            timeOut: 10,
            maxDigits: 1
          }
        ]);
        return;
      }

      let language;

      switch (parseInt(input.dtmf)) {
        case 1:
          language = 'en';
          break;
        case 2:
          language = 'de';
          break;
        default:
          language = 'en';
      }

      try {
        await this.vonageService.appendInputToCall('language', input, {
          timestamp: r.now(),
          message: logMsg
        });
      } catch (e) {
        const errMsg = `[ERROR] Failed to persist call input to database! (uuid: ${input.uuid} | Input: ${input.dtmf} | conversation ${input.conversation_uuid})`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve([
        ...this.ncco[language].nccoRole
      ]);
    });
  }

  @Post('role/:language')
  @Header('Cache-Control', 'none')
  async postRole(@Param('language') language: string,
                 @Body() input: InputWebhook): Promise<any> {
    const logMsg = `[Input: role] ${input.uuid} - timedOut: ${input.timed_out} | Input: ${input.dtmf} | conversation ${input.conversation_uuid}`;
    console.log(logMsg);

    return new Promise<any>(async (resolve, reject) => {
      if (input.timed_out || input.dtmf.length < 1) {
        resolve([
          ...this.ncco[language].nccoRepeat,
          ...this.ncco[language].nccoRole
        ]);
        return;
      }

      try {
        await this.vonageService.appendInputToCall('role', input, {
          timestamp: r.now(),
          message: logMsg
        });
      } catch (e) {
        const errMsg = `[ERROR] Failed to persist call input to database! (uuid: ${input.uuid} | Input: ${input.dtmf} | conversation ${input.conversation_uuid})`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      if (input.dtmf.startsWith('1')) {
        resolve([
          ...this.ncco[language].nccoRequest,
          ...this.ncco[language].nccoPhoneNumber
        ]);
      } else if (input.dtmf.startsWith('2')) {
        resolve([
          ...this.ncco[language].workInProgress
        ]);
      } else {
        resolve([
          ...this.ncco[language].nccoRepeat,
          ...this.ncco[language].nccoRole
        ]);
      }
    });
  }

  @Post('phoneNumber/:language')
  @Header('Cache-Control', 'none')
  async postPhoneNumber(@Param('language') language: string,
                        @Body() input: InputWebhook): Promise<any> {
    const logMsg = `[Input: phoneNumber] ${input.uuid} - timedOut: ${input.timed_out} | Input: ${input.dtmf} | conversation ${input.conversation_uuid}`;
    console.log(logMsg);

    return new Promise<any>(async (resolve, reject) => {
      if (input.timed_out || input.dtmf.length < 1) {
        resolve([
          ...this.ncco[language].nccoRepeat,
          ...this.ncco[language].nccoPhoneNumber
        ]);
        return;
      }

      if (input.dtmf.length === 1 && parseInt(input.dtmf) === 1) {
        const callMetadata = await this.vonageService.getMetadataFromDatabase(input.conversation_uuid);
        const phoneNumber = '0' + callMetadata.phoneNumber.substring(2);
        input.dtmf = phoneNumber;
      }

      try {
        await this.vonageService.appendInputToCall('phoneNumber', input, {
          timestamp: r.now(),
          message: logMsg
        });
      } catch (e) {
        const errMsg = `[ERROR] Failed to persist call input to database! (uuid: ${input.uuid} | Input: ${input.dtmf} | conversation ${input.conversation_uuid})`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve([
        ...this.ncco[language].nccoName,
        ...this.ncco[language].nccoZip
      ]);
    });
  }

  @Post('name')
  @Header('Cache-Control', 'none')
  async postName(@Body() record: RecordWebhook): Promise<void> {
    const logMsg = `[Record: name] ${record.recording_uuid} - URL: ${record.recording_url} | start: ${record.start_time} | end: ${record.end_time} | conversation ${record.conversation_uuid}`;
    console.log(logMsg);

    return new Promise<any>(async (resolve, reject) => {
      try {
        await this.vonageService.appendRecordToCall('name', record, {
          timestamp: r.now(),
          message: logMsg
        });
      } catch (e) {
        const errMsg = `[ERROR] Failed to persist call record to database! (uuid: ${record.recording_uuid} | url: ${record.recording_url} | conversation ${record.conversation_uuid})`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve();
    });
  }

  @Post('zipCode/:language')
  @Header('Cache-Control', 'none')
  async postZip(@Param('language') language: string,
                @Body() input: InputWebhook): Promise<any> {
    const logMsg = `[Input: zipCode] ${input.uuid} - timedOut: ${input.timed_out} | Input: ${input.dtmf} | conversation ${input.conversation_uuid}`;
    console.log(logMsg);

    return new Promise<any>(async (resolve, reject) => {
      if (input.timed_out || input.dtmf.length < 1) {
        resolve([
          ...this.ncco[language].nccoRepeat,
          ...this.ncco[language].nccoZip
        ]);
        return;
      }

      try {
        await this.vonageService.appendInputToCall('zipCode', input, {
          timestamp: r.now(),
          message: logMsg
        });
      } catch (e) {
        const errMsg = `[ERROR] Failed to persist call input to database! (uuid: ${input.uuid} | Input: ${input.dtmf} | conversation ${input.conversation_uuid})`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve([
        ...this.ncco[language].nccoRequestType
      ]);
    });
  }

  @Post('requestType/:language')
  @Header('Cache-Control', 'none')
  async postRequestType(@Param('language') language: string,
                        @Body() input: InputWebhook): Promise<any> {
    const logMsg = `[Input: requestType] ${input.uuid} - timedOut: ${input.timed_out} | Input: ${input.dtmf} | conversation ${input.conversation_uuid}`;
    console.log(logMsg);

    return new Promise<any>(async (resolve, reject) => {
      if (input.timed_out || input.dtmf.length < 1) {
        resolve([
          ...this.ncco[language].nccoRepeat,
          ...this.ncco[language].nccoRequestType
        ]);
        return;
      }

      try {
        await this.vonageService.appendInputToCall('requestType', input, {
          timestamp: r.now(),
          message: logMsg
        });
      } catch (e) {
        const errMsg = `[ERROR] Failed to persist call input to database! (uuid: ${input.uuid} | Input: ${input.dtmf} | conversation ${input.conversation_uuid})`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      const num = parseInt(input.dtmf);

      if (num === 9) {
        resolve([
          ...this.ncco[language].nccoRequestCustom,
          ...this.ncco[language].nccoNotifySummarize
        ]);
      } else if (num > 0 && num < 6) {
        resolve([
          ...this.ncco[language].nccoNotifySummarize
        ]);
      } else {
        resolve([
          ...this.ncco[language].nccoRepeat,
          ...this.ncco[language].nccoRequestType
        ]);
      }
    });
  }

  @Post('customRequest')
  @Header('Cache-Control', 'none')
  async postCustomRequest(@Body() record: RecordWebhook): Promise<void> {
    const logMsg = `[Record: customRequest] ${record.recording_uuid} - URL: ${record.recording_url} | start: ${record.start_time} | end: ${record.end_time} | conversation ${record.conversation_uuid}`;
    console.log(logMsg);

    return new Promise<any>(async (resolve, reject) => {
      try {
        await this.vonageService.appendRecordToCall('customRequest', record, {
          timestamp: r.now(),
          message: logMsg
        });
      } catch (e) {
        const errMsg = `[ERROR] Failed to persist call record to database! (uuid: ${record.recording_uuid} | url: ${record.recording_url} | conversation ${record.conversation_uuid})`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      resolve();
    });
  }

  @Post('requestSummary/:language')
  @Header('Cache-Control', 'none')
  async postRequestSummary(@Param('language') language: string,
                           @Body() input): Promise<any> {
    console.log(`[DEBUG] postRequestSummary() - input:\n${JSON.stringify(input, null, 2)}`);
    return new Promise<any>(async (resolve, reject) => {
      const inputs = await this.vonageService.getInputsFromDatabase(input.conversation_uuid);
      // console.log(`[DEBUG] postRequestSummary() - call inputs:\n${JSON.stringify(inputs, null, 2)}`);

      if (inputs && inputs.phoneNumber && inputs.zipCode) {
        const nccoSummarize = this.ncco[language].nccoSummarizeRequest(input.conversation_uuid, inputs.phoneNumber, inputs.zipCode, parseInt(inputs.requestType));
        // console.log(`[DEBUG] nccoSummarize:\n${JSON.stringify(nccoSummarize, null, 2)}`);
        resolve(nccoSummarize);
      } else {
        const errMsg = `[ERROR] Failed to summarize request because of missing inputs`;
        console.error(errMsg);
        reject(errMsg);
      }
    });
  }

  @Post('requestSave/:language')
  @Header('Cache-Control', 'none')
  async postRequestSave(@Param('language') language: string,
                           @Body() input: InputWebhook): Promise<any> {
    const logMsg = `[Input: requestSave] ${input.uuid} - timedOut: ${input.timed_out} | Input: ${input.dtmf} | conversation ${input.conversation_uuid}`;
    console.log(logMsg);

    return new Promise<any>(async (resolve, reject) => {
      if (input.timed_out || input.dtmf.length < 1) {
        resolve([
          ...this.ncco[language].nccoRepeat,
          ...this.ncco[language].nccoNotifySummarize
        ]);
        return;
      }

      try {
        await this.vonageService.appendInputToCall('requestSave', input, {
          timestamp: r.now(),
          message: logMsg
        });
      } catch (e) {
        const errMsg = `[ERROR] Failed to persist call input to database! (uuid: ${input.uuid} | Input: ${input.dtmf} | conversation ${input.conversation_uuid})`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      const num = parseInt(input.dtmf);

      if (num === 1) {
        const inputs = await this.vonageService.getInputsFromDatabase(input.conversation_uuid);
        let requestType: RequestType;

        switch (parseInt(inputs.requestType)) {
          case 1:
            requestType = RequestType.ERRANDS;
            break;
          case 2:
            requestType = RequestType.LETTER_PARCEL;
            break;
          case 3:
            requestType = RequestType.PHARMACY;
            break;
          case 4:
            requestType = RequestType.DOG_WALK;
            break;
          case 5:
            requestType = RequestType.CAR_RIDE;
            break;
          case 9:
            requestType = RequestType.OTHER;
            break;
        }

        const request: IRequest = {
          timestamp: r.now(),
          conversationUUID: input.conversation_uuid,
          phoneNo: inputs.phoneNumber,
          zipCode: inputs.zipCode,
          country: RequestCountry.SWITZERLAND,
          requestType: requestType,
          status: RequestStatus.OPEN
        };

        const requestId = await this.apiService.insertRequest(request);
        console.log(`[DEBUG] postRequestSave() - requestId: ${requestId}`);

        resolve([
          ...this.ncco[language].nccoRequestSave
        ]);
      } else if (num === 2) {
        resolve([
          ...this.ncco[language].nccoRequestFailure,
          ...this.ncco[language].nccoRequest,
          ...this.ncco[language].nccoPhoneNumber
        ]);
      } else {
        resolve([
          ...this.ncco[language].nccoRepeat,
          ...this.ncco[language].nccoNotifySummarize
        ]);
      }
    });
  }

  @Get('recording/:conversationUUID/:context')
  async getRecording(@Param('conversationUUID') conversationUUID: string,
                     @Param('context') context: string,
                     @Res() res: Response) {
    console.log(`[DEBUG] getRecording() - conversationUUID: ${conversationUUID} | context: ${context}`);
    const buffer = await this.vonageService.getRecordingFromDatabase(conversationUUID, context);
    console.log(`[DEBUG] getRecording() - got binary buffer with length of ${buffer.length} bytes`);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    res.setHeader('Cache-Control', 'none');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);

    stream.pipe(res);
  }

  private async handleStartedEvent(event: CommonEvent): Promise<void> {
    console.log(this.event2LogMsg(event));

    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.vonageService.insertCall({
          conversationUUID: event.conversation_uuid,
          startTime: r.now(),
          lastUpdate: r.now(),
          phoneNumber: event.from,
          inputs: [],
          recordings: [],
          logs: [ this.event2CallLog(event) ]
        });
      } catch (e) {
        console.error(`[ERROR] Failed to persist call completion to database! (uuid: ${event.uuid} | from: ${event.from} | to: ${event.to} | conversation: ${event.conversation_uuid})`);
        reject();
        return;
      }

      resolve();
    });
  }

  private async handleCompletedEvent(event: CommonEvent): Promise<void> {
    console.log(this.event2LogMsg(event));

    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.vonageService.completeCall(event, this.event2CallLog(event));
      } catch (e) {
        console.error(`[ERROR] Failed to persist call completion to database! (uuid: ${event.uuid} | from: ${event.from} | to: ${event.to} | conversation: ${event.conversation_uuid})`);
        reject();
        return;
      }

      resolve();
    });
  }

  private async handleCommonEvent(event: CommonEvent): Promise<void> {
    console.log(this.event2LogMsg(event));

    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.vonageService.appendLog2Call(event.conversation_uuid, this.event2CallLog(event));
      } catch (e) {
        console.error(`[ERROR] Failed to persist call log to database! (uuid: ${event.uuid} | from: ${event.from} | to: ${event.to} | conversation: ${event.conversation_uuid})`);
        reject();
        return;
      }

      resolve();
    });
  }

  private event2CallLog(event: CommonEvent): ICallLog {
    const callLog: ICallLog = {
      timestamp: r.now(),
      message: this.event2LogMsg(event),
      event: {
        ...event
      }
    };

    delete callLog.event.conversation_uuid;
    delete callLog.event.timestamp;

    return callLog;
  }

  private event2LogMsg(event: CommonEvent): string {
    return `[Event] ${event.uuid} - ${event.direction} - ${event.status} from ${event.from} to ${event.to} - conversation ${event.conversation_uuid}`;
  }
}
