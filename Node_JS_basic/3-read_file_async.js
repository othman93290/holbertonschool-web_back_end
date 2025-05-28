const fs = require('fs');

function countStudents(filePath) {
  return new Promise((resolve, reject) => {
    // Read the file asynchronously
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(new Error('Cannot load the database'));
        return;
      }

      // Process the file content
      const lines = data.split('\n').filter((line) => line.trim() !== '');

      if (lines.length <= 1) {
        console.log('Number of students: 0');
        resolve();
        return;
      }

      // Parse the student data
      const students = lines.slice(1).map((line) => {
        const [firstname, , , field] = line.split(','); // Ignore lastname and age
        return { firstname, field };
      });

      // Aggregate data by field
      const fieldCount = {};
      students.forEach((student) => {
        if (!fieldCount[student.field]) {
          fieldCount[student.field] = [];
        }
        fieldCount[student.field].push(student.firstname);
      });

      // Log the total number of students
      console.log(`Number of students: ${students.length}`);

      // Log the number of students in each field
      for (const [field, names] of Object.entries(fieldCount)) {
        console.log(
          `Number of students in ${field}: ${names.length}. List: ${names.join(
            ', ',
          )}`,
        );
      }

      resolve();
    });
  });
}

module.exports = countStudents;