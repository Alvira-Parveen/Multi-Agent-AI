import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      let userInfo;
      let sessionToken;

      const isLocal = !ENV.oAuthServerUrl || code !== "real_oauth_code_here";
      if (isLocal) {
        const sanitizedCode = code.toLowerCase().replace(/[^a-z0-9_]/g, "");
        const openId = sanitizedCode || "mock_user_id";
        const customName = getQueryParam(req, "name");
        const customEmail = getQueryParam(req, "email");
        const formattedName = customName || (openId.charAt(0).toUpperCase() + openId.slice(1));

        userInfo = {
          openId,
          name: formattedName,
          email: customEmail || `${openId}@local.host`,
          loginMethod: "local",
          platform: "local"
        };
        sessionToken = await sdk.createSessionToken(userInfo.openId, {
          name: userInfo.name,
          expiresInMs: ONE_YEAR_MS,
        });
      } else {
        const tokenResponse = await sdk.exchangeCodeForToken(code, state);
        const userInfoRes = await sdk.getUserInfo(tokenResponse.accessToken);
        userInfo = userInfoRes;

        if (!userInfo.openId) {
          res.status(400).json({ error: "openId missing from user info" });
          return;
        }
        sessionToken = await sdk.createSessionToken(userInfo.openId, {
          name: userInfo.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
