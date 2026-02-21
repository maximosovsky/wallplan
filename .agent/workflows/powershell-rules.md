---
description: PowerShell command rules
---
# PowerShell Rules

// turbo-all

1. **NEVER use `&&` to chain commands** — it is not a valid operator in this PowerShell version.
2. Use `;` as a separator between commands, or run them as separate `run_command` calls.
3. Example: instead of `git add -A && git commit`, use `git add -A; git commit` or two separate commands.
