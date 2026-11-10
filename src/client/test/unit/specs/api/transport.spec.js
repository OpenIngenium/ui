import transport from "../../../../src/api/transport";

describe("api/transport.js authorization header", () => {
    let originalAdapter;
    let captured;

    beforeEach(() => {
        originalAdapter = transport.defaults.adapter;
        captured = null;
        transport.defaults.adapter = (config) => {
            captured = config;
            return Promise.resolve({
                data: {},
                status: 200,
                statusText: "OK",
                headers: {date: new Date().toUTCString()},
                config
            });
        };
    });

    afterEach(() => {
        transport.defaults.adapter = originalAdapter;
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    });

    it("sends the JWT currently in the access_token cookie, not the one captured at load time", async() => {
        // `transport` is created with axios.create(), so its defaults are a snapshot taken at
        // module load. Simulate that snapshot going stale after a background token renewal.
        transport.defaults.headers.common["Authorization"] = "Bearer stale-token";
        document.cookie = "access_token=renewed-token";

        await transport.get("/anything");

        expect(captured.headers["Authorization"]).toBe("Bearer renewed-token");
    });

    it("leaves the existing header in place when there is no access_token cookie", async() => {
        transport.defaults.headers.common["Authorization"] = "Bearer existing-token";

        await transport.get("/anything");

        expect(captured.headers["Authorization"]).toBe("Bearer existing-token");
    });
});
