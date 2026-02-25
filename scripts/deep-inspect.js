
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
            include: 2, // Garantir que as referencias (imagens, autor) sejam carregadas
            'fields.title[match]': 'Best Crypto Exchanges'
        });

        if (entries.items.length > 0) {
            const post = entries.items[0];
            const fields = post.fields;
            console.log('--- POST ENCONTRADO ---');
            console.log('Title:', fields.title);
            console.log('Slug:', fields.slug);

            console.log('\n--- VERIFICANDO CONTEÚDO ---');
            console.log('Tem fields.content?', !!fields.content);
            if (fields.content) console.log('Tipo do content:', fields.content.nodeType);

            console.log('Tem fields.body?', !!fields.body);
            if (fields.body) console.log('Tipo do body:', fields.body.nodeType);

            console.log('\n--- VERIFICANDO IMAGEM DE DESTAQUE ---');
            if (fields.featuredImage) {
                console.log('featuredImage fields:', JSON.stringify(fields.featuredImage.fields, null, 2));
            } else {
                console.log('featuredImage não encontrado!');
                // Vamos ver se existe um 'seoImage' ou 'heroImage' ou 'image'
                const imgFields = Object.keys(fields).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('pic') || k.toLowerCase().includes('cover'));
                console.log('Outros campos que parecem imagens:', imgFields);
            }

        } else {
            console.log('Post não encontrado.');
        }
    } catch (e) {
        console.error('Erro:', e.message);
    }
}

test();
