# CORS: applied configuration, rules and alternatives

**Status: the CORS configuration is implemented in the backend** (added on user
request). The JWT filter, the authorization rules, the RBAC checks, the database
schema and the migrations are unchanged.

## 1. What was changed in the backend

### 1.1 New file: `src/main/java/com/olympiad/identity/config/CorsConfig.java`

A `CorsConfigurationSource` bean for the API paths:

```java
@Configuration
public class CorsConfig {

    private final List<String> allowedOrigins;

    public CorsConfig(
            @Value("${app.cors.allowed-origins:http://localhost:5173}")
            String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Location"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 1.2 `SecurityConfig.java`: one added line

```java
http
    .cors(cors -> cors.configurationSource(corsConfigurationSource))
    .csrf(csrf -> csrf.disable())
    // ... unchanged: session policy, exception handling,
    //     authorizeHttpRequests rules, addFilterBefore(jwtAuthenticationFilter, ...)
```

The `CorsConfigurationSource` is injected through the constructor, so the
`CorsFilter` is registered **in front of** the JWT filter and the
`AuthorizationFilter`. Preflight `OPTIONS` requests are answered by the
`CorsFilter` and never reach the JWT filter or the authorization rules.

### 1.3 `application.yaml`: configurable origins

```yaml
app:
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}
```

Additional origins are added without a code change:

```bash
# PowerShell
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
```

## 2. Verified behaviour (backend running on 8080, frontend origin 5173)

| Request | Result |
| --- | --- |
| `OPTIONS /api/auth/login`, `Origin: http://localhost:5173`, `Access-Control-Request-Headers: authorization,content-type` | `200` with `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`, `Access-Control-Allow-Headers: authorization, content-type`, `Access-Control-Max-Age: 3600` |
| `OPTIONS /api/auth/me` with `Access-Control-Request-Headers: authorization` | `200`, preflight for the `Authorization` header granted |
| `OPTIONS` with `Origin: http://127.0.0.1:5173` | `403` (`Reject: 'http://127.0.0.1:5173' origin is not allowed`) |
| `POST /api/auth/login` (wrong password) | `401` + `Access-Control-Allow-Origin` + the unchanged error body `{"timestamp":…,"status":401,"message":"Invalid email or password"}` |
| `GET /api/auth/me` without a token | `401` (Spring Security entry point) |
| `GET /api/auth/me` with a valid token | `200` + the profile |
| `GET /api/admin/users` with a student token | `403` - RBAC still enforced |

## 3. Rules that matter

* **The origin must match exactly.** `http://localhost:5173` and
  `http://127.0.0.1:5173` are *different* origins. Use `allowed-origins` with
  the exact origin that the browser shows.
* **`Authorization` and `Content-Type` need preflight permission.** A request
  with a bearer token or a JSON body is not a "simple request", so the browser
  sends a preflight first.
* **`allowCredentials` is `false`** because the API authenticates with a bearer
  token and no cookie. If the backend is later changed to an `HttpOnly` cookie,
  the CORS configuration has to change with it (`allowCredentials(true)` plus an
  explicit origin, never `*`).
* Explicit origins are used instead of `*` so that the configuration stays
  valid if credentials are enabled later.
* The Swagger/OpenAPI endpoints keep their existing `permitAll()` rules and are
  served from the same origin as the API, so they need no CORS entry.

## 4. Known pre-existing backend behaviour (not caused by the CORS change)

* A request with a **malformed JSON body** is answered with `400` by the
  dispatcher, but the follow-up `ERROR` dispatch to `/error` is matched by
  `anyRequest().authenticated()` and therefore answered with `401`. This
  behaviour exists independently of the CORS configuration. The frontend always
  sends valid JSON, and validation errors are produced by `@Valid` +
  `ApiExceptionHandler` (a direct `400` response with the `VALIDATION_FAILED`
  body), which is unaffected.
* An **invalid bearer token** is answered with `401` and an empty body: the
  JSON body written by `JwtAuthenticationFilter` is discarded because the
  response is already committed by the security header writer. The frontend
  handles an empty `401` body with its generic session message.

## 5. Frontend-only alternative: Vite dev proxy

If the backend must not carry a CORS configuration, the browser can talk to
the Vite dev server only. Vite forwards the request to the Identity Service, so
the browser never performs a cross origin request.

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

```bash
# .env.local
VITE_API_BASE_URL=
```

This variant only works for the dev server; a production build still needs a
reverse proxy or the CORS configuration above.

## 6. Checklist for the CORS configuration

1. The frontend origin (`http://localhost:5173`) is allowed - done.
2. `Authorization` and `Content-Type` are allowed headers - done.
3. `GET`, `POST`, `PUT`, `PATCH`, `DELETE` and `OPTIONS` are allowed methods -
   done.
4. Preflight `OPTIONS` requests are answered before the authorization rules -
   done, the `CorsFilter` runs in front of the JWT filter.
5. The JWT filter and all `@PreAuthorize` rules are unchanged - done.
6. `allowCredentials` matches the token strategy (bearer token -> `false`) -
   done.
