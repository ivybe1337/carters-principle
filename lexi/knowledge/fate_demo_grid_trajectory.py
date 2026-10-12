"""
FATE Engine demo #2 — grid transformation trajectory inference (ARC-style state space).

This closes one of the honest limitations flagged in FATE_Engine_Technical_Specification.md §5:
demo #1 (arithmetic) used a brute-force preimage over a small integer universe. Here, every
operation is an exact, analytically-invertible bijection on the grid space (rotations, flips,
color shift), so we supply a real inverse_transition_fn directly -- no universe scan, no brute
force, and it scales to any grid size.

Setup: a small colored grid undergoes an UNKNOWN sequence of operations, one of
    {rotate 90 CW, flip horizontal, flip vertical, color-shift}
per step. We know the starting grid and the grid after some number of steps (e.g. a later
observed frame, or a stated goal) -- exactly the "terminal constraint" pattern FATE Engine is
built around. The question: what were the intermediate grids, and which operations were applied?

Run: python demo_grid_trajectory.py
"""

from fate_engine import FateEngine

Grid = tuple[tuple[int, ...], ...]
N_COLORS = 4  # colors 0..3, 0 = background


def to_grid(rows: list[list[int]]) -> Grid:
    return tuple(tuple(r) for r in rows)


def rot90(g: Grid) -> Grid:
    return tuple(zip(*g[::-1]))


def rot270(g: Grid) -> Grid:
    return tuple(zip(*g))[::-1]


def flip_h(g: Grid) -> Grid:
    return tuple(row[::-1] for row in g)


def flip_v(g: Grid) -> Grid:
    return g[::-1]


def color_shift(g: Grid) -> Grid:
    # Cycle only the FOREGROUND colors (1..N_COLORS-1); 0 (background) is a fixed point.
    # This keeps the map a true bijection -- shifting must never collide two different
    # inputs onto the same output, which an earlier version of this function did (color
    # N_COLORS-1 wrapped onto 0, colliding with real background and silently breaking the
    # exact inverse). Caught by actually running the demo, not by assuming the math was fine.
    fg = N_COLORS - 1
    return tuple(tuple(((c - 1 + 1) % fg) + 1 if c != 0 else 0 for c in row) for row in g)


def color_unshift(g: Grid) -> Grid:
    fg = N_COLORS - 1
    return tuple(tuple(((c - 1 - 1) % fg) + 1 if c != 0 else 0 for c in row) for row in g)


# Every op below is an exact bijection with a known, exact inverse -- this is what a real
# deployment should supply instead of the brute-force fallback.
OPS = {
    "rotate90": rot90,
    "flip_h": flip_h,
    "flip_v": flip_v,
    "color_shift": color_shift,
}
INVERSE_OPS = {
    "rotate90": rot270,
    "flip_h": flip_h,      # self-inverse
    "flip_v": flip_v,      # self-inverse
    "color_shift": color_unshift,
}


def transition_fn(g: Grid) -> set[Grid]:
    return {op(g) for op in OPS.values()}


def inverse_transition_fn(g: Grid) -> set[Grid]:
    return {inv(g) for inv in INVERSE_OPS.values()}


def which_ops_explain(prev: Grid, nxt: Grid) -> list[str]:
    return [name for name, op in OPS.items() if op(prev) == nxt]


def forward_only_reachable_sizes(start: Grid, horizon: int) -> list[int]:
    sizes = [1]
    frontier = {start}
    for _ in range(horizon):
        nxt = set()
        for s in frontier:
            nxt |= transition_fn(s)
        frontier = nxt
        sizes.append(len(frontier))
    return sizes


def pretty(g: Grid) -> str:
    return " / ".join("".join(str(c) for c in row) for row in g)


if __name__ == "__main__":
    START = to_grid([
        [1, 0, 2],
        [0, 3, 0],
        [2, 0, 1],
    ])
    HORIZON = 4

    # Construct the true (secret, for demo purposes) trajectory so we know ground truth to check against.
    true_ops = ["rotate90", "color_shift", "flip_h", "rotate90"]
    true_traj = [START]
    for op_name in true_ops:
        true_traj.append(OPS[op_name](true_traj[-1]))
    KNOWN_END = true_traj[-1]

    engine = FateEngine(
        transition_fn=transition_fn,
        inverse_transition_fn=inverse_transition_fn,  # exact analytic inverse -- no brute force
    )

    result = engine.run(initial_state=START, horizon=HORIZON, terminal_constraint={KNOWN_END})

    fwd_only = forward_only_reachable_sizes(START, HORIZON)
    fate_sizes = result.uncertainty_profile()

    print("Start grid:      ", pretty(START))
    print("True hidden ops: ", true_ops, "(known only to the demo's ground truth, not the engine)")
    print("Known end grid:  ", pretty(KNOWN_END), f"(after {HORIZON} steps)\n")

    print(f"{'t':>3} | {'forward-only domain size':>26} | {'FATE narrowed domain size':>26}")
    print("-" * 65)
    for t in range(HORIZON + 1):
        print(f"{t:>3} | {fwd_only[t]:>26} | {fate_sizes[t]:>26}")

    print(f"\nStatus: {result.status()}")
    traj = result.trajectory()
    if traj:
        print("Certified trajectory (grids):")
        for t, g in enumerate(traj):
            print(f"  t={t}: {pretty(g)}")
        print("\nCertified operation sequence:")
        correct = True
        for t in range(1, len(traj)):
            ops_here = which_ops_explain(traj[t - 1], traj[t])
            print(f"  step {t}: operation = {', '.join(ops_here)}")
        recovered_ops = [which_ops_explain(traj[t-1], traj[t])[0] for t in range(1, len(traj))]
        print(f"\nRecovered ops == true hidden ops? {recovered_ops == true_ops}")
    else:
        print("Not fully determined -- remaining candidate grids per step:")
        for t in range(HORIZON + 1):
            print(f"  t={t}: {len(result.domains[t])} candidates")

    print(f"\nTotal certified eliminations logged: {len(result.eliminations)}")
