import os
import sys
from config import FIREBASE_DATABASE_URL, FIREBASE_SERVICE_ACCOUNT_PATH
import json
import tempfile

try:
    import firebase_admin
    from firebase_admin import credentials, db

    # Support service account provided as JSON string in env (FIREBASE_SERVICE_ACCOUNT_JSON)
    sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if sa_json:
        try:
            sa_obj = json.loads(sa_json)
            cred = credentials.Certificate(sa_obj)
        except Exception as e:
            raise
    else:
        # Fallback to file path from config (FIREBASE_SERVICE_ACCOUNT_PATH)
        cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)

    firebase_admin.initialize_app(cred, {
        "databaseURL": FIREBASE_DATABASE_URL
    })

    # Get real database reference
    database = db.reference()
    print("✓ Connected to Firebase Realtime Database", file=sys.stderr)
    # Initialize Google Cloud Storage client for metadata operations
    try:
        from google.cloud import storage as gcs
        # Use JSON env or path for GCS client as well
        sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if sa_json:
            sa_obj = json.loads(sa_json)
            # create temporary file for gcs client if needed
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
            tmp.write(json.dumps(sa_obj).encode('utf-8'))
            tmp.close()
            storage_client = gcs.Client.from_service_account_json(tmp.name)
        else:
            storage_client = gcs.Client.from_service_account_json(FIREBASE_SERVICE_ACCOUNT_PATH)
        print("✓ Initialized GCS storage client", file=sys.stderr)
    except Exception as e:
        print(f"⚠ GCS storage client init failed: {e}", file=sys.stderr)
        storage_client = None
except Exception as e:
    print(f"⚠ Firebase init failed: {e}", file=sys.stderr)
    # Fallback: simple in-memory mock database for local testing when serviceAccountKey.json is missing
    class MockRef:
        def __init__(self, store=None, key=None):
            self._store = store if store is not None else {}
            self._key = key

        def child(self, key):
            if self._key is None:
                # top-level
                return MockRef(self._store, key)
            # nested
            if self._key not in self._store or not isinstance(self._store[self._key], dict):
                self._store[self._key] = {}
            return MockRef(self._store[self._key], key)

        def get(self):
            if self._key is None:
                return self._store
            return self._store.get(self._key)

        def set(self, value):
            if self._key is None:
                raise RuntimeError("Cannot set root store")
            self._store[self._key] = value

        def push(self, value):
            import uuid
            key = str(uuid.uuid4())
            if self._key is None:
                self._store[key] = value
            else:
                if self._key not in self._store or not isinstance(self._store[self._key], dict):
                    self._store[self._key] = {}
                self._store[self._key][key] = value
            return MockRef(self._store, key)

        def remove(self):
            if self._key is None:
                self._store.clear()
            else:
                self._store.pop(self._key, None)

        def update(self, value: dict):
            if self._key is None:
                self._store.update(value)
            else:
                if self._key not in self._store or not isinstance(self._store[self._key], dict):
                    self._store[self._key] = {}
                self._store[self._key].update(value)

    _mock_store = {}
    database = MockRef(_mock_store)
    # By default do not seed fake test data into the mock DB so admin UI
    # does not display non-production data. To enable seeding for local
    # development set the env var `MOCK_DB_SEED=true`.
    MOCK_DB_SEED = os.getenv("MOCK_DB_SEED", "false").lower() == "true"

    if MOCK_DB_SEED:
        import uuid
        from datetime import datetime

        # Test users
        test_users = {
            str(uuid.uuid4()): {
                "id": "user-seller-001",
                "name": "John Smith",
                "email": "john@example.com",
                "phone": "9876543210",
                "user_type": "seller",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            str(uuid.uuid4()): {
                "id": "user-seller-002",
                "name": "Jane Doe",
                "email": "jane@example.com",
                "phone": "8765432109",
                "user_type": "seller",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            str(uuid.uuid4()): {
                "id": "user-collector-001",
                "name": "Mike Johnson",
                "email": "mike@example.com",
                "phone": "7654321098",
                "user_type": "collector",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        }

        # Test items
        test_items = {
            str(uuid.uuid4()): {
                "id": "item-001",
                "category": "plastic",
                "quantity": "5 kg",
                "description": "Used plastic bottles and containers",
                "seller_id": "user-seller-001",
                "seller_name": "John Smith",
                "seller_phone": "9876543210",
                "status": "pending",
                "estimated_price": 75.0,
                "created_at": datetime.utcnow().isoformat()
            },
            str(uuid.uuid4()): {
                "id": "item-002",
                "category": "paper",
                "quantity": "10 sheets",
                "description": "Old newspaper and cardboard",
                "seller_id": "user-seller-002",
                "seller_name": "Jane Doe",
                "seller_phone": "8765432109",
                "status": "accepted",
                "estimated_price": 100.0,
                "created_at": datetime.utcnow().isoformat()
            },
            str(uuid.uuid4()): {
                "id": "item-003",
                "category": "metal",
                "quantity": "2 kg",
                "description": "Scrap metal and aluminum cans",
                "seller_id": "user-seller-001",
                "seller_name": "John Smith",
                "seller_phone": "9876543210",
                "status": "collected",
                "estimated_price": 80.0,
                "created_at": datetime.utcnow().isoformat()
            }
        }

        _mock_store["users"] = test_users
        _mock_store["items"] = test_items
    else:
        # keep the mock DB empty by default to avoid showing fake data
        _mock_store.clear()

    # In mock mode, storage_client is not available
    storage_client = None

def set_cache_control_for_gcs_url(image_url: str, cache_control: str = 'public, max-age=31536000'):
    """If running with real GCS credentials, set the cache-control metadata for a GCS URL.
    Supports Firebase download URLs and storage.googleapis.com URLs.
    """
    try:
        # Attempt to import runtime client if available
        from google.cloud import storage as gcs
    except Exception:
        return False

    # Parse out bucket and object name from common GCS URL formats
    from urllib.parse import urlparse, unquote

    parsed = urlparse(image_url)
    bucket = None
    object_name = None

    # firebase storage download URL: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<object>?alt=media&token=...
    if 'firebasestorage.googleapis.com' in parsed.netloc:
        parts = parsed.path.split('/')
        # expect /v0/b/<bucket>/o/<object>
        try:
            b_index = parts.index('b')
            bucket = parts[b_index + 1]
            o_index = parts.index('o')
            object_name = unquote('/'.join(parts[o_index + 1:]))
        except ValueError:
            return False

    # storage.googleapis.com/<bucket>/<object>
    elif 'storage.googleapis.com' in parsed.netloc:
        parts = parsed.path.lstrip('/').split('/')
        if len(parts) >= 2:
            bucket = parts[0]
            object_name = unquote('/'.join(parts[1:]))

    # gs://bucket/object
    elif parsed.scheme == 'gs':
        bucket = parsed.netloc
        object_name = parsed.path.lstrip('/')

    if not bucket or not object_name:
        return False

    try:
        client = gcs.Client.from_service_account_json(FIREBASE_SERVICE_ACCOUNT_PATH)
        bucket_obj = client.bucket(bucket)
        blob = bucket_obj.blob(object_name)
        blob.cache_control = cache_control
        blob.patch()
        return True
    except Exception as e:
        print(f"⚠ Failed to set cache-control for {image_url}: {e}", file=sys.stderr)
        return False
