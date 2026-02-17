
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

async function testNestedQuery() {
    const space = envConfig.CONTENTFUL_SPACE_ID || envConfig.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
    const accessToken = envConfig.CONTENTFUL_ACCESS_TOKEN || envConfig.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

    const client = contentful.createClient({
        space: space,
        accessToken: accessToken,
    });

    const categorySlug = 'crypto-opportunities';

    console.log('Testing nested query for category slug:', categorySlug);

    try {
        // Attempt 3: Nested fields with content type reference
        console.log('\nAttempt 3: Complete nested query');
        const response3 = await client.getEntries({
            content_type: 'blogPost',
            'fields.category.sys.contentType.sys.id': 'category',
            'fields.category.fields.slug': categorySlug,
            limit: 1
        });
        console.log('Result 3 total:', response3.total);

    } catch (error) {
        console.error('Attempt 3 failed:', error.message);
    }
}

testNestedQuery();
