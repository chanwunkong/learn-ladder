#!/bin/bash
# 後中化學：建置 → 三組測試 → commit → push → 複製 Artifact 預覽檔。用法：bash tests/chem/publish.sh "commit 訊息"
set -e
cd "$(dirname "$0")/../.."
python3 build.py >/dev/null
node tests/chem/chem.test.js >/dev/null
node tests/chem/stereo.test.js >/dev/null
node tests/chem/qid.test.js || exit 1
out=$(bash tests/chem/smoke.sh 2>&1) || { echo "$out" | grep -v "^ok"; exit 1; }
echo "$out" | grep -c "^ok" | xargs echo "smoke ok:"
git add -A
git commit -qm "$1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -q origin main
cp dist/chem.html "${ARTIFACT_COPY:-/private/tmp/claude-501/-Users-martini/e23d4fdb-6552-455c-ae1e-92c868e63832/scratchpad/chem/index.html}"
git log --oneline -1
