const http = require('http');
const fs = require('fs');

// Fonction helper pour lire et analyser le fichier CSV
const countStudents = (databasePath) => new Promise((resolve, reject) => {
  fs.readFile(databasePath, 'utf8', (err, data) => {
    if (err) {
      // Rejeter la promesse si une erreur se produit lors de la lecture du fichier
      reject(new Error('Cannot load the database'));
    } else {
      // Diviser les lignes et filtrer les lignes vides
      const lines = data.split('\n').filter((line) => line.trim() !== '');
      // Ignorer la première ligne (entête) et extraire les étudiants
      const students = lines.slice(1).map((line) => line.split(','));

      // Filtrer les lignes valides (avec exactement 4 éléments)
      const validStudents = students.filter(
        (student) => student.length === 4,
      );

      // Compter le nombre total d'étudiants
      const totalStudents = validStudents.length;

      // Grouper les étudiants par domaine (CS, SWE)
      const csStudents = validStudents.filter(
        (student) => student[3] === 'CS',
      );
      const sweStudents = validStudents.filter(
        (student) => student[3] === 'SWE',
      );

      // Résoudre la promesse avec les données des étudiants
      resolve({
        totalStudents,
        cs: {
          count: csStudents.length,
          list: csStudents.map((student) => student[0]),
        },
        swe: {
          count: sweStudents.length,
          list: sweStudents.map((student) => student[0]),
        },
      });
    }
  });
});

// Créer le serveur HTTP
const app = http.createServer(async (req, res) => {
  const { url } = req;

  // Gérer la route racine "/"
  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello Holberton School!'); // Répondre avec un message de bienvenue
  } else if (url === '/students') {
    const databasePath = process.argv[2]; // Le fichier CSV est passé en argument

    if (!databasePath) {
      // Si aucun chemin vers la base de données n'est fourni
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('No database provided');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('This is the list of our students\n');

    try {
      // Appeler la fonction pour compter les étudiants
      const studentsData = await countStudents(databasePath);

      // Vérifier que les données des étudiants sont dans le format attendu
      if (studentsData) {
        res.write(`Number of students: ${studentsData.totalStudents}\n`);
        res.write(
          `Number of students in CS: ${
            studentsData.cs.count
          }. List: ${studentsData.cs.list.join(', ')}\n`,
        );
        res.write(
          `Number of students in SWE: ${
            studentsData.swe.count
          }. List: ${studentsData.swe.list.join(', ')}`,
        );
      } else {
        throw new Error('Cannot parse students data');
      }
    } catch (error) {
      // Gérer les erreurs et envoyer un message d'erreur
      res.write(error.message);
    }

    res.end(); // Terminer correctement la réponse
  } else {
    // Gérer les routes non définies
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Faire écouter le serveur sur le port 1245
app.listen(1245);

// Exporter le serveur pour les tests ou une utilisation future
module.exports = app;