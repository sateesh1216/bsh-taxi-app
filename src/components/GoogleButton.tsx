import { useEffect } from "react";
import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import * as WebBrowser from "expo-web-browser";
import { Button } from "./Button";
import { GOOGLE_CLIENT_IDS } from "../lib/authConfig";

WebBrowser.maybeCompleteAuthSession();

type Props = { label: string; onToken: (idToken: string) => void; onError: (message: string) => void; disabled?: boolean };

const hasCrypto = Platform.OS === "web" || Boolean(requireOptionalNativeModule("ExpoCrypto"));

function NativeGoogleButton({ label, onToken, onError, disabled }: Props) {
  const Google = require("expo-auth-session/providers/google") as typeof import("expo-auth-session/providers/google");
  const [request, response, prompt] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_CLIENT_IDS.web || undefined,
    iosClientId: GOOGLE_CLIENT_IDS.ios || undefined,
    androidClientId: GOOGLE_CLIENT_IDS.android || undefined,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === "success") {
      const id = response.params?.id_token;
      if (id) onToken(id); else onError("Google sign-in did not return a token. Please try again.");
    } else if (response.type === "error") {
      onError("Google sign-in failed. Please try again.");
    }
  }, [response]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Button label={label} variant="glass" disabled={!request || disabled} onPress={() => prompt()} />;
}

/** Only render this when Google client IDs are configured (the hook throws without them). */
export function GoogleButton(props: Props) {
  if (!hasCrypto) {
    return (
      <Button
        label={props.label}
        variant="glass"
        disabled={props.disabled}
        onPress={() => props.onError("Google sign-in requires rebuilding the app with native modules.")}
      />
    );
  }
  return <NativeGoogleButton {...props} />;
}
