const xlsx = require('xlsx');

const workbook = xlsx.readFile('../Prototype Lab Equipment Details.xlsx', { sheetRows: 50 });

console.log('Available Sheets:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(`\n--- SHEET: ${sheetName} ---`);
  if (data.length > 0) {
    console.log('First 5 rows:');
    console.log(data.slice(0, 5));
  } else {
    console.log('Sheet is empty');
  }
});
