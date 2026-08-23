/**
 * Exports the HTML table identified by `htmlTableId` as an .xlsx file.
 * The `xlsx` library is loaded on demand to keep the main bundle small.
 */
const exportToExcel = async (
  htmlTableId: string,
  sheetName: string,
  fileName: string,
): Promise<void> => {
  const { default: XLSX } = await import('xlsx');
  const tableElement = document.getElementById(htmlTableId);
  if (!tableElement) {
    throw new Error(`Could not find table with id "${htmlTableId}"`);
  }
  const workbook = XLSX.utils.table_to_book(tableElement);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Could not find sheet "${sheetName}"`);
  }
  XLSX.utils.sheet_add_aoa(sheet, [], { origin: -1 });
  XLSX.writeFile(workbook, fileName);
};

export default exportToExcel;
