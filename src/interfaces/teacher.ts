export interface IDecodedTeachers {
    university: University;
}

export interface University {
    short_name: string;
    full_name:  string;
    faculties:  Faculty[];
}

export interface Faculty {
    id:          number;
    short_name:  string;
    full_name:   string;
    departments: Department[];
}

export interface Department {
    id:           number;
    short_name:   string;
    full_name:    string;
    teachers?:    Department[];
    departments?: Department[];
}
