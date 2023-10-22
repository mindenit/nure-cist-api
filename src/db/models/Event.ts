// Core
import {Model, Table, Column, DataType, BelongsTo, ForeignKey, BelongsToMany, DefaultScope} from 'sequelize-typescript'

// Models
import { Group } from './Group';
import { Teacher } from './Teacher';
import { Subject } from './Subject';
import { GroupEvent } from './GroupEvent';
import { TeacherEvent } from './TeacherEvent';

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
        exclude: ['subjectId', 'createdAt']
    }
}))
@Table({
    timestamps: true,
    deletedAt: true,
})
export class Event extends Model {
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

    // @Column({ type: DataType.BOOLEAN, defaultValue: false })
    // isDeleted: boolean;

    @ForeignKey(() => Subject)
    subjectId: number;

    @BelongsToMany(() => Group, {
        through: { model: () => GroupEvent }
    })
    groups: Group[];

    @BelongsToMany(() => Teacher, {
        through: { model: () => TeacherEvent }
    })
    teachers: Teacher[];

    @BelongsTo(() => Subject)
    subject: Subject;
}
