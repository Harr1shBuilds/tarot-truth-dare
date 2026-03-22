"""
Vercel Serverless Function — /api/get_card
Fetches a random truth or dare card from Supabase via REST API.

Query Parameters:
    type     (required): "truth" or "dare"
    exclude  (optional): comma-separated card IDs to exclude (repetition prevention)
"""

import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

import httpx


# ── Supabase config (from environment variables) ──────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")


def _call_rpc(card_type: str) -> list:
    """Call the Supabase get_random_card RPC via REST."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/get_random_card"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    resp = httpx.post(url, json={"card_type": card_type}, headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()


# ── Helpers ────────────────────────────────────────────────────────────
def _json_response(handler, status_code: int, body: dict):
    """Send a JSON response with CORS headers."""
    handler.send_response(status_code)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(json.dumps(body).encode("utf-8"))


# ── Handler ────────────────────────────────────────────────────────────
class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless handler."""

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        _json_response(self, 204, {})

    def do_GET(self):
        # Check config
        if not SUPABASE_URL or not SUPABASE_KEY:
            return _json_response(self, 500, {
                "error": "SUPABASE_URL and SUPABASE_KEY must be set as environment variables."
            })

        # Parse query params
        query = parse_qs(urlparse(self.path).query)
        card_type = query.get("type", [None])[0]

        # Validate type
        if card_type not in ("truth", "dare"):
            return _json_response(self, 400, {
                "error": "Missing or invalid 'type' parameter. Must be 'truth' or 'dare'."
            })

        # Parse exclusion list (for repetition prevention)
        exclude_raw = query.get("exclude", [""])[0]
        exclude_ids = [eid.strip() for eid in exclude_raw.split(",") if eid.strip()]

        try:
            cards = _call_rpc(card_type)

            # If we got a card that's in the exclude list, retry a few times
            attempts = 0
            while cards and cards[0].get("id") in exclude_ids and attempts < 5:
                cards = _call_rpc(card_type)
                attempts += 1

            if not cards:
                return _json_response(self, 404, {
                    "error": f"No {card_type} cards found in the database."
                })

            card = cards[0]
            return _json_response(self, 200, {
                "card": {
                    "id": card.get("id"),
                    "type": card.get("type"),
                    "text": card.get("text"),
                }
            })

        except Exception as exc:
            return _json_response(self, 500, {
                "error": f"Failed to fetch card: {str(exc)}"
            })
