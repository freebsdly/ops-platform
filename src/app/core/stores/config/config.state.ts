import { LayoutConfig } from '../../types/layout-config.interface';

export interface ConfigState {
  config: LayoutConfig | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const initialState: ConfigState = {
  config: null,
  loading: false,
  loaded: false,
  error: null,
  lastUpdated: null
};