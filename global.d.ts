// Ambient types for the AI Studio host bridge.
// Present only when the app runs inside Google AI Studio; guarded with
// optional chaining everywhere it is used, so the app also works standalone.
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey?: () => Promise<boolean>;
      openSelectKey?: () => Promise<void>;
    };
  }
}

export {};
