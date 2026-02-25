
const fs = require('fs');
const contentful = require('contentful');
require('dotenv').config({ path: '.env.local' });

const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master',
});

async function test() {
    try {
        const entries = await client.getEntries({
            content_type: 'blogPost',
            limit: 1,
            include: 2,
            'fields.title[match]': 'Best Crypto Exchanges'
        });

        if (entries.items.length > 0) {
            fs.writeFileSync('post-dump.json', JSON.stringify(entries.items[0], null, 2));
            console.log('Post salvo em post-dump.json');
        } else {
            console.log('Post não encontrado');
        }
    } catch (e) {
        console.error(e);
    }
}

test();
