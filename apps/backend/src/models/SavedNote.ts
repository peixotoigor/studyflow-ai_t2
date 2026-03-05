import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database';
import { Subject } from './Subject';
import { StudyPlan } from './StudyPlan';

export class SavedNote extends Model<InferAttributes<SavedNote>, InferCreationAttributes<SavedNote>> {
  declare id: CreationOptional<string>;
  declare planId: ForeignKey<StudyPlan['id']>;
  declare subjectId: ForeignKey<Subject['id']> | null;
  declare content: string;
  declare topicName: string | null;
  declare tags: string[] | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare plan?: NonAttribute<StudyPlan>;
  declare subject?: NonAttribute<Subject>;
}

SavedNote.init(
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
    subjectId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    topicName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
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
    tableName: 'saved_notes'
  }
);
