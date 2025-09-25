import { useHello } from '@/modules/hello';

export function myFunction() {
  Logger.log(useHello('world'));
}
