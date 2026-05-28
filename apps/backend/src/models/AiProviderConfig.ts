import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class AiProviderConfig extends Model<InferAttributes<AiProviderConfig>, InferCreationAttributes<AiProviderConfig>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare baseUrl: string;
  declare apiKeyEnvVar: string;
  declare defaultModel: string;
  declare isActive: CreationOptional<boolean>;
  declare extraHeaders: CreationOptional<any>;
  declare maxTokensPerRequest: CreationOptional<number>;
  declare modelsAvailable: CreationOptional<any>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AiProviderConfig.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    baseUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apiKeyEnvVar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    defaultModel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    extraHeaders: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    maxTokensPerRequest: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4096
    },
    modelsAvailable: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
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
    tableName: 'ai_provider_configs'
  }
);
