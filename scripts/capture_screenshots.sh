#!/bin/sh
set -e

OUT_DIR="/work/docs/03-design/screenshots"
BASE_URL="${BASE_URL:-http://127.0.0.1}"

echo "Capturing implemented screenshots..."

# Helper function
capture() {
    FILE="$1"
    WIDTH="$2"
    HEIGHT="$3"
    URL="$4"
    echo "Capturing $FILE ($WIDTH x $HEIGHT) from $URL ..."
    chromium \
        --headless \
        --no-sandbox \
        --disable-gpu \
        --hide-scrollbars \
        --window-size=${WIDTH},${HEIGHT} \
        --screenshot="${OUT_DIR}/${FILE}" \
        "${BASE_URL}${URL}"
}

# 1. Desktop Screenshots (1440x900)
capture "implemented-homepage-desktop-en.png" 1440 900 "/"
capture "implemented-homepage-desktop-ur.png" 1440 900 "/ur/"
capture "implemented-product-desktop-en.png" 1440 900 "/products/commercial-mdf-sheet-18mm/"
capture "implemented-product-desktop-ur.png" 1440 900 "/ur/products/commercial-mdf-sheet-18mm/"
capture "implemented-bestseller-desktop-en.png" 1440 900 "/categories/hardware/door-handles/"
capture "implemented-contact-desktop-en.png" 1440 900 "/contact/"
capture "implemented-contact-desktop-ur.png" 1440 900 "/ur/contact/"

# 2. Mobile Screenshots (390x844)
capture "implemented-homepage-mobile-en.png" 390 844 "/"
capture "implemented-homepage-mobile-ur.png" 390 844 "/ur/"
capture "implemented-product-mobile-en.png" 390 844 "/products/commercial-mdf-sheet-18mm/"
capture "implemented-product-mobile-ur.png" 390 844 "/ur/products/commercial-mdf-sheet-18mm/"
capture "implemented-bestseller-mobile-en.png" 390 844 "/categories/hardware/door-handles/"
capture "implemented-contact-mobile-en.png" 390 844 "/contact/"

echo "All screenshots captured successfully!"
