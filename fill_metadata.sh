#!/usr/bin/env bash
# fill_metadata.sh — complete the remaining Squarespace JSON metadata files.
# Uses single fresh curl attempts (which reliably get 200) with a 20s settle
# only on a 403, avoiding the rapid-retry "tainting" that caused long stalls.
set -uo pipefail
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
ARCHIVE="./archive"; METADATA_DIR="${ARCHIVE}/metadata"; LOG_DIR="${ARCHIVE}/logs"
host="nepalrobotics.squarespace.com"
mkdir -p "$METADATA_DIR"

# Build the to-do list (pages with no valid metadata file), using the exact
# same safe-name mapping as archive_site.sh.
python3 - "$LOG_DIR/pages.txt" "$METADATA_DIR" "$host" > "$LOG_DIR/meta_todo.tsv" <<'PY'
import re, sys, pathlib
pages_file, meta_dir, host = sys.argv[1], pathlib.Path(sys.argv[2]), sys.argv[3]
pages=[l for l in pathlib.Path(pages_file).read_text().splitlines() if l.strip()]
def safe_name(pg):
    path=pg.replace(f'https://{host}','').lstrip('/')
    if not path: path='index'
    s=path.replace('/','__')
    s=''.join(c for c in s if c.isalnum() or c in '._-')
    s=s or 'index'
    import hashlib
    h=hashlib.sha1(pg.encode()).hexdigest()[:8]
    return f'{s}__{h}'
rows=[]
for pg in pages:
    sn=safe_name(pg)
    f=meta_dir/f'{sn}.json'
    if f.exists() and f.stat().st_size>0: continue
    rows.append((pg, f'{sn}.json'))
import sys as _s
_s.stdout.write('\n'.join(f'{u}\t{r}' for u,r in rows)+('\n' if rows else ''))
PY

TODO=$(wc -l < "$LOG_DIR/meta_todo.tsv" | tr -d ' ')
echo "metadata to fetch: $TODO"
ok=0; fail=0; faillist=""
while IFS=$'\t' read -r page rel; do
  [ -z "$page" ] && continue
  out="$METADATA_DIR/$rel"
  [ -s "$out" ] && { ok=$((ok+1)); continue; }
  url="${page}?format=json-pretty"
  # single fresh attempt
  code=$(curl -sS -A "$UA" -w '%{http_code}' "$url" -o "$out.tmp" 2>/dev/null || echo 000)
  if [ "$code" = "200" ] && [ -s "$out.tmp" ]; then
    mv "$out.tmp" "$out"; ok=$((ok+1))
  else
    rm -f "$out.tmp"
    # one settle + retry (fresh attempt after cool-down)
    sleep 20
    code=$(curl -sS -A "$UA" -w '%{http_code}' "$url" -o "$out.tmp" 2>/dev/null || echo 000)
    if [ "$code" = "200" ] && [ -s "$out.tmp" ]; then
      mv "$out.tmp" "$out"; ok=$((ok+1))
    else
      rm -f "$out.tmp"; fail=$((fail+1)); faillist="${faillist}\n  FAIL[$code] $page"
    fi
  fi
  sleep 0.8
done < "$LOG_DIR/meta_todo.tsv"
echo "metadata fill: $ok ok, $fail failed"
[ -n "$faillist" ] && printf '%b\n' "$faillist"
echo "total metadata files now: $(find "$METADATA_DIR" -name '*.json' | wc -l | tr -d ' ')"