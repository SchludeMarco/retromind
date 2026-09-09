# Working conventions for this repo

## Pull requests: always merge

When Claude Code opens a pull request against this repo (in any session/chat)
and it is green — CI passing, no merge conflicts, no unresolved review
comments blocking it — merge it. Don't leave it open waiting for a separate
"please merge" message. This applies generally, across all future sessions,
not just a one-off approval for a single PR.

If a PR is not mergeable (red CI, conflicts, or open review feedback that
needs a human decision), resolve what can be resolved automatically and, if
something still requires a human call, ask before merging rather than
merging with unresolved problems.
