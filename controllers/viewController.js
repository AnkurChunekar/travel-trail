exports.getOverview = (_, res) => {
  res.status(200).render("tour", { title: "All Tours" });
};
exports.getTour = (_, res) => {
  res.status(200).render("overview", { title: "The Forest Hiker" });
};
