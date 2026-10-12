"""
FATE Engine demo — arithmetic trajectory inference.

Setup: a counter starts at a known value. At every step, ONE of four operations is applied:
    +1, +2, *2, -1
The operation chosen at each step is UNKNOWN — that's the ambiguity a forward-only model can't
resolve. We DO know the counter's exact value after 6 steps (the terminal constraint).

Forward-only prediction has to keep every operation-branch alive at every step: the reachable
set explodes combinatorially, all the way to the end, and only THEN can you check which final
branches happen to match the known end value.

FATE Engine instead runs the backward pass from the known end value at the same time, and
intersects it with the forward-reachable set at every intermediate step. This certifies exactly
which counter values (and therefore which operations) are consistent with reaching the known
end — collapsing most of the ambiguity immediately, at every step, not just at the end.

Run: python demo_arithmetic_trajectory.py
"""

from fate_engine import FateEngine


OPS = {
    "+1": lambda x: x + 1,
    "+2": lambda x: x + 2,
    "*2": lambda x: x * 2,
    "-1": lambda x: x - 1,
}

DOMAIN_MIN, DOMAIN_MAX = 0, 200  # certified bound -- a real "nogood": values outside are impossible


def transition_fn(x: int) -> set[int]:
    return {op(x) for op in OPS.values() if DOMAIN_MIN <= op(x) <= DOMAIN_MAX}


def bound_nogood(t: int, x: int) -> str | None:
    if not (DOMAIN_MIN <= x <= DOMAIN_MAX):
        return f"value {x} outside certified bound [{DOMAIN_MIN},{DOMAIN_MAX}]"
    return None


def forward_only_reachable_sizes(start: int, horizon: int) -> list[int]:
    """What a purely forward generative model sees: reachable-set size at each step, no backward info."""
    sizes = [1]
    frontier = {start}
    for _ in range(horizon):
        nxt = set()
        for s in frontier:
            nxt |= transition_fn(s)
        frontier = nxt
        sizes.append(len(frontier))
    return sizes


def which_ops_explain(prev: int, nxt: int) -> list[str]:
    return [name for name, op in OPS.items() if op(prev) == nxt]


if __name__ == "__main__":
    START = 3
    HORIZON = 6
    KNOWN_END = 30  # ground truth we're told about the future: counter == 30 after 6 steps

    engine = FateEngine(
        transition_fn=transition_fn,
        universe=range(DOMAIN_MIN, DOMAIN_MAX + 1),
        nogoods=[bound_nogood],
    )

    result = engine.run(initial_state=START, horizon=HORIZON, terminal_constraint={KNOWN_END})

    fwd_only = forward_only_reachable_sizes(START, HORIZON)
    fate_sizes = result.uncertainty_profile()

    print(f"Start = {START}, known end after {HORIZON} steps = {KNOWN_END}\n")
    print(f"{'t':>3} | {'forward-only domain size':>26} | {'FATE narrowed domain size':>26} | domain")
    print("-" * 100)
    for t in range(HORIZON + 1):
        print(f"{t:>3} | {fwd_only[t]:>26} | {fate_sizes[t]:>26} | {sorted(result.domains[t])}")

    print(f"\nStatus: {result.status()}")
    traj = result.trajectory()
    if traj:
        print(f"Certified trajectory: {traj}")
        print("Certified operation sequence:")
        for t in range(1, len(traj)):
            ops_here = which_ops_explain(traj[t - 1], traj[t])
            print(f"  step {t}: {traj[t-1]} -> {traj[t]}   (operation: {', '.join(ops_here)})")
    else:
        print("Not fully determined. Remaining candidates per step are shown above.")

    print(f"\nTotal certified eliminations logged: {len(result.eliminations)}")
    print("Sample elimination receipts (first 5):")
    for e in result.eliminations[:5]:
        print(f"  t={e.time_step}, state={e.state}: {e.reason}")
