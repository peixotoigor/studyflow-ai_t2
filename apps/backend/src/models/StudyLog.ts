import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database';
import { Subject } from './Subject';
import { Topic } from './Topic';

export class StudyLog extends Model<InferAttributes<StudyLog>, InferCreationAttributes<StudyLog>> {
  declare id: CreationOptional<string>;
  declare subjectId: ForeignKey<Subject['id']>;
  declare topicId: ForeignKey<Topic['id']> | null;
  declare topicName: string;
  declare date: Date;
  declare durationMinutes: number;
  declare questionsCount: number;
  declare correctCount: number;
  declare modalities: string[] | null;
  declare notes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare subject?: NonAttribute<Subject>;
  declare topic?: NonAttribute<Topic>;
}

StudyLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    topicId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    topicName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    questionsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    correctCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    modalities: {
      type: DataTypes.JSON,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'study_logs'
  }
);
