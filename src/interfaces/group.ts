export interface IDecodedGroup {
    university: University     
}

export interface University {
    short_name: string;
    full_name:  string;
    faculties:  Faculty[];
}

export interface Direction {
    id:           number;
    short_name:   string;
    full_name:    string;
    specialities: Faculty[];
    groups?:      Group[];
}

export interface Faculty {
    id:          number;
    short_name:  string;
    full_name:   string;
    directions?: Direction[];
    groups?:     Group[];
}

export interface Group {
    id:   number;
    name: string;
}