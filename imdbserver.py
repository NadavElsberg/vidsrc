"""this is just a simple server to serve the imdb data, it doesn't serve the actuall streaming, just metadata and the file paths for wach title"""
from common import IMDb
from common import network
from flask import Flask, jsonify, request, make_response

# Optional: flask-cors is preferred; if not installed, responses will include a permissive header.
try:
    from flask_cors import CORS
    _CORS_AVAILABLE = True
except Exception:
    _CORS_AVAILABLE = False

app = Flask(__name__)
if _CORS_AVAILABLE:
    CORS(app)


def _corsify_response(response):
    """Add Access-Control-Allow-Origin header when flask-cors isn't available."""
    if _CORS_AVAILABLE:
        return response
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


def _bad_request(msg: str):
    return _corsify_response(make_response(jsonify({"error": msg}), 400))


@app.route("/api/get_first_imdb_title", methods=["GET"])
def api_get_first_imdb_title():
    """Call IMDb.get_first_imdb_title(name) — returns the first matching IMDb id or null."""
    name = request.args.get("name") or request.args.get("q")
    if not name:
        return _bad_request("missing 'name' query parameter")

    try:
        result = IMDb.get_first_imdb_title(name)
        return _corsify_response(jsonify({"imdb": result}))
    except Exception as exc:
        return _corsify_response(make_response(jsonify({"error": str(exc)}), 500))


@app.route("/api/get_imdb_title_info", methods=["GET"])
def api_get_imdb_title_info():
    """Call IMDb.get_imdb_title_info(name) — returns dict with id/title/year/type/url or 404."""
    name = request.args.get("name") or request.args.get("q")
    if not name:
        return _bad_request("missing 'name' query parameter")

    try:
        data = IMDb.get_imdb_title_info(name)
        if data is None:
            return _corsify_response(make_response(jsonify({}), 404))
        return _corsify_response(jsonify(data))
    except Exception as exc:
        return _corsify_response(make_response(jsonify({"error": str(exc)}), 500))


@app.route("/api/get_imdb_look_up", methods=["GET"])
def api_get_imdb_look_up():
    """Call IMDb.get_imdb_look_up(name) — returns list of matching ids (or null)."""
    name = request.args.get("name") or request.args.get("q")
    if not name:
        return _bad_request("missing 'name' query parameter")

    try:
        results = IMDb.get_imdb_look_up(name)
        return _corsify_response(jsonify({"results": results}))
    except Exception as exc:
        return _corsify_response(make_response(jsonify({"error": str(exc)}), 500))


@app.route("/api/get_title_image", methods=["GET"])
def api_get_title_image():
    """Call IMDb.get_title_image(title_id) — returns the image URL for a title id."""
    title_id = request.args.get("title_id") or request.args.get("id") or request.args.get("imdb")
    if not title_id:
        return _bad_request("missing 'title_id' (or 'id'/'imdb') query parameter")

    try:
        img = IMDb.get_title_image(title_id)
        if img is None:
            return _corsify_response(make_response(jsonify({}), 404))
        return _corsify_response(jsonify({"image": img}))
    except Exception as exc:
        return _corsify_response(make_response(jsonify({"error": str(exc)}), 500))


@app.route("/api/health", methods=["GET"])
def health():
    return _corsify_response(jsonify({"ok": True}))


if __name__ == "__main__":
    local_ip = network.get_local_ip()
    port = 5001
    print(f"IMDb server running at http://{local_ip}:{port}/")
    # Run on localhost:5001 so it doesn't conflict with other dev servers
    app.run(host=local_ip, port=port)
