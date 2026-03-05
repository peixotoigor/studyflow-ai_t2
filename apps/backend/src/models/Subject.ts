import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database';
import { StudyPlan } from './StudyPlan';
import { Topic } from './Topic';
import { StudyLog } from './StudyLog';
import { ErrorLog } from './ErrorLog';

export class Subject extends Model<InferAttributes<Subject>, InferCreationAttributes<Subject>> {
  declare id: CreationOptional<string>;
  declare planId: ForeignKey<StudyPlan['id']>;
  declare name: string;
  declare active: CreationOptional<boolean>;
  declare color: string | null;
  declare weight: number | null;
  declare priority: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  declare proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare plan?: NonAttribute<StudyPlan>;
  declare topics?: NonAttribute<Topic[]>;
  declare logs?: NonAttribute<StudyLog[]>;
  declare errorLogs?: NonAttribute<ErrorLog[]>;
}

Subject.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    planId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('HIGH', 'MEDIUM', 'LOW'),
      allowNull: true
    },
    proficiency: {
      type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
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
    tableName: 'subjects'
  }
);
