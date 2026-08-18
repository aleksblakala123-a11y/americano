#!/usr/bin/env bash
# ============================================================
#  AMERICANO Świdnik — pobranie fontów z Google Fonts do self-hostingu
#
#  Uruchomienie (Git Bash):
#    bash tools/fetch-fonts.sh
#
#  Co robi:
#   1. Pobiera CSS z Google Fonts udając Chrome (bez tego API oddaje
#      stary format TTF zamiast woff2).
#   2. Zostawia wyłącznie podzbiory `latin` i `latin-ext`. latin-ext
#      jest obowiązkowy — polskie Ś, Ż, Ł, ą, ę, ć, ń, ś, ź, ż leżą
#      w U+0100–02BA. Reszta (cyrylica, greka, hebrajski, wietnamski,
#      symbole, math) to na polskiej stronie martwy transfer.
#   3. Deduplikuje pliki. Open Sans jest fontem ZMIENNYM, więc Google
#      oddaje ten sam plik dla wag 400/600/700 — sprawdzamy to sumą
#      MD5 i trzymamy jedną kopię zamiast trzech.
#
#  Deklaracje @font-face są na stałe wpisane na początku styles.css.
#  Jeśli zmienisz listę wag albo rodzin, zaktualizuj też tamten blok
#  (zwłaszcza unicode-range, gdyby Google je kiedyś przestawił).
#
#  Licencje: Titan One i Open Sans są na Open Font License —
#  self-hosting jest dozwolony. Plik licencji trzymamy obok fontów.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."
OUT="assets/fonts"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
API="https://fonts.googleapis.com/css2?family=Titan+One&family=Open+Sans:wght@400;600;700&display=swap"

mkdir -p "$OUT"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "→ pobieram CSS…"
curl -sS -A "$UA" "$API" -o "$tmp/gf.css"

echo "→ wycinam podzbiory latin i latin-ext…"
awk '
  /^\/\* .* \*\/$/ { sub(/^\/\* /,""); sub(/ \*\/$/,""); subset=$0; next }
  /@font-face/     { inblock=1; buf=$0"\n"; next }
  inblock && /^}/  {
    inblock=0
    if (subset=="latin" || subset=="latin-ext") printf "/*SUBSET:%s*/\n%s}\n", subset, buf
    next
  }
  inblock { buf = buf $0 "\n" }
' "$tmp/gf.css" > "$tmp/keep.css"

awk '/SUBSET:/{sub(/\/\*SUBSET:/,"");sub(/\*\//,"");s=$0; gsub(/-ext/,"ext",s)}
     /font-family/{f=$2$3; gsub(/['"'"';]/,"",f); f=tolower(f)}
     /font-weight/{w=$2; gsub(/;/,"",w)}
     /woff2/{match($0,/https:[^)]+/); print f"-"w"-"s".woff2\t"substr($0,RSTART,RLENGTH)}
' "$tmp/keep.css" > "$tmp/map.txt"

echo "→ pobieram $(wc -l < "$tmp/map.txt") plików woff2…"
while IFS=$'\t' read -r name url; do
  curl -sS -A "$UA" "$url" -o "$tmp/$name"
done < "$tmp/map.txt"

echo "→ deduplikuję (font zmienny = jeden plik na wiele wag)…"
declare -A seen
for f in "$tmp"/*.woff2; do
  base="$(basename "$f")"
  family="${base%%-*}"
  subset="${base##*-}"                  # latin.woff2 albo latinext.woff2
  hash="$(md5sum "$f" | cut -d' ' -f1)"
  key="$hash"
  if [[ -n "${seen[$key]:-}" ]]; then continue; fi
  seen[$key]=1
  cp "$f" "$OUT/${family}-${subset}"
done

echo
printf '  %-28s %s\n' "PLIK" "ROZMIAR"
for f in "$OUT"/*.woff2; do
  printf '  %-28s %5s KB\n' "$(basename "$f")" "$(( $(stat -c%s "$f") / 1024 ))"
done
echo
echo "Razem: $(du -sh "$OUT" | cut -f1)"
