import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Subject } from './Subject';
import { SimulatedExam } from './SimulatedExam';
import { SavedNote } from './SavedNote';

export class StudyPlan extends Model<InferAttributes<StudyPlan>, InferCreationAttributes<StudyPlan>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare name: string;
  declare description: string | null;
  declare color: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user?: NonAttribute<User>;
  declare subjects?: NonAttribute<Subject[]>;
  declare simulatedExams?: NonAttribute<SimulatedExam[]>;
  declare savedNotes?: NonAttribute<SavedNote[]>;
}

StudyPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'study_plans'
  }
);
