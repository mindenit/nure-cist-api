// Core
import {
    Model,
    Table,
    Column,
    DataType,
    DefaultScope, BelongsToMany,
    // HasMany
} from 'sequelize-typescript'
import {Group} from './Group';
import {UserGroup} from './UserGroup';

// Models
// import { Group } from './Group';

@DefaultScope(() => ({
    attributes: {
        exclude: ['access_token', 'createdAt', 'refresh_token', 'updatedAt',]
    }
}))
@Table({
    timestamps: true,
    deletedAt: true,
})
export class User extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.STRING, })
    email: string;

    @Column({ type: DataType.STRING })
    password: string

    @Column({ type: DataType.STRING })
    access_token?: string;

    @Column({ type: DataType.STRING })
    refresh_token?: string

    @BelongsToMany(() => Group, {
        through: { model: () => UserGroup }
    })
    groups: Group[];
}
