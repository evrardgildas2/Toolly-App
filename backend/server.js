require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketServer');

const authRoutes = require('./routes/authRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const prestataireRoutes = require('./routes/prestataireRoutes');
const missionRoutes = require('./routes/missionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notationRoutes = require('./routes/notationRoutes');
const realisationRoutes = require('./routes/realisationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const rechercheRoutes = require('./routes/rechercheRoutes');


connectDB();

const app = express();

app.use(cors({
  origin: 'https://toolly-app-4.onrender.com',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/prestataires', prestataireRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notations', notationRoutes);
app.use('/api/realisations', realisationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/recherche', rechercheRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/sante', (req, res) => {
  res.json({ message: 'API Toolly 2.0 opérationnelle' });
});

// On crée un serveur HTTP explicite (plutôt que app.listen directement)
// car Socket.io a besoin de s'attacher à ce serveur pour fonctionner
// en parallèle des routes Express classiques.
const serveurHttp = http.createServer(app);
initSocket(serveurHttp);

const PORT = process.env.PORT || 5000;
serveurHttp.listen(PORT, () => {
  console.log(`Serveur backend Toolly 2.0 démarré sur le port ${PORT} (API + Socket.io)`);
});
