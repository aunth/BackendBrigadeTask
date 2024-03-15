
import express, {Response, Request} from 'express';
import { getNameById } from '../utils/utils'


const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.render('main');
});


router.post('/request-action', (req, res) => {
  const { employeeId, action } = req.body;

  const employeeExists = getNameById(Number(employeeId));

  if (!employeeExists) {
    res.status(404).send("Employee ID does not exist.");
    return;
  }

  switch (action) {
      case 'create':
          res.redirect(`/add-request?employeeId=${encodeURIComponent(employeeId)}`);
          return;
      case 'update':
          res.redirect(`/update-request?employeeId=${encodeURIComponent(employeeId)}`);
          return;
      case 'delete':
          return res.redirect(`/delete?employeeId=${encodeURIComponent(employeeId)}`);
      default:
          res.status(400).send('Unknown action');
          return;
  }
});

export default router;