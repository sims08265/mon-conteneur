const mysql = require('mysql2/promise');
require('dotenv').config();

// Créer le pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialiser la base de données
const initDb = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      console.log('Connecté à la base de données MySQL');

      // Créer la table utilisateurs
      await connection.query(`
        CREATE TABLE IF NOT EXISTS utilisateurs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          age INT,
          ville VARCHAR(255)
        )
      `);
      console.log('Table utilisateurs créée ou déjà existante');

      // Vérifier si la table est vide
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM utilisateurs');
      const count = rows[0].count;

      // Insérer des données de test si la table est vide
      if (count === 0) {
        const utilisateurs = [
          { nom: 'SIMO Gills', email: 'gills.simo@email.com', age: 15, ville: 'Eyang' },
          { nom: 'MEPE Victoire', email: 'victoire.mepe@email.com', age: 21, ville: 'Eyang' },
          { nom: 'Eddy MANGA', email: 'eddy.mangae@email.com', age: 23, ville: 'Eyang' },
        ];

        for (const user of utilisateurs) {
          await connection.query(
            'INSERT INTO utilisateurs (nom, email, age, ville) VALUES (?, ?, ?, ?)',
            [user.nom, user.email, user.age, user.ville]
          );
        }
        console.log('Données de test insérées');
      }

      connection.release();
      break;
    } catch (err) {
      console.error(`Erreur de connexion (essais restants: ${retries}):`, err.message);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000)); // Attendre 5s avant de réessayer
    }
  }
};

initDb();

module.exports = pool;