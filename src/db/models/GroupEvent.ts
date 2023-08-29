// Core
import {Model, Table, Column, DataType, ForeignKey} from 'sequelize-typescript'
import { Event } from './Event'
import { Group } from './Group'

@Table({
    timestamps: false
})
export class GroupEvent extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true })
    @ForeignKey(() => Event)
    eventId: number;

    @Column({ type: DataType.STRING, primaryKey: true })
    @ForeignKey(() => Group)
    groupId: string;
}