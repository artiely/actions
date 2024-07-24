const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

async function run() {
  try {
    const token = core.getInput('token');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const tag = core.getInput('tag');
    const filePatterns = core.getInput('files').split('\n').map(pattern => pattern.trim());

    const octokit = github.getOctokit(token);

    async function createRelease() {
      // Check if the release already exists
      try {
        await octokit.rest.repos.getReleaseByTag({
          owner,
          repo,
          tag,
        });
        console.log(`Release with tag ${tag} already exists.`);
      } catch (error) {
        if (error.status === 404) {
          // Create a new release
          const release = await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: tag,
            name: `Release ${tag}`,
          });
          console.log(`Created release with tag ${tag}.`);
        } else {
          throw error;
        }
      }
    }

    async function uploadAssets() {
      const { data: release } = await octokit.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag,
      });

      for (const pattern of filePatterns) {
        const files = glob.sync(pattern);
        for (const file of files) {
          const fileData = fs.readFileSync(file);
          await octokit.rest.repos.uploadReleaseAsset({
            owner,
            repo,
            release_id: release.id,
            name: path.basename(file),
            data: fileData,
          });
          console.log(`Uploaded ${file} to release ${tag}.`);
        }
      }
    }

    await createRelease();
    await uploadAssets();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();