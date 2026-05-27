"""Compute % of typical Italian text covered by the curated vocabulary.

Uses empirical cumulative-coverage checkpoints for Italian (calibrated against
published figures: top 1000 ≈ 80%, top 2000 ≈ 86%, etc.) with log-interpolation
between checkpoints. For each band the curated entries occupy, calculate the
marginal coverage contribution = (count in curated / 100) × marginal-band-coverage.
"""
import json
import math
from pathlib import Path

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning/data/vocabulary_it_frequency.json')

# Empirical cumulative coverage checkpoints for Italian
# Sources: De Mauro NVdB, established figures from Italian frequency studies
CHECKPOINTS = [
    (0, 0.00),
    (1, 0.06),
    (10, 0.22),
    (100, 0.47),
    (200, 0.56),
    (500, 0.70),
    (1000, 0.80),
    (2000, 0.86),
    (3000, 0.89),
    (5000, 0.92),
    (8000, 0.95),
    (15000, 0.98),
    (50000, 0.995),
]


def cumulative_coverage(rank):
    """Return cumulative coverage (fraction of typical text covered) at given rank.
    Log-interpolates between empirical checkpoints."""
    if rank <= 0:
        return 0.0
    if rank >= CHECKPOINTS[-1][0]:
        return CHECKPOINTS[-1][1]
    for i in range(len(CHECKPOINTS) - 1):
        r1, c1 = CHECKPOINTS[i]
        r2, c2 = CHECKPOINTS[i + 1]
        if r1 <= rank <= r2:
            if r1 == 0:
                return c1 + (c2 - c1) * rank / r2
            # Log-interpolate in rank
            t = (math.log(rank) - math.log(r1)) / (math.log(r2) - math.log(r1))
            return c1 + (c2 - c1) * t
    return CHECKPOINTS[-1][1]


def main():
    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    # Count entries by band (lo)
    by_band = {}
    for e in data:
        r = e.get('rank', 0)
        lo = ((r - 1) // 100) * 100 + 1
        by_band[lo] = by_band.get(lo, 0) + 1

    # For each occupied band, compute marginal coverage of that band and the curated fraction
    print(f'{"band":>11}  {"curated":>7}  {"of":>3}  {"marginal":>8}  {"contrib":>7}  {"cum dict":>8}  {"cum text":>8}')
    print('-' * 70)
    total_coverage = 0.0
    cum_text_at_band = 0.0
    for lo in sorted(by_band.keys()):
        hi = lo + 99
        count = by_band[lo]
        # Marginal coverage of this whole band (100 lemmas) in typical text
        marginal_band = cumulative_coverage(hi) - cumulative_coverage(lo - 1)
        # Curated fraction of this band
        fraction = min(count / 100.0, 1.0)
        contrib = marginal_band * fraction
        total_coverage += contrib
        cum_text_at_band = cumulative_coverage(hi)
        if lo <= 3000:  # Show only top 30 bands; print summary after
            print(f'  {lo:>4}-{hi:<4}  {count:>7}  /100  {marginal_band:>7.2%}  {contrib:>6.2%}  {total_coverage:>7.2%}  {cum_text_at_band:>7.2%}')

    print()
    print(f'Total curated entries: {len(data)}')
    print(f'Bands occupied (out of 80): {len(by_band)}')
    print(f'Estimated coverage of typical Italian text by curated dictionary: {total_coverage:.1%}')
    print(f'Coverage gap (text not in curated dict): {1 - total_coverage:.1%}')

    # Coverage at NVdB / CEFR-relevant thresholds
    print()
    print('Thresholds (approximate, NOT calibrated against this dictionary specifically):')
    for r, c in [(500, 'A1+ vocab'), (1000, 'A2 vocab'), (2000, 'A2/B1 vocab'),
                 (4000, 'B1/B2 vocab'), (5000, 'B2 vocab'), (8000, 'C1 vocab')]:
        print(f'  Knowing top {r} lemmas → ~{c}: covers {cumulative_coverage(r):.0%} of text')


if __name__ == '__main__':
    main()
