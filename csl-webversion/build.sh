#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== CSL Web Runner - Build Script ==="
echo ""

# Check prerequisites
echo "[1/5] Checking prerequisites..."

if ! command -v cargo &> /dev/null; then
    echo "Error: Rust (cargo) is not installed."
    echo "Install from: https://rustup.rs/"
    exit 1
fi

if ! command -v wasm-pack &> /dev/null; then
    echo "wasm-pack not found. Installing..."
    cargo install wasm-pack
fi

if ! command -v wasm-bindgen &> /dev/null; then
    echo "wasm-bindgen-cli not found. Installing..."
    cargo install wasm-bindgen-cli
fi

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Install from: https://nodejs.org/"
    exit 1
fi

echo "✓ All prerequisites met"

# Step 2: Build WASM versions
echo ""
echo "[2/5] Building WASM modules for each Minecraft version..."

WASM_VERSIONS=("mc1_21_4" "mc1_20_4" "mc1_19_4")
WASM_OUT_DIR="$SCRIPT_DIR/csl-web-runner/public/wasm"

for version in "${WASM_VERSIONS[@]}"; do
    echo "  Building $version..."
    cd "$SCRIPT_DIR/wasm-versions/$version"
    wasm-pack build --release --target web --out-dir "$WASM_OUT_DIR/$version"
    echo "  ✓ $version built"
done

echo "✓ All WASM versions built"

# Step 3: Install Node dependencies
echo ""
echo "[3/5] Installing Node.js dependencies..."
cd "$SCRIPT_DIR/csl-web-runner"
npm install
echo "✓ Dependencies installed"

# Step 4: Build Next.js (static export)
echo ""
echo "[4/5] Building static site..."
npm run build
echo "✓ Static site built"

# Step 5: Summary
echo ""
echo "[5/5] Build complete!"
echo ""
echo "=== Build Complete ==="
echo "Output directory: $SCRIPT_DIR/csl-web-runner/out"
echo ""
echo "Included Minecraft versions:"
for version in "${WASM_VERSIONS[@]}"; do
    size=$(du -sh "$WASM_OUT_DIR/$version" 2>/dev/null | cut -f1)
    echo "  - ${version} ($size)"
done
echo ""
echo "To preview locally:"
echo "  cd $SCRIPT_DIR/csl-web-runner && npx serve out"
echo ""
echo "To deploy: upload the 'out' directory to any static hosting service"
echo "  (GitHub Pages, Vercel, Netlify, Cloudflare Pages, etc.)"