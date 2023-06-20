export default function is_empty_object(args: any, and?: boolean): boolean {
  let isEmpty: boolean = false;
  if (typeof args === "object" && args !== null && !Array.isArray(args)) {
    let nulls: number = 0;
    for (var v in args) {
      if (and) {
        if (!args[v]) {
          nulls += 1;
        }
      } else {
        if (!args[v]) {
          isEmpty = true;
          break;
        }
      }
      if (Object.keys(args).length == nulls) {
        isEmpty = true;
      }
    }
  } else {
    isEmpty = true;
  }
  return isEmpty;
}
