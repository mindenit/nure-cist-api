// Core
import { Model, Table, Column, DataType } from 'sequelize-typescript'

@Table({ 
    timestamps: false
})
export class Subject extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true })
    id: number;
    
    @Column({ type: DataType.STRING, })
    brief: string;

    @Column({ type: DataType.STRING, })
    title: string;
}