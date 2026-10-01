// One source for the work page list, its detail panes and the prompt's `cat <case>` command.
export interface CaseBarRow { k: string; v: string; pct: number }
export interface CaseStudy {
  slug: string;
  name: string;
  hint: string;
  industry: string;
  term: string;
  stats: { num: string; lbl: string }[];
  compare?: { caption: string; rows: CaseBarRow[] };
  story: string;
  site?: { href: string; label: string };
}

export const CASES: CaseStudy[] = [
  {
    slug: 'blink',
    name: 'blink',
    hint: '92% AI mode visibility',
    industry: 'employee experience platform',
    term: 'ongoing',
    stats: [
      { num: '92%', lbl: 'google AI mode visibility' },
      { num: '73.3%', lbl: 'average LLM visibility' },
      { num: '1,300+', lbl: 'top-3 keywords' },
      { num: '10', lbl: '#1 positions' },
    ],
    compare: {
      caption: 'google AI mode visibility, 0 to 100%',
      rows: [
        { k: 'from', v: '66.6%', pct: 66.6 },
        { k: 'to', v: '92%', pct: 92 },
      ],
    },
    story: "the AI search story. blink's intranet software page has 10 #1 positions, and we pushed their google AI mode visibility from 66.6% to 92%. doesn't matter if someone's searching google, asking chatgpt, or using perplexity. blink shows up.",
    site: { href: 'https://joinblink.com/', label: 'joinblink.com' },
  },
  {
    slug: 'onboard',
    name: 'onboard',
    hint: '+337% organic traffic',
    industry: 'board management software',
    term: '3 years (ongoing)',
    stats: [
      { num: '+337%', lbl: 'organic traffic' },
      { num: '+4,402', lbl: 'page 1 keywords' },
      { num: '+1,311', lbl: 'top 3 rankings' },
      { num: '+69', lbl: 'DR' },
    ],
    story: 'our longest client relationship. 3 years and counting. they had the authority but couldn\'t rank for the terms that actually close deals. now they\'re #1 for "meeting minutes software" and "board portal," and showing up in google AI overviews.',
    site: { href: 'https://onboardmeetings.com/', label: 'onboardmeetings.com' },
  },
  {
    slug: 'form-health',
    name: 'form health',
    hint: '24K to 94K organic',
    industry: 'telehealth obesity medicine',
    term: 'ongoing',
    stats: [
      { num: '+292%', lbl: 'organic traffic' },
      { num: '+1,192%', lbl: 'top-3 expansion' },
    ],
    compare: {
      caption: 'organic traffic, 0 to 100K',
      rows: [
        { k: 'from', v: '24K', pct: 24 },
        { k: 'to', v: '94K', pct: 94 },
      ],
    },
    story: 'ashton kutcher-backed, $60M funded. the GLP-1 medication space was exploding and we had the content strategy live before competitors caught on. 24K to 94K organic in under a year.',
    site: { href: 'https://www.formhealth.co/', label: 'formhealth.co' },
  },
  {
    slug: 'chamber',
    name: 'chamber of commerce',
    hint: '+363% organic traffic',
    industry: 'B2B directory',
    term: 'legacy site turnaround',
    stats: [
      { num: '+363%', lbl: 'organic traffic' },
      { num: '+$429K', lbl: 'estimated site value' },
    ],
    story: 'one of the largest business directories in the US. massive authority, underperforming results. I ran outreach across press releases, broken links, and resource pages. pure link building, no content.',
  },
  {
    slug: 'bigcommerce',
    name: 'bigcommerce',
    hint: '426K to 502K daily',
    industry: 'e-commerce platform',
    term: '2018 (at agency)',
    stats: [{ num: '+17.8%', lbl: 'organic growth at scale' }],
    compare: {
      caption: 'daily organic, 0 to 520K',
      rows: [
        { k: 'from', v: '426K', pct: 81.9 },
        { k: 'to', v: '502K', pct: 96.5 },
      ],
    },
    story: "early agency work at organic growth marketing. bigcommerce was pre-IPO. they'd go on to have the biggest first-day pop of 2020 (+201%). 60,000+ merchants, sony and toyota among them.",
    site: { href: 'https://www.bigcommerce.com/', label: 'bigcommerce.com' },
  },
  {
    slug: 'remote',
    name: 'remote',
    hint: '+74,334 ranking keywords',
    industry: 'global workforce platform',
    term: '1 year',
    stats: [
      { num: '+74,334', lbl: 'ranking keywords' },
      { num: '+6,338', lbl: 'page 1' },
      { num: '+1,695', lbl: 'top 3' },
    ],
    story: 'the most competitive HRIS space online. deel and oyster already dominated the obvious angles. we found the gaps. some individual pages hit 2,980% traffic spikes.',
  },
];
