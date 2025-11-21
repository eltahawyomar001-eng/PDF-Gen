import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } },
});

async function exportData() {
  try {
    console.log('📊 Exporting data from SQLite...');
    
    const companies = await prisma.company.findMany({
      include: { templates: { include: { fields: true } } },
    });
    
    const standaloneTemplates = await prisma.pdfTemplate.findMany({
      where: { ownerId: null },
      include: { fields: true },
    });
    
    const data = {
      companies,
      standaloneTemplates,
    };
    
    fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2));
    
    console.log(`✅ Exported ${companies.length} companies and ${standaloneTemplates.length} standalone templates`);
    console.log('📁 Data saved to data-export.json');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
