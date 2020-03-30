import { RDatum } from 'rethinkdb-ts';

interface IRequest {
  timestamp: RDatum,
  firstName?: string,
  lastName?: string,
  zipCode: string,
  city?: string,
  country: RequestCountry,
  phoneNo: string,
  requestType: RequestType,
  request?: string,
  conversationUUID?: string,
  status: RequestStatus
}

enum RequestType {
  ERRANDS = 'ERRANDS',
  LETTER_PARCEL = 'LETTER_PARCEL',
  PHARMACY = 'PHARMACY',
  DOG_WALK = 'DOG_WALK',
  CAR_RIDE = 'CAR_RIDE',
  OTHER = 'OTHER'
}

enum RequestStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

enum RequestCountry {
  SWITZERLAND = 'CH'
}

export { IRequest, RequestType, RequestStatus, RequestCountry }