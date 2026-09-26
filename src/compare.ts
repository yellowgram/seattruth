import { assertStubResult } from "./invariants.js";
import type { CompareResult } from "./invariants.js";

/**
 * Read-only compare of provider snapshots against product rows.
 *
 * Detect only the two cases in DETECT_CASES:
 * 1. paid_locked_out — paid in an enabled provider, is_pro is false.
 * 2. canceled_still_entitled — provider status canceled, is_pro is true.
 *
 * Invariants:
 * - Never charge. Never write providers. Never mutate is_pro or seats.
 * - Never auto-fix, and never describe a fix.
 * - A dry-run or a failed read is not an all-clear.
 * - TODO(implement): not in DR#3. Next gate is the 4th DR and LaunchGate APPROVE.
 *   Active rules are P6, P7, P11, P17–P24, and P25–P30 in docs/MVP_SCOPE.md.
 *   Do not add plan drift, orphan rows, or seat inequality as findings.
 */

export async function compareReadOnly(): Promise<CompareResult> {
  const result: CompareResult = {
    implemented: false,
    allClear: false,
    mode: "dry-run",
    findings: [],
    unclassifiedUsers: 0,
    deliberateSkipUsers: 0,
    errors: ["detector_not_implemented"],
  };
  assertStubResult(result);
  return result;
}
