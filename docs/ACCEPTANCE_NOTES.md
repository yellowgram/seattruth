# Acceptance notes

LaunchGate P2 on the 4th DR. These items do **not** block re-approval of this gate. They are frozen here so the implement PR, and the review before the 4th code review, name them instead of inventing them in a comment.

They are not new detect rules. Active implement scope remains P6, P7, P11, and P17–P30, and only after LaunchGate re-APPROVE. This pull request does not implement them. No detector code.

## Before the 4th code review

1. **Polar Organization Access Token read scopes.** Name the read scope strings from the live Polar token UI in `.env.example` and in [MVP_SCOPE.md](MVP_SCOPE.md) before the 4th CR. This note does not invent scope strings. The scope doc already says those names are confirmed in the token UI at implementation time.

2. **Stripe refund detection.** Write the concrete recipe that proves any refund on this subscription: which list or expand is enough, and what "cannot tell" means so the subscription stays ambiguous under P26. Do not reduce that test to a single "latest charge."

3. **P28 fixture table.** A normative table of cross-rail edges and the required finding or non-finding. Cover at least: paid plus a deliberate skip, paid plus canceled, paid plus ambiguous, canceled plus a deliberate skip, every applicable rail canceled, and a customer id with zero subscriptions after a complete read. The table is the test oracle. It does not add a case.

4. **P27 pagination contract.** A provider-specific definition of a complete list for Stripe and for Polar: how the implementation knows the page was not truncated. A partial page stays a run error. It is not absence, and it is not a cancel.
