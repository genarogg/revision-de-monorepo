import { toast } from 'sonner';
import 'sonner/dist/styles.css';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

const notify = ({ type, message }: ToastProps) => {

  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
    case 'info':
      toast.info(message);
      break;
    default:
      break;
  }
};

export default notify;