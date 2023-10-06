// Core
import {Model, Table, Column, DataType, ForeignKey} from 'sequelize-typescript'

// Models
import { User } from './User'
import { Group } from './Group'

@Table({
    timestamps: false
})
export class UserGroup extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true })
    @ForeignKey(() => User)
    userId: number;

    @Column({ type: DataType.BIGINT, primaryKey: true })
    @ForeignKey(() => Group)
    groupId: number;
}
