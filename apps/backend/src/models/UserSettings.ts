import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export class UserSettings extends Model<InferAttributes<UserSettings>, InferCreationAttributes<UserSettings>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare dailyAvailableTimeMinutes: CreationOptional<number>;
  declare openAiApiKey: CreationOptional<string | null>;
  declare openAiModel: CreationOptional<string>;
  declare githubToken: CreationOptional<string | null>;
  declare backupGistId: CreationOptional<string | null>;
  declare avatarUrl: CreationOptional<string | null>;
  declare scheduleSettings: CreationOptional<any | null>;
  declare scheduleSelection: CreationOptional<any | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserSettings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    dailyAvailableTimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 240
    },
    openAiApiKey: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    openAiModel: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'gpt-4o-mini'
    },
    githubToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    backupGistId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scheduleSettings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    scheduleSelection: {
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
    tableName: 'user_settings'
  }
);
