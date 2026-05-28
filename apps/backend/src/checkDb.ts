import 'dotenv/config';
import { connectDatabase, sequelize } from './config/database';
import { User } from './models/User';
import { runMigrationsAndSeed } from './config/migrations';

async function main() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('Database connected successfully.');

    console.log('\nRunning migrations and seeding...');
    await runMigrationsAndSeed();
    console.log('Migrations and seeding finished.');

    console.log('\nDescribing "users" table via Sequelize queryInterface...');
    const tableDesc = await sequelize.getQueryInterface().describeTable('users');
    console.log('Columns in "users" table:');
    console.log(JSON.stringify(tableDesc, null, 2));

    console.log('\nTesting a simple query on User model...');
    const usersCount = await User.count();
    console.log(`Total users in database: ${usersCount}`);

    console.log('\nTesting User.findOne...');
    const oneUser = await User.findOne();
    if (oneUser) {
      console.log('Found one user:', oneUser.toJSON());
    } else {
      console.log('No users found in database.');
    }

  } catch (error) {
    console.error('Error during database check:', error);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

main();
