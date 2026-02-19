/**
 * Outreach Email Templates
 * Modelos para automação de contato/networking
 */

export const OutreachTemplates = {
    GUEST_POST_PITCH: (targetName: string, topic: string) => `
Hi ${targetName},

I've been following your work at ${topic} for a while and really enjoyed your latest piece on crypto trends.

I'm reaching out because I'd love to contribute a high-quality guest post to your blog. I have an idea for an article titled "The Future of Web3: Beyond the Hype" which I think your readers would find very valuable.

We currently reach 50k+ readers at TheCryptoStart and would be happy to cross-promote.

Would you be open to a pitch?

Best,
TheCryptoStart Team
  `,

    BROKEN_LINK_NOTICE: (targetName: string, brokenUrl: string, replacementUrl: string) => `
Hi ${targetName},

I was reading your article about blockchain basics and noticed that one of the links leads to a 404 page (${brokenUrl}).

If you're looking for a replacement, we have a comprehensive, up-to-date guide on that exact topic here: ${replacementUrl}

Just wanted to help you keep your content top-notch!

Cheers,
TheCryptoStart Editor
  `
}
