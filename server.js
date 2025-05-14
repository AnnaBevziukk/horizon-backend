import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('uncaught exception! shutting down..');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

import app from './app.js';

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection works'));
// .catch((err) => {
//   console.error('DB connection error:', err);
// });

// const port = process.env.PORT || 8000;
const port = 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandler rejection! shutting down..');
  server.close(() => {
    process.exit(1);
  });
});
