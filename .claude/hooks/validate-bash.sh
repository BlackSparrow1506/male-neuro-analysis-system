#!/usr/bin/env bash
# PreToolUse hook for the Bash tool.
# Reads a JSON payload on stdin: { "tool_name": "Bash", "tool_input": { "command": "..." } }
# Exit 0 = allow.  Exit 2 = block and surface stderr to the model.
# Pure bash + standard POSIX tools — no Python, no Node.

set -euo pipefail

payload="$(cat)"

# Extract the command field with sed (extended regex — works on BSD + GNU).
# Pattern: "command":"...."   accepting backslash-escaped quotes inside.
cmd="$(printf '%s' "$payload" \
  | sed -nE 's/.*"command"[[:space:]]*:[[:space:]]*"((\\.|[^"\\])*)".*/\1/p' \
  | sed 's/\\"/"/g; s/\\\\/\\/g')"

if [ -z "${cmd:-}" ]; then
  exit 0  # nothing to inspect — allow
fi

block() {
  echo "blocked by validate-bash.sh: $1" >&2
  exit 2
}

# --- Hard blocks ---------------------------------------------------------------

# Recursive root deletion.
case "$cmd" in
  *"rm -rf /"*|*"rm -rf /*"*|*"rm -rf ~"*|*"rm -rf \$HOME"*)
    block "destructive recursive delete";;
esac

# Force push to main / master.
echo "$cmd" | grep -Eq 'git[[:space:]]+push[[:space:]]+(--force|-f)([[:space:]]|=).*\b(main|master)\b' \
  && block "force-push to main/master"

# Hard reset on a tracked branch (allow only against safe refs explicitly approved).
echo "$cmd" | grep -Eq 'git[[:space:]]+reset[[:space:]]+--hard\b' \
  && block "git reset --hard — confirm with user first"

# Disabling commit hooks / signing without explicit approval.
echo "$cmd" | grep -Eq '\-\-no-verify\b|\-\-no-gpg-sign\b' \
  && block "skipping git hooks/signing requires explicit user approval"

# Editing the user's git identity.
echo "$cmd" | grep -Eq 'git[[:space:]]+config[[:space:]]+(--global[[:space:]]+)?user\.(name|email)\b' \
  && block "do not modify git user.name/email"

# Curl piped straight into a shell — common malware vector.
echo "$cmd" | grep -Eq '(curl|wget)[^|]*\|[[:space:]]*(sh|bash|zsh)\b' \
  && block "piping a network download into a shell"

# --- Soft warnings (allowed, just noted on stderr) -----------------------------

if echo "$cmd" | grep -Eq '\.env( |$)|\.env\.local'; then
  echo "note: command references a .env file — make sure no secrets are echoed" >&2
fi

exit 0
