const PRODUCTIVE_DOMAINS = [
  'github.com', 'stackoverflow.com', 'leetcode.com', 'codecademy.com',
  'coursera.org', 'udemy.com', 'docs.google.com', 'notion.so', 'linkedin.com',
  'geeksforgeeks.org', 'hackerrank.com', 'kaggle.com'
];

const UNPRODUCTIVE_DOMAINS = [
  'youtube.com', 'instagram.com', 'facebook.com', 'twitter.com', 'reddit.com',
  'netflix.com', 'tiktok.com', 'snapchat.com', 'whatsapp.web.com', 'twitch.tv',
  'pinterest.com', 'tumblr.com'
];

function classifyDomain(domain) {
  if (!domain) {
    return 'neutral';
  }

  const normalized = domain.toLowerCase();

  if (PRODUCTIVE_DOMAINS.some(item => normalized === item || normalized.endsWith('.' + item))) {
    return 'productive';
  }

  if (UNPRODUCTIVE_DOMAINS.some(item => normalized === item || normalized.endsWith('.' + item))) {
    return 'unproductive';
  }

  return 'neutral';
}

module.exports = {
  classifyDomain,
  PRODUCTIVE_DOMAINS,
  UNPRODUCTIVE_DOMAINS
};
