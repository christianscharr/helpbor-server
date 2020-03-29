import { CommonEvent } from './common.event';

export interface InputEvent extends CommonEvent {
  from: number, // The number the call came from
  to: number, // The number the call was made to
  dtmf: string, // 	The buttons pressed by the user
  timed_out: boolean, // 	Whether the input action timed out: true if it did, false if not
  uuid: string, // 	The unique identifier for this call
  conversation_uuid: string, // 	The unique identifier for this conversation
  timestamp: string // Timestamp (ISO 8601 format)
}