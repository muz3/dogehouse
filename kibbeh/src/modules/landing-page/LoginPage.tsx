import { useRouter } from "next/router";
import React, { useCallback, useContext, useEffect } from "react";
import { apiBaseUrl, loginNextPathKey, __prod__ } from "../../lib/constants";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { useSaveTokensFromQueryParams } from "../auth/useSaveTokensFromQueryParams";
import { useTokenStore } from "../auth/useTokenStore";
import SvgSolidGitHub from "../../icons/SolidGitHub";
import SvgSolidNew from "../../icons/SolidNew";
import SvgSolidBug from "../../icons/SolidBug";
import SvgSolidTwitter from "../../icons/SolidTwitter";
import { LgLogo } from "../../icons";
import SvgSolidDiscord from "../../icons/SolidDiscord";
import { WebSocketContext } from "../ws/WebSocketProvider";
import { HeaderController } from "../display/HeaderController";

/*

i know this code is kinda garbage but that's because the mockup is garbage and doesn't use the design system

 */

interface LoginButtonProps {
  children: [React.ReactNode, React.ReactNode];
  dev?: true;
  onClick?: () => void;
  oauthUrl?: string; // React.FC didn't like & ({ onClick: () => void } | { oauthUrl: string }) so yeah
}

const LoginButton: React.FC<LoginButtonProps> = ({
  children,
  onClick,
  oauthUrl,
  dev,
}) => {
  const { query } = useRouter();
  const clickHandler = useCallback(() => {
    if (typeof query.next === "string" && query.next) {
      try {
        localStorage.setItem(loginNextPathKey, query.next);
      } catch {}
    }

    window.location.href = oauthUrl as string;
  }, [query, oauthUrl]);

  return (
    <Button
      className="justify-center text-base py-3"
      color={dev ? "primary" : "secondary"}
      onClick={oauthUrl ? clickHandler : onClick}
    >
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
        }}
      >
        {children[0]}
        {children[1]}
        <div />
      </div>
    </Button>
  );
};

export const LoginPage: React.FC = () => {
  useSaveTokensFromQueryParams();
  const { setConn } = useContext(WebSocketContext);
  const { push } = useRouter();

  useEffect(() => {
    // only want this on mount
    setConn(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full">
      <HeaderController embed={{}} />
      <div className="absolute top-6 h-8 w-full items-center justify-center sm:hidden">
        <LgLogo />
      </div>
      <div className="m-auto flex-col p-6 gap-5 bg-primary-800 sm:rounded-8 z-10 sm:w-400 w-full">
        <div className="gap-2 flex-col">
          <span className="text-3xl text-primary-100 font-bold">Welcome</span>
          <p className="text-primary-100 flex-wrap">
            By logging in you accept our&nbsp;
            <a
              href="https://youtu.be/dQw4w9WgXcQ"
              className="text-accent hover:underline"
            >
              Privacy Policy
            </a>
            &nbsp;and&nbsp;
            <a
              href="https://youtu.be/dQw4w9WgXcQ"
              className="text-accent hover:underline"
            >
              Terms of Service
            </a>
            .
          </p>
        </div>
        <div className="flex-col gap-4">
          <LoginButton oauthUrl={`${apiBaseUrl}/auth/github/web`}>
            <SvgSolidGitHub width={20} height={20} />
            Log in with GitHub
          </LoginButton>
          {/* @todo backend needs to be fixed for twitter to work */}
          {/* <LoginButton oauthUrl={`${apiBaseUrl}/auth/twitter/web`}>
            <SvgSolidTwitter width={20} height={20} />
            Log in with Twitter
          </LoginButton> */}
          {!__prod__ ? (
            <LoginButton
              dev
              onClick={async () => {
                // eslint-disable-next-line no-alert
                const name = window.prompt("username");
                if (!name) {
                  return;
                }
                const r = await fetch(
                  `${apiBaseUrl}/dev/test-info?username=` + name
                );
                const d = await r.json();
                useTokenStore.getState().setTokens({
                  accessToken: d.accessToken,
                  refreshToken: d.refreshToken,
                });
                push("/dash");
              }}
            >
              <SvgSolidBug width={20} height={20} />
              Create a test user
            </LoginButton>
          ) : null}
        </div>
        {/* <div className="flex-col gap-3 items-center">
          <span className="text-primary-100">Download the app</span>
          <span className="text-primary-300">unavailable lol</span>
        </div> */}
      </div>
      <div className="absolute bottom-0 w-full justify-between px-5 py-5 mt-auto items-center sm:px-7">
        <div className="hidden sm:block">
          <LgLogo />
        </div>
        <div className="gap-6 text-primary-300">
          <a
            href="https://youtu.be/dQw4w9WgXcQ"
            className="hover:text-primary-200"
          >
            Privacy policy
          </a>
          <a
            href="https://github.com/benawad/dogehouse/issues"
            className="hover:text-primary-200"
          >
            Report a bug
          </a>
          <div className="gap-6 sm:gap-4">
            <a href="https://github.com/benawad/dogehouse">
              <SvgSolidGitHub
                width={20}
                height={20}
                className="cursor-pointer hover:text-primary-200"
              />
            </a>
            <a href="https://discord.gg/wCbKBZF9cV">
              <SvgSolidDiscord
                width={20}
                height={20}
                className="hover:text-primary-200"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
