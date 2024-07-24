const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    const notifyUrl = core.getInput('notifyUrl');
    const text = core.getInput('text');

    axios.post(notifyUrl, {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: text,
            },
          },
        ],
      });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();