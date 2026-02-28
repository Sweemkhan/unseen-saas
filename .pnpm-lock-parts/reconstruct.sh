#!/bin/bash
# Reconstruct pnpm-lock.yaml from parts
cat .pnpm-lock-parts/part1.yaml \
    .pnpm-lock-parts/part2.yaml \
    .pnpm-lock-parts/part3.yaml \
    .pnpm-lock-parts/part4.yaml \
    .pnpm-lock-parts/part5.yaml \
    .pnpm-lock-parts/part6.yaml \
    .pnpm-lock-parts/part7.yaml \
    .pnpm-lock-parts/part8.yaml \
    .pnpm-lock-parts/part9.yaml \
    .pnpm-lock-parts/part10.yaml > pnpm-lock.yaml
echo "pnpm-lock.yaml reconstructed. Or run: pnpm install"
