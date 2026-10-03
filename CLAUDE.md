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

## Changelog and README: keep them current

Every change that reaches the app gets an entry in `CHANGELOG.md` under
"Unreleased" (newest on top, plain German, what changes for users, with date
and PR number). In the same PR, update `README.md`: new features go under
"Was RetroMind kann", new ideas under "Ideen und offene Punkte" at the very
bottom (sorted into Muss / Sollte / Könnte), and ideas that got built are
removed from that list.

## Feedback

Feedback from the app is stored in `feedback.md` (status "offen"). It only
goes into the README's "### To Do" list after Marco approves it, through the
link in the feedback mail (or when he says so in chat). Never copy open
feedback into the README on your own. When a To Do gets built, remove it from
the README and mention it in the CHANGELOG.

## Removed content

UI parts or assets that are removed from the app are moved into
`_removed_content/` (with a line in its README) instead of being deleted.
