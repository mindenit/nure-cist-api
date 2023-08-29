// Core
import {Model, Table, Column, DataType, ForeignKey} from 'sequelize-typescript'

// Model
import { Event } from './Event'
import { Teacher } from './Teacher'

@Table({
    timestamps: false
})
export class TeacherEvent extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true })
    @ForeignKey(() => Event)
    eventId: number;

    @Column({ type: DataType.STRING, primaryKey: true })
    @ForeignKey(() => Teacher)
    teacherId: string;
}