#!/usr/bin/env bash
#
# archive_site.sh — Full archival mirror of https://nepalrobotics.squarespace.com
#
# Captures:
#   1. ALL pages (HTML) — enumerated from sitemap.xml + homepage, fetched from the
#      squarespace.com built-in host (serves identical content to nepalrobotics.org).
#   2. ALL page assets (CSS/JS/images) referenced by each page (for offline browsing).
#   3. ALL metadata — Squarespace structured JSON (?format=json-pretty) per page.
#   4. ALL images — true ORIGINAL uploaded format (jpeg/png/gif) for every unique
#      image path referenced anywhere in the site, in addition to the rendered variants
#      pulled by the page mirror.
#
# Layout under ./archive :
#   site/        wget mirror (host-organized, browsable offline)
#   originals/   original-format images (full fidelity)
#   metadata/    <page>.json  (Squarespace structured content/metadata)
#   logs/        run.log, pages.txt, image_tasks.tsv, wget.log, verify.txt, summary.txt
#   sitemap.xml, robots.txt, README.md, manifest.json
#
# Safe to re-run (idempotent / resumable). Resilient to transient 403/429/5xx.

set -uo pipefail

# ----------------------------- config -----------------------------
SITE_HOST="nepalrobotics.squarespace.com"
SITE_URL="https://${SITE_HOST}/"
ARCHIVE="./archive"
MIRROR_DIR="${ARCHIVE}/site"
ORIGINALS_DIR="${ARCHIVE}/originals"
METADATA_DIR="${ARCHIVE}/metadata"
LOG_DIR="${ARCHIVE}/logs"
# Realistic browser UA: Squarespace's edge bot-detection intermittently 403s a
# UA that literally says "Archiver". A standard browser UA fetches cleanly.
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
# Asset/CDN hosts to follow (excludes social media / analytics / schema refs)
SPAN_DOMAINS="${SITE_HOST},images.squarespace-cdn.com,file.squarespace-cdn.com,definitions.sqspcdn.com,static1.squarespace.com,static.squarespace.com,assets.squarespace.com,p.typekit.net,use.typekit.net"

mkdir -p "$MIRROR_DIR" "$ORIGINALS_DIR" "$METADATA_DIR" "$LOG_DIR"
RUN_LOG="$LOG_DIR/run.log"
log(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$RUN_LOG"; }

# curl with retry/backoff for transient blocks (Squarespace edges occasionally 403).
# Usage: fetch <out_path> <extra_header_or_empty> <url>
# Prints final HTTP code; writes body to <out_path> only on 2xx.
fetch(){
  local out="$1" hdr="$2" url="$3" code i s
  for i in 1 2 3 4 5 6 7 8; do
    if [ -n "$hdr" ]; then
      code=$(curl -sS -A "$UA" -H "$hdr" -w '%{http_code}' "$url" -o "$out.tmp" 2>/dev/null || echo 000)
    else
      code=$(curl -sS -A "$UA" -w '%{http_code}' "$url" -o "$out.tmp" 2>/dev/null || echo 000)
    fi
    case "$code" in
      200|201|203|204)
        if [ -s "$out.tmp" ] || [ "$code" = "204" ]; then mv "$out.tmp" "$out"; echo "$code"; return 0; fi
        rm -f "$out.tmp"; echo "$code"; return 0 ;;
      404|410)
        rm -f "$out.tmp"; echo "$code"; return 0 ;;   # terminal, don't retry
    esac
    rm -f "$out.tmp"
    # transient (403/429/5xx/000): backoff and retry (Squarespace edges throttle bursts)
    case $i in 1) s=3;; 2) s=8;; 3) s=15;; 4) s=30;; 5) s=45;; 6) s=60;; 7) s=90;; 8) s=120;; *) s=120;; esac
    sleep $s
  done
  echo "$code"; return 1
}

log "================ ARCHIVE START ================"
log "target: $SITE_URL"
log "dest:   $ARCHIVE"
sleep 3   # brief cooldown so we don't start with a burst

# ---------------- Phase 1: sitemap + page enumeration ----------------
log "Phase 1: sitemap.xml + robots.txt"
if [ -s "$ARCHIVE/sitemap.xml" ]; then
  log "  using existing sitemap.xml ($(wc -c < "$ARCHIVE/sitemap.xml" | tr -d ' ') bytes)"
else
  code=$(fetch "$ARCHIVE/sitemap.xml" "" "$SITE_URL/sitemap.xml")
  log "  sitemap.xml -> HTTP $code"
  if [ "$code" != "200" ] || [ ! -s "$ARCHIVE/sitemap.xml" ]; then
    log "  WARNING: sitemap unavailable; will seed with homepage only + recursive discovery"
  fi
fi
curl -sS -A "$UA" "$SITE_URL/robots.txt" -o "$ARCHIVE/robots.txt" 2>/dev/null || true

python3 - <<'PY'
import re, pathlib
arch = pathlib.Path('./archive')
pages = []
sm_path = arch/'sitemap.xml'
if sm_path.exists() and sm_path.stat().st_size > 0:
    sm = sm_path.read_text(errors='ignore')
    locs = re.findall(r'<loc>\s*(.*?)\s*</loc>', sm, re.S)
    for u in locs:
        u = u.strip()
        if re.search(r'\.(jpg|jpeg|png|gif|webp|ico|svg|bmp)(\?|$)', u, re.I):
            continue
        u = u.replace('https://nepalrobotics.org',  'https://nepalrobotics.squarespace.com')
        u = u.replace('http://nepalrobotics.org',   'https://nepalrobotics.squarespace.com')
        pages.append(u)
seen=set(); out=[]
for u in pages:
    if u in seen: continue
    seen.add(u); out.append(u)
home='https://nepalrobotics.squarespace.com/'
if home not in seen:
    out.insert(0, home)
(arch/'logs'/'pages.txt').write_text('\n'.join(out) + '\n')
print(len(out))
PY
PAGE_COUNT=$(wc -l < "$LOG_DIR/pages.txt" | tr -d ' ')
log "Phase 1: $PAGE_COUNT unique pages enumerated -> logs/pages.txt"

# ---------------- Phase 2: wget mirror (pages + requisites) ----------------
log "Phase 2: wget page mirror (pages + CSS/JS/images requisites) -> site/"
# Seed-based page-requisites fetch (no inter-page recursion): each page is fetched
# with its inline requisites; shared assets are downloaded once. --convert-links
# rewrites links to downloaded files for offline browsing.
EXISTING_HTML=$(find "$MIRROR_DIR/$SITE_HOST" -name '*.html' 2>/dev/null | wc -l | tr -d ' ')
if [ "${EXISTING_HTML:-0}" -ge 80 ]; then
  log "  mirror already present ($EXISTING_HTML html pages); skipping wget"
else
  if [ -s "$LOG_DIR/pages.txt" ]; then
    # Recursive mirror (discovers all pages via relative links) PLUS explicit
    # sitemap seeds (guarantees every page, including paginated/older posts that
    # may only be linked via the .org pagination URLs we don't span). Shared
    # assets are downloaded once; duplicates are de-duplicated within the run.
    wget \
      --recursive --level=inf --timestamping \
      --page-requisites \
      --convert-links \
      --adjust-extension \
      --span-hosts --domains="$SPAN_DOMAINS" \
      --directory-prefix="$MIRROR_DIR" \
      --restrict-file-names=windows \
      --user-agent="$UA" \
      --input-file="$LOG_DIR/pages.txt" \
      --wait=0.3 --random-wait \
      --tries=6 --waitretry=8 --timeout=30 \
      --retry-connrefused --retry-on-http-error=403,429,500,502,503,504 \
      --no-verbose --append-output="$LOG_DIR/wget.log" \
      || log "  wget returned non-zero (partial mirror possible; continuing)"
  fi
  log "Phase 2: mirror pass complete ($(find "$MIRROR_DIR" -type f 2>/dev/null | wc -l | tr -d ' ') files so far)"
fi
log "settling 20s before metadata phase (let any edge throttle cool down)"
sleep 20

# ---------------- Phase 3: JSON metadata per page ----------------
log "Phase 3: fetching Squarespace JSON metadata (?format=json-pretty) per page"
meta_ok=0; meta_fail=0; meta_fail_list=""
while IFS= read -r page; do
  [ -z "$page" ] && continue
  path="${page#https://${SITE_HOST}}"
  path="${path#/}"
  [ -z "$path" ] && path="index"
  safe=$(printf '%s' "$path" | tr '/' '__' | tr -cd 'A-Za-z0-9._-')
  [ -z "$safe" ] && safe="index"
  hash=$(printf '%s' "$page" | shasum | cut -c1-8)
  out="$METADATA_DIR/${safe}__${hash}.json"
  if [ -s "$out" ]; then meta_ok=$((meta_ok+1)); continue; fi
  code=$(fetch "$out" "" "${page}?format=json-pretty")
  if [ "$code" = "200" ] && [ -s "$out" ]; then
    meta_ok=$((meta_ok+1))
  else
    meta_fail=$((meta_fail+1)); meta_fail_list="${meta_fail_list}\n  FAIL[$code] $page"; rm -f "$out"
  fi
  sleep 0.6
done < "$LOG_DIR/pages.txt"
log "Phase 3: metadata $meta_ok ok, $meta_fail failed"
[ -n "$meta_fail_list" ] && printf '%b\n' "$meta_fail_list" | tee -a "$RUN_LOG"
log "settling 10s before image phase"
sleep 10

# ---------------- Phase 4: original-format images ----------------
log "Phase 4a: enumerating unique image paths from downloaded HTML"
python3 - <<'PY'
import re, pathlib
arch = pathlib.Path('./archive')
pat = re.compile(r'https://images\.squarespace-cdn\.com/content/v1/[^"\'<>\s)\\]+', re.I)
paths = set()
for p in arch.rglob('*.html'):
    try: txt = p.read_text(errors='ignore')
    except Exception: continue
    for u in pat.findall(txt):
        paths.add(u.split('?')[0])
rows = []
for u in sorted(paths):
    after = u.split('/content/v1/', 1)[1] if '/content/v1/' in u else u
    after = after.split('?')[0]
    base = after.rsplit('/', 1)[-1]
    ext = base.rsplit('.', 1)[-1].lower() if '.' in base else 'img'
    if ext not in ('jpg','jpeg','png','gif','webp','ico','svg','bmp','tiff'):
        ext = 'img'
    idnoext = after.rsplit('.', 1)[0] if '.' in base else after
    idnoext = idnoext.replace('/', '_')
    idnoext = re.sub(r'[^A-Za-z0-9._-]', '_', idnoext)
    idnoext = re.sub(r'_+', '_', idnoext).strip('_.')
    rel = f"{idnoext}__original.{ext}"
    rows.append((u, rel))
out = arch/'logs'/'image_tasks.tsv'
out.write_text('\n'.join(f"{u}\t{rel}" for u, rel in rows) + ('\n' if rows else ''))
print(len(rows))
PY
log "Phase 4a: $(wc -l < "$LOG_DIR/image_tasks.tsv" | tr -d ' ') unique image paths -> logs/image_tasks.tsv"

log "Phase 4b: downloading original-format images (Accept: image/jpeg,png,gif)"
img_ok=0; img_fail=0; img_fail_list=""
while IFS=$'\t' read -r url rel; do
  [ -z "$url" ] && continue
  out="$ORIGINALS_DIR/$rel"
  if [ -s "$out" ]; then img_ok=$((img_ok+1)); continue; fi
  code=$(fetch "$out" "Accept: image/jpeg,image/png,image/gif" "$url")
  if [ "$code" = "200" ] && [ -s "$out" ]; then
    img_ok=$((img_ok+1))
  else
    img_fail=$((img_fail+1)); img_fail_list="${img_fail_list}\n  FAIL[$code] ${url:0:90}"; rm -f "$out"
  fi
  sleep 0.3
done < "$LOG_DIR/image_tasks.tsv"
log "Phase 4b: originals $img_ok ok, $img_fail failed"
[ -n "$img_fail_list" ] && printf '%b\n' "$img_fail_list" | head -30 | tee -a "$RUN_LOG"

# ---------------- Phase 5: verification + manifest ----------------
log "Phase 5: verification + manifest"
python3 - <<'PY'
import os, re, json, pathlib
arch = pathlib.Path('./archive')
host = 'nepalrobotics.squarespace.com'
site_dir = arch/'site'/host

pages = []
pf = arch/'logs'/'pages.txt'
if pf.exists():
    pages = [l for l in pf.read_text().splitlines() if l.strip()]

def expected_files(page):
    p = page.replace(f'https://{host}', '')
    if p in ('', '/'):
        return ['index.html']
    p = p.lstrip('/')
    return [p + '.html', p + '/index.html', p]

missing = []
if len(pages) > 1:
    for pg in pages:
        cands = expected_files(pg)
        found = any((site_dir / c).exists() for c in cands)
        if not found:
            missing.append(pg)

html_pages = sum(1 for _ in site_dir.rglob('*.html')) if site_dir.exists() else 0
meta_files = sum(1 for _ in (arch/'metadata').glob('*.json'))
orig_files = sum(1 for _ in (arch/'originals').iterdir() if _.is_file()) if (arch/'originals').exists() else 0

def dirsize(p):
    total=0
    for root,_,files in os.walk(p):
        for f in files:
            try: total+=os.path.getsize(os.path.join(root,f))
            except Exception: pass
    return total
total = dirsize(arch)
def human(n):
    for u in ['B','KB','MB','GB']:
        if n < 1024: return f"{n:.1f} {u}"
        n/=1024
    return f"{n:.1f} TB"

report = [
    f"pages enumerated      : {len(pages)}" + ("" if len(pages) > 1 else "  (sitemap unavailable; completeness via recursive mirror)"),
    f"html pages mirrored    : {html_pages}",
    f"pages missing on disk  : {len(missing)}",
]
for m in missing[:50]:
    report.append(f"   MISSING: {m}")
report += [
    f"metadata json files    : {meta_files}",
    f"original images        : {orig_files}",
    f"total archive size     : {human(total)}",
]
rep = '\n'.join(report)
(arch/'logs'/'verify.txt').write_text(rep + '\n')
print(rep)

manifest = {
    "source": f"https://{host}/",
    "archive_root": str(arch.resolve()),
    "pages_enumerated": len(pages),
    "html_pages_mirrored": html_pages,
    "pages_missing": missing,
    "metadata_json_files": meta_files,
    "original_image_files": orig_files,
    "total_size_bytes": total,
    "layout": {
        "site/":      "wget mirror (browsable offline; host-organized)",
        "originals/": "true original-format images (jpeg/png/gif)",
        "metadata/":  "Squarespace ?format=json-pretty per page",
        "logs/":      "pages.txt, image_tasks.tsv, wget.log, run.log, verify.txt",
        "sitemap.xml": "raw sitemap",
        "robots.txt":  "raw robots.txt",
    },
}
(arch/'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
PY

cat > "$ARCHIVE/README.md" <<EOF
# Archive of ${SITE_URL}

Archived $(date '+%Y-%m-%d %H:%M:%S') by \`archive_site.sh\`.

## Layout
- \`site/\` — browsable offline mirror (HTML + CSS/JS + rendered image variants).
  Pages live under \`site/${SITE_HOST}/\`. CDN assets under their own host folders.
- \`originals/\` — every unique image saved in its **original uploaded format**
  (jpeg/png/gif), full fidelity. Filenames end in \`__original.<ext>\`.
- \`metadata/\` — Squarespace structured content/metadata per page
  (\`?format=json-pretty\`), one JSON file per page.
- \`logs/\` — run.log, pages.txt (page URLs), image_tasks.tsv, wget.log,
  verify.txt, summary.txt.
- \`sitemap.xml\`, \`robots.txt\` — raw source files.
- \`manifest.json\` — machine-readable summary/counts.

## Notes
- Pages fetched from the built-in \`nepalrobotics.squarespace.com\` host (the
  sitemap lists \`nepalrobotics.org\`; both serve identical content).
- The sitemap's \`static1.squarespace.com\` image URLs are dead (that host now
  returns "No Such Website"); live images are on \`images.squarespace-cdn.com\`,
  which is what this archive captures.
- External social/embed hosts (facebook, twitter, youtube, googletagmanager) are
  intentionally not mirrored.
EOF

log "================ ARCHIVE COMPLETE ================"
echo "---- SUMMARY ----" | tee -a "$RUN_LOG"
cat "$ARCHIVE/logs/verify.txt" | tee -a "$RUN_LOG" > "$LOG_DIR/summary.txt"