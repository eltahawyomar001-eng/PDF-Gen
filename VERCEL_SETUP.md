# Vercel Deployment Setup

## Environment Variables Required

To enable PDF file uploads in production, you need to configure Vercel Blob Storage.

### 1. Set up Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. Follow the setup wizard

### 2. Add Environment Variable

Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project once you create the Blob storage.

If you need to add it manually:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: (Get this from your Blob storage settings)
   - **Environments**: Production, Preview, Development

### 3. Database Migration

After deploying the updated schema, you need to add the `fileUrl` column to your database:

```sql
ALTER TABLE "PdfTemplate" ADD COLUMN "fileUrl" TEXT;
```

You can run this in your Supabase SQL editor:
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the above SQL command

### 4. Deploy

```bash
git add -A
git commit -m "Add Vercel Blob Storage support for file uploads"
git push
```

## How It Works

- **New uploads**: Files are uploaded to Vercel Blob Storage and the `fileUrl` is stored in the database
- **Legacy files**: Existing templates with only `fileName` continue to work from the local `public/pdf-templates/` folder
- **PDF Generation**: Automatically uses `fileUrl` if available, otherwise falls back to `fileName`

## Testing Locally

To test blob uploads locally, you'll need to add the `BLOB_READ_WRITE_TOKEN` to your `.env.local` file.

## Troubleshooting

### Upload fails with "Missing environment variable"
- Make sure `BLOB_READ_WRITE_TOKEN` is set in Vercel project settings
- Redeploy after adding the environment variable

### Old templates not working
- Make sure the database migration was applied
- Check that PDF files exist in `public/pdf-templates/` for legacy templates

### New uploads not appearing
- Verify Blob storage is created in Vercel dashboard
- Check browser console for error messages
- Ensure file size is under 10MB and file type is PDF
