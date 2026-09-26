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

Docs: docs/MVP_SCOPE.md
Contact: hello@yellowgram.dev
`;

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

function exitCode(allClear: boolean, errors: readonly string[]): number {
  if (errors.length > 0) {
    return 1;
  }
  return allClear ? 0 : 2;
}

export async function runCli(argv: readonly string[]): Promise<number> {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    return 0;
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
  const alert = buildSlackAlert(result);
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
      const code = error instanceof Error ? error.message : "slack_http_0";
      console.error(code.startsWith("slack_") || code === "missing_slack_webhook" ? code : "slack_http_0");
      return 1;
    }
  }
  return exitCode(result.allClear, result.errors);
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
