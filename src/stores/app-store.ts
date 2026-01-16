import { Store } from "@tanstack/react-store";

interface AppStore {
  isHudIdle: boolean;
  activeTechPanelId: string | null;
}

export const appStore = new Store<AppStore>({
  isHudIdle: true,
  activeTechPanelId: null,
});
