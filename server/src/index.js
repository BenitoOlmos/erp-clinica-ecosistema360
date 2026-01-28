const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const profesionalesRoutes = require('./routes/profesionalesRoutes');
const citasRoutes = require('./routes/citasRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/citas', citasRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('API Ecosistema 360 is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
