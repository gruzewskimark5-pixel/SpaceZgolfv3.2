export const ObjectContract = {
  validate(context: any) {
      if (!context) {
          throw new Error("Object model violation");
      }
  }
};
