const core = require("@actions/core");
const github = require("@actions/github");
import { Octokit } from '@octokit/rest';

const REACTION_LIST = [
  "+1",
  "-1",
  "laugh",
  "hooray",
  "confused",
  "heart",
  "rocket",
  "eyes"
]

async function run() {
  try {
    const message = core.getInput('message');
    const reactions = core.getInput('reactions');
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

    if(reactions){
      const repo = process.env.GITHUB_REPOSITORY?.split('/');
      await addReactions(octokit, repo, new_comment.data.id, reactions)
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 * Add reactions on a comment
 * 
 * @param octokit 
 * @param repo 
 * @param commentId 
 * @param reactions 
 */
async function addReactions(octokit, repo, commentId, reactions){

  let ReactionsSet = [
    ...new Set(
      reactions
        .replace(/\s/g, "")
        .split("|")
        .filter((reaction) => {
          if (!REACTION_LIST.includes(reaction)) {
            return false;
          }
          return true;
        })
    ),
  ];

  if (!ReactionsSet) {
    return false;
  }

  let results = await Promise.all(
    ReactionsSet.map(async (reaction) => {
      await octokit.reactions.createForIssueComment({
        owner: repo[0],
        repo: repo[1],
        comment_id: commentId,
        content: reaction,
      });
    })
  );
}


run();