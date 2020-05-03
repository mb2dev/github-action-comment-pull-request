const core = require("@actions/core");
const github = require("@actions/github");
import { Octokit } from '@octokit/rest';


async function run() {
  try {
    const message = core.getInput('message');
    const github_token = core.getInput('GITHUB_TOKEN');

    const context = github.context;
    if (context.payload.pull_request == null) {
        core.setFailed('No pull request found.');
        return;
    }
    const pull_request_number = context.payload.pull_request.number;

    const octokit = new Octokit({
      auth: github_token
    });

    // Create a new Comment
    const new_comment  = await octokit.issues.createComment({
        ...context.repo,
        issue_number: pull_request_number,
        body: message
      });
    ;  


  } catch (error) {
    core.setFailed(error.message);
  }
}


run();