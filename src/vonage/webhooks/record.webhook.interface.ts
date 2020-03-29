export interface RecordWebhook {
  recording_uuid: string, // 	A unique identifier for this recording
  recording_url: string, // Where to download the recording
  start_time: string, // 	The time the recording started in the following format: YYYY-MM-DD HH:MM:SS
  end_time: string, // 	The time the recording finished in the following format: YYYY-MM-DD HH:MM:SS
  size: number, // The size of the recording file (in bytes)
  conversation_uuid: string // 	The unique identifier for this conversation
}