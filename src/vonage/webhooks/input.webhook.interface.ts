export interface InputWebhook {
  uuid: string, // 	The unique identifier for this call
  conversation_uuid: string, // 	The unique identifier for this conversation
  timed_out: boolean, // 	Whether the input action timed out: true if it did, false if not
  dtmf: string // 	The buttons pressed by the user
}