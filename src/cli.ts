import { pathToFileURL } from "node:url";

import { compareReadOnly } from "./compare.js";
import { assertStubResult } from "./invariants.js";
import { buildSlackAlert } from "./slack.js";

/**
 * SeatTruth CLI.
 *
 * Default is dry-run. --live is refused until the detector exists.
 * The stub does not read environment variables and does not open the network.
 *
 * Invariants: read-only; never charge; never mutate entitlements.
 * TODO(implement): not in DR#1. Wait for DR×3, then a 4th DR with LaunchGate APPROVE. Do not wait on the founder for that ordinary gate.
 */

export const HELP = `SeatTruth compare (scaffold)

The detector is not implemented. A dry-run is not an all-clear.

Usage:
  seattruth --dry-run     Print the stub result and exit 0 (default)
  seattruth --help        Show this text
  seattruth --live        Refused. Exit 2. No provider, database, or Slack calls.

Docs: docs/MVP_SCOPE.md
Contact: hello@yellowgram.dev
`;

const LIVE_REFUSAL =
  "Live compare is not implemented. SeatTruth will not read providers, will not query the product database, and will not post to Slack.";

export async function runCli(argv: readonly string[]): Promise<number> {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    return 0;
  }
  if (argv.includes("--live")) {
    console.error(LIVE_REFUSAL);
    return 2;
  }
  const result = await compareReadOnly();
  assertStubResult(result);
  const alert = buildSlackAlert(result);
  console.log(alert.text);
  console.log(`errors=${result.errors.join(",")}`);
  return 0;
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) {
  runCli(process.argv.slice(2)).then(
    (code) => {
      process.exit(code);
    },
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  );
}
