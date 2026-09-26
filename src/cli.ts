import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { compareReadOnly, runLiveCompare } from "./compare.js";
import { assertDryRunResult } from "./invariants.js";
import { buildSlackAlert, deliverSlackAlert, slackNeeded } from "./slack.js";

/**
 * SeatTruth CLI.
 *
 * Default is dry-run. Dry-run does not read environment secrets and does not
 * open the network. --live uses restricted credentials and posts to Slack
 * only for a finding, an ambiguous count, or a run error.
 */

export const HELP = `SeatTruth compare

A dry-run is not an all-clear. Live mode reads Stripe, Polar, and Postgres and does not change them.

Usage:
  seattruth --dry-run     Print a local notice and exit 0 (default)
  seattruth --help        Show this text
  seattruth --live        Read-only compare. Exit 0, 2, or 1 per docs/MVP_SCOPE.md rule P30.

Unknown flags exit 1 and do not run a compare.

Docs: docs/MVP_SCOPE.md
Contact: hello@yellowgram.dev
`;

const KNOWN_FLAGS = new Set(["--live", "--dry-run", "--help", "-h"]);
const SAFE_LOG_CODE = /^(?:slack_[a-z0-9_]+|missing_slack_webhook|unknown_argument|compare_failed)$/;

function loadEnvFile(): void {
  let text: string;
  try {
    text = readFileSync(".env", "utf8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/** P30 live exit: 1 on a run error, 0 only when allClear, otherwise 2. */
export function liveExitCode(allClear: boolean, errors: readonly string[]): number {
  if (errors.length > 0) {
    return 1;
  }
  return allClear ? 0 : 2;
}

function safeLogCode(message: string): string {
  return SAFE_LOG_CODE.test(message) ? message : "compare_failed";
}

export async function runCli(argv: readonly string[]): Promise<number> {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    return 0;
  }
  if (argv.some((arg) => !KNOWN_FLAGS.has(arg))) {
    console.error("unknown_argument");
    return 1;
  }
  if (argv.includes("--live") && argv.includes("--dry-run")) {
    console.error("Pass only one of --live or --dry-run.");
    return 1;
  }
  if (!argv.includes("--live")) {
    const result = await compareReadOnly();
    assertDryRunResult(result);
    console.log(buildSlackAlert(result).text);
    return 0;
  }

  loadEnvFile();
  const result = await runLiveCompare({
    stripeKey: process.env.STRIPE_RESTRICTED_KEY ?? "",
    polarToken: process.env.POLAR_RESTRICTED_TOKEN ?? "",
    databaseUrl: process.env.PRODUCT_DATABASE_URL ?? "",
    mappingPath: process.env.SEATTRUTH_MAPPING_PATH ?? "",
  });
  let alert;
  try {
    alert = buildSlackAlert(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    console.error(safeLogCode(message));
    return 1;
  }
  if (alert.text !== "") {
    console.log(alert.text);
  } else if (result.allClear) {
    console.log("SeatTruth live run finished all-clear. Slack was not posted.");
  }

  if (slackNeeded(result)) {
    const webhook = process.env.SLACK_WEBHOOK_URL ?? "";
    if (webhook.trim() === "") {
      console.error("missing_slack_webhook");
      return 1;
    }
    try {
      await deliverSlackAlert(alert, webhook);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      console.error(message === "missing_slack_webhook" ? message : safeLogCode(message));
      return 1;
    }
  }
  return liveExitCode(result.allClear, result.errors);
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
    () => {
      console.error("compare_failed");
      process.exit(1);
    }
  );
}
