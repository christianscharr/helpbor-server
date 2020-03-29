import { EventStatus } from './eventstatus.enum';
import { Direction } from './direction.enum';

export interface CommonEvent {
  from: number,
  to: number,
  uuid: string,
  conversation_uuid: string,
  status: EventStatus,
  direction: Direction,
  timestamp: string,
  [propName: string]: any;
}