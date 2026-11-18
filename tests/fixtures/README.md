# Checkpoint font test fixture

`NotoSansSC-subset.otf` is a small subset of the pinned checkpoint face
(`@betteroffice/fonts-cjk@0.4.2`, `package/assets/NotoSansSC-Regular.otf`,
OFL-1.1) covering every character the tests render. It is committed so the
suite is identical on Linux, macOS and Windows and never needs the network;
production always downloads the full face.

Regenerate it after changing text that reaches the renderer:

```sh
# 1. collect ASCII plus every non-ASCII character used by tests/ and src/
python3 - <<'CHARS'
import glob
chars = {chr(c) for c in range(0x20, 0x7f)}
for path in glob.glob('tests/**/*.ts*', recursive=True) + glob.glob('src/**/*.ts*', recursive=True):
    chars |= {ch for ch in open(path, encoding='utf-8').read() if ord(ch) > 0x7e}
open('/tmp/subset-chars.txt', 'w', encoding='utf-8').write(''.join(sorted(chars)))
CHARS

# 2. subset the pinned OTF (fonttools)
pyftsubset NotoSansSC-Regular.otf --text-file=/tmp/subset-chars.txt \
  --output-file=tests/fixtures/NotoSansSC-subset.otf --layout-features='' --no-hinting
```

`OFL.txt` is the licence shipped by that package
(`LICENSES/OFL-NotoCJK.txt`); keep it next to the subset.
