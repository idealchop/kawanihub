/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import 'dotenv/config';
import { app } from './index-api';
import { brand } from './config/brand';

const port = Number(process.env.PORT ?? 8080);

app.listen(port, '0.0.0.0', () => {
  console.log(`${brand.productName} API listening on http://0.0.0.0:${port}`);
  console.log(`Copyright (c) ${brand.copyrightYear} ${brand.legalName}. All rights reserved.`);
});
