import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create example German companies
  const companies = [
    {
      name: 'Musterfirma GmbH',
      street: 'Hauptstraße 42',
      postalCode: '10115',
      city: 'Berlin',
      country: 'Deutschland',
      taxId: 'DE123456789',
      iban: 'DE89370400440532013000',
      contactPerson: 'Max Mustermann',
      email: 'kontakt@musterfirma.de',
      phone: '+49 30 12345678',
      fax: '+49 30 12345679',
      hrNr: 'HRB 12345 B',
      registergericht: 'Amtsgericht Charlottenburg',
      bimaNummer: 'BIMA-123456',
    },
    {
      name: 'Beispiel AG',
      street: 'Musterweg 15',
      postalCode: '80331',
      city: 'München',
      country: 'Deutschland',
      taxId: 'DE987654321',
      iban: 'DE89370400440532013001',
      contactPerson: 'Anna Schmidt',
      email: 'info@beispiel-ag.de',
      phone: '+49 89 98765432',
      fax: '+49 89 98765433',
      hrNr: 'HRB 98765 M',
      registergericht: 'Amtsgericht München',
      bimaNummer: 'BIMA-987654',
    },
    {
      name: 'Demo Handel UG (haftungsbeschränkt)',
      street: 'Testplatz 8',
      postalCode: '20095',
      city: 'Hamburg',
      country: 'Deutschland',
      taxId: 'DE456789123',
      iban: 'DE89370400440532013002',
      contactPerson: 'Thomas Weber',
      email: 'service@demo-handel.de',
      phone: '+49 40 55566677',
      fax: '+49 40 55566678',
      hrNr: 'HRB 45678 HH',
      registergericht: 'Amtsgericht Hamburg',
      bimaNummer: 'BIMA-456789',
    },
  ];

  // Check if companies already exist (idempotent approach)
  const existingCompanies = await prisma.company.findMany({
    where: {
      name: {
        in: companies.map((c) => c.name),
      },
    },
  });

  const existingCompanyNames = new Set(existingCompanies.map((c: { name: string }) => c.name));
  const companiesToCreate = companies.filter(
    (c) => !existingCompanyNames.has(c.name)
  );

  if (companiesToCreate.length > 0) {
    console.log(`📦 Creating ${companiesToCreate.length} companies...`);
    for (const companyData of companiesToCreate) {
      const company = await prisma.company.create({
        data: companyData,
      });
      console.log(`  ✅ Created: ${company.name}`);
    }
  } else {
    console.log('⏭️  All companies already exist, skipping...');
  }

  // Get the first company as the owner for the template
  const firstCompany = await prisma.company.findFirst({
    where: { name: 'Musterfirma GmbH' },
  });

  if (!firstCompany) {
    throw new Error('Could not find Musterfirma GmbH');
  }

  // Create example PDF template
  const existingTemplate = await prisma.pdfTemplate.findFirst({
    where: { name: 'Standard Vertrag V1' },
  });

  let template;
  if (!existingTemplate) {
    console.log('📄 Creating PDF template...');
    template = await prisma.pdfTemplate.create({
      data: {
        name: 'Standard Vertrag V1',
        fileName: '633_Angebot.pdf', // Using actual PDF from public/pdf-templates/
        description: 'Deutscher Standardvertrag – Angebot',
        ownerId: firstCompany.id,
      },
    });
    console.log(`  ✅ Created template: ${template.name}`);
  } else {
    console.log('⏭️  PDF template already exists, skipping...');
    template = existingTemplate;
  }

  // Create PDF fields for the template
  // Based on 633_Angebot.pdf - measured carefully
  // PDF: y=0 is BOTTOM, y=841.92 is TOP (A4 page)
  // Page height: 841.92, so top section ~720-750 from bottom
  
  const fields = [
    // LEFT BOX - "Name und Anschrift des Bieters" - starts at ~165x, ~620y
    {
      templateId: template.id,
      fieldKey: 'name',
      label: 'Firmenname',
      page: 0,
      x: 175,
      y: 680,
      fontSize: 10,
      maxWidth: 320,
      align: 'left',
    },
    // MIDDLE SECTION - "Name und Anschrift der Vergabestelle"
    {
      templateId: template.id,
      fieldKey: 'street',
      label: 'Straße',
      page: 0,
      x: 175,
      y: 550,
      fontSize: 9,
      maxWidth: 300,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'postalCode',
      label: 'PLZ',
      page: 0,
      x: 175,
      y: 535,
      fontSize: 9,
      maxWidth: 80,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'city',
      label: 'Stadt',
      page: 0,
      x: 265,
      y: 535,
      fontSize: 9,
      maxWidth: 200,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'country',
      label: 'Land',
      page: 0,
      x: 175,
      y: 520,
      fontSize: 9,
      maxWidth: 150,
      align: 'left',
    },
    // RIGHT BOX - Contact details - starts at ~550x, ~720y
    {
      templateId: template.id,
      fieldKey: 'city',
      label: 'Ort',
      page: 0,
      x: 700,
      y: 730,
      fontSize: 9,
      maxWidth: 340,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'phone',
      label: 'Tel.',
      page: 0,
      x: 700,
      y: 698,
      fontSize: 9,
      maxWidth: 340,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'fax',
      label: 'Fax',
      page: 0,
      x: 700,
      y: 680,
      fontSize: 9,
      maxWidth: 340,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'email',
      label: 'e-mail',
      page: 0,
      x: 700,
      y: 662,
      fontSize: 9,
      maxWidth: 340,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'taxId',
      label: 'USt.-ID-Nr.',
      page: 0,
      x: 700,
      y: 644,
      fontSize: 9,
      maxWidth: 340,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'hrNr',
      label: 'HR-Nr.',
      page: 0,
      x: 700,
      y: 626,
      fontSize: 9,
      maxWidth: 340,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'registergericht',
      label: 'Registergericht',
      page: 0,
      x: 700,
      y: 608,
      fontSize: 9,
      maxWidth: 340,
      align: 'left',
    },
    {
      templateId: template.id,
      fieldKey: 'bimaNummer',
      label: 'BImA-Nummer',
      page: 0,
      x: 700,
      y: 590,
      fontSize: 9,
      maxWidth: 340,
      align: 'left',
    },
  ];

  // Check which fields already exist (idempotent approach)
  const existingFields = await prisma.pdfField.findMany({
    where: {
      templateId: template.id,
      fieldKey: {
        in: fields.map((f) => f.fieldKey),
      },
    },
  });

  const existingFieldKeys = new Set(existingFields.map((f: { fieldKey: string }) => f.fieldKey));
  const fieldsToCreate = fields.filter(
    (f) => !existingFieldKeys.has(f.fieldKey)
  );

  if (fieldsToCreate.length > 0) {
    console.log(`🏷️  Creating ${fieldsToCreate.length} PDF fields...`);
    for (const fieldData of fieldsToCreate) {
      const field = await prisma.pdfField.create({
        data: fieldData,
      });
      console.log(`  ✅ Created field: ${field.label} (${field.fieldKey})`);
    }
  } else {
    console.log('⏭️  All PDF fields already exist, skipping...');
  }

  console.log('');
  console.log('✨ Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  const totalCompanies = await prisma.company.count();
  const totalTemplates = await prisma.pdfTemplate.count();
  const totalFields = await prisma.pdfField.count();
  console.log(`  - Companies: ${totalCompanies}`);
  console.log(`  - Templates: ${totalTemplates}`);
  console.log(`  - Fields: ${totalFields}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
