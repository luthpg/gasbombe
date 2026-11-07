# TypeScript + AppsScript (CiderJS)

This template provides a minimal setup to get TypeScript working for an Apps Script Backend with CiderJS utilities, scaffolded by [Gasbombe](https://ciderlabs.link/docs/gasbombe).

Currently, these plugins and tools are configured:

- [@ciderjs/vitest-plugin-gas-mock](https://github.com/luthpg/vitest-plugin-gas-mock) for GAS API Mocking in Vitest
- [rolldown](https://github.com/rolldown/rolldown) for transpiling TypeScript files and bundling server-side files

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:7f850572a1f8a3dc8811e487b2eb8af1e9209c42ab9ceffe0f607fd1917aaf94 -->

## Using Clasp authentication in CI/CD workflow with @ciderjs/clasp-auth

Create the workflow below in the generated project's repository; pushing a Version Tag alone does not configure deployment.

1. Install dependencies with `pnpm install` and commit the generated `pnpm-lock.yaml`.
2. Run `pnpm exec clasp login` and `gh auth login`. Ensure the project's `.clasp.json` points to the intended Apps Script project and uses `dist` as its `rootDir`.
3. Run `pnpm run auth repoOwner/repoName` from the project directory, replacing `repoOwner/repoName` with your GitHub repository. This uploads the following repository Actions Secrets:
   - `CLASPRC_JSON`: Base64-encoded contents of `~/.clasprc.json` (Clasp credentials).
   - `CLASP_JSON`: Base64-encoded contents of `.clasp.json` (project configuration; the file must exist before uploading).
4. Add `.github/workflows/deploy.yml` with the following content and commit it with your code:

```yaml
name: Deploy Apps Script
on:
  push:
    tags: ["v*"]
permissions:
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
        with:
          version: 11.24.0
      - uses: actions/setup-node@v5
        with:
          node-version: "24"
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - name: Restore Clasp configuration
        env:
          CLASPRC_JSON: ${{ secrets.CLASPRC_JSON }}
          CLASP_JSON: ${{ secrets.CLASP_JSON }}
        run: |
          umask 077
          printf '%s' "$CLASPRC_JSON" | base64 --decode > "$HOME/.clasprc.json"
          printf '%s' "$CLASP_JSON" | base64 --decode > .clasp.json
      - run: pnpm run push
      - run: pnpm run deploy
      - name: Clean up Clasp configuration
        if: always()
        run: rm -f "$HOME/.clasprc.json" .clasp.json
```

1. Push the committed code and a matching tag, for example `git tag v0.1.0` followed by `git push origin v0.1.0`. The workflow builds the project, pushes it to Apps Script, and creates a deployment.

To update an existing deployment, replace the `pnpm run deploy` step with the following step and add a repository Actions Secret named `GAS_DEPLOYMENT_ID` containing the existing deployment ID. The `update` script updates that deployment; `deploy` creates a new one on each run.

```yaml
      - run: pnpm run update
        env:
          GAS_DEPLOYMENT_ID: ${{ secrets.GAS_DEPLOYMENT_ID }}
```

<!-- /coderabbit-ai-generated:v1 -->

## Documentation

- [Gasbombe Official Reference](https://ciderlabs.link/docs/gasbombe)
