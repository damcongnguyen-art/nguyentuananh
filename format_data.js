const fs = require('fs');

const raw = fs.readFileSync('raw_data.json', 'utf-8');
const data = JSON.parse(raw);

let tsContent = `export interface ProductMasterItem {
  id: string;
  code: string;
  modelName: string;
  speedPerHour: number;
  defaultLine: string;
}

export const initialProductCatalog: ProductMasterItem[] = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync('src/data/productCatalog.ts', tsContent);
console.log('Done generating TS file');
