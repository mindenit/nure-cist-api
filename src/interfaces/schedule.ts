export interface IScheduleQueries {
    start_time: number;
    end_time: number;
    groupId?: number;
    teacherId?: number;
    auditoryId?: number;
    type: 'group' | 'teacher' | 'auditory';
}

export interface IDecodedSchedule {
    "time-zone": string;
    events:      Event[];
    groups:      Group[];
    teachers:    Teacher[];
    subjects:    Subject[];
    types:       Type[];
}

export interface Event {
    subject_id:  number;
    start_time:  number;
    end_time:    number;
    type:        number;
    number_pair: number;
    auditory:    string;
    teachers:    number[];
    groups:      number[];
}

export interface Group {
    id:   number;
    name: string;
}

export interface Subject {
    id:    number;
    brief: string;
    title: string;
    hours: Hour[];
}

export interface Hour {
    type:     number;
    val:      number;
    teachers: number[];
}

export interface Teacher {
    id:         number;
    full_name:  string;
    short_name: string;
}

export interface Type {
    id:         number;
    short_name: string;
    full_name:  string;
    id_base:    number;
    type:       string;
}
