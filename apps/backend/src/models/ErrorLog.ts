import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database';
import { Subject } from './Subject';

export class ErrorLog extends Model<InferAttributes<ErrorLog>, InferCreationAttributes<ErrorLog>> {
  declare id: CreationOptional<string>;
  declare subjectId: ForeignKey<Subject['id']>;
  declare topicName: string;
  declare questionSource: string;
  declare reason: 'KNOWLEDGE_GAP' | 'ATTENTION' | 'INTERPRETATION' | 'TRICK' | 'TIME';
  declare description: string;
  declare correction: string;
  declare reviewCount: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare subject?: NonAttribute<Subject>;
}

ErrorLog.init(
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
    topicName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    questionSource: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reason: {
      type: DataTypes.ENUM('KNOWLEDGE_GAP', 'ATTENTION', 'INTERPRETATION', 'TRICK', 'TIME'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correction: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'error_logs'
  }
);
