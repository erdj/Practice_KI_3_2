import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';

dotenv.config();
mongoose.set('strictQuery', true);
console.log("")
const app = express();
const port = process.env.SERVER_PORT || 5000;

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

const connect = async () => {
  await mongoose
    .connect(process.env.MONGO_DB_URL)
    .then(() => {
      console.log('Connected to DB');
    })
    .catch((err) => {
      console.log(JSON.stringify({ message: err.message }));
      throw err;
    });
};

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  connect();
});
