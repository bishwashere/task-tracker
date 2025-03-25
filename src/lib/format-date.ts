export const formatDate = (date: Date) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })?.format(date);
  } catch (e) {
    return date.toLocaleDateString();
  }
};
