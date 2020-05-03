"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const rest_1 = require("@octokit/rest");
const REACTION_LIST = [
    "+1",
    "-1",
    "laugh",
    "hooray",
    "confused",
    "heart",
    "rocket",
    "eyes"
];
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
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
            const octokit = new rest_1.Octokit({
                auth: github_token
            });
            const new_comment = yield octokit.issues.createComment(Object.assign(Object.assign({}, context.repo), { issue_number: pull_request_number, body: message }));
            ;
            if (reactions) {
                const repo = (_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.split('/');
                yield addReactions(octokit, repo, new_comment.data.id, reactions);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function addReactions(octokit, repo, commentId, reactions) {
    return __awaiter(this, void 0, void 0, function* () {
        let ReactionsSet = [
            ...new Set(reactions
                .replace(/\s/g, "")
                .split("|")
                .filter((reaction) => {
                if (!REACTION_LIST.includes(reaction)) {
                    return false;
                }
                return true;
            })),
        ];
        if (!ReactionsSet) {
            return false;
        }
        let results = yield Promise.all(ReactionsSet.map((reaction) => __awaiter(this, void 0, void 0, function* () {
            yield octokit.reactions.createForIssueComment({
                owner: repo[0],
                repo: repo[1],
                comment_id: commentId,
                content: reaction,
            });
        })));
    });
}
run();
