import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Blockchain Voting System API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
