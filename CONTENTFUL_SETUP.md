# Contentful Setup Guide

## Step 1: Create Contentful Space

1. Go to https://app.contentful.com
2. Sign up or log in
3. Click "Create space"
4. Name it: "Crypto Academy Blog"
5. Choose: "Free" plan (up to 5,000 records)

## Step 2: Create Content Model

1. Go to "Content Model" tab
2. Click "Add content type"
3. Name: `BlogPost`
4. Add fields:

### Fields:
- **Title** (Text, Short text, Required)
- **Slug** (Text, Short text, Required, Unique)
- **Description** (Text, Long text, Required)
- **Category** (Text, Short text, Required)
- **Content** (Rich Text, Required)
- **Featured Image** (Media, One file)
- **Reading Time** (Number, Integer)
- **Tags** (Tags, Short text)
- **Published Date** (Date & Time, Required)

## Step 3: Get API Keys

1. Go to "Settings" → "API keys"
2. Click "Add API key"
3. Name: "Crypto Academy Production"
4. Save and copy:
   - **Space ID**
   - **Content Delivery API - access token**
5. Create preview token (optional):
   - "Add API key" → Name: "Preview Token"
   - Copy **Preview API access token**

## Step 4: Configure Environment Variables

```bash
# Copy example env
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

Update:
```env
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id_here
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_cda_token_here
NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_preview_token_here
```

## Step 5: Test Connection

```bash
npm run dev
```

Visit: http://localhost:3000

If working, you should see blog posts from Contentful.

## Step 6: Create Your First Post

1. Go to "Content" tab in Contentful
2. Click "BlogPost"
3. "Add entry"
4. Fill fields:
   - **Title**: "Welcome to Crypto Academy"
   - **Slug**: "welcome-to-crypto-academy"
   - **Description**: "Your first crypto blog post..."
   - **Category**: "bitcoin"
   - **Content**: [Write your content]
   - **Reading Time**: 5
   - **Tags**: bitcoin, welcome, tutorial
   - **Published Date**: [Select today]
5. "Publish"

## Troubleshooting

**Error: "Space not found"**
- Check NEXT_PUBLIC_CONTENTFUL_SPACE_ID matches your space

**Error: "Access token invalid"**
- Regenerate token in Contentful settings
- Check no extra spaces in .env.local

**Posts not showing**
- Verify posts are "Published" (not just "Drafts")
- Check Content Model field names match code

## Resources

- Contentful Docs: https://www.contentful.com/developers/docs/
- Rich Text Rendering: https://www.contentful.com/developers/docs/javascript/tutorials/using-the-contentful-javascript-library-with-react/
