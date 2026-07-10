# Agent Instructions

- Always work in a git worktree for repository changes.
- Never make code changes directly in the main clone checkout.
- Create ticket/task branches in a separate worktree and leave the main clone untouched except for read-only inspection.

## Merge Command Convention

When the user says `merge`, perform the full local merge cleanup flow:

1. Review the active feature worktree status and commit the intended changes.
2. Run the relevant checks if they have not been run since the final edits.
3. Merge the feature branch into the main clone's `master` branch.
4. Remove the merged feature worktree.
5. Leave the main clone updated on `master` with a clean working tree.

Do not push to a remote unless the user explicitly asks for it.
