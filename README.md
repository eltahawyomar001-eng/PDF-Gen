# German PDF GeneratorThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A professional PDF generation system for German business documents with dynamic company management and interactive coordinate selection.## Getting Started



## 👨‍💻 DeveloperFirst, run the development server:



**Omar Rageh**```bash

npm run dev

Full-stack developer specializing in modern web applications and document automation systems.# or

yarn dev

---# or

pnpm dev

## 🌟 Features# or

bun dev

- **PDF Form Field Auto-Fill**: Automatically fills PDF forms using actual form field detection```

- **Dynamic Company Management**: Add, edit, and delete companies with full CRUD operations

- **Interactive Coordinate Picker**: Click directly on PDF previews to capture coordinatesOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **German Business Standards**: Built specifically for German business document requirements

- **Real-time PDF Preview**: Live preview of PDF templates with click-to-capture functionalityYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **Type-Safe**: Built with TypeScript for enhanced reliability

- **Modern UI**: Clean, responsive interface with Tailwind CSSThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



## 🚀 Tech Stack## Learn More



- **Framework**: Next.js 16.0.3 with App RouterTo learn more about Next.js, take a look at the following resources:

- **Language**: TypeScript 5

- **Database**: Prisma ORM with SQLite- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **PDF Processing**: pdf-lib, pdfjs-dist- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Styling**: Tailwind CSS v4

- **Validation**: ZodYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Form Handling**: Server Actions

## Deploy on Vercel

## 📋 Prerequisites

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- Node.js 18+ 

- npm or yarnCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/eltahawyomar001-eng/PDF-Gen.git
cd PDF-Gen

# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── app/
│   ├── actions/          # Server actions for data mutations
│   ├── admin/            # Admin interface pages
│   ├── api/              # API routes
│   └── page.tsx          # Main application page
├── components/           # React components
│   ├── CompanyForm.tsx
│   ├── PdfClickablePreview.tsx
│   ├── FieldManagerWithPreview.tsx
│   └── Footer.tsx
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── public/
    └── pdf-templates/    # PDF template files
```

## 🎯 Key Features Explained

### PDF Form Field Detection
The system automatically detects and fills PDF form fields instead of using coordinate-based text overlay, ensuring accurate placement.

### Click-to-Capture Coordinates
Administrators can click directly on PDF previews to capture exact coordinates for text placement. The system handles:
- Screen coordinate to PDF coordinate transformation
- Y-axis inversion (PDF uses bottom-left origin)
- Display scaling calculations

### Company Management
Dynamic CRUD interface for managing multiple companies with all German business registration details:
- Tax ID (USt-IdNr)
- Commercial Register Number (HR-Nr)
- Register Court (Registergericht)
- BIMA Number
- Contact information

## 🎨 Usage

### Generate a PDF

1. Navigate to the home page
2. Select a company from the dropdown
3. Choose a PDF template
4. Click "PDF generieren"
5. Download your filled PDF

### Manage Companies

1. Go to "Firmen" from the main page
2. Click "+ Neue Firma hinzufügen" to add a company
3. Fill in all required fields (marked with *)
4. Save the company

### Admin Template Management

1. Navigate to "Vorlagen"
2. Select a template to manage fields
3. Click on the PDF preview to capture coordinates
4. Fill in field details and save

## 🔧 Configuration

The application uses environment variables for configuration. Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
```

## 📄 License

MIT License - Copyright (c) 2025 Omar Rageh

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

**Omar Rageh**
- GitHub: [@eltahawyomar001-eng](https://github.com/eltahawyomar001-eng)
- Project: [PDF-Gen](https://github.com/eltahawyomar001-eng/PDF-Gen)

## 🙏 Acknowledgments

- Built with Next.js and React
- PDF processing powered by pdf-lib and pdf.js
- Database management with Prisma

---

**Developed with ❤️ by Omar Rageh**
