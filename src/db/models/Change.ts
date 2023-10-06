// Core
import {Model, Table, Column, DataType, BelongsTo, ForeignKey, DefaultScope } from 'sequelize-typescript'

// Models
import { Subject } from './Subject';
import {Group} from './Group';


export enum LessonType {
    Pz = 'Пз',
    Lb = 'Лб',
    Cons = 'Конс',
    Zal = 'Зал',
    Ekz = 'Екз',
    KpKr = 'КП/КР',
    Lk = 'Лк',
}
@DefaultScope(() => ({
    attributes: {
        exclude: ['subjectId']
    }
}))
@Table({
    timestamps: true,
    deletedAt: true,
})
export class Change extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.BIGINT, })
    start_time: number;

    @Column({ type: DataType.BIGINT, })
    end_time: number;

    @Column({ type: DataType.STRING, })
    auditory: string;

    @Column({ type: DataType.INTEGER })
    number_pair: number;

    @Column({ type: DataType.ENUM(...Object.values(LessonType)), })
    type: LessonType;

    @Column({ type: DataType.STRING, defaultValue: false })
    typeChange: 'OLD' | 'NEW';

    @ForeignKey(() => Subject)
    subjectId: number;

    @ForeignKey(() => Group)
    groupId: number

    @BelongsTo(() => Subject)
    subject: Subject;

    @BelongsTo(() => Group)
    group: Group
}
