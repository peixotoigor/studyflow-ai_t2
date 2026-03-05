import { Sequelize, Options } from 'sequelize';
import path from 'path';
import fs from 'fs';
import pg from 'pg';

const dbUrl = process.env.DATABASE_URL || (process.env.VERCEL ? '' : 'sqlite:./data/dev.sqlite');

if (process.env.VERCEL && !dbUrl) {
  throw new Error('DATABASE_URL must be provided when running on Vercel');
}

if (dbUrl.startsWith('sqlite:')) {
  const relativePath = dbUrl.replace('sqlite:', '');
  const fullPath = path.resolve(process.cwd(), relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const sequelizeOptions: Options = {
  logging: false,
  define: {
    underscored: true
  }
};

if (isPostgres) {
  sequelizeOptions.dialectModule = pg;
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

export const sequelize = new Sequelize(dbUrl, sequelizeOptions);

export const connectDatabase = async () => {
  await sequelize.authenticate();
};
