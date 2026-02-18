
const contentful = require('contentful');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .reduce((acc, line) => {
        const [key, value] = line.split('=');
        acc[key.trim()] = value.trim();
        return acc;
    }, {});

async function testPreview() {
    const space = envConfig.CONTENTFUL_SPACE_ID || envConfig.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
    const previewToken = envConfig.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN;

    if (!previewToken) {
        console.error('Preview token not found in .env.local');
        return;
    }

    const client = contentful.createClient({
        space: space,
        accessToken: previewToken,
        host: 'preview.contentful.com'
    });

    try {
        console.log('Fetching entries from PREVIEW API...');
        const entries = await client.getEntries({
            content_type: 'blogPost',
            limit: 100
        });

        console.log('Total posts found (including drafts):', entries.total);
        entries.items.forEach(item => {
            console.log(`- Slug: ${item.fields.slug}`);
            console.log(`  Title: ${item.fields.title}`);
            console.log(`  Status: ${item.sys.publishedAt ? 'Published' : 'Draft/Changed'}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Preview fetch failed:', error.message);
    }
}

async function testCategoryFields() {
    const space = envConfig.CONTENTFUL_SPACE_ID || envConfig.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
    const accessToken = envConfig.CONTENTFUL_ACCESS_TOKEN || envConfig.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

    const client = contentful.createClient({
        space: space,
        accessToken: accessToken,
    });

    try {
        console.log('Fetching Category entries...');
        const entries = await client.getEntries({
            content_type: 'category',
            limit: 5
        });

        entries.items.forEach(item => {
            console.log(`\nCategory: ${item.fields.name || item.fields.title}`);
            console.log('Fields:', Object.keys(item.fields));
            console.log('Slug:', item.fields.slug);
            console.log('Description:', item.fields.description);
            // Check for icon or similar
            if (item.fields.icon) console.log('Icon:', item.fields.icon);
        });

    } catch (error) {
        console.error('Category field fetch failed:', error.message);
    }
}

testPreview();
testCategoryFields();
