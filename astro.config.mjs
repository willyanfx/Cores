// @ts-check
import { defineConfig } from 'astro/config';

// On GitHub Actions, GITHUB_REPOSITORY is "owner/repo". Project pages are served
// from https://owner.github.io/repo/, so derive site + base from it.
// A repo named "owner.github.io" is a user site served from the root.
const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const isUserSite = repo && repo.toLowerCase() === `${owner?.toLowerCase()}.github.io`;

export default defineConfig({
  site: owner ? `https://${owner}.github.io` : 'http://localhost:4321',
  base: repo && !isUserSite ? `/${repo}` : '/',
  trailingSlash: 'ignore',
});
