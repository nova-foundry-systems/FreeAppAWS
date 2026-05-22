# FreeAppAWS

React SPA on CloudFront and S3, Cognito authentication, and an Express API on API Gateway and Lambda backed by DynamoDB. AWS CDK in `infra/` defines and deploys the stacks.

## Architecture

| Layer | Location | Role |
| --- | --- | --- |
| Client | `client/` | Vite + React app: hosted UI OAuth redirect, password (SRP) sign-in, profile setup |
| API | `lambda/express-api/` | JWT-protected `GET`/`POST /users/me` for DynamoDB user profiles |
| Infrastructure | `infra/` | CDK stacks: client (S3 + CloudFront), database, auth (Cognito), API |

Stack wiring (`infra/bin/infra.ts`): the client stack exposes `publicAppUrl`; the auth stack registers OAuth callback and logout URLs against that origin; the API stack attaches a JWT authorizer to the user pool and allows CORS from localhost and the deployed app URL.

## Authentication

- **OAuth redirect**: `oidc-client-ts` against the Cognito user pool; tokens live in `sessionStorage`.
- **Email/password**: `amazon-cognito-identity-js` SRP; sessions are normalized into the same OIDC user store via `persistSessionAsOidcUser`.
- **API access**: Bearer access token on `Authorization`; API Gateway validates JWTs from the pool issuer.

`VITE_COGNITO_DOMAIN` must be the pool auth domain host (stack output `FreeAppUserPoolDomainHost`), used for OAuth metadata endpoints. The issuer URL uses `cognito-idp.{region}.amazonaws.com/{userPoolId}`.

## Local development

1. Deploy infrastructure (or use existing stack outputs):

   ```bash
   cd infra && npm ci && npx cdk deploy --all
   ```

2. Copy `client/.env.example` to `client/.env` and set Cognito and API values from CDK outputs (`FreeAppUserPoolId`, `FreeAppUserPoolClientId`, `FreeAppUserPoolDomainHost`, `FreeAppApiUrl`, region).

3. Run the client:

   ```bash
   cd client && npm ci && npm run dev
   ```

   Vite serves at `http://localhost:5173`; Cognito allows that origin for callback and logout.

## Deployed client

`FreeAppClientStack` builds the client during CDK asset bundling and publishes to S3 behind CloudFront. `PublicAppUrl` is the HTTPS origin used for production OAuth redirects and `client` env when targeting the deployed API.

## API

| Method | Path | Auth | Behavior |
| --- | --- | --- | --- |
| `GET` | `/users/me` | JWT (`sub` claim) | Returns profile or `404` if no row |
| `POST` | `/users/me` | JWT | Creates profile (`409` if `cognitoSub` already exists) |

## Project layout

```
client/          # React SPA
infra/           # AWS CDK app
lambda/express-api/  # Lambda handler + Express app
```

## App Personalization
In VSCode (or Cursor), find all references of FreeApp and replace with your app's name.

Then find the S3 bucket name (free-app-client-bucket) and replace free-app with your app's name (must be LOWERCASE).