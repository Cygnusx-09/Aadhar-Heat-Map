import argparse
import json
from pathlib import Path
from typing import Any, Iterable, Set


TARGET_KEY = "bagid"


def normalize_key(key: str) -> str:
    return "".join(ch for ch in key.lower() if ch.isalnum())


def extract_bag_ids(data: Any, found: Set[str]) -> None:
    if isinstance(data, dict):
        for key, value in data.items():
            if normalize_key(key) == TARGET_KEY:
                if isinstance(value, list):
                    for item in value:
                        if item is not None:
                            text = str(item).strip()
                            if text:
                                found.add(text)
                elif value is not None:
                    text = str(value).strip()
                    if text:
                        found.add(text)
            extract_bag_ids(value, found)
    elif isinstance(data, list):
        for item in data:
            extract_bag_ids(item, found)


def find_json_files(root: Path) -> Iterable[Path]:
    if root.is_file() and root.suffix.lower() == ".json":
        return [root]
    return root.rglob("*.json")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Collect all bag IDs from JSON files."
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Directory or JSON file path to scan (default: current directory).",
    )
    args = parser.parse_args()

    target = Path(args.path).resolve()
    if not target.exists():
        raise SystemExit(f"Path does not exist: {target}")

    bag_ids: Set[str] = set()
    scanned_files = 0

    for json_file in find_json_files(target):
        scanned_files += 1
        try:
            with json_file.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, json.JSONDecodeError):
            continue
        extract_bag_ids(data, bag_ids)

    for bag_id in sorted(bag_ids):
        print(bag_id)

    print(f"\nFound {len(bag_ids)} unique bag ID(s) across {scanned_files} JSON file(s).")


if __name__ == "__main__":
    main()
