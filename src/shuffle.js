function shuff(list) {
  const d = list.reduce((acc, p) => {
    if (Math.random() < 0.5) {
      acc.push(p);
    } else {
      acc.unshift(p);
    }
    return acc;
  }, []);
  return d;
}
export default list => shuff(shuff(shuff(shuff(shuff(list)))));
