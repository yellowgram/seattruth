#!/usr/bin/env bash
# Gate the GitHub Actions live compare.
#
# Schedule with SEATTRUTH_MAPPING_YAML unset or blank: exit 0 and print a skip
# line. That skip is not an all-clear. No mapping file is written.
# Any other caller with the secret unset or blank: exit 1. An explicit live
# workflow_dispatch uses that path so a buyer who opted into live sees the miss.
# Secret present: write it to mapping.yaml (or SEATTRUTH_MAPPING_OUT) and exit 0.
#
# Stripe, Polar, the database URL, and Slack are not this gate. A rail may be
# disabled, and Slack is posted only when a finding, an ambiguous count, or a
# run error needs it. After the mapping secret is set, those misses stay live
# run errors, including on the schedule.
#
# Does not print secret values.
set -euo pipefail

event="${SEATTRUTH_EVENT_NAME:-}"
out="${SEATTRUTH_MAPPING_OUT:-mapping.yaml}"
mapping="${SEATTRUTH_MAPPING_YAML:-}"
trimmed="$(printf '%s' "$mapping" | tr -d '[:space:]')"

write_output() {
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf '%s=%s\n' "$1" "$2" >> "$GITHUB_OUTPUT"
  fi
}

if [[ -z "$trimmed" ]]; then
  if [[ "$event" == "schedule" ]]; then
    echo "SeatTruth schedule skipped: SEATTRUTH_MAPPING_YAML is unset. Live compare did not run. No provider, database, or Slack calls. This is not an all-clear."
    write_output skip true
    exit 0
  fi
  echo "Missing SEATTRUTH_MAPPING_YAML secret."
  write_output skip false
  exit 1
fi

printf '%s\n' "$mapping" > "$out"
write_output skip false
exit 0
