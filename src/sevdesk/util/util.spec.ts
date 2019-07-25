import cleanObject from "./clean-object";

it("clean-object", () => {
  const obj = {
    first: "a",
    other: false,
    amount: 0,
    skip: undefined
  };
  const clean = cleanObject(obj);
  expect(clean).not.toHaveProperty("skip");
  expect(clean).toEqual({
    first: "a",
    other: false,
    amount: 0
  });
});
