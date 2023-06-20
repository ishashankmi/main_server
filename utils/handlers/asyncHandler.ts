export async function asyncHandler(query: any): Promise<any> {
  return query
    .then((data: any) => {
      return [data, null];
    })
    .catch((error: any) => {
      return [null, error.message];
    });
}
