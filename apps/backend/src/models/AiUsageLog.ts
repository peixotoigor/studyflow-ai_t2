import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export class AiUsageLog extends Model<InferAttributes<AiUsageLog>, InferCreationAttributes<AiUsageLog>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare endpoint: string;
  declare provider: string;
  declare model: string;
  declare inputTokens: number;
  declare outputTokens: number;
  declare estimatedCostUsd: number;
  declare durationMs: number;
  declare status: 'success' | 'error' | 'rate_limited' | 'quota_exceeded';
  declare errorMessage: CreationOptional<string | null>;
  declare ipAddress: CreationOptional<string | null>;
  declare userAgent: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user?: NonAttribute<User>;
}

AiUsageLog.init(
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
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    inputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    outputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estimatedCostUsd: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      defaultValue: 0.0
    },
    durationMs: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('success', 'error', 'rate_limited', 'quota_exceeded'),
      allowNull: false
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING(200),
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
    tableName: 'ai_usage_logs'
  }
);
