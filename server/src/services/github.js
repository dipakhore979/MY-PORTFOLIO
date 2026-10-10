const API = 'https://api.github.com';

const requestHeaders = (token) => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-api',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token && { Authorization: `Bearer ${token}` }),
});

const getJson = async (url, token) => {
  const res = await fetch(url, { headers: requestHeaders(token), signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    const error = new Error(`GitHub responded with ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
};

/**
 * Public numbers for the GitHub section: repos, stars, followers and language share.
 * Forks are left out of stars and languages so they reflect the owner's own work.
 */
export const fetchGithubSummary = async (username, token) => {
  const name = encodeURIComponent(username);

  const [user, repos] = await Promise.all([
    getJson(`${API}/users/${name}`, token),
    getJson(`${API}/users/${name}/repos?per_page=100&sort=pushed&type=owner`, token),
  ]);

  const own = repos.filter((repo) => !repo.fork);
  const stars = own.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

  // One request per repo (newest 30): a single failure must not break the whole section
  const results = await Promise.allSettled(
    own
      .slice(0, 30)
      .map((repo) => getJson(`${API}/repos/${name}/${encodeURIComponent(repo.name)}/languages`, token)),
  );

  const bytes = {};
  results.forEach((result) => {
    if (result.status !== 'fulfilled') return;
    Object.entries(result.value).forEach(([language, count]) => {
      bytes[language] = (bytes[language] || 0) + count;
    });
  });

  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  const languages = Object.entries(bytes)
    .sort((a, b) => b[1] - a[1])
    .map(([language, count]) => ({
      name: language,
      percent: total ? Math.round((count / total) * 1000) / 10 : 0,
    }));

  return {
    username,
    url: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    stars,
    languageCount: languages.length,
    languages: languages.slice(0, 6),
    fetchedAt: new Date().toISOString(),
  };
};
