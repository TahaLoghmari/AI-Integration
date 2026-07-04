#!/usr/bin/env bash
input=$(cat)
model=$(echo "$input" | grep -o '"display_name":"[^"]*"' | head -1 | cut -d'"' -f4)
used=$(echo "$input" | grep -o '"total_input_tokens":[0-9]*' | grep -o '[0-9]*$')
total=$(echo "$input" | grep -o '"context_window_size":[0-9]*' | grep -o '[0-9]*$')
fmt() {
  v=$1
  if [ "$v" -ge 1000000 ]; then
    awk "BEGIN{printf \"%.1fm\", $v/1000000}"
  elif [ "$v" -ge 1000 ]; then
    awk "BEGIN{printf \"%.1fk\", $v/1000}"
  else
    echo "$v"
  fi
}
if [ -n "$used" ] && [ -n "$total" ]; then
  echo "$model | $(fmt $used) / $(fmt $total) tokens"
else
  echo "$model"
fi
