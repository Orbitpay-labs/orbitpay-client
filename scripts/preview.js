import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
const PORT = Number.parseInt(process.env.PORT || "5173", 10);
const ROOT = process.cwd();
const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};
function sendText(response, statusCode, body) {
    response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(body);
}
const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url || "/", `http://${request.headers.host}`);
        const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
        const filePath = normalize(join(ROOT, pathname));
        if (!filePath.startsWith(ROOT)) {
            sendText(response, 403, "Forbidden");
            return;
        }
        const body = await readFile(filePath);
        response.writeHead(200, {
            "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream"
        });
        response.end(body);
    }
    catch {
        sendText(response, 404, "Not found");
    }
});
server.listen(PORT, () => {
    console.log(`OrbitPay client running on http://localhost:${PORT}`);
});

