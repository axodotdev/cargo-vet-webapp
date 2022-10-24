// @ts-check

import { createNodeMiddleware, createProbot } from "probot";

function app(app) {
  app.on("check_run.completed", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    console.log(context);
    await context.octokit.issues.createComment(issueComment);
  });
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}

export default createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/github/webhook",
});
