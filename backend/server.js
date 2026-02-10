const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Permet les requêtes cross-origin
app.use(express.json()); // Parse les requêtes JSON

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API!',
    endpoints: {
      utilisateurs: '/api/utilisateurs',
      utilisateurParId: '/api/utilisateurs/:id'
    }
  });
});

// GET - Récupérer tous les utilisateurs
app.get('/api/utilisateurs', async (req, res) => {
  const query = 'SELECT * FROM utilisateurs ORDER BY id';

  try {
    const [rows] = await db.query(query);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des données'
    });
  }
});

// GET - Récupérer un utilisateur par ID
app.get('/api/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM utilisateurs WHERE id = ?';

  try {
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Ajouter un nouvel utilisateur
app.post('/api/utilisateurs', async (req, res) => {
  const { nom, email, age, ville } = req.body;

  if (!nom || !email) {
    res.status(400).json({ error: 'Le nom et l\'email sont requis' });
    return;
  }

  // MySQL: pas de RETURNING id supporté directement comme Postgres dans INSERT
  const query = 'INSERT INTO utilisateurs (nom, email, age, ville) VALUES (?, ?, ?, ?)';

  try {
    const [result] = await db.query(query, [nom, email, age, ville]);

    res.status(201).json({
      success: true,
      message: 'Utilisateur ajouté avec succès',
      id: result.insertId
    });
  } catch (err) {
    console.error('Erreur lors de l\'insertion:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout' });
  }
});

// DELETE - Supprimer un utilisateur
app.delete('/api/utilisateurs/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM utilisateurs WHERE id = ?';

  try {
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`\nServeur démarré sur http://localhost:${PORT}`);
  console.log(` API disponible sur http://localhost:${PORT}/api/utilisateurs\n`);
});

// Gérer la fermeture propre n'est pas nécessaire de la même façon avec le pool mysql2 qui gère les connections
process.on('SIGINT', async () => {
  try {
    await db.end();
    console.log('\n✓ Base de données fermée');
  } catch (err) {
    console.error('Erreur lors de la fermeture:', err);
  }
  process.exit(0);
});