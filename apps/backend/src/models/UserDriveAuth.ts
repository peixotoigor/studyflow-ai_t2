import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export class UserDriveAuth extends Model<InferAttributes<UserDriveAuth>, InferCreationAttributes<UserDriveAuth>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare refreshToken: string;
  declare driveFolderId: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserDriveAuth.init(
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
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    driveFolderId: {
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
    tableName: 'user_drive_auth'
  }
);
