const http = require('http');
const fs = require('fs');

const countStudents = (databasePath) => new Promise((resolve, reject) => {
  fs.readFile(databasePath, 'utf8', (err, data) => {
    if (err) {
      reject(new Error('Cannot load the database'));
    } else {
      const lines = data.split('\n').filter((line) => line.trim() !== '');
      const students = lines.slice(1).map((line) => line.split(','));
      const validStudents = students.filter((student) => student.length === 4);

      const totalStudents = validStudents.length;
      const csStudents = validStudents.filter((student) => student[3] === 'CS');
      const sweStudents = validStudents.filter((student) => student[3] === 'SWE');

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

const app = http.createServer(async (req, res) => {
  const { url } = req;

  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello Holberton School!');
  } else if (url === '/students') {
    const databasePath = process.argv[2];
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('This is the list of our students\n');

    try {
      const studentsData = await countStudents(databasePath);
      res.write(`Number of students: ${studentsData.totalStudents}\n`);
      res.write(
        `Number of students in CS: ${studentsData.cs.count}. List: ${studentsData.cs.list.join(', ')}\n`,
      );
      res.write(
        `Number of students in SWE: ${studentsData.swe.count}. List: ${studentsData.swe.list.join(', ')}`,
      );
      res.end();
    } catch (error) {
      res.write(error.message);
      res.end(); // ← important
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

app.listen(1245);
module.exports = app;
