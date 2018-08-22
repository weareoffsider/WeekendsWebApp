export enum AMSAPropulsionCode {
  Inboard = "I",
  Outboard = "O",
  Steam = "S",
}

export enum AMSATypeOfOperationCode {
  Commerical = "C",
  Recreational = "R",
  Military = "M",
}


export interface Vessel {
  uuid: string
  slug: string

  name: string
  port_of_registration: string
  identification_organization: string
  identification_number: string

  vessel_length_m: number // metres

  amsa_propulsion_system: AMSAPropulsionCode
  amsa_operation_type: AMSATypeOfOperationCode

  number_of_engines: number
  propulsion_power_kw: number // kilowatts
}
