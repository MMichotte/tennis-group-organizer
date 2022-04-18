
const XLSX = require('xlsx');

const exportToExcel = (htmlTableId, sheetName, fileName) => {
  const table_elt = document.getElementById(htmlTableId);
  const workbook = XLSX.utils.table_to_book(table_elt);
  const ws = workbook.Sheets[sheetName];
  XLSX.utils.sheet_add_aoa(ws, [[]], {origin:-1});
  XLSX.writeFile(workbook, fileName);
}

export default exportToExcel;