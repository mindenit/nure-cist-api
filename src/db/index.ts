// Core
import { Sequelize } from 'sequelize-typescript';

//Config
import { env } from '../config';

// Models
import { Group } from './models/Group';
import { Teacher } from './models/Teacher';
import {GroupEvent} from './models/GroupEvent';
import {TeacherEvent} from './models/TeacherEvent';
import {Subject} from './models/Subject';
import { Event } from './models/Event';
import { Auditory } from './models/Auditory';
import {Change} from './models/Change';
import {User} from './models/User';
import {UserGroup} from './models/UserGroup';

export default async function (): Promise<Sequelize> {
    const sequelize = new Sequelize(env.DB_URI, {
        models: [User, Group, UserGroup, Teacher, Event, Change, GroupEvent, TeacherEvent, Subject, Auditory],
        pool: {
            max: 60,
            min: 0,
            idle: 30000,
            acquire: 100000,
        },
        logging: false
    })

    await sequelize.sync();

    return sequelize
}
