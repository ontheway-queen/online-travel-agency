import { Router } from 'express';
import CommonValidator from '../features/public/utils/validators/publicCommon.validator';
import FileFolder from '../utils/miscellaneous/fileFolders';
import Uploader from '../middleware/uploader/uploader';

class AbstractRouter {
  public router = Router();
  protected commonValidator = new CommonValidator();
  protected uploader = new Uploader();
  protected fileFolders = FileFolder;
}

export default AbstractRouter;
