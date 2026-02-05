/**
 * MQTT topic filter matching (MQTT 3.1.1 / 5.0).
 *
 * Determines whether a **topic name** (as used in PUBLISH) matches a **topic filter**
 * (as used in SUBSCRIBE). Only filter may contain wildcards:
 * - `+` single-level wildcard (matches exactly one segment, including empty)
 * - `#` multi-level wildcard (matches zero or more segments, must be the last segment)
 *
 * @param filter - Topic filter (subscription side; may contain `+` and `#`)
 * @param topic - Topic name (publish side; no wildcards)
 * @param handleSharedSubscription - If true, strip `$share/{GroupID}/` prefix from filter before matching (MQTT 5 shared subscription)
 * @returns true if topic matches filter
 *
 * @see https://docs.oasis-open.org/mqtt/mqtt/v5.0/cos01/mqtt-v5.0-cos01.html (4.7 Topic Names and Topic Filters)
 */
export function matchTopic(
  filter: string,
  topic: string,
  handleSharedSubscription = false,
): boolean {
  let filterSegments = filter.split('/');
  if (
    handleSharedSubscription &&
    filterSegments.length > 2 &&
    filter.startsWith('$share/')
  ) {
    filterSegments = filterSegments.slice(2);
  }
  const topicSegments = topic.split('/');
  const filterLength = filterSegments.length;
  for (let i = 0; i < filterLength; i++) {
    const f = filterSegments[i];
    const t = topicSegments[i];
    if (f === '#') return topicSegments.length >= filterLength - 1;
    if (f !== '+' && f !== t) return false;
  }
  return filterLength === topicSegments.length;
}
