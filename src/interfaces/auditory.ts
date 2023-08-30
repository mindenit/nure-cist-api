export interface IDecodedAuditories {
    university: University
}

export interface University {
    short_name: string
    full_name: string
    buildings: Building[]
}

export interface Building {
    id: string
    short_name: string
    full_name: string
    auditories: Auditory[]
}

export interface Auditory {
    id: string
    short_name: string
    floor: string
    is_have_power: string
    auditory_types: AuditoryType[]
}

export interface AuditoryType {
    id: string
    short_name: string
}
