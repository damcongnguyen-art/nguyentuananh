const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Test');
sheet.columns = [
    { key: 'A', width: 10 },
    { key: 'B', width: 8 },
    { key: 'C', width: 10 },
    { key: 'D', width: 11 },
    { key: 'E', width: 18 },
    { key: 'F', width: 11 },
    { key: 'G', width: 11 },
    { key: 'H', width: 11 },
    { key: 'I', width: 12 },
    { key: 'J', width: 11 },
    { key: 'K', width: 11 },
    { key: 'L', width: 11 },
    { key: 'M', width: 12 },
    { key: 'N', width: 16 },
  ];
const rB1 = sheet.addRow(['LINE', '', 'CODE', '', '', '', 'Plan', 'Actual', 'Speed/H', 'GAP', '', '', '', '']);
console.log(rB1.getCell(10).value); // GAP
