export const serializeAccount = (account) => {
  if (!account) {
    return null;
  }

  const data =
    typeof account.toObject === "function"
      ? account.toObject()
      : { ...account };

  delete data.passwordHash;

  return data;
};
