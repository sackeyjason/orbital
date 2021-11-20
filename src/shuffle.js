const shuffle = (arr, options) => {
  const len = arr.length;
  const { rand, mutate } = {
    rand: (min, max) => Math.floor(Math.random() * (max - min) + min),
    mutate: true,
    ...options,
  };
  const list = mutate ? arr : [...arr];
  for (let i = 0; i < len; ++i) {
    const j = rand(i, len);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};
export default shuffle;
