// Core
import { Model, Table, Column, DataType } from 'sequelize-typescript'

@Table({
    timestamps: false
})
export class Teacher extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, })
    full_name: string;

    @Column({ type: DataType.STRING, })
    short_name: string;

    @Column({ type: DataType.STRING, allowNull: true })
    lastRequest?: Date;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isActive?: boolean;
}
