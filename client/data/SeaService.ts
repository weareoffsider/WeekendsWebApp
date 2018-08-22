export enum AMSAAreaOfOperationCode {
  InlandWaters = "IW",
  ShelteredWaters = "SW",
  SeawardOfShelteredWaters = "SSW",
  NotUnderwayDeckOrRefitWork = "NUD",
  NotUnderwayEngineOrRefitWork = "NUE",
}

export enum AMSADutiesPerformedCode {
  AssistantToEngineer = "AE",
  Engineer = "E",
  EngineerWatchkeeper = "EW",
  EngineerInCharge = "EIC",
  AssistantToEngineerInCharge = "AEIC",
  Deck = "D",
  DeckAndEngineering = "DE",
  GeneralPurposeHand = "GPH",
  NavigationWatchOfficer = "INW",
  Coxswain = "C",
}

export enum VesselOperationsType {
  ContinuousVoyage = "CV",
  DayTrips = "DT",
  RefitAlongside = "RA",
}

export interface Person {
  uuid: string
  full_name: string
  contact_phone?: string
  contact_email?: string
}


export interface SeaService {
  uuid: string
  vessel_id: string

  amsa_area_of_operation: AMSAAreaOfOperationCode[]
  amsa_duties_performed: AMSADutiesPerformedCode[]
  start_datetime: string //ISO8601 timestamp with timezone info
  end_datetime: string //ISO8601 timestamp with timezone info
  hours_worked_per_day?: number
  mileage_nm?: number // nautical miles
  vessel_operations: VesselOperationsType

  supervising_person_id: string // Person
}
