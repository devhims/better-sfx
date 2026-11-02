// The Better SFX License. Single source for the /license/ page,
// dist/license.txt, llms.txt and the agent skill's summary.
export const LICENSE_VERSION = '1.0';
export const LICENSE_DATE = '2026-11-02';
export const LICENSE_SUMMARY = 'Free and royalty-free for personal and commercial use. No credit required. Do not resell or redistribute the sounds on their own.';

export function licenseSections({ total, codeCount, recCount }) {
  return [
    ['Pricing', [
      'Better SFX is free. There is no price, no account, no subscription and no API key.',
    ]],
    ['You can', [
      'Use any Better SFX sound in personal and commercial work, including apps, websites, games, videos, films, ads, podcasts, streams, presentations and client projects.',
      'Include the sounds inside your app, game, template, website or open-source project.',
      'Edit, trim, layer, pitch or otherwise change the sounds.',
      'Use them without crediting Better SFX. A credit is welcome but never required.',
      'Use them forever, anywhere in the world, with no royalties or per-use fees.',
    ]],
    ['You cannot', [
      'Sell, share or give away the sounds on their own or as a collection, for example as a sound pack, a sound-effects library or on another sound-effects website. The sounds must be part of something you made.',
      'Register the sounds, or work made mainly of them, with YouTube Content ID or any other rights-management system, or claim that you own them.',
    ]],
    ['Small print', [
      'The sounds are provided as they are, with no warranty. video2ctx is not liable for how you use them.',
      `${codeCount} of the ${total} sounds are made in code by video2ctx. ${recCount} are recordings generated with Higgsfield Seed Audio 1.0. Higgsfield does not claim ownership of generated output and does not restrict its commercial use (Higgsfield Terms of Use, section 4.4).`,
      'video2ctx may publish a new version of this license. A sound you downloaded under this version stays usable under this version.',
    ]],
  ];
}

export function licenseText(counts) {
  return `Better SFX License ${LICENSE_VERSION} (${LICENSE_DATE})

${LICENSE_SUMMARY}

${licenseSections(counts).map(([h, items]) => `${h}\n${items.map((i) => `- ${i}`).join('\n')}`).join('\n\n')}
`;
}
