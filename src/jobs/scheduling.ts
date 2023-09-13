// Core
import iconv from 'iconv-lite'
import { jsonrepair } from 'jsonrepair'

// Config
import { env } from '../config'
 
// Models
import { Teacher } from '../db/models/Teacher'
import { Group } from '../db/models/Group'

// Interfaces 
import { IDecodedGroup } from '../interfaces/group'
import { IDecodedTeachers } from '../interfaces/teacher'
import { IDecodedAuditories } from '../interfaces/auditory'
import { Auditory } from '../db/models/Auditory'

export const schedulingParserJob = async (): Promise<void> => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
        }
        const groups = await fetch(`${env.API_URL}/P_API_GROUP_JSON`, {
            method: 'GET',
            headers,
        });
        const decodedGroups: IDecodedGroup = JSON.parse(iconv.decode(Buffer.from(await groups.arrayBuffer()), 'win1251'));
        await syncGroupsFromData(decodedGroups);
        const teachers = await fetch(`${env.API_URL}/P_API_PODR_JSON`, {
            method: 'GET',
            headers,
        });

        const decodedTeachers = iconv.decode(Buffer.from(await teachers.arrayBuffer()), 'win1251');
        const fixedJsonTeachers = jsonrepair(decodedTeachers);
        const repairedDecodedTeachers: IDecodedTeachers = JSON.parse(fixedJsonTeachers);
        await syncTeachersFromData(repairedDecodedTeachers);

        const auditories = await fetch(`${env.API_URL}/P_API_AUDITORIES_JSON`, {
            method: 'GET',
            headers,
        });

        const decodedAuditories = iconv.decode(Buffer.from(await auditories.arrayBuffer()), 'win1251');
        const fixedJsonAuditories = jsonrepair(decodedAuditories);
        const repairedDecodedAuditories: IDecodedAuditories = JSON.parse(fixedJsonAuditories);
        await syncAuditoriesFromData(repairedDecodedAuditories)

    } catch (error) {
        console.log('[schedulingParserJob]', error);
    }    
}

const syncTeachersFromData = async (teachersData: IDecodedTeachers): Promise<void> => {
    for (const faculty of teachersData.university.faculties) {
        for (const { teachers, departments } of faculty.departments) {
            if (departments && departments.length !== 0) {
                for (const { teachers } of departments) {
                    if (teachers && teachers.length !== 0) {
                        for (const { full_name, id, short_name } of teachers) {
                            const teacher = await Teacher.findByPk(id);
                            if (!teacher) {
                                await Teacher.create({
                                    id,
                                    short_name,
                                    full_name
                                })
                            }
                        }
                    }
                }
            }
            if (teachers && teachers.length !== 0) {
                for (const { full_name, id, short_name } of teachers) {
                    const teacher = await Teacher.findByPk(id);
                    if (!teacher) {
                        await Teacher.create({
                            id, 
                            short_name,
                            full_name
                        })
                    }
                }
            }
        }
    }  
}

const syncGroupsFromData = async (groupsData:IDecodedGroup): Promise<void> => {
    for (const faculty of groupsData.university.faculties) {
        for (const { groups } of faculty.directions) {
            if (groups && isIterable(groups)) {
                for (const { name, id } of groups) {
                    const group = await Group.findByPk(id);
                    if (name && id && !group) {
                        await Group.create({
                            name,
                            id,
                        })
                    }
                }
            }
        }
    }   
}

const syncAuditoriesFromData = async (auditories: IDecodedAuditories) => {
    for (const building of auditories.university.buildings) {
        for (const { short_name, id } of building.auditories) {
            await Auditory.findOrCreate({
                where: {
                    id,
                    name: short_name
                }
            })
        }
    }
}

const isIterable = (obj: unknown) => {
    return typeof obj[Symbol.iterator] === 'function'
}
