import { LayoutConfig, DEFAULT_LAYOUT_CONFIG } from '../../types/layout-config.interface';

export interface ConfigState {
  config: LayoutConfig;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const initialState: ConfigState = {
  config: DEFAULT_LAYOUT_CONFIG,
  loading: false,
  loaded: false,
  error: null,
  lastUpdated: null
};