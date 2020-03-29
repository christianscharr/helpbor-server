import { RDatum } from 'rethinkdb-ts';

interface ICall {
  conversationUUID: string,
  startTime: RDatum,
  lastUpdate: RDatum,
  endTime?: RDatum,
  duration?: number,
  phoneNumber: number,
  inputs: ICallInput[],
  recordings: ICallRecording[],
  logs: ICallLog[]
}

interface ICallLog {
  timestamp: RDatum, // unix timestamp (ms)
  message: string,
  event?: ICallLogEvent
}

interface ICallLogEvent {
  from: number,
  to: number,
  uuid: string,
  status: string,
  direction: string,
  [propName: string]: any;
}

interface ICallInput {
  uuid: string,
  context: string,
  input: string
}

interface ICallRecording {
  uuid: string,
  context: string,
  startTime: RDatum,
  endTime: RDatum,
  size: number,
  url: string,
  binary: Buffer
}

export { ICall, ICallLog, ICallLogEvent, ICallInput, ICallRecording };