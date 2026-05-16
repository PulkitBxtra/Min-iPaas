package com.bxtralabs.connectorservice.service;

import com.bxtralabs.connectorservice.config.ConnectorProperties.Provider;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;

/**
 * Talks to provider OAuth2 token endpoints. Sends credentials in the form body
 * (the most widely accepted style) and parses the standard JSON token response.
 */
@Component
public class OAuthTokenClient {

    private final RestClient http = RestClient.builder().build();

    public record TokenResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            String scope,
            Instant expiresAt
    ) {}

    /** Authorization-code: exchange the one-time code for tokens. */
    public TokenResponse exchangeAuthorizationCode(Provider provider, String code, String redirectUri) {
        MultiValueMap<String, String> form = baseForm(provider);
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", redirectUri);
        return post(provider, form);
    }

    /** Authorization-code: trade a refresh token for a fresh access token. */
    public TokenResponse refreshAuthorizationCode(Provider provider, String refreshToken) {
        MultiValueMap<String, String> form = baseForm(provider);
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", refreshToken);
        return post(provider, form);
    }

    /** Client-credentials: obtain (or re-obtain) a machine token. */
    public TokenResponse clientCredentials(Provider provider, String scopes) {
        MultiValueMap<String, String> form = baseForm(provider);
        form.add("grant_type", "client_credentials");
        String s = (scopes != null && !scopes.isBlank()) ? scopes : provider.scopes();
        if (s != null && !s.isBlank()) {
            form.add("scope", s);
        }
        return post(provider, form);
    }

    private static MultiValueMap<String, String> baseForm(Provider provider) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", provider.clientId());
        if (provider.clientSecret() != null) {
            form.add("client_secret", provider.clientSecret());
        }
        return form;
    }

    @SuppressWarnings("unchecked")
    private TokenResponse post(Provider provider, MultiValueMap<String, String> form) {
        Map<String, Object> body = http.post()
                .uri(provider.tokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .accept(MediaType.APPLICATION_JSON)
                .body(form)
                .retrieve()
                .body(Map.class);

        if (body == null || body.get("access_token") == null) {
            throw new IllegalStateException("Token endpoint returned no access_token: " + body);
        }

        Instant expiresAt = null;
        Object expiresIn = body.get("expires_in");
        if (expiresIn != null) {
            expiresAt = Instant.now().plusSeconds(((Number) toNumber(expiresIn)).longValue());
        }

        return new TokenResponse(
                String.valueOf(body.get("access_token")),
                body.get("refresh_token") != null ? String.valueOf(body.get("refresh_token")) : null,
                body.get("token_type") != null ? String.valueOf(body.get("token_type")) : "Bearer",
                body.get("scope") != null ? String.valueOf(body.get("scope")) : null,
                expiresAt
        );
    }

    private static Number toNumber(Object o) {
        return (o instanceof Number n) ? n : Double.valueOf(String.valueOf(o));
    }
}
