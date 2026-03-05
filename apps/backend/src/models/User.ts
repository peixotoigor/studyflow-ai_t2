import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database';
import { UserSettings } from './UserSettings';
import { UserDriveAuth } from './UserDriveAuth';
import { PasswordResetToken } from './PasswordResetToken';
import { StudyPlan } from './StudyPlan';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string; // Not CreationOptional anymore, we'll use Supabase UUID
  declare name: string;
  declare email: string;
  declare passwordHash?: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare settings?: NonAttribute<UserSettings>;
  declare driveAuth?: NonAttribute<UserDriveAuth>;
  declare resetTokens?: NonAttribute<PasswordResetToken[]>;
  declare plans?: NonAttribute<StudyPlan[]>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    passwordHash: {
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
    tableName: 'users'
  }
);
