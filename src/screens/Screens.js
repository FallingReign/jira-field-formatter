// Public Screens facade
import { getCreateScreen } from './create.js';

export const Screens = {
  async getCreate(opts){
    return getCreateScreen(opts);
  }
};
