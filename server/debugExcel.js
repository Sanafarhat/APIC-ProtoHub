const xlsx = require('xlsx');
const workbook = xlsx.readFile('../Prototype Lab Equipment Details.xlsx');

workbook.SheetNames.forEach(sheetName => {
  if (!sheetName.includes('Civil') && !sheetName.includes('Ag.E')) return;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return;
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(`\n--- Sheet: ${sheetName} ---`);
  
  let found = false;
  for (const row of data) {
    if (!found) {
      const firstCol = row['__EMPTY'] || row['S.No'] || row['Sr. No.'];
      if (typeof firstCol === 'string' && (firstCol.includes('S.No') || firstCol.includes('Sr. No'))) {
        console.log("HEADER ROW:");
        console.log(Object.keys(row).map(k => `${k}: ${row[k]}`));
        found = true;
      }
    } else {
      console.log("FIRST DATA ROW:");
      console.log(Object.keys(row).map(k => `${k}: ${row[k]}`));
      break;
    }
  }
});
