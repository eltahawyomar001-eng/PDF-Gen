import { PrismaClient } from '@prisma/client';

// Create two Prisma clients - one for SQLite, one for PostgreSQL
const sqlite = new PrismaClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } },
});

const postgres = new PrismaClient({
  datasources: { 
    db: { 
      url: process.env.DATABASE_URL || 'postgresql://postgres.pbkjcvhzqkrlnycfutpo:34023012563Meer@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
    } 
  },
});

async function migrate() {
  try {
    console.log('📊 Fetching data from SQLite...');
    
    // Fetch all companies
    const companies = await sqlite.company.findMany({
      include: { templates: { include: { fields: true } } },
    });
    
    console.log(`Found ${companies.length} companies`);
    
    // Migrate companies
    for (const company of companies) {
      console.log(`\n📦 Migrating company: ${company.name}`);
      
      const { id, templates, ...companyData } = company;
      
      // Create company in PostgreSQL
      const newCompany = await postgres.company.create({
        data: companyData,
      });
      
      console.log(`  ✅ Created company ID ${newCompany.id}`);
      
      // Migrate templates
      for (const template of templates) {
        const { id: templateId, ownerId, fields, ...templateData } = template;
        
        const newTemplate = await postgres.pdfTemplate.create({
          data: {
            ...templateData,
            ownerId: newCompany.id,
          },
        });
        
        console.log(`    📄 Created template: ${newTemplate.name}`);
        
        // Migrate fields
        for (const field of fields) {
          const { id: fieldId, templateId: oldTemplateId, ...fieldData } = field;
          
          await postgres.pdfField.create({
            data: {
              ...fieldData,
              templateId: newTemplate.id,
            },
          });
        }
        
        console.log(`      ✅ Migrated ${fields.length} fields`);
      }
    }
    
    // Also migrate standalone templates (without owner)
    const standaloneTemplates = await sqlite.pdfTemplate.findMany({
      where: { ownerId: null },
      include: { fields: true },
    });
    
    console.log(`\n📄 Migrating ${standaloneTemplates.length} standalone templates...`);
    
    for (const template of standaloneTemplates) {
      const { id, fields, ...templateData } = template;
      
      const newTemplate = await postgres.pdfTemplate.create({
        data: templateData,
      });
      
      console.log(`  ✅ Created template: ${newTemplate.name}`);
      
      for (const field of fields) {
        const { id: fieldId, templateId, ...fieldData } = field;
        
        await postgres.pdfField.create({
          data: {
            ...fieldData,
            templateId: newTemplate.id,
          },
        });
      }
      
      console.log(`    ✅ Migrated ${fields.length} fields`);
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

migrate();
