const express = require('express');
const fs = require('fs');

const app = express();

function countStudents(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(new Error('Cannot load the database'));
        return;
      }

      const lines = data.split('\n').filter((line) => line.trim() !== '');
      const students = lines.slice(1).map((line) => line.split(','));

      const fields = {};
      students.forEach((student) => {
        if (student.length === 4) {
          const field = student[3];
          if (!fields[field]) {
            fields[field] = [];
          }
          fields[field].push(student[0]);
        }
      });

      const total = Object.values(fields).reduce((sum, group) => sum + group.length, 0);

      const output = [`Number of students: ${total}`];
      for (const [field, list] of Object.entries(fields)) {
        output.push(`Number of students in ${field}: ${list.length}. List: ${list.join(', ')}`);
      }

      resolve(output.join('\n'));
    });
  });
}

app.get('/', (req, res) => {
  res.send('Hello Holberton School!');
});

app.get('/students', async (req, res) => {
  const database = process.argv[2];
  res.set('Content-Type', 'text/plain');
  let response = 'This is the list of our students\n';

  try {
    const data = await countStudents(database);
    response += data;
    res.send(response);
  } catch (err) {
    response += err.message;
    res.status(500).send(response);
  }
});

app.listen(1245);

module.exports = app;
