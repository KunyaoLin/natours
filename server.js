const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.on('uncaughtException', (err) => {
  // console.log(err.name, err.message);
  console.log('UNHANDLE EXCEPTION! 💥 SHUTTING DOWN...');
  // console.log(err);
});
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((con) => {
    console.log('DB connect successful!');
  });

const app = require('./app');
//start server
const port = process.env.PORT || 3000;
// console.log(process.env);

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
process.on('unhandledRejection', (err) => {
  // console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION! 💥 SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
