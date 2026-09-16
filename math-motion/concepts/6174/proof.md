# Kaprekar 6174 — Verification

## Claim

For a four-digit number whose digits are not all identical, repeatedly subtract the ascending digit arrangement from the descending arrangement (preserving leading zeroes) and the process reaches 6174.

## Golden example

`3524 → 5432 − 2345 = 3087 → 8730 − 0378 = 8352 → 8532 − 2358 = 6174`

Then `7641 − 1467 = 6174`, so 6174 is a fixed point of the routine.

## Production invariant

The semantic engine owns the calculation and trace. Renderers consume the resulting trace and must not recompute the mathematics.
