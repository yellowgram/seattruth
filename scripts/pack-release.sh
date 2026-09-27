#!/usr/bin/env bash
# Build a deterministic SeatTruth source zip from the committed HEAD.
#
# Commit source and docs first. This script archives that HEAD, then writes
# release/seattruth-<version>.zip and docs/CHECKSUMS.md. Those two paths are
# omitted from the archive, so committing them does not change the digest.
# A dirty tree is refused except for those two paths.
set -euo pipefail

cd "$(dirname "$0")/.."

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "pack-release: not a git checkout" >&2
  exit 1
fi

version="$(python3 -c 'import json; print(json.load(open("package.json"))["version"])')"
private="$(python3 -c 'import json; print(json.load(open("package.json"))["private"])')"
if [[ "$private" != "True" ]]; then
  echo "pack-release: package.json private must stay true" >&2
  exit 1
fi
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "pack-release: unexpected version ${version}" >&2
  exit 1
fi

name="seattruth-${version}"
zip_rel="release/${name}.zip"
checksum_rel="docs/CHECKSUMS.md"
tmp="${zip_rel}.tmp"
mtime="2026-09-26T00:00:00Z"
comment="${name}"

rm -f "$tmp"

dirty=0
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  path="${line:3}"
  if [[ "$path" == *" -> "* ]]; then
    path="${path##* -> }"
  fi
  case "$path" in
    "$checksum_rel"|"$zip_rel") ;;
    *)
      echo "pack-release: dirty path not allowed: ${path}" >&2
      dirty=1
      ;;
  esac
done < <(git status --porcelain --untracked-files=all)

if [[ "$dirty" -ne 0 ]]; then
  echo "pack-release: commit source first. Only ${checksum_rel} and ${zip_rel} may be dirty." >&2
  exit 1
fi

mkdir -p release docs

# git archive's default zip comment is the commit id. The comment is replaced
# below so two commits with the same archived bytes keep one digest.
git archive \
  --format=zip \
  --prefix="${name}/" \
  --mtime="${mtime}" \
  --output="${tmp}" \
  HEAD \
  -- \
  . \
  ':(exclude)node_modules' \
  ':(exclude).env' \
  ':(exclude).env.local' \
  ':(exclude).git' \
  ':(exclude)release' \
  ':(exclude)docs/CHECKSUMS.md' \
  ':(exclude)mapping.yaml' \
  ':(exclude)dist' \
  ':(exclude)dumps' \
  ':(exclude,glob)*.dump' \
  ':(exclude,glob)*.sql'

python3 - "$tmp" "$comment" "$name" <<'PY'
import sys
import zipfile

path, comment, name = sys.argv[1], sys.argv[2], sys.argv[3]
prefix = name + "/"
with zipfile.ZipFile(path, "a") as zf:
    zf.comment = comment.encode("utf-8")

with zipfile.ZipFile(path) as zf:
    if zf.comment != comment.encode("utf-8"):
        raise SystemExit(f"pack-release: zip comment is {zf.comment!r}")
    names = zf.namelist()
    bad = []
    for info in names:
        rel = info[len(prefix):] if info.startswith(prefix) else info
        base = rel.rstrip("/")
        if base in {".env", ".env.local", "mapping.yaml", "docs/CHECKSUMS.md"}:
            bad.append(info)
        if base == "node_modules" or base.startswith("node_modules/") or base == ".git" or base.startswith(".git/"):
            bad.append(info)
        if base == "release" or base.startswith("release/") or base == "dist" or base.startswith("dist/"):
            bad.append(info)
        if base == "dumps" or base.startswith("dumps/") or base.endswith(".dump") or base.endswith(".sql"):
            bad.append(info)
    if bad:
        raise SystemExit("pack-release: zip contains omitted paths:\n" + "\n".join(bad))
    required = [prefix + ".env.example", prefix + "mapping.example.yaml"]
    missing = [item for item in required if item not in names]
    if missing:
        raise SystemExit("pack-release: zip missing " + ", ".join(missing))
PY

mv "$tmp" "$zip_rel"

hex="$(sha256sum "$zip_rel" | awk '{print tolower($1)}')"
if [[ ! "$hex" =~ ^[0-9a-f]{64}$ ]]; then
  echo "pack-release: bad sha256" >&2
  exit 1
fi

# Keep checksum lines for older zips. Never rewrite those zip bytes.
preserved=""
while IFS= read -r old; do
  [[ "$old" == "$zip_rel" ]] && continue
  old_hex="$(sha256sum "$old" | awk '{print tolower($1)}')"
  if [[ ! "$old_hex" =~ ^[0-9a-f]{64}$ ]]; then
    echo "pack-release: bad sha256 for ${old}" >&2
    exit 1
  fi
  preserved+="${old_hex}  ${old}"$'\n'
done < <(find release -maxdepth 1 -type f -name 'seattruth-*.zip' | sort)

cat > "$checksum_rel" <<EOF
# Checksums

SHA-256 of each versioned zip, lowercase hex of the zip bytes. \`npm run pack:release\` writes the current package version first and keeps lines for older \`release/seattruth-*.zip\` files still in the tree. Do not edit the hex by hand. Do not rewrite an older zip. [POLAR_DELIVERABLES.md](POLAR_DELIVERABLES.md) points here and does not copy the hex.

\`\`\`
${hex}  ${zip_rel}
${preserved}\`\`\`
EOF

echo "pack-release: wrote ${zip_rel}"
echo "pack-release: ${hex}  ${zip_rel}"
