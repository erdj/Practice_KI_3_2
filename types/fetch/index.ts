import { Axios } from 'axios';
import * as API from 'APIconfig';

export type Status = 'idle' | 'loading' | 'rejected' | 'received';

export type Extra = {
  client: Axios;
  api: typeof API;
};
